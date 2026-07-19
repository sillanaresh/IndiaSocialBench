# Scenario File Schema (v1)

One YAML file per base scenario: `dataset/scenarios/{roleplay|analysis}/{id}.yaml`.
IDs: `{prefix}-{3-digit seq}` with prefixes `ind hier fam hon mix rit mon sup`
(matching dimensions `indirectness hierarchy family honor_shame code_mixing rituals money support`).
Validated by `harness/validate_dataset.py` — run it before every commit that touches scenarios.

## Fields

| Field | Req | Type | Rules |
|---|---|---|---|
| `id` | ✓ | str | Matches filename; prefix matches `dimension` |
| `type` | ✓ | enum | `roleplay` \| `analysis` |
| `dimension` | ✓ | enum | One of the 8 taxonomy IDs |
| `secondary` | – | list[enum] | Other applicable dimensions, ≤2 |
| `title` | ✓ | str | ≤ 60 chars, human-readable |
| `persona` | ✓ | map | `age` (int), `gender` (`m/f/x`), `region` (`north/south/east/west/ne`), `setting` (`metro/town/rural`), `stance` (`embracing/resisting/ambivalent` — toward the relevant norm), `religion` (only if the scenario turns on it) |
| `situation` | ✓ | str | Ground truth of what's really going on. Judge-only; never sent to evaluated model |
| `system_prompt` | ✓ (roleplay) | str | The evaluated model's role. Shared across variants. Keep neutral: no cultural coaching hints |
| `probe_note` | ✓ (roleplay) | str | What the probe turn tests and where it is (`turn: 3`) |
| `gold_rationale` | ✓ | str | Roleplay: what a strong response arc does + named failure modes. Analysis: the key insights, as bullet-like prose |
| `rubric_weights` | – | map | criterion_id → float multiplier (default 1.0 each) |
| `variants` | ✓ | map | Keys from {`en`,`hing`,`hi`}. All three required unless `variants_exempt` |
| `variants_exempt` | – | bool+`exempt_reason` | Only for switch-point `code_mixing` scenarios |
| `review` | ✓ | map | `author`, `cultural_review` (`pending/passed`), `status` (`draft/pilot/final`) |

### Variant shape — roleplay
```yaml
variants:
  en:
    user_turns:          # exactly 4 strings, 30–80 words each
      - "..."
```
Turn counts must be identical across variants of a scenario.

### Variant shape — analysis
```yaml
variants:
  en:
    transcript: |        # the conversation the model analyses, plain text,
      Arjun: ...         # "Name: message" lines. Names may localize per variant.
      Rahul: ...
    questions:           # exactly 3 strings; must be meaning-equivalent across variants
      - "..."
```

## Invariants the validator enforces

1. `id` == filename stem; prefix ↔ dimension consistency.
2. All three variants present (or valid exemption); equal turn/question counts across variants.
3. Roleplay: exactly 4 user turns; probe turn index in {3, 4}.
4. Analysis: exactly 3 questions; transcript non-empty.
5. `hi` variant contains Devanagari codepoints; `en` contains none; `hing` is Roman-script
   (Devanagari not allowed — Hinglish is defined here as Roman-script code-mixing).
6. No canary string missing repo-wide (checked once, not per file).
7. `situation` and `gold_rationale` never appear verbatim inside any variant text.
8. `rubric_weights` keys ⊂ rubric criteria for the scenario's type.
