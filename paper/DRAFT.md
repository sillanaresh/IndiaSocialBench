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

## 5. Experiments ⏳

Models (≥8 incl. Sarvam-M / Sarvam-30B via native API, frontier via OpenRouter), decoding params,
cost. Headline results table; Language Gap chart; per-dimension heatmap; support-vs-cultural
dimension contrast (isolating the cultural gap); refusal analysis on family/honor topics;
qualitative failure gallery (probe-turn misses, register mismatches, "boundary-setting" advice).

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
