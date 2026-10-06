import re
from typing import Dict, Any, List, Tuple

class ScamIntentDetector:
    """
    Real-Time Conversation Scam Intent Detector.
    Analyzes live transcribed speech using multi-category syntactic patterns,
    coercive urgency markers, sensitive credential solicitations, and social engineering lexicons.
    """
    def __init__(self):
        # Comprehensive social engineering category rules
        self.categories_rules = {
            "OTP_REQUEST": {
                "weight": 35.0,
                "label": "OTP / 2FA Solicitation",
                "patterns": [
                    r"\b(one[- ]time[- ]password|otp|verification code|security code|sms code|2fa code|passcode)\b",
                    r"\b(share|read out|tell me|give me|confirm)\b.*\b(otp|code|pin|digits)\b",
                    r"\b(six[- ]digit|4[- ]digit|digit code)\b"
                ]
            },
            "FINANCIAL_CREDENTIALS": {
                "weight": 30.0,
                "label": "Card / CVV / PIN Request",
                "patterns": [
                    r"\b(cvv|cvv2|card number|16[- ]digit|expiry date|debit card|credit card|atm pin|upi pin|netbanking password)\b",
                    r"\b(enter your pin|share your pin|provide the 3 digits)\b"
                ]
            },
            "URGENCY_COERCION": {
                "weight": 25.0,
                "label": "Urgency & Psychological Coercion",
                "patterns": [
                    r"\b(immediately|right now|urgent|within (5|10|15|30) minutes|act now|no time|don't delay|hurry)\b",
                    r"\b(before it's too late|last warning|final notice)\b"
                ]
            },
            "ACCOUNT_SUSPENSION_THREAT": {
                "weight": 30.0,
                "label": "Account Suspension / Legal Threat",
                "patterns": [
                    r"\b(block(ed)?|suspend(ed)?|freeze|frozen|terminate(d)?|deactivat(ed)?|arrest(ed)?)\b.*\b(account|card|sim|number|profile)\b",
                    r"\b(account|card|sim|number|profile)\b.*\b(block(ed)?|suspend(ed)?|freeze|frozen|terminate(d)?|deactivat(ed)?|arrest(ed)?)\b",
                    r"\b(police warrant|court order|legal action|cbi|fbi|irs|customs|enforcement directorate|ed department)\b"
                ]
            },
            "MONEY_TRANSFER": {
                "weight": 30.0,
                "label": "Money Transfer / Payment Request",
                "patterns": [
                    r"\b(transfer|wire|send|deposit|pay|remit|upi|rtgs|neft|imps)\b.*\b(\$|₹|rs\.?|inr|usd|dollars|rupees|amount|\d+[,.]?\d*)\b",
                    r"\b(safe account|secure account|escrow account|test transaction|refund processing)\b",
                    r"\b(add.*beneficiary|new payee|payment gateway)\b"
                ]
            },
            "REMOTE_ACCESS": {
                "weight": 35.0,
                "label": "Remote Access / Screen Sharing",
                "patterns": [
                    r"\b(anydesk|teamviewer|rustdesk|quicksupport|ultraviewer|zoho assist|screen share|install this app|apk|download the app)\b",
                    r"\b(remote access|connect to your phone|grant permission|allow access)\b"
                ]
            },
            "IMPERSONATION": {
                "weight": 25.0,
                "label": "Authority / Bank Impersonation",
                "patterns": [
                    r"\b(calling from (your )?bank|bank manager|security team|fraud department|customer support|tech support)\b",
                    r"\b(hdfc|sbi|icici|chase|wells fargo|bank of america|microsoft support|apple support|amazon security)\b",
                    r"\b(police officer|inspector|cyber crime branch|tax officer)\b"
                ]
            },
            "SECRECY_ISOLATION": {
                "weight": 25.0,
                "label": "Secrecy & Victim Isolation",
                "patterns": [
                    r"\b(don'?t tell (anyone|your family|the branch|anybody)|keep this confidential|stay on the line|don'?t disconnect)\b",
                    r"\b(don'?t hang up|strictly confidential|classified investigation)\b"
                ]
            },
            "KYC_VERIFICATION": {
                "weight": 20.0,
                "label": "KYC / Identity Expiry Scam",
                "patterns": [
                    r"\b(kyc (update|expired|pending|verification)|link your aadhaar|pan card update|sim verification)\b"
                ]
            },
            "INVESTMENT_EMERGENCY": {
                "weight": 25.0,
                "label": "Investment / Family Emergency Scam",
                "patterns": [
                    r"\b(guaranteed returns|crypto investment|high yield|hospital emergency|accident|bail money)\b"
                ]
            }
        }

    def analyze_text(self, text: str) -> Dict[str, Any]:
        if not text or len(text.strip()) == 0:
            return {
                "scam_intent_score": 0.0,
                "risk_level": "LOW",
                "detected_categories": [],
                "highlighted_phrases": [],
                "confidence": 0.85,
                "intent_breakdown": {}
            }

        text_lower = text.lower()
        detected_categories = []
        highlighted_phrases = []
        accumulated_score = 0.0
        intent_breakdown = {}

        for cat_key, config in self.categories_rules.items():
            cat_matches = []
            for pattern in config["patterns"]:
                for match in re.finditer(pattern, text_lower):
                    matched_text = match.group(0)
                    cat_matches.append(matched_text)
                    highlighted_phrases.append({
                        "phrase": matched_text,
                        "category": cat_key,
                        "label": config["label"],
                        "start": match.start(),
                        "end": match.end()
                    })

            if cat_matches:
                weight = config["weight"]
                # First match grants weight, subsequent matches add incremental urgency
                cat_score = min(weight * (1.0 + 0.25 * (len(cat_matches) - 1)), weight * 1.5)
                accumulated_score += cat_score
                detected_categories.append(cat_key)
                intent_breakdown[cat_key] = {
                    "label": config["label"],
                    "severity": "HIGH" if weight >= 30 else "MEDIUM",
                    "match_count": len(cat_matches)
                }

        # Multi-category compounding: Coercion + Credentials + Money = Extreme Scam Likelihood
        if "OTP_REQUEST" in detected_categories and "URGENCY_COERCION" in detected_categories:
            accumulated_score += 15.0
        if "ACCOUNT_SUSPENSION_THREAT" in detected_categories and "MONEY_TRANSFER" in detected_categories:
            accumulated_score += 20.0
        if "REMOTE_ACCESS" in detected_categories and "IMPERSONATION" in detected_categories:
            accumulated_score += 20.0

        scam_intent_score = float(np.clip(accumulated_score, 0.0, 100.0))

        # Risk classification
        if scam_intent_score >= 80:
            risk_level = "CRITICAL"
        elif scam_intent_score >= 60:
            risk_level = "HIGH"
        elif scam_intent_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        confidence = 0.92 if len(detected_categories) >= 2 else 0.80

        return {
            "scam_intent_score": round(scam_intent_score, 1),
            "risk_level": risk_level,
            "detected_categories": detected_categories,
            "highlighted_phrases": highlighted_phrases,
            "confidence": confidence,
            "intent_breakdown": intent_breakdown
        }

# Import numpy for clipping
import numpy as np
