/**
 * VOXSHIELD LIVE - Audio Encoding Utilities
 * Converts raw browser Web Audio API float32 PCM samples into standard 16-bit PCM WAV base64
 * for forensic deepfake and voice-clone analysis pipelines.
 */

export function encodeWAV(
  samples: Float32Array,
  sampleRate: number = 16000
): { buffer: ArrayBuffer; base64: string } {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // 1. RIFF Header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(8, "WAVE");

  // 2. fmt Sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // 3. data Sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // 4. Write 16-bit PCM Samples with clamping
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    // Clamp between -1.0 and 1.0
    const s = Math.max(-1, Math.min(1, samples[i]));
    // Scale to 16-bit signed integer
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  // Convert ArrayBuffer to Base64
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof window !== "undefined" ? btoa(binary) : "";

  return { buffer, base64 };
}

/**
 * Downsamples audio buffer from browser native sample rate (typically 44100Hz or 48000Hz)
 * to 16000Hz for speech processing models.
 */
export function downsampleTo16k(
  inputBuffer: Float32Array,
  inputSampleRate: number,
  targetSampleRate: number = 16000
): Float32Array {
  if (inputSampleRate === targetSampleRate) {
    return inputBuffer;
  }
  if (inputSampleRate < targetSampleRate) {
    return inputBuffer;
  }

  const sampleRateRatio = inputSampleRate / targetSampleRate;
  const newLength = Math.round(inputBuffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    // Linear interpolation / mean across bucket
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < inputBuffer.length; i++) {
      accum += inputBuffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}
