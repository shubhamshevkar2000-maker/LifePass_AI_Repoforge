"""
LifePass AI — Groq Cloud LLM Client
Workstream 2: AI + Document Intelligence (Stage AI-2)
Reference: docs/AI_AGENT_SPEC.md & docs/AI_WORKSTREAM_PLAN.md
"""

import json
import logging
import re
from typing import Any, Dict, Optional, Tuple
import httpx
from app.core.config import settings
from app.context.prompt import build_system_prompt, sanitize_and_fence_user_input

logger = logging.getLogger("lifepass.ai.context.llm_client")

GROQ_CHAT_COMPLETIONS_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"


class GroqClient:
    """
    Standard Groq Cloud client for LifePass AI.
    Uses environment credentials (never hard-coded) and enforces JSON schema output.
    Gracefully returns error codes when unconfigured, timed out, or failing.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 10.0,
    ):
        self.api_key = api_key if api_key is not None else settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self.timeout_seconds = timeout_seconds

    def is_configured(self) -> bool:
        """Returns True if a non-empty Groq API key is present."""
        return bool(self.api_key and self.api_key.strip())

    def interpret_user_goal(
        self,
        user_message: str,
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Sends the fenced user goal to Groq Cloud LLM for structured interpretation.
        
        Returns:
            (parsed_dict, None) on success
            (None, error_code) on failure or when unconfigured
        """
        if not self.is_configured():
            return None, "GROQ_NOT_CONFIGURED"

        system_prompt = build_system_prompt()
        fenced_user_prompt = sanitize_and_fence_user_input(user_message)

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": fenced_user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
            "max_tokens": 512,
        }

        # Safe header with masked auth for any debug logs
        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Content-Type": "application/json",
        }

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(
                    GROQ_CHAT_COMPLETIONS_ENDPOINT,
                    headers=headers,
                    json=payload,
                )

            if response.status_code != 200:
                logger.warning(
                    "Groq API returned non-200 status code: %d", response.status_code
                )
                if response.status_code == 401:
                    return None, "GROQ_AUTHENTICATION_FAILED"
                elif response.status_code == 429:
                    return None, "GROQ_RATE_LIMITED"
                else:
                    return None, f"GROQ_HTTP_{response.status_code}"

            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                return None, "GROQ_EMPTY_RESPONSE"

            content = choices[0].get("message", {}).get("content", "")
            return self._parse_json_response(content)

        except httpx.TimeoutException:
            logger.warning("Groq API request timed out after %.1fs", self.timeout_seconds)
            return None, "GROQ_TIMEOUT"
        except httpx.ConnectError:
            logger.warning("Groq API connection failed (network unavailable)")
            return None, "GROQ_CONNECTION_ERROR"
        except Exception as e:
            logger.warning("Groq client encountered error: %s", type(e).__name__)
            return None, "GROQ_REQUEST_FAILED"

    def _parse_json_response(
        self,
        raw_content: str,
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """Parses model text into a validated dictionary, stripping any markdown wrappers."""
        if not raw_content or not raw_content.strip():
            return None, "GROQ_EMPTY_RESPONSE"

        clean = raw_content.strip()

        # Handle markdown fences if present
        if clean.startswith("```"):
            clean = re.sub(r"^```(?:json)?\s*", "", clean)
            clean = re.sub(r"\s*```$", "", clean)
            clean = clean.strip()

        try:
            parsed = json.loads(clean)
        except json.JSONDecodeError:
            logger.warning("Failed to decode JSON from Groq model output")
            return None, "GROQ_MALFORMED_JSON"

        if not isinstance(parsed, dict):
            return None, "GROQ_INVALID_SCHEMA"

        # Validate minimum expected keys
        required_keys = ["task_type", "confidence", "domain", "institution_type"]
        if not all(k in parsed for k in required_keys):
            return None, "GROQ_MISSING_REQUIRED_KEYS"

        return parsed, None
