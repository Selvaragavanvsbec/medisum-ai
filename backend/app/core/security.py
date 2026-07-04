"""Input validation, sanitization, and prompt-injection screening.

This module is the first line of defense before any user-supplied medical
text reaches the LLM. It never logs raw report content (PII protection);
only a salted SHA-256 digest is used for de-duplication / audit.
"""
import hashlib
import re
from dataclasses import dataclass

# Patterns that indicate an attempt to override the system prompt or exfiltrate
# instructions. Kept deliberately conservative to avoid false positives on real
# medical text.
_INJECTION_PATTERNS = [
    r"ignore (all|any|the) (previous|prior|above) (instructions|prompts?)",
    r"disregard (the )?(system|previous) (prompt|instructions)",
    r"you are now (a|an|the)\b",
    r"reveal (your )?(system )?prompt",
    r"print (your )?(system )?prompt",
    r"act as (a|an)? ?(dan|jailbreak|developer mode)",
    r"</?(system|assistant|user)>",
    r"\bBEGIN SYSTEM\b",
]
_INJECTION_RE = re.compile("|".join(_INJECTION_PATTERNS), re.IGNORECASE)

# Zero-width / bidi-override characters used to smuggle hidden instructions.
_OBFUSCATION_RE = re.compile(r"[\u200b-\u200f\u202a-\u202e\u2066-\u2069]")


@dataclass
class ScreenResult:
    ok: bool
    reason: str = ""
    suspicion: float = 0.0


def content_hash(text: str) -> str:
    """Non-reversible digest for audit/dedup. Never stores raw PII."""
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


def sanitize(text: str) -> str:
    """Strip obfuscation characters and normalize whitespace."""
    text = _OBFUSCATION_RE.sub("", text)
    return text.strip()


def screen_input(text: str, max_chars: int) -> ScreenResult:
    """Validate and screen a raw medical report before LLM processing."""
    if not text or not text.strip():
        return ScreenResult(ok=False, reason="Empty input.")

    if len(text) > max_chars:
        return ScreenResult(
            ok=False,
            reason=f"Input exceeds {max_chars} character limit.",
        )

    suspicion = 0.0
    if _OBFUSCATION_RE.search(text):
        suspicion += 0.4
    if _INJECTION_RE.search(text):
        suspicion += 0.6

    if suspicion >= 0.6:
        return ScreenResult(
            ok=False,
            reason="Input flagged as a possible prompt-injection attempt.",
            suspicion=suspicion,
        )

    return ScreenResult(ok=True, suspicion=suspicion)
