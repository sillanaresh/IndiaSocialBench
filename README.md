# BhavBench

**Does your model understand India?**

BhavBench (भाव — *bhāv*: feeling, emotion, inner state) is a benchmark for measuring the emotional and cultural intelligence of large language models in Indian conversations. It scores models on multi-turn conversations across eight dimensions of Indian social-emotional life, in three matched language modes — Indian English, Hinglish, and Hindi — and publishes the results as a public leaderboard where every score is traceable to the exact transcript that produced it.

> **Status:** first live board is running — 12 real models across 10 labs (Anthropic, OpenAI ×2,
> Google, DeepSeek ×2, Alibaba, Meta, Mistral, Zhipu, MiniMax, xAI), 50 items each in three
> language modes, judged blind by two model families, all on a $5 API budget. See
> [PLAN.md](PLAN.md) for the build plan and `results/` for every raw transcript and judgment.

---

## Why this exists — the product case

Frontier models now top every English emotional-intelligence benchmark. Meanwhile, the fastest-growing population of new AI users types in Hinglish on a ₹12,000 phone, and the conversations they bring — a boss who can't be contradicted directly, a friend's loan that can't be refused outright, a rishta the family is pushing, a condolence message that must strike exactly the right register — are precisely the conversations no benchmark measures.

This gap has real consequences:

- **Model builders** (Sarvam, and the wider Indic ecosystem) train culturally grounded models but have no instrument that *proves* the cultural advantage. India can train a sovereign model; it cannot currently show where that model beats GPT.
- **Enterprises** deploying conversational AI to hundreds of millions of Indian users select vendors on latency and ASR accuracy, because nobody can tell them which model will mishandle a grieving or humiliated customer.
- **Users** get advice optimized for a different society: "set firm boundaries with your mother-in-law" is a coherent sentence and a culturally impossible action.

A benchmark is the smallest product that moves all three. It converts "our model understands Indian users" from a marketing claim into a number, a per-dimension diagnostic, and a set of receipts.

## What it measures — the domain case

BhavBench is deliberately *not* a clinical-psychology EQ test. It measures **cultural pragmatics** — the layer where emotion and social structure meet — across eight dimensions, each grounded in established cross-cultural psychology and sociolinguistics:

| Dimension | The question | Grounding |
|---|---|---|
| Indirect speech & face-saving | Does the model know "dekhte hain" usually means no? | Hall's high-context communication; politeness theory |
| Hierarchy & respect registers | Can it help a junior disagree with a boss without the Western "give direct feedback" playbook? | Hofstede power distance (India ≈ 77) |
| Family & the collective self | Does it understand decisions made by families, not individuals? | Markus & Kitayama, interdependent self-construal |
| Honor, shame & reputation | Does it recognize *log kya kahenge* as a real constraint, not an irrationality to be dismissed? | Shame/guilt culture distinction; face theory |
| Code-mixed emotional register | Does it hear that switching into Hindi mid-sentence *is* the emotional signal? | Gumperz's we-code/they-code |
| Ritual & life-event pragmatics | Does it know what you say — and never text — when someone's father dies? | Ethnography of Indian life-cycle ritual |
| Money, obligation & reciprocity | Can it navigate a loan between friends where a direct "no" ends the friendship? | Anthropology of reciprocity |
| Support calibration *(control)* | Universal EI — venting vs. solving — included so the cultural gap can be isolated from general empathy | Rogerian active listening |

Two design choices carry most of the signal. First, every scenario exists in **three matched language variants** (English / Hinglish / Devanagari Hindi), so the benchmark yields a *language gap* metric: how much emotional intelligence a model loses when the same human problem arrives in Hindi. Second, each conversation contains a **probe turn** — a scripted moment engineered to trigger the specific failure the scenario tests (the user says "I don't want solutions"; the user takes an indirect refusal literally). Models don't fail on averages; they fail at moments. The benchmark is built out of moments.

Scenarios are hand-curated under explicit anti-stereotype rules: they reflect norms that are operative *for the person in the scenario* rather than prescribing one "correct" Indian culture, personas vary in region, religion, class, and their own stance toward tradition — and several scenarios deliberately penalize models that apply cultural stereotypes instead of reading the actual person.

## How it works — the technical case

- **Scripted multi-turn roleplay + transcript analysis.** The user side of every conversation is fixed in advance, so every model faces an identical conversation — no user-simulator variance, clean cross-model comparison, reproducible runs.
- **Rubric-based LLM judging with published error bars.** Two judges from different model families score five anchored criteria per transcript (justification before score, model identity blinded). Judge validity is not assumed: judges are calibrated against blind human ratings on a stratified sample, and the agreement coefficient is published, along with length-bias and self-preference diagnostics.
- **Honest failure accounting.** Refusals are never averaged away — over-refusal on ordinary Indian family topics is reported as its own leaderboard column. Bootstrap confidence intervals gate ranking claims; models with overlapping CIs share a rank tier.
- **Receipts, always.** Every number on the leaderboard is clickable down to the raw transcript and the judge's written reasoning. If a model scored 3.1 on hierarchy, you can read the conversation where it told a 24-year-old analyst to "schedule a candid 1:1" with her 55-year-old boss.
- **Runs anywhere.** A single CLI (`bhavbench run --model <id>`) evaluates any model reachable via OpenRouter, plus a native adapter for Sarvam's API. Runs are cached, resumable, and budget-capped.

## Repository map

```
dataset/    scenarios (YAML), taxonomy, rubrics, authoring rules
harness/    Python runner, adapters, judge, scoring
results/    raw transcripts + generated leaderboard data
web/        the leaderboard site (Next.js)
PLAN.md     the full build plan — start here to contribute or continue the work
```

## Author

Built by Naresh Silla as a product + research portfolio project: an exercise in finding the eval a market actually needs, then building it with the rigor the claim requires.
