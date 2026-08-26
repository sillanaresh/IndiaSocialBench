from bhavbench import adapters


def test_stealth_models_use_low_reasoning_effort(monkeypatch):
    captured = {}

    def fake_post(url, headers, payload, retries=3):
        captured.update(payload)
        return {
            "choices": [{"message": {"content": "response"}, "finish_reason": "stop"}],
            "usage": {},
        }

    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    monkeypatch.setattr(adapters, "_post_with_retries", fake_post)

    adapter = adapters.OpenRouterAdapter("stealth/ox-alpha")
    adapter.complete([{"role": "user", "content": "hello"}])

    assert captured["reasoning"] == {"effort": "low"}
