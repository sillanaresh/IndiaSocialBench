# BhavBench: Measuring the Cultural Gap in LLM Emotional Intelligence for Indian Conversations

**Naresh Silla** · Draft v0.1 — sections marked ⏳ await live-run results.

## Abstract

Frontier language models saturate English emotional-intelligence benchmarks, yet no instrument
measures whether they understand the emotional and social texture of Indian conversations —
indirect refusals, respect registers, joint-family negotiation, honor and shame, code-mixed
emotional signaling, ritual pragmatics, and obligation economies. We introduce BhavBench, a
benchmark of 18 (target: 54) hand-curated multi-turn scenarios, each shipped in matched English,
Hinglish, and Hindi renderings, scored by blinded LLM judges on anchored rubrics with published
human-agreement statistics. BhavBench yields a per-dimension diagnostic and a headline *Language
Gap* metric: how much emotional intelligence a model loses when the identical human situation
arrives in Hindi rather than English. ⏳ We evaluate N frontier and Indic models and find …

## 1. Introduction

- The eval gap: EQ-Bench 3 / EmotionQueen measure clinically-framed EI in an implicitly Western
  frame; CuLEmo covers cross-cultural emotion naming but is single-turn and small. Nothing measures
  *cultural pragmatics* — the layer where emotion meets social structure.
- The product stakes: sovereign-model programs (India and elsewhere) can train models but cannot
  prove cultural advantage; enterprises deploying Indic conversational AI select on ASR latency
  because no conversational-quality instrument exists.
- Contributions: (1) a task design isolating cultural from general EI via a control dimension;
  (2) matched language triplets enabling the Language Gap metric; (3) probe-turn methodology for
  multi-turn scenarios with scripted users; (4) a fully open, receipt-first evaluation stack.

## 2. Related work

EQ-Bench 3 (multi-turn roleplay, Elo). EmotionQueen (empathy). CuLEmo (culture-aware emotion
prediction, 6 languages). Cultural-alignment surveys (Hofstede-probing of LLMs). Code-mixing NLP
(COMI-LINGUA etc.). LLM-as-judge validity and bias literature (length, self-preference, position).
Position BhavBench: conversational, culturally situated, production + perception, receipts-first.

## 3. Benchmark design

### 3.1 Eight dimensions
Table of dimensions with groundings (Hall high-context; Hofstede power distance; Markus & Kitayama
interdependent self; face theory; Gumperz we-code/they-code; ritual ethnography; reciprocity;
Rogerian support as the culture-neutral control).

### 3.2 Tasks
Roleplay with scripted self-propelled user turns + engineered probe turn (why scripted: variance,
cost, comparability). Transcript analysis against author gold rationales (perception vs production).

### 3.3 Language triplets
Parallel composition (not translation); Hinglish as primary register; switch-point scenarios
(hing-only, register shift as measured phenomenon); Devanagari competence requirements.

### 3.4 Anti-stereotype protocol
Reflect-don't-prescribe rule; persona stance variation (embracing / resisting / ambivalent);
stereotype-punishing scenarios; distribution tracking (region, religion, class, gender, setting);
named cultural-review pass.

## 4. Scoring

Anchored 0–10 rubrics (5 criteria roleplay / 3 analysis); two blinded judges from different
families, justification-before-score; refusals excluded and reported as a separate metric;
dimension-equal aggregation; bootstrap CIs; rank ties under CI overlap.

### 4.1 Judge validation ⏳
50-transcript stratified human calibration; Spearman ρ per criterion; rubric revision loop;
length-bias correlation table; self-preference sensitivity (per-judge score tables).

## 5. Experiments — pilot run (2026-07-20, provisional)

**Setup.** 11 models across 9 labs (Claude Haiku 4.5, GPT-5.6 Luna, GPT-5 Mini, Gemini 3.1 Flash
Lite, DeepSeek V4 Flash & Pro, Qwen3.6 Flash, Llama 4 Maverick, Mistral Large 2512, MiniMax M3,
Grok 4.3), 50 items each, temperature 0.7, single blinded judge (Gemini 3.1 Flash Lite; see §4
caveats — no human calibration yet, so all numbers are provisional). GLM-4.7 excluded (provider
errors left only 30/50 items). Total cost of the entire evaluation: **under $5** on OpenRouter.

**R1 — Culture is harder than empathy.** Field average on the culture-neutral `support` control:
**7.72/10**; across the seven cultural dimensions: **6.58**. The two weakest dimensions field-wide
are exactly the most indirection-loaded ones: `indirectness` (**5.36**) and `money` (**5.66**) —
models reliably miss the "no" inside "dekhte hain" and mis-handle refusals that must save face.
`family` is the strongest dimension (8.30): rishta-and-parents content is likely well-represented
in training data; reading an *individual's* stance inside a hierarchy or a loan ledger is not.

**R2 — The language gap is real and directional.** 9 of 11 models score lower in Hindi than in
English on identical scenarios; mean en→hi gap **+0.69** points. Largest collapse: DeepSeek V4 Pro
(**+3.23**: 8.97 en → 5.08 hi) — flagship English performance with brittle Hindi. GPT-5.6 Luna is
the notable inversion (−0.27: slightly *better* in Hindi).

**R3 — Rankings scramble the general-purpose order.** MiniMax M3 tops the board (8.27, on 43/50
items); Llama 4 Maverick — a strong general benchmark performer — lands last (3.23), with judge
justifications repeatedly citing register mismatch and premature advice. Composite-index rank does
not predict cultural-emotional competence.

**R4 — Refusals are rare.** Only MiniMax M3 (4.8%) and DeepSeek V4 Flash (4.0%) refused any
ordinary family-life scenarios; over-refusal is not currently the binding failure mode.

**Extended run (same day):** with a credit top-up and a Sarvam API key, the board grew to 27 rows across 14 labs. Claude Fable 5 leads (9.47) with a near-zero en→hi gap (+0.04), and the top tier generally shows language robustness scaling with capability — the Language Gap concentrates in mid-tier models (MiMo V2.5 Pro +2.27, DeepSeek V4 Pro +3.23, GLM-5.2 +1.33). Sarvam-105B improves from 5.54 to 7.04 when allowed high reasoning effort (run as a separately-labeled variant under the uniform low-effort policy); Sarvam-30B does not benefit (5.89 vs 5.86). All claims are recomputable from `results/raw/` (every transcript and judge justification is
committed). ⏳ Pending for the full version: two-family judging, human-calibration ρ, flagship
tier (Fable 5, GPT-5.6 Sol, Opus 4.8), Sarvam models via native API.

## 6. Analysis ⏳

- Does the gap grow with cultural specificity (support < money < honor_shame)?
- Hinglish vs Hindi: is the gap script-driven or culture-driven?
- Do Indic models trade general EI for cultural calibration?
- Judge disagreement patterns; where humans and judges diverge.

## 7. Limitations

LLM-judge ceiling; Hindi-belt skew of v1 (Tamil/Telugu as v2 priority); public-set contamination
(canary + holdout); a benchmark of culture encodes choices — all texts and prompts are public so
those choices are contestable; author-centered curation (single primary curator, one review pass).

## 8. Release

Dataset, harness, judgments, site, and this report; canary string; how to submit a model.

---
*Writing rule for this draft: no result may be stated that is not backed by a run artifact in
`results/`. Sections marked ⏳ stay empty until then.*
