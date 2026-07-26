# IndiaSocialBench

**Does your model understand India?**

[View the live leaderboard](https://indiasocialbench.nareshsilla.com/), [read the technical report](paper/DRAFT.md), or [inspect the source and results](https://github.com/sillanaresh/IndiaSocialBench).

IndiaSocialBench measures the emotional and cultural intelligence of large language models in Indian conversations. It scores models on multi-turn conversations across eight dimensions of Indian social and emotional life in Indian English, Hinglish, and Hindi. It publishes a public leaderboard where every score is traceable to the exact transcript that produced it.

> **Status:** The live board covers 28 models, with up to 50 items per run in English, Hinglish,
> and Hindi. The initial 11-model pilot cost $4.97. The expanded board was completed within a $30
> API budget. Scores use one uniform blinded judge and remain provisional until human calibration. See
> [PLAN.md](PLAN.md) for the build plan and `results/` for every raw transcript and judgment.

---

## Why this exists

Frontier models now top every English emotional-intelligence benchmark. Meanwhile, the fastest-growing population of new AI users types in Hinglish on a ₹12,000 phone. They bring conversations about a boss who cannot be contradicted directly, a friend's loan that cannot be refused outright, a rishta the family is pushing, or a condolence message that must strike exactly the right register. These are precisely the conversations no benchmark measures.

This gap has real consequences:

- **Model builders** (Sarvam, and the wider Indic ecosystem) train culturally grounded models but have no instrument that *proves* the cultural advantage. India can train a sovereign model; it cannot currently show where that model beats GPT.
- **Enterprises** deploying conversational AI to hundreds of millions of Indian users select vendors on latency and ASR accuracy, because nobody can tell them which model will mishandle a grieving or humiliated customer.
- **Users** get advice optimized for a different society: "set firm boundaries with your mother-in-law" is a coherent sentence and a culturally impossible action.

A benchmark is the smallest product that moves all three. It converts "our model understands Indian users" from a marketing claim into a number, a per-dimension diagnostic, and a set of receipts.

## What it measures

IndiaSocialBench is deliberately *not* a clinical psychology EQ test. It measures **cultural pragmatics**, the layer where emotion and social structure meet, across eight dimensions. Each is grounded in established cross-cultural psychology and sociolinguistics:

| Dimension | The question | Grounding |
|---|---|---|
| Indirect speech & face-saving | Does the model know "dekhte hain" usually means no? | Hall's high-context communication; politeness theory |
| Hierarchy & respect registers | Can it help a junior disagree with a boss without the Western "give direct feedback" playbook? | Hofstede power distance (India ≈ 77) |
| Family & the collective self | Does it understand decisions made by families, not individuals? | Markus & Kitayama, interdependent self-construal |
| Honor, shame & reputation | Does it recognize *log kya kahenge* as a real constraint, not an irrationality to be dismissed? | Shame/guilt culture distinction; face theory |
| Code-mixed emotional register | Does it hear that switching into Hindi mid-sentence *is* the emotional signal? | Gumperz's we-code/they-code |
| Ritual & life-event pragmatics | Does it know what you say, and never text, when someone's father dies? | Ethnography of Indian life-cycle ritual |
| Money, obligation & reciprocity | Can it navigate a loan between friends where a direct "no" ends the friendship? | Anthropology of reciprocity |
| Support calibration *(control)* | Universal EI, such as venting instead of solving, included so the cultural gap can be isolated from general empathy | Rogerian active listening |

Two design choices carry most of the signal. First, every scenario exists in **three matched language variants** (English / Hinglish / Devanagari Hindi), so the benchmark yields a *language gap* metric: how much emotional intelligence a model loses when the same human problem arrives in Hindi. Second, each conversation contains a **probe turn**. This scripted moment is designed to trigger the specific failure the scenario tests (the user says "I don't want solutions"; the user takes an indirect refusal literally). Models don't fail on averages; they fail at moments. The benchmark is built out of moments.

Scenarios are hand-curated under explicit anti-stereotype rules. They reflect norms that are operative *for the person in the scenario* instead of prescribing one "correct" Indian culture. Personas vary in region, religion, class, and their own stance toward tradition. Several scenarios deliberately penalize models that apply cultural stereotypes instead of reading the actual person.

## How it works

- **Scripted multi-turn roleplay + transcript analysis.** The user side of every conversation is fixed in advance, so every model faces an identical conversation. This removes user simulator variance and makes runs easy to compare and reproduce.
- **Rubric-based LLM judging with published error bars.** The current board uses one uniform blinded judge that writes a justification before each score. A second judge and blind human calibration are planned. Until then, absolute scores are provisional and overlapping confidence intervals should be read as ties.
- **Honest failure accounting.** Refusals are never averaged away. Over-refusal on ordinary Indian family topics is reported as its own leaderboard column. Bootstrap confidence intervals gate ranking claims; models with overlapping CIs share a rank tier.
- **Receipts, always.** Every number on the leaderboard is clickable down to the raw transcript and the judge's written reasoning. If a model scored 3.1 on hierarchy, you can read the conversation where it told a 24-year-old analyst to "schedule a candid 1:1" with her 55-year-old boss.
- **Runs anywhere.** A single CLI (`indiasocialbench run --model <id>`) evaluates any model reachable through OpenRouter, plus a native adapter for Sarvam's API. Runs are cached and resumable. Use `indiasocialbench estimate --model <id>` to preview cost before making API calls. The previous `bhavbench` command remains available for compatibility.
- **Fast static delivery.** Public pages are exported as static files. The homepage receives only the summary data it displays. Detailed transcript data and Devanagari fonts load only when needed.

## Repository map

```
dataset/    scenarios (YAML), taxonomy, rubrics, authoring rules
harness/    Python runner, adapters, judge, scoring
results/    raw transcripts + generated leaderboard data
web/        the leaderboard site (Next.js)
PLAN.md     the full build plan; start here to contribute or continue the work
```

## Run it locally

The harness needs Python 3.11 or newer and [uv](https://docs.astral.sh/uv/).

```bash
cd harness
uv sync --frozen
uv run indiasocialbench estimate --model your/model
uv run pytest -q
```

The website needs Node.js 22.

```bash
cd web
npm ci
npm run dev
```

To request a model, [open a model evaluation issue](https://github.com/sillanaresh/IndiaSocialBench/issues/new?template=model-evaluation.yml). Include the exact model ID and provider.

## Citation

Use the metadata in [CITATION.cff](CITATION.cff) when you cite this project. The code and benchmark files are available under the [MIT License](LICENSE).

## Author

Built by Naresh Silla as a product + research portfolio project: an exercise in finding the eval a market actually needs, then building it with the rigor the claim requires.
