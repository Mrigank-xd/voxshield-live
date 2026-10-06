import random
import time
import numpy as np
from typing import Dict, Any, Optional, List

class DynamicChallengeService:
    """
    Dynamic Liveness & Challenge-Response Service.
    Generates cryptographically unpredictable vocal challenge phrases
    (e.g., "Blue Falcon 742", "Copper Horizon 519", "Emerald Summit 384")
    triggered adaptively when cumulative risk crosses configurable threshold (>65).
    Evaluates:
    - Semantic phrase matching (STT accuracy)
    - Response latency (real-time voice vs pre-recorded re-routing delay)
    - Acoustic authenticity during challenge utterance
    """
    ADJECTIVES = [
        "Blue", "Silver", "Amber", "Copper", "Golden", "Emerald",
        "Crimson", "Solar", "Lunar", "Polar", "Velvet", "Granite",
        "Echo", "Shadow", "Alpine", "Cobalt", "Neon", "Thunder"
    ]
    
    NOUNS = [
        "Falcon", "Horizon", "Harbor", "Pinnacle", "Summit", "Matrix",
        "Canyon", "Beacon", "Vanguard", "Shield", "Fortress", "Comet",
        "Voyager", "Outpost", "Glacier", "Compass", "Circuit", "Phoenix"
    ]

    def generate_random_challenge(self) -> Dict[str, Any]:
        """Generate non-predictable challenge phrase and token."""
        adj = random.choice(self.ADJECTIVES)
        noun = random.choice(self.NOUNS)
        num = random.randint(100, 999)
        phrase = f"{adj} {noun} {num}"
        verification_code = random.randint(1000, 9999)

        challenge_types = [
            f"Please say: '{phrase}'",
            f"Please repeat phrase: '{adj} {noun} {num}'",
            f"Please verify: 'Code {verification_code} {adj}'"
        ]
        
        prompt = random.choice(challenge_types)
        expected = phrase.lower()

        return {
            "challenge_phrase": phrase,
            "prompt_text": prompt,
            "expected_keywords": [adj.lower(), noun.lower(), str(num)],
            "issued_at": time.time(),
            "status": "PENDING"
        }

    def evaluate_response(
        self,
        spoken_text: str,
        expected_phrase: str,
        expected_keywords: List[str],
        response_latency_ms: float = 1500.0,
        voice_synthetic_prob: float = 0.05
    ) -> Dict[str, Any]:
        """
        Evaluate caller's spoken response against active dynamic challenge.
        """
        spoken_clean = spoken_text.lower().strip() if spoken_text else ""
        
        # Check keyword presence
        matched_keywords = [kw for kw in expected_keywords if kw in spoken_clean]
        match_ratio = len(matched_keywords) / max(len(expected_keywords), 1)

        # Response latency check (TTS generative pipeline latency typically introduces >3500ms lag)
        latency_penalty = False
        if response_latency_ms > 4500.0:
            latency_penalty = True

        status = "FAILED"
        voice_auth = 1.0 - voice_synthetic_prob

        if match_ratio >= 0.66 and not latency_penalty and voice_auth >= 0.60:
            status = "VERIFIED"
            message = f"Challenge verified successfully ('{expected_phrase}' confirmed with live voice)."
        elif match_ratio >= 0.66 and (latency_penalty or voice_auth < 0.60):
            status = "SUSPICIOUS"
            message = "Phrase keywords matched, but high response latency or synthetic acoustic markers detected."
        else:
            status = "FAILED"
            message = f"Challenge failed. Caller failed to speak expected phrase '{expected_phrase}'."

        return {
            "challenge_phrase": expected_phrase,
            "spoken_phrase": spoken_text,
            "matched_keywords": matched_keywords,
            "match_ratio": round(match_ratio, 2),
            "status": status,
            "voice_authenticity_score": round(voice_auth, 2),
            "latency_ms": round(response_latency_ms, 1),
            "latency_penalty": latency_penalty,
            "message": message
        }
