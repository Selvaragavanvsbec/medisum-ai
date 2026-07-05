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


async def chat_with_agent(message: str, context_report: str | None = None) -> str:
    """Answer patient questions about their medical report using Groq."""
    client = _get_client()
    
    system_prompt = (
        "You are MediSum AI, an expert medical report analysis chatbot. "
        "Your goal is to answer patient questions about their diagnostic results clearly, empathetically, and accurately. "
        "Strictly adhere to these rules:\n"
        "1. If medical report context is provided under the <REPORT> tag, prioritize answering based on that context.\n"
        "2. If no context report is provided, or the question is general, answer using your expert clinical knowledge. Ensure you state that it is general educational information.\n"
        "3. You are NOT a diagnosing clinician. Never prescribe, diagnose, or recommend treatments.\n"
        "4. Always end your answer with a brief disclaimer recommending they speak with their doctor."
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    if context_report:
        messages.append({
            "role": "system",
            "content": f"The patient has uploaded the following medical report context:\n<REPORT>\n{context_report}\n</REPORT>"
        })
        
    messages.append({"role": "user", "content": message})
    
    completion = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.5,
        max_tokens=600,
    )
    return completion.choices[0].message.content or "No response from AI."

