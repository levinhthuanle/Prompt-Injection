import logging
import time
from typing import Optional, List, Dict, Any
from google import genai
from google.genai import types
from google.genai.errors import ClientError, ServerError
from app.core.config import settings

logger = logging.getLogger("uniguard.gemini")


def _call_with_retry(fn, *args, max_retries=4, **kwargs):
    for attempt in range(max_retries):
        try:
            return fn(*args, **kwargs)
        except (ClientError, ServerError) as e:
            status = getattr(e, 'status_code', 0) or 0
            if status in (429, 503) and attempt < max_retries - 1:
                # Try to parse retryDelay from the error details
                wait = 60 * (attempt + 1)  # default backoff
                try:
                    details = e.args[1] if len(e.args) > 1 else {}
                    for detail in details.get('error', {}).get('details', []):
                        if detail.get('@type', '').endswith('RetryInfo'):
                            delay_str = detail.get('retryDelay', '')
                            if delay_str.endswith('s'):
                                wait = int(float(delay_str[:-1])) + 2
                            break
                except Exception:
                    pass
                logger.warning(f"API error {status}, retrying in {wait}s (attempt {attempt+1}/{max_retries})")
                time.sleep(wait)
            else:
                raise


class LLMService:
    def __init__(self):
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set — LLM calls will fail")
        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._model = settings.gemini_model

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        history: Optional[List[Dict[str, str]]] = None,
        tools: Optional[List[Any]] = None,
    ) -> Dict[str, Any]:
        contents = []
        if history:
            for turn in history:
                contents.append(
                    types.Content(role=turn["role"], parts=[types.Part(text=turn["content"])])
                )
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.2,
        )

        response = _call_with_retry(
            self._client.models.generate_content,
            model=self._model,
            contents=contents,
            config=config,
        )

        text = response.text or ""
        return {"text": text, "raw": response}

    async def generate_with_tools(
        self,
        system_prompt: str,
        user_message: str,
        tool_declarations: List[Dict[str, Any]],
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        contents = []
        if history:
            for turn in history:
                contents.append(
                    types.Content(role=turn["role"], parts=[types.Part(text=turn["content"])])
                )
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

        gemini_tools = []
        for t in tool_declarations:
            func = types.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=t.get("parameters", {}),
            )
            gemini_tools.append(func)

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            tools=[types.Tool(function_declarations=gemini_tools)] if gemini_tools else None,
            temperature=0.2,
        )

        response = _call_with_retry(
            self._client.models.generate_content,
            model=self._model,
            contents=contents,
            config=config,
        )

        tool_calls = []
        text_parts = []
        for part in response.candidates[0].content.parts:
            if hasattr(part, "function_call") and part.function_call:
                fc = part.function_call
                tool_calls.append({
                    "name": fc.name,
                    "arguments": dict(fc.args) if fc.args else {},
                })
            elif hasattr(part, "text") and part.text:
                text_parts.append(part.text)

        return {
            "text": " ".join(text_parts),
            "tool_calls": tool_calls,
            "raw": response,
        }


llm_service = LLMService()
