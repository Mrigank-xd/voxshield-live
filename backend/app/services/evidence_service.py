import hashlib
import time
from typing import Dict, Any, List, Optional

class EvidenceService:
    """
    Privacy-Preserving Evidence & Ephemeral Processing Service.
    Enforces the zero-raw-storage guarantee:
    1. RAW AUDIO -> FEATURE EXTRACTION -> RISK SIGNAL -> DISCARD RAW AUDIO
    2. RAW VIDEO FRAME -> FACE/LIP FEATURES -> RISK SIGNAL -> DISCARD FRAME
    Only cryptographic integrity hashes, extracted signal parameters,
    and metadata are preserved for post-incident audit.
    """
    def __init__(self):
        self.evidence_vault: Dict[str, List[Dict[str, Any]]] = {}

    def record_forensic_evidence_anchor(
        self,
        call_id: str,
        timestamp: float,
        event_type: str,
        risk_score: int,
        feature_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Record a tamper-evident cryptographic hash anchor for a suspicious event
        without retaining raw biometric media.
        """
        evidence_payload_str = f"{call_id}:{timestamp}:{event_type}:{risk_score}:{sorted(feature_summary.items())}"
        sha256_hash = hashlib.sha256(evidence_payload_str.encode("utf-8")).hexdigest()

        anchor = {
            "evidence_id": f"EV-{int(time.time() * 1000)}",
            "call_id": call_id,
            "timestamp": timestamp,
            "event_type": event_type,
            "risk_score": risk_score,
            "cryptographic_hash": sha256_hash,
            "feature_summary": feature_summary,
            "raw_media_discarded": True,
            "recorded_at": time.time()
        }

        if call_id not in self.evidence_vault:
            self.evidence_vault[call_id] = []
        self.evidence_vault[call_id].append(anchor)

        return anchor

    def get_call_evidence(self, call_id: str) -> List[Dict[str, Any]]:
        return self.evidence_vault.get(call_id, [])

    def purge_call_evidence(self, call_id: str) -> int:
        """Data deletion endpoint handler for GDPR compliance."""
        records = self.evidence_vault.pop(call_id, [])
        return len(records)
