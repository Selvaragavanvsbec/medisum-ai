"""Groq LLM integration for report summarization."""
import json
import logging

from groq import AsyncGroq

from app.core.config import get_settings
from app.services.prompts import build_messages

logger = logging.getLogger("medisum.llm")
settings = get_settings()

_client: AsyncGroq | None = None


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not configured.")
        _client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _client


def _extract_json(raw: str) -> dict:
    """Robustly pull a JSON object out of the model response."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model response.")
    return json.loads(raw[start : end + 1])


async def summarize_report(report_text: str, reading_level: str = "simple") -> dict:
    """Call Groq and return a structured summary dict."""
    client = _get_client()
    messages = build_messages(report_text, reading_level)

    completion = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.2,          # low -> factual, deterministic
        max_tokens=1500,
        response_format={"type": "json_object"},
    )
    content = completion.choices[0].message.content or ""
    try:
        return _extract_json(content)
    except (ValueError, json.JSONDecodeError) as exc:
        logger.error("Failed to parse LLM JSON: %s", exc)
        raise ValueError("The AI returned an unreadable response. Please retry.")
