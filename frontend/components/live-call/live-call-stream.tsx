"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Shield,
  Activity,
  Play,
  Zap,
  Volume2,
  VolumeX,
  Share2,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Radio,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { encodeWAV, downsampleTo16k } from "@/lib/audio-encoder";

interface LiveCallStreamProps {
  callId: string;
  callerName: string;
  callerNumber: string;
  callType: "audio" | "video";
  status: string;
  durationSeconds: number;
  overallRiskScore: number;
  onEndCall: () => void;
  onTriggerScenario: (scenario: string) => void;
  onSendAudioChunk?: (base64Wav: string) => void;
  className?: string;
}

export function LiveCallStream({
  callId,
  callerName,
  callerNumber,
  callType,
  status,
  durationSeconds,
  overallRiskScore,
  onEndCall,
  onTriggerScenario,
  onSendAudioChunk,
  className,
}: LiveCallStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Media state
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(callType === "video");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isTabAudioCaptured, setIsTabAudioCaptured] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Audio analysis & VU meter state
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0 to 100
  const [audioDb, setAudioDb] = useState<number>(-60);
  const [isAudioTransmitting, setIsAudioTransmitting] = useState<boolean>(false);
  const [chunkCount, setChunkCount] = useState<number>(0);

  // Scenario simulator & WhatsApp modal
  const [selectedScenario, setSelectedScenario] = useState("bank_impersonator");
  const [isSimulating, setIsSimulating] = useState(false);
  const [showWhatsAppGuide, setShowWhatsAppGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<"tab" | "virtual" | "telephony">("tab");

  // Web Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferAccumulator = useRef<Float32Array[]>([]);
  const accumulatedSamplesCount = useRef<number>(0);

  // 1. Enumerate available audio input devices
  const refreshDevices = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setAvailableDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.warn("Could not enumerate audio devices:", err);
      }
    }
  }, [selectedDeviceId]);

  // 2. Setup Audio Processing & Visualizer
  const setupAudioProcessing = useCallback(
    (stream: MediaStream) => {
      try {
        // Clean up previous AudioContext if any
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }

        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Use ScriptProcessor to accumulate audio frames for real-time chunks
        const bufferSize = 4096;
        const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
        scriptProcessorRef.current = processor;
        source.connect(processor);
        processor.connect(ctx.destination);

        audioBufferAccumulator.current = [];
        accumulatedSamplesCount.current = 0;

        // Target: dispatch audio every ~2.5 seconds for windowed forensic inference
        const sampleRate = ctx.sampleRate;
        const samplesPerChunk = Math.round(sampleRate * 2.5);

        processor.onaudioprocess = (e) => {
          if (!micActive) return;
          const inputChannel = e.inputBuffer.getChannelData(0);
          const copy = new Float32Array(inputChannel.length);
          copy.set(inputChannel);

          audioBufferAccumulator.current.push(copy);
          accumulatedSamplesCount.current += copy.length;

          if (accumulatedSamplesCount.current >= samplesPerChunk) {
            // Concatenate all accumulated buffers
            const totalLength = accumulatedSamplesCount.current;
            const fullBuffer = new Float32Array(totalLength);
            let offset = 0;
            for (const buf of audioBufferAccumulator.current) {
              fullBuffer.set(buf, offset);
              offset += buf.length;
            }

            // Downsample from browser rate (e.g. 44.1k/48k) to 16kHz
            const samples16k = downsampleTo16k(fullBuffer, sampleRate, 16000);

            // Encode to standard 16-bit PCM WAV
            const { base64 } = encodeWAV(samples16k, 16000);

            if (base64 && onSendAudioChunk) {
              onSendAudioChunk(base64);
              setIsAudioTransmitting(true);
              setChunkCount((prev) => prev + 1);
              setTimeout(() => setIsAudioTransmitting(false), 600);
            }

            audioBufferAccumulator.current = [];
            accumulatedSamplesCount.current = 0;
          }
        };

        // Real-Time VU Meter update loop
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (analyserRef.current && micActive) {
            analyserRef.current.getByteTimeDomainData(dataArray);

            // Calculate RMS
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const val = (dataArray[i] - 128) / 128;
              sum += val * val;
            }
            const rms = Math.sqrt(sum / dataArray.length);
            const level = Math.min(100, Math.round(rms * 320));
            setAudioLevel(level);

            const db = rms > 0.0001 ? Math.round(20 * Math.log10(rms)) : -60;
            setAudioDb(Math.max(-60, db));
          } else {
            setAudioLevel(0);
            setAudioDb(-60);
          }
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (err) {
        console.warn("Failed to initialize Web Audio API analyzer:", err);
      }
    },
    [micActive, onSendAudioChunk]
  );

  // 3. Start Media Stream (Audio + Optional Camera)
  const startMedia = useCallback(
    async (devId?: string, requestVideo?: boolean) => {
      setPermissionError(null);
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setPermissionError("WebRTC media devices are not supported in this environment.");
        return;
      }

      // Stop existing tracks first
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }

      const wantVideo = requestVideo !== undefined ? requestVideo : cameraActive;
      const audioConstraint: MediaTrackConstraints = devId
        ? { deviceId: { exact: devId }, echoCancellation: true, noiseSuppression: true }
        : { echoCancellation: true, noiseSuppression: true };

      try {
        let stream: MediaStream;
        if (wantVideo) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: audioConstraint,
              video: { width: 640, height: 480 },
            });
          } catch (videoErr) {
            console.warn("Video stream acquisition failed; falling back to audio-only stream:", videoErr);
            // Fallback immediately to audio-only so the microphone still works!
            setCameraActive(false);
            stream = await navigator.mediaDevices.getUserMedia({
              audio: audioConstraint,
            });
          }
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraint,
          });
        }

        setMediaStream(stream);
        setIsTabAudioCaptured(false);

        if (videoRef.current && wantVideo) {
          videoRef.current.srcObject = stream;
        }

        setupAudioProcessing(stream);
        refreshDevices();
      } catch (err: unknown) {
        console.error("Microphone capture failed:", err);
        const e = err as { name?: string; message?: string };
        if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
          setPermissionError(
            "Microphone blocked: Please grant microphone permission in your browser address bar (lock/tune icon) and macOS System Settings > Privacy & Security > Microphone."
          );
        } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
          setPermissionError("No active microphone hardware found on your system.");
        } else {
          setPermissionError(`Microphone access error: ${e.message || "Unknown error"}`);
        }
      }
    },
    [cameraActive, mediaStream, refreshDevices, setupAudioProcessing]
  );

  // Initial startup
  useEffect(() => {
    startMedia(selectedDeviceId || undefined, cameraActive);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4. Capture WhatsApp Web Tab Audio via getDisplayMedia
  const handleCaptureTabAudio = async () => {
    try {
      setPermissionError(null);
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setPermissionError("Display Media (Screen/Tab Audio capture) is not supported in this browser.");
        return;
      }

      // Request display media with audio enabled
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        setPermissionError(
          "No audio track was selected! Make sure to select the WhatsApp Web browser tab and check the 'Also share tab audio' checkbox in the browser picker."
        );
        displayStream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Replace active media stream with display stream
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }

      setMediaStream(displayStream);
      setIsTabAudioCaptured(true);
      if (videoRef.current) {
        videoRef.current.srcObject = displayStream;
      }
      setupAudioProcessing(displayStream);

      // Listen for when user stops tab sharing via browser banner
      audioTracks[0].onended = () => {
        setIsTabAudioCaptured(false);
        startMedia(selectedDeviceId || undefined, cameraActive);
      };
    } catch (err: unknown) {
      console.warn("Tab capture cancelled or failed:", err);
      const e = err as { name?: string; message?: string };
      if (e.name !== "NotAllowedError") {
        setPermissionError("Could not capture tab audio: " + (e.message || "User cancelled"));
      }
    }
  };

  const handleDeviceChange = (devId: string) => {
    setSelectedDeviceId(devId);
    startMedia(devId, cameraActive);
  };

  const handleToggleCamera = () => {
    const nextVal = !cameraActive;
    setCameraActive(nextVal);
    startMedia(selectedDeviceId || undefined, nextVal);
  };

  const handleToggleMic = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((t) => (t.enabled = !micActive));
    }
    setMicActive(!micActive);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate 12-segment VU meter bars
  const totalBars = 12;
  const activeBars = Math.round((audioLevel / 100) * totalBars);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden flex flex-col backdrop-blur-md shadow-2xl relative",
        className
      )}
    >
      {/* Permission or Hardware Error Alert Banner */}
      {permissionError && (
        <div className="bg-red-950/90 border-b border-red-800/80 p-3.5 flex items-start justify-between gap-3 text-xs text-red-200 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-100">{permissionError}</p>
              <p className="text-[11px] text-red-300/90 mt-1">
                Tip: If using WhatsApp on macOS, you can also click{" "}
                <button
                  onClick={() => setShowWhatsAppGuide(true)}
                  className="underline font-bold text-cyan-300 hover:text-cyan-200"
                >
                  Connect WhatsApp Calls
                </button>{" "}
                to route desktop audio through a virtual audio driver like BlackHole.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPermissionError(null)}
            className="text-red-400 hover:text-red-200 text-xs px-2 py-0.5 rounded border border-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Video / Caller Canvas */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {cameraActive && !isTabAudioCaptured ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : isTabAudioCaptured ? (
          <div className="relative w-full h-full bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
              <Share2 className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-sm font-bold text-emerald-300 font-mono">
                WHATSAPP / BROWSER TAB AUDIO STREAM ACTIVE
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              VoxShield is actively streaming and inspecting live incoming voice packets from the connected tab.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                16 kHz PCM SAMPLES: {chunkCount * 40}k
              </span>
              <button
                onClick={() => startMedia(selectedDeviceId || undefined, cameraActive)}
                className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Switch Back to Microphone
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 mb-3 shadow-inner relative">
              <Mic className={cn("w-10 h-10 transition-all", micActive && audioLevel > 5 ? "scale-110 text-cyan-300" : "opacity-80")} />
              {isAudioTransmitting && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white">{callerName}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{callerNumber}</p>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono mt-3">
              LIVE ENCRYPTED AUDIO STREAM
            </span>
          </div>
        )}

        {/* Neural Tracking Overlay when camera is on */}
        {cameraActive && !isTabAudioCaptured && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-48 h-56 border-2 border-cyan-400/60 rounded-2xl animate-pulse">
              <span className="absolute -top-3 left-3 bg-slate-950/90 text-[9px] font-mono font-bold text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/40">
                LIP/FACE MESH: 68 PTS
              </span>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-16 h-8 border border-purple-400/70 rounded-full">
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-purple-300 whitespace-nowrap">
                  MAR: 0.32
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 pointer-events-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              LIVE {formatTimer(durationSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 font-mono text-xs pointer-events-auto">
            <span className="text-slate-400">CALLER:</span>
            <span className="text-white font-bold">{callerName}</span>
          </div>
        </div>

        {/* Bottom Scanner Grid Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
            <span>WEBRTC OPUS | 16 kHz HD</span>
            {isAudioTransmitting && (
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> TX #{chunkCount}
              </span>
            )}
          </div>
          <div
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold",
              overallRiskScore >= 60
                ? "bg-red-500/20 text-red-400 border-red-500/40"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            )}
          >
            RISK: {overallRiskScore}/100
          </div>
        </div>
      </div>

      {/* Real-Time Audio Level & VU Meter Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {audioLevel > 5 ? (
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-[11px] font-mono font-semibold text-slate-300">
              AUDIO INPUT:
            </span>
          </div>

          {/* 12-segment LED VU meter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            {Array.from({ length: totalBars }).map((_, idx) => {
              const isLit = idx < activeBars && micActive;
              let barColor = "bg-emerald-500";
              if (idx >= 8 && idx < 10) barColor = "bg-amber-400";
              if (idx >= 10) barColor = "bg-red-500";

              return (
                <div
                  key={idx}
                  className={cn(
                    "w-1.5 h-3.5 rounded-xs transition-all duration-75",
                    isLit ? barColor + " opacity-100 shadow-sm" : "bg-slate-800 opacity-40"
                  )}
                />
              );
            })}
            <span className="text-[10px] font-mono text-slate-400 ml-1.5 min-w-[36px]">
              {micActive ? `${audioDb} dB` : "MUTED"}
            </span>
          </div>

          {audioLevel > 5 ? (
            <span className="hidden sm:inline-flex text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              SIGNAL DETECTED
            </span>
          ) : (
            <span className="hidden sm:inline-flex text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              Awaiting Speech...
            </span>
          )}
        </div>

        {/* WhatsApp & Screen Audio Capture Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCaptureTabAudio}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all",
              isTabAudioCaptured
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
            )}
            title="Directly capture incoming audio from a WhatsApp Web tab or Chrome tab"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isTabAudioCaptured ? "Tab Audio Connected" : "Capture WhatsApp Web Tab"}</span>
          </button>

          <button
            onClick={() => setShowWhatsAppGuide(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-all"
            title="Instructions on connecting WhatsApp Desktop and Phone calls"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Setup Guide</span>
          </button>
        </div>
      </div>

      {/* Media & Call Action Controls */}
      <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Device Select & Hardware Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Audio Input Device Dropdown */}
          <select
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 max-w-[200px] truncate"
            title="Select audio input (e.g. MacBook Mic, AirPods, or BlackHole virtual cable for WhatsApp)"
          >
            {availableDevices.length === 0 ? (
              <option value="">Default Microphone</option>
            ) : (
              availableDevices.map((dev, idx) => (
                <option key={dev.deviceId || idx} value={dev.deviceId}>
                  {dev.label || `Microphone ${idx + 1}`}
                </option>
              ))
            )}
          </select>

          <button
            onClick={() => refreshDevices()}
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            title="Refresh audio hardware list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleMic}
            className={cn(
              "p-2.5 rounded-xl border transition-all",
              micActive
                ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                : "bg-red-500/20 text-red-400 border-red-500/40"
            )}
            title={micActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleCamera}
            className={cn(
              "p-2.5 rounded-xl border transition-all",
              cameraActive
                ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            )}
            title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onEndCall}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 transition-all hover:scale-105"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Hackathon Interactive Simulator Picker */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 w-full sm:w-auto"
          >
            <option value="bank_impersonator">🚨 Bank Impersonator Scam (OTP + Urgency)</option>
            <option value="deepfake_ceo">💼 Deepfake CEO Wire Scam ($250k Wire)</option>
            <option value="legitimate_call">✅ Legitimate Trusted Family Call</option>
          </select>

          <button
            onClick={() => {
              setIsSimulating(true);
              onTriggerScenario(selectedScenario);
              setTimeout(() => setIsSimulating(false), 2000);
            }}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 shrink-0 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSimulating ? "Injecting..." : "Simulate"}</span>
          </button>
        </div>
      </div>

      {/* WHATSAPP CALL INTEGRATION MODAL */}
      {showWhatsAppGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Connecting WhatsApp Live Calls to VoxShield
                    </h2>
                    <p className="text-xs text-slate-400">
                      Real-time live voice interception and deepfake forensic protection architecture
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppGuide(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950"
              >
                Close (ESC)
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              <button
                onClick={() => setActiveGuideTab("tab")}
                className={cn(
                  "pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-all",
                  activeGuideTab === "tab"
                    ? "border-cyan-400 text-cyan-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                1. WhatsApp Web (Direct Tab Audio)
              </button>
              <button
                onClick={() => setActiveGuideTab("virtual")}
                className={cn(
                  "pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-all",
                  activeGuideTab === "virtual"
                    ? "border-cyan-400 text-cyan-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                2. WhatsApp Desktop (Virtual Audio Cable)
              </button>
              <button
                onClick={() => setActiveGuideTab("telephony")}
                className={cn(
                  "pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-all",
                  activeGuideTab === "telephony"
                    ? "border-cyan-400 text-cyan-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                3. Enterprise SIP Gateway
              </button>
            </div>

            {/* Tab 1: WhatsApp Web Browser Tab */}
            {activeGuideTab === "tab" && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl">
                  <span className="font-bold text-cyan-300">Fastest method (No software installation required):</span>
                  <p className="mt-1 text-slate-300">
                    Modern browsers support capturing live tab audio through the WebRTC Screen/Tab Capture API.
                  </p>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 font-sans">
                  <li>
                    Open <strong className="text-white">web.whatsapp.com</strong> in another browser tab and start or answer your voice/video call.
                  </li>
                  <li>
                    In VoxShield Live, click the button:{" "}
                    <span className="font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Capture WhatsApp Web Tab
                    </span>
                    .
                  </li>
                  <li>
                    In the browser pop-up prompt, select the <strong className="text-white">"Chrome Tab"</strong> or <strong className="text-white">"Window"</strong> tab, choose your WhatsApp tab, and make sure <strong className="text-emerald-300">"Also share tab audio"</strong> is checked.
                  </li>
                  <li>
                    VoxShield will instantly receive the live caller stream, display the bouncing green VU meter, and compute real-time voice clone probabilities!
                  </li>
                </ol>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowWhatsAppGuide(false);
                      handleCaptureTabAudio();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Launch WhatsApp Tab Capture Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: WhatsApp Desktop via BlackHole / Loopback */}
            {activeGuideTab === "virtual" && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="font-bold text-white">For WhatsApp Mac Desktop Application:</span>
                  <p className="mt-1 text-slate-300">
                    <strong>Note:</strong> WhatsApp for Mac does <em>not</em> have an &quot;Audio &amp; Video&quot; tab in its general app settings (<code className="text-cyan-300">Cmd + ,</code>). Instead, WhatsApp automatically follows your <strong>macOS System Sound Output</strong>!
                  </p>
                </div>

                <ol className="list-decimal list-inside space-y-2.5">
                  <li>
                    <strong className="text-white">Install BlackHole (macOS free driver):</strong> Run in your Mac Terminal:
                    <pre className="bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-cyan-300 mt-1 border border-slate-800">
                      brew install blackhole-2ch
                    </pre>
                  </li>
                  <li>
                    <strong className="text-white">Enable Multi-Output in macOS Audio MIDI Setup:</strong> Open <em>Audio MIDI Setup</em> (press Cmd+Space and type Audio MIDI Setup), click <strong>+</strong> at the bottom left, choose <em>Create Multi-Output Device</em>, and check both your Headphones/Speakers AND <strong>BlackHole 2ch</strong> (so you can hear the caller while VoxShield inspects it).
                  </li>
                  <li>
                    <strong className="text-white">Switch macOS System Sound:</strong> Click the <strong>macOS Control Center</strong> icon in your top menu bar (top-right next to the clock) &gt; click <strong>Sound</strong> &gt; select your <strong>Multi-Output Device</strong>. WhatsApp will automatically route its audio here!
                  </li>
                  <li>
                    <strong className="text-white">Select in VoxShield:</strong> In VoxShield Live, click the <em>Audio Input dropdown</em> and select <span className="font-mono text-cyan-300">&quot;BlackHole 2ch&quot;</span>. VoxShield will immediately detect and analyze the incoming WhatsApp call audio!
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 3: Enterprise Telephony */}
            {activeGuideTab === "telephony" && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl">
                  <span className="font-bold text-purple-300">Production Enterprise SIP Trunk Architecture:</span>
                  <p className="mt-1 text-slate-300">
                    In enterprise environments (financial institutions, contact centers), calls do not rely on local browser microphones.
                  </p>
                </div>
                <p>
                  VoxShield includes an extensible <code className="text-cyan-300 font-mono">CallProvider</code> backend abstraction:
                </p>
                <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800">
                  {`CallProvider
├── WebRTCCallProvider   (Live browser call session)
├── MockCallProvider      (Synthetic scenario injection)
└── FutureSIPProvider     (Twilio / WhatsApp Business Cloud API)`}
                </pre>
                <p>
                  Incoming WhatsApp Business Cloud API calls are routed via SIP trunk directly into VoxShield&apos;s Python backend without browser involvement.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
