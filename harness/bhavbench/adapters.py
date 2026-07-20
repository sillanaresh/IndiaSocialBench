"""Model adapters: OpenRouter, Sarvam native, and a deterministic offline mock.

Adapter contract: complete(messages, system, **params) -> Completion.
Messages are [{"role": "user"|"assistant", "content": str}] without the system turn.
"""

from __future__ import annotations

import hashlib
import os
import random
import time
from dataclasses import dataclass, field

import httpx


class AdapterError(Exception):
    """Raised after retries are exhausted; runner marks the item `error`."""


@dataclass
class Completion:
    text: str
    usage: dict = field(default_factory=dict)  # prompt_tokens, completion_tokens
    raw: dict = field(default_factory=dict)


RETRY_STATUS = {408, 409, 429, 500, 502, 503, 504}


def _post_with_retries(url: str, headers: dict, payload: dict, retries: int = 3) -> dict:
    last = None
    for attempt in range(retries + 1):
        try:
            resp = httpx.post(url, headers=headers, json=payload, timeout=180)
            if resp.status_code == 200:
                return resp.json()
            last = f"HTTP {resp.status_code}: {resp.text[:300]}"
            if resp.status_code not in RETRY_STATUS:
                break
        except httpx.HTTPError as ex:
            last = f"{type(ex).__name__}: {ex}"
        if attempt < retries:
            time.sleep(min(2**attempt * 2, 30))
    raise AdapterError(f"request failed after {retries + 1} attempts: {last}")


class OpenRouterAdapter:
    """Any model on openrouter.ai. Env: OPENROUTER_API_KEY."""

    BASE = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, model: str):
        self.model = model
        key = os.environ.get("OPENROUTER_API_KEY")
        if not key:
            raise AdapterError("OPENROUTER_API_KEY not set")
        self.headers = {
            "Authorization": f"Bearer {key}",
            "HTTP-Referer": "https://github.com/sillanaresh/bhavbench",
            "X-Title": "BhavBench",
        }

    # Reasoning models burn budget (and tokens) on hidden thought; cap it low.
    REASONING_PREFIXES = ("openai/gpt-5", "google/gemini-3", "qwen/qwen3.7", "anthropic/claude")

    def complete(self, messages, system="", temperature=0.7, max_tokens=1024) -> Completion:
        msgs = ([{"role": "system", "content": system}] if system else []) + list(messages)
        payload = {
            "model": self.model,
            "messages": msgs,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if self.model.startswith(self.REASONING_PREFIXES):
            payload["reasoning"] = {"effort": "low"}
        data = _post_with_retries(self.BASE, self.headers, payload)
        try:
            choice = data["choices"][0]
            text = choice["message"]["content"] or ""
        except (KeyError, IndexError) as ex:
            raise AdapterError(f"malformed response: {data}") from ex
        if not text.strip():
            raise AdapterError(f"empty completion text (finish_reason={choice.get('finish_reason')})")
        return Completion(text=text, usage=data.get("usage") or {}, raw={"finish_reason": choice.get("finish_reason")})


class SarvamAdapter:
    """Sarvam's native chat completions API. Env: SARVAM_API_KEY.

    API shape verified against docs at integration time (M2 open item in PLAN):
    OpenAI-compatible POST /v1/chat/completions with api-subscription-key header.
    """

    BASE = "https://api.sarvam.ai/v1/chat/completions"

    def __init__(self, model: str):
        self.model = model
        key = os.environ.get("SARVAM_API_KEY")
        if not key:
            raise AdapterError("SARVAM_API_KEY not set")
        self.headers = {"api-subscription-key": key}

    def complete(self, messages, system="", temperature=0.7, max_tokens=1024) -> Completion:
        msgs = ([{"role": "system", "content": system}] if system else []) + list(messages)
        data = _post_with_retries(
            self.BASE,
            self.headers,
            {
                "model": self.model,
                "messages": msgs,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        try:
            text = data["choices"][0]["message"]["content"] or ""
        except (KeyError, IndexError) as ex:
            raise AdapterError(f"malformed response: {data}") from ex
        if not text.strip():
            raise AdapterError("empty completion text")
        return Completion(text=text, usage=data.get("usage") or {})


class MockAdapter:
    """Deterministic offline adapter for pipeline tests and sample data.

    Produces clearly-labeled synthetic replies. A per-model "skill" prior (derived
    from the model name hash) lets the mock judge in tests produce spread-out
    scores, so the whole scoring path can be exercised offline.
    """

    def __init__(self, model: str):
        self.model = model
        self.skill = (int(hashlib.sha256(model.encode()).hexdigest(), 16) % 60) / 10 + 3.0  # 3.0..8.9

    def complete(self, messages, system="", temperature=0.7, max_tokens=1024) -> Completion:
        seed = hashlib.sha256(
            (self.model + "|" + system + "|" + "|".join(m["content"] for m in messages)).encode()
        ).hexdigest()
        rng = random.Random(seed)
        n_user = sum(1 for m in messages if m["role"] == "user")
        text = (
            f"[MOCK REPLY — synthetic sample data, not a real model response] "
            f"model={self.model} turn={n_user} skill={self.skill:.1f} nonce={rng.randint(1000, 9999)}"
        )
        return Completion(text=text, usage={"prompt_tokens": 200, "completion_tokens": 40})


def get_adapter(spec: str):
    """spec: 'mock:name', 'sarvam:<model>', or an OpenRouter model id like 'openai/gpt-5.6-sol'."""
    if spec.startswith("mock:"):
        return MockAdapter(spec.removeprefix("mock:"))
    if spec.startswith("sarvam:"):
        return SarvamAdapter(spec.removeprefix("sarvam:"))
    return OpenRouterAdapter(spec)


def model_slug(spec: str) -> str:
    return spec.replace("/", "_").replace(":", "_").replace(".", "-")
