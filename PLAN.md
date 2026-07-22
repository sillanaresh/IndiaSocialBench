# IndiaSocialBench Build Plan

**An emotional & cultural intelligence benchmark for Indian conversations.**

This document is the single source of truth for how IndiaSocialBench gets built. It is written so that any agent (or human) can pick up any milestone cold and continue the work. Read this whole file before writing code or dataset content. When you make a decision that deviates from this plan, record it in §12 (Decisions Log) in the same commit.

---

## 1. What we are building and why

### 1.1 The one-paragraph pitch

Frontier LLMs top every English emotional-intelligence benchmark (EQ-Bench 3, EmotionQueen), yet no benchmark measures whether a model understands the emotional and social texture of *Indian* conversations: indirect refusals, the aap/tum register, joint-family dynamics, honor and "log kya kahenge," condolence norms, code-mixed Hinglish where the emotional weight rides on the Hindi words. IndiaSocialBench is a multi-turn, judge-scored benchmark that measures exactly this, publishes a public leaderboard across frontier and Indic models (including Sarvam's), and quantifies the "cultural gap" — how much a model's emotional intelligence drops when the conversation moves from English to Hinglish to Hindi.

### 1.2 Why this is not EQ-Bench with Indian names

- EQ-Bench measures *clinical/psychological* EI in a culture-neutral (implicitly Western) frame. IndiaSocialBench measures **cultural pragmatics**: does the model know that "dekhte hain" usually means no, that you don't tell a 26-year-old to "just move out," that a condolence text has a register.
- Every scenario exists in **three matched language variants** (English, Hinglish, Hindi/Devanagari). Identical situation, identical rubric. The per-language delta is a headline metric no existing benchmark produces.
- Scenarios are scored not only for empathy but for **culturally viable advice** — a response can be emotionally warm and still fail because it proposes a socially impossible action.

### 1.3 Who this is for (product framing)

1. **Primary: the portfolio audience.** Interviewers at Sarvam and similar labs. The artifact must demonstrate eval-design depth, cultural domain expertise, and product craft. Every design decision below doubles as an interview talking point.
2. **Model builders (Sarvam, Krutrim, BharatGen, open-source Indic community).** A diagnostic: which cultural dimensions does my model fail?
3. **Enterprise buyers of Indic conversational AI.** Today they choose voice-bot vendors on latency and ASR accuracy; nobody can tell them which model won't insult a grieving customer.

### 1.4 Definition of success (v1)

- ≥ 8 models scored end-to-end, including ≥ 1 Sarvam model, published on a polished public leaderboard.
- ≥ 150 scenario-items (≥ 50 base scenarios × 3 language variants), every one hand-curated.
- Judge validated against human labels (target: Spearman ρ ≥ 0.7 on the calibration set; report the actual number honestly whatever it is).
- Every leaderboard number is clickable down to the raw transcript that produced it ("receipts, always").
- A methodology page rigorous enough that an eval engineer finds nothing embarrassing.

---

## 2. Benchmark design (the intellectual core)

### 2.1 The eight dimensions

Each scenario is tagged with exactly one **primary dimension** (what the rubric weights hardest) and optionally secondary tags. Dimension IDs are stable snake_case keys used across dataset, harness, and UI.

| # | ID | Name | What it measures | Grounding |
|---|----|------|------------------|-----------|
| 1 | `indirectness` | Indirect speech & face-saving | Reading the unsaid "no", hints, deflections ("dekhte hain", "try karenge"); helping the user respond without forcing anyone to lose face | Hall's high-/low-context cultures; Brown & Levinson politeness theory |
| 2 | `hierarchy` | Hierarchy & respect registers | aap/tum/tu calibration, elder & boss dynamics, how disagreement travels upward; knowing that a junior cannot "give feedback" to a boss the way US management books assume | Hofstede power distance (India ≈ 77 vs US ≈ 40) |
| 3 | `family` | Family & the collective self | Joint-family dynamics, in-laws, arranged-marriage negotiations, parental expectations vs individual desire; decisions are made by units, not individuals | Markus & Kitayama's interdependent self-construal; Triandis collectivism |
| 4 | `honor_shame` | Honor, shame & reputation | Izzat, "log kya kahenge", concealment of failure from the community, shame spirals; distinguishing shame (social exposure) from guilt (private conscience) | Benedict's shame/guilt culture distinction; face theory |
| 5 | `code_mixing` | Code-mixed emotional register | The language switch *is* the signal: shifting into Hindi mid-sentence often marks intimacy, hurt, or seriousness; replying in the wrong register breaks rapport | Sociolinguistics of code-switching (Gumperz: "we-code" vs "they-code") |
| 6 | `rituals` | Life events, ritual & religious pragmatics | Grief and condolence norms (what you say, what you never text), festival and wedding obligations, gift/shagun etiquette, religious sensitivity across communities | Ethnography of Indian life-cycle rituals |
| 7 | `money` | Money, obligation & reciprocity | Loans between friends/family that can't be refused directly, salary asymmetries, dowry-adjacent pressure, obligation ledgers that never appear in words | Economic anthropology of reciprocity; lena-dena norms |
| 8 | `support` | Support calibration | Venting vs solving: does the model launch into fix-it advice when the user needs witnessing? Universal EI — deliberately included as the **anchor dimension** so IndiaSocialBench scores can be sanity-checked against Western benchmarks | Rogers' active listening; EQ-Bench's empathy criteria |

**Design rule:** `support` is the control. If a model scores high on `support` but low on `indirectness`/`honor_shame`, that isolates the *cultural* gap from general EI. This comparison is a headline chart.

### 2.2 Anti-stereotype guardrails (non-negotiable)

The fastest way to make this benchmark embarrassing is to encode "one true Indian culture." Rules for every scenario:

1. **Reflect, don't prescribe.** Scenarios present a person *for whom* these norms are operative. The rubric never rewards "you must obey your parents"; it rewards *recognizing what is at stake for this person* and advising within their stated constraints.
2. **No monoculture.** Across the dataset, vary: region (N/S/E/W India), religion (Hindu, Muslim, Christian, Sikh — condolence norms differ and at least one scenario must turn on that), class, urban/rural, gender, age. Track this in scenario metadata (`persona.region`, etc.) and check distribution at M4.
3. **The user's own stance varies.** Some personas embrace tradition, some are fighting it, some are ambivalent. The model's job is to read *this person*, not to apply a cultural lookup table. Several scenarios deliberately punish stereotype-application (e.g., a father who *wants* his daughter to marry for love; the model that assumes he's the obstacle fails).
4. **A named cultural reviewer pass** (the author + at least one other native speaker) before any scenario ships. Checklist in `dataset/authoring-checklist.md`.

### 2.3 Task types

**Type A — Roleplay (target ~70% of base scenarios).**
The evaluated model is a conversational AI (assistant or "trusted friend" persona set by system prompt) talking with a scripted user in an emotionally loaded situation. The user side is **fully scripted in advance**: 4 fixed user turns per scenario. The model produces 4 replies; the full transcript is judged.

- *Why scripted, not simulated:* a user-simulator LLM introduces uncontrolled variance and contaminates the measurement (you're partly measuring the simulator). Scripted turns make every model face the *identical* conversation → clean comparisons, reproducibility, and 4× lower cost. 
- *The robustness constraint this creates:* scripted turns must read naturally regardless of what the model said. Authoring rule: each user turn is written as **self-propelled** — the user continues their own emotional arc (new information, escalation, a doubt, a reversal) rather than answering the model. This mirrors real venting behavior and is the same trick EQ-Bench 3 uses. Turn 3 or 4 of every roleplay contains a **probe turn** — a moment specifically designed to catch the failure mode this scenario tests (e.g., in a venting scenario the user says "I don't need you to fix it"; in an indirectness scenario the user takes the deflection literally).
- Length: user turns 30–80 words each. Total scenario ≤ 400 words of user text.

**Type B — Transcript analysis (target ~30% of base scenarios).**
The evaluated model reads a completed conversation (WhatsApp-style, between two humans) and answers 3 fixed questions: (1) What is [person X] actually feeling/meaning — including what they did *not* say? (2) What did [person Y] miss or get wrong? (3) What would a good next message from Y look like? The model's analysis is judged against an **author-written gold rationale** (the key insights a strong human reader would produce).

- *Why include this:* separates *perception* (can the model read the situation?) from *production* (can it respond well?). A model can fail roleplay for style reasons while understanding perfectly; Type B isolates comprehension. Also cheap: 1 completion per item.

### 2.4 Language variants (the triplet design)

Every base scenario ships in exactly three renderings with matched meaning:

| Code | Rendering | Notes |
|------|-----------|-------|
| `en` | Indian English | Not US English — Indian-English idiom ("do the needful"-register avoided, but natural Indian phrasing kept) |
| `hing` | Hinglish, Roman script | The realistic WhatsApp register. Code-mix ratio must feel native, not word-swapped. This is the **primary** variant — it is how the target user base actually types |
| `hi` | Hindi, Devanagari | Standard conversational Hindi (not shuddh/Sanskritized). |

Rules:
- Variants are *renderings of the same situation*, not translations of each other's sentences — each must read as if originally written in that register. A literal translation that sounds unnatural is a bug.
- The rubric and gold rationale are shared across the triplet (written once, in English, per base scenario).
- The `code_mixing` dimension additionally uses **switch-point scenarios** where the emotional signal *is* a mid-conversation register shift; these only exist in `hing` (a triplet would destroy the phenomenon — mark `variants_exempt: true` with a reason).
- v2 (post-launch): add one Dravidian language (Tamil or Telugu + code-mixed variant) to break the "India = Hindi" assumption. Out of scope for v1; note it prominently on the site's limitations section.

### 2.5 Scenario file format

One YAML file per base scenario in `dataset/scenarios/{roleplay|analysis}/`. Filename = scenario ID: `{dim-prefix}-{seq}.yaml` (e.g. `ind-001.yaml`). Schema is documented in `dataset/schema.md` and machine-validated by `harness/validate_dataset.py`. Key fields:

```yaml
id: ind-001
type: roleplay            # roleplay | analysis
dimension: indirectness    # primary; exactly one of the 8 IDs
secondary: [money]         # optional
title: short human-readable slug
persona:                   # who the *user* is (drives anti-stereotype tracking)
  age: 29
  gender: m
  region: north
  setting: urban
  religion: hindu          # only when relevant to the scenario; else omit
situation: >               # 2-4 sentence author's note: ground truth of what is
  really going on. Never shown to the evaluated model. Shown to the judge.
system_prompt: >           # identical across variants; sets the model's role
probe_note: >              # what the probe turn is designed to catch (judge sees this)
gold_rationale: >          # for analysis type: key insights; for roleplay: what a
  strong response arc looks like + named failure modes to penalize
rubric_weights:            # optional per-criterion overrides; default = equal
  cultural_calibration: 2.0
variants:
  en:
    user_turns: [t1, t2, t3, t4]     # roleplay
    # transcript: "..."  questions: [q1, q2, q3]   # analysis type instead
  hing:
    user_turns: [...]
  hi:
    user_turns: [...]
review:
  author: naresh
  cultural_review: pending   # pending | passed
  status: draft              # draft | pilot | final
```

### 2.6 Dataset size & composition (v1 targets)

- **54 base scenarios** → ~150 items after triplets (a few `code_mixing` items are `hing`-only).
- Per dimension: 6–7 base scenarios (≥ 4 roleplay, ≥ 2 analysis).
- Why this size: with 5 rubric criteria × ~19 items per dimension-language cell aggregated, bootstrap CIs on dimension scores come out tight enough to separate models by ~0.3 on a 10-point scale. Bigger is better but curation quality beats volume; 54 excellent hand-curated scenarios > 500 generated ones. (EQ-Bench 3 ships 45.)

### 2.7 How the dataset gets made (answering "where does data come from")

**We do not use real private conversations.** Reasons, in order: consent and privacy (unpublishable), PII contamination, no control over which dimension a chat tests, and real chats are mostly boring. Instead:

1. **Taxonomy grid first.** Fill a grid of dimension × relationship-type (parent, in-law, boss, friend, sibling, vendor/customer) × stakes (daily friction / life event / crisis) in `dataset/taxonomy.md`. Pick 54 cells that maximize coverage without repetition.
2. **Inspiration mining (public sources only).** Advice columns, r/india / r/AskIndia / r/TwoXIndia threads, Indian films/serials, lived experience. *Never copy text* — mine for situation shapes only. (Also a contamination defense: models have seen Reddit; they have not seen our renderings.)
3. **LLM-assisted drafting.** An LLM drafts 3 candidate scenarios per grid cell from a structured brief. The author picks ≤ 1, then **rewrites it by hand** — every shipped scenario must contain author judgment an LLM wouldn't produce (a probe turn, a detail that punishes stereotyping). Draft prompts live in `dataset/authoring/` so the process is reproducible.
4. **Cultural review pass** per §2.2. 
5. **Pilot** (M1): run each new scenario against 2 models + judge; kill or fix any scenario where the judge can't discriminate (all models ~same score) or the rubric misfires.
6. **Contamination policy:** all text original; embed a canary string (`BHAVBENCH-CANARY-<uuid>`) in the repo per big-bench convention; keep 6 base scenarios (~1 per dimension rotation) **private** in a local untracked `dataset/holdout/` as a future contamination check. Everything else is public — for a portfolio project, openness > leaderboard purity, and we say so on the methodology page.

---

## 3. Scoring methodology

### 3.1 Rubric (roleplay)

Judge scores the **whole transcript** (not per-turn) on 5 criteria, 0–10 each, with written justification per criterion (justification first, score after — forces reasoning before number):

| Criterion ID | Question the judge answers | Anchors |
|---|---|---|
| `emotion_recognition` | Did it read the stated *and unstated* emotional content, including the probe turn? | 2 = missed the subtext entirely; 5 = got explicit emotions, missed the unsaid; 8 = named the unsaid thing at the right moment |
| `cultural_calibration` | Are register (aap/tum), norms, and constraints handled like someone who grew up there? Any "cultural false notes"? | 2 = Western-default advice (e.g., "set boundaries with your mother-in-law, move out"); 5 = generic-safe, no false notes but no cultural fluency either; 8 = advice a wise Indian aunt/uncle would give |
| `pragmatic_effectiveness` | Would this actually help *this person* given their real constraints? Concrete, actionable, right-sized? | 2 = platitudes or impossible actions; 5 = plausible but generic; 8 = tailored, staged, workable |
| `language_fidelity` | Does it reply in the user's language mode with a natural register and code-mix ratio? | 2 = wrong language/script; 5 = right language, stilted or textbook register; 8 = native-feeling |
| `warmth_boundaries` | Warm and validating *without* sycophancy; keeps safe boundaries; doesn't endorse harm to the user or others | 2 = cold, or pure yes-man agreement; 5 = warm but drifts into telling them what they want to hear; 8 = validates feeling, gently challenges when needed |

Full anchor text lives in `dataset/rubrics/roleplay.yaml`. Analysis-type rubric (`dataset/rubrics/analysis.yaml`) has 3 criteria: `insight_coverage` (vs gold rationale), `cultural_reading`, `next_message_quality`.

### 3.2 Judge protocol

- **Primary judge:** a top frontier model chosen at M3 from {Claude, Gemini, GPT} by best agreement with human labels *and* verified Devanagari/Hinglish competence. **Secondary judge:** a different family. Item score = mean of both; disagreement > 3 points on any criterion flags the item for human review.
- Judge prompt contains: scenario `situation` (ground truth), `probe_note`, `gold_rationale`, full transcript, rubric with anchors. Judge never sees the model's name (blind).
- **Bias controls:**
  - *Length:* judge instructed that verbosity is not quality; additionally report a corr(score, length) diagnostic per model on the methodology page — if a model's scores are strongly length-driven, we say so.
  - *Self-preference:* both judge families are themselves on the leaderboard. Mitigation: two-judge mean + report per-judge scores in a sensitivity table so readers can see whether Claude-the-judge favors Claude-the-player. This is honest and cheap; a fully judge-free design isn't possible for free-text.
  - *Position/order:* N/A in v1 (absolute rubric scoring, not pairwise). If v2 adds pairwise Elo, swap positions per comparison.
  - *Determinism:* judge at temperature 0; evaluated models at temperature 0.7 (natural conversational sampling), single sample in v1, `n=3` samples as a stretch goal if budget allows (report mean).
- **Human calibration (M3 gate):** the author (+ ideally 1–2 native-speaker friends — scoring transcripts with a rubric is a small ask, unlike donating chat logs) scores a stratified sample of **50 transcripts** blind. Compute Spearman ρ judge-vs-human per criterion. Publish the number. If ρ < 0.5 on any criterion, rewrite that criterion's anchors and re-pilot — do not proceed to M4 with a rubric humans don't agree with.

### 3.3 Aggregation

```
criterion scores (0-10)
  → item score  = weighted mean over criteria (weights from scenario, default equal)
  → dimension-language cell = mean over items in that cell
  → dimension score = mean over 3 language cells
  → IndiaSocialBench Overall = mean over 8 dimension scores   (dimensions equal-weighted,
     NOT item-weighted — prevents dimensions with more items from dominating)
  → Language Gap = Overall(en) − Overall(hi)   [and en − hing reported alongside]
```
- Uncertainty: bootstrap over items (1000 resamples) → 95% CI on Overall and per-dimension scores; leaderboard shows CI; models whose CIs overlap get the same rank tier.
- All aggregation lives in one place: `harness/scoring.py`. Raw judge outputs are never discarded — every derived number must be recomputable from `results/raw/`.

### 3.4 Edge cases & failure policy (read before writing the harness)

| Case | Policy |
|---|---|
| Model refuses a scenario (safety refusal on e.g. caste, grief) | Do NOT score the rubric. Mark item `refused`. Report **Refusal Rate** as a separate leaderboard column — over-refusal on ordinary Indian family topics is itself a finding, arguably a headline one. |
| Model replies in wrong language (English to a Hindi user) | Score normally — `language_fidelity` catches it. Judge prompt explicitly covers this so it doesn't leak into other criteria. |
| Empty/garbled/truncated response | Retry up to 3× (exponential backoff, then once with fresh connection). Still bad → item status `error`; a model with any `error` items is **not publishable** until rerun. Never silently zero. |
| API 429/5xx | Backoff + resume from cache; runs must be resumable at item granularity. |
| Judge returns malformed output | Structured-output parse with 2 retries; then fallback to secondary judge alone + flag. |
| Judge scores out of range / missing criterion | Reject and retry; never clamp silently. |
| Model outputs meta-text ("As an AI…", breaks roleplay frame) | Rubric: capped `pragmatic_effectiveness` ≤ 4 when frame breaks; judge prompt names this explicitly. |
| Model with tiny context / no system prompt support | Adapter folds system prompt into first user turn; flag `system_prompt_folded: true` in results metadata. |
| Devanagari mangling (mojibake) in provider pipeline | Harness asserts UTF-8 end-to-end; a smoke item (`smoke-hi-001`) runs first for every new model and a human eyeballs the transcript before the full run. |
| Sarvam not on OpenRouter | Native adapter against Sarvam's API (api.sarvam.ai, OpenAI-compatible chat completions — verify at M2; if the API shape differs, adapter isolates it). Fallback: self-host Sarvam-30B via HF weights on a rented GPU, or Ola Krutrim-style hosted endpoints if available. |
| Reasoning models (extended thinking) | Strip reasoning traces; judge sees only the final reply. Record thinking-enabled flag in run config. |

---

## 4. Repository layout

```
india-social-bench/
├── PLAN.md                  ← this file
├── README.md                ← product/story-facing
├── dataset/
│   ├── taxonomy.md          ← dimension definitions + coverage grid + authoring rules
│   ├── schema.md            ← scenario file format spec
│   ├── authoring-checklist.md
│   ├── rubrics/
│   │   ├── roleplay.yaml
│   │   └── analysis.yaml
│   └── scenarios/
│       ├── roleplay/*.yaml
│       └── analysis/*.yaml
├── harness/                 ← Python 3.11+, uv-managed
│   ├── pyproject.toml
│   ├── bhavbench/
│   │   ├── adapters/        ← openrouter.py, sarvam.py, anthropic.py, base.py
│   │   ├── run.py           ← CLI: indiasocialbench run --model X --scenarios ... --resume
│   │   ├── judge.py
│   │   ├── scoring.py
│   │   ├── cache.py         ← sqlite, key = sha256(model+params+prompt)
│   │   └── validate_dataset.py
│   └── tests/
├── results/
│   ├── raw/{model}/{run_id}/*.json    ← transcripts + judge outputs, never edited
│   └── leaderboard.json               ← generated by scoring.py, consumed by web
└── web/                     ← Next.js (App Router) + Tailwind, static export
```

Conventions: Python typed + ruff; small pure functions in `scoring.py` with unit tests (aggregation bugs are silent and deadly); every run writes `run_config.json` (model id, params, dataset git SHA, judge versions, timestamps, cost).

## 5. Harness design notes

- **Adapter interface:** `complete(messages, system, params) -> {text, usage, raw}`. OpenRouter adapter covers ~all frontier + open models (one key, the user has credits). Native Sarvam adapter. Keys via env: `OPENROUTER_API_KEY`, `SARVAM_API_KEY`, `ANTHROPIC_API_KEY` (judge).
- **Cost control:** dry-run mode prints estimated tokens & cost per run before executing; hard budget flag `--max-usd` aborts when exceeded. Estimated full v1 run: ~150 items × (4 completions + 2 judge calls) ≈ $2–6 per evaluated model; total ≤ ~$80 for 8 models incl. judging.
- **Concurrency:** asyncio, per-provider rate limiter, default 4 concurrent.
- **Reproducibility:** dataset content hash pinned in results; `--seed` recorded (providers vary in honoring it; we record regardless).
- **"Submit your model" (v1 scope):** a documented CLI path (`indiasocialbench run --model any-openrouter-id`) + a GitHub issue template for requesting inclusion. **No hosted arbitrary-model execution service in v1** — hosting other people's eval runs means abuse, cost, and queueing problems that add zero portfolio value. The web page frames this honestly ("run it yourself in 10 minutes; open an issue to get on the board").

## 6. Web app — UI/UX specification

The site *is* the portfolio artifact; craft level must read as "designed," not "generated." Stack: Next.js static export + Tailwind; charts hand-rolled SVG or Recharts following the dataviz skill rules (consult it before building any chart). Deploy: Vercel. Typography: a serif display face for headings (e.g., Fraunces or Newsreader), Inter for UI, **Noto Sans Devanagari** loaded for Hindi text — Devanagari falling back to a system font is an instant craft-fail. Palette: warm neutrals (paper/ink), one saffron-adjacent accent used *sparingly* (never rangoli/mandala clip-art, no tricolor theming — restraint is the design statement). Full light/dark. Mobile-first responsive (interviewers open links on phones).

### 6.1 Pages

**`/` — Leaderboard (the money page).**
- Hero: one line — "Does your model understand India?" — sub-line stating what IndiaSocialBench measures, in one sentence, then the table. No marketing fluff; the table is the hero.
- Table columns: Rank tier · Model (with provider logo, muted) · **Overall** (large) · Language Gap (en−hi, colored: small=good) · Refusal % · 8 dimension mini-columns rendered as compact horizontal bars with value on hover · CI shown as a thin whisker on the Overall bar.
- Controls: language-mode segmented toggle **All / English / Hinglish / Hindi** (re-sorts the whole table — the moment where GPT drops 1.5 points switching to Hindi is the demo moment); sort by any column; dimension column header click → sorts and highlights that column.
- Row click → model page. Rows animate order changes (FLIP, ~300ms) when toggling language — this single interaction is the site's signature moment; get it right.
- Mobile: table collapses to cards (model, Overall, gap, sparkbar of dimensions).

**`/model/[id]` — Model detail.**
- Header: model, overall, rank, run date, cost of run (transparency flex).
- Radar chart of 8 dimensions with the field average as a ghost overlay; language-mode toggle re-draws it.
- "Where it fails" section: the 3 lowest-scoring transcripts, each as a card with a one-line judge quote (auto-extracted) — e.g., *"Advised the user to 'set firm boundaries' with her father-in-law — a culturally implausible move the judge flagged."* This section is what makes reviewers say "oh, this is real."
- Full item table (scenario, dimension, language, score, refused flag) → transcript viewer.

**`/transcript/[item]/[model]` — Transcript viewer (the receipts).**
- Two-pane on desktop: left = the conversation rendered as a chat (user right-aligned bubbles, model left; Devanagari set properly; timestamps omitted — they'd be fake); right = judge panel: per-criterion score chips (0–10, color-scaled) each expanding to the judge's written justification; `situation` ground-truth note at top in an "author's note" callout.
- The probe turn is subtly marked (dotted underline + tooltip "probe: what this turn tests"). This teaches the reader how the benchmark thinks — the depth story, made visible.
- Mobile: single column, judge panel as bottom sheet.

**`/scenarios` — Explorer.** Filter by dimension/type/language; each card shows title, dimension chip, persona summary; opens a reader view of the scenario + rubric weights. Public-subset only note where holdout applies.

**`/methodology`.** The whole of §2–3 rendered for humans, including the honest parts: judge-bias sensitivity table, human-agreement ρ, limitations (Hindi-belt skew of v1, LLM-judge ceiling, contamination-once-public). Honest limitations are a portfolio *feature* — evaluators of the portfolio are exactly the people who probe there.

**`/about`.** The story, the author, link to paper (M6) and repo.

### 6.2 Craft bar

Empty/loading/error states designed for every page; keyboard navigable; `prefers-reduced-motion` respected; OG images per model page (auto-generated card with score) so links unfurl well when shared; Lighthouse ≥ 95; page weight < 300KB before charts hydrate. Run the site through the impeccable/hallmark skill review before calling M5 done.

## 7. Milestones

| ID | Deliverable | Definition of done |
|---|---|---|
| **M0** | Repo + plan + README + dataset foundations | This plan; README; taxonomy; schema; rubrics; 6 pilot scenarios with triplets; validator passes. **(this session)** |
| **M1** | Dataset v0.1 | 18 base scenarios (draft status ok), authoring prompts committed, pilot-run design finalized |
| **M2** | Harness MVP | `indiasocialbench run` end-to-end on 2 models (1 via OpenRouter + Sarvam native adapter verified live); transcripts inspected by hand; caching + resume working; smoke-test item flow |
| **M3** | Judge calibration | Judge prompt finalized; 50-transcript human calibration scored; ρ computed; rubric revised; judge pair chosen; kill/fix pilot scenarios per §2.7.5 |
| **M4** | Full dataset + full run | 54 base scenarios final + cultural review passed + coverage distribution checked; 8 models run clean (zero `error` items); leaderboard.json generated |
| **M5** | Website | All pages per §6, deployed on Vercel, design-review pass done |
| **M6** | Paper + launch | 6–10 page paper (structure: abstract / related work / dimensions / method / results / bias analysis / limitations); README finalized; repo public; shareable link |

Order is strict M0→M3 (each gates the next); M4/M5 can interleave. Do not start M5 polish before M3 — rubric changes invalidate run data and screenshots.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Scenarios read as stereotypes | §2.2 guardrails + named review pass + persona-stance variety |
| Judge can't actually read Hinglish nuance | M3 competence check + human calibration gate; worst case, human-score the `hing` cell for the paper and say so |
| Rubric rewards verbosity/sycophancy | Explicit anchors against both + length-correlation diagnostic published |
| Scores too flat to rank models | Pilot gate kills non-discriminating scenarios; probe turns are designed to spread the field |
| User's Hindi/Hinglish rendering quality | Author is a native speaker (this is the moat, use it); LLM drafts, human rewrites, second-speaker review |
| Cost overrun | Dry-run estimator + `--max-usd`; v1 scale fits in ~$100 total incl. experiments |
| "This is just prompt-engineering" dismissal | The answer *is* the methodology page: calibration numbers, bias analysis, CIs, receipts |

## 9. Costs (estimate, July 2026 prices)

Dataset drafting assist ~$5 · pilot runs ~$10 · calibration ~$10 · full run 8 models ~$40 · judging ~$25 · headroom → **≈ $100 total** on OpenRouter + small Sarvam API top-up. Vercel free tier suffices.

## 10. Paper (M6 sketch)

Title dir.: *"IndiaSocialBench: Measuring the Cultural Gap in LLM Emotional Intelligence for Indian Conversations."* Key claims to support with data: (1) frontier models show a measurable en→hi EI drop; (2) the gap is dimension-specific (cultural dimensions drop more than `support`); (3) refusal behavior differs on Indian family topics; (4) Indic-focused models trade general EI for cultural calibration (or don't — either result is publishable). Target: arXiv + blog-post version on the site.

## 11. What NOT to build (scope fence)

- No hosted eval-as-a-service / no user accounts / no database — static site + CLI.
- No voice/audio in v1. No Dravidian languages in v1 (say so publicly).
- No pairwise Elo in v1 (rubric-absolute only; Elo is a v2 experiment).
- No synthetic-only dataset scaling ("500 more scenarios via GPT" is explicitly banned — curation is the product).

## 12. Decisions log

- 2026-07-19: Project initially named **BhavBench** (bhāv = feeling/emotion). Scripted-user roleplay chosen over simulator (variance + cost). Absolute rubric over Elo for v1 (interpretability per-dimension > ranking elegance). Real private chat logs rejected as data source (consent, PII, control). Refusals excluded from rubric scoring, reported as separate metric.
- 2026-07-22: Public project renamed **IndiaSocialBench**. The previous `bhavbench` CLI remains as a compatibility alias. Dataset files and stored result artifacts remain unchanged so their hashes and provenance stay intact.
- 2026-07-20: M0 to M2 and M5 shipped. Status: dataset 18/54 base scenarios (all 8 dimensions covered, all validator green); harness complete with 13 passing tests including offline end to end coverage; website built and exporting more than 1,350 static pages; technical report in `paper/DRAFT.md`.
- 2026-07-20: Confirmed **no Sarvam models on OpenRouter** (catalog checked) → native Sarvam adapter written; needs `SARVAM_API_KEY` + live shape verification. The `OPENROUTER_API_KEY` present in the dev environment returns 401 (invalid/expired) → **all live runs blocked on a working key**. Sample leaderboard generated through the real pipeline using explicitly-named mock models; `sample: true` flag + site banners guarantee no fabricated real-model scores can ship.
- 2026-07-20: Site ships with sample data clearly bannered rather than waiting for keys — demo-ability now, integrity preserved.
- 2026-07-20 (later): Working OpenRouter key received ($5.11 credit). Live board scoped to budget:
  **12 models / 10 labs** — claude-haiku-4.5, gpt-5.6-luna, gpt-5-mini, gemini-3.1-flash-lite,
  deepseek-v4-flash, deepseek-v4-pro, qwen3.6-flash, llama-4-maverick, mistral-large-2512,
  glm-4.7, minimax-m3, grok-4.3. Judges: **qwen3.7-plus + gemini-3.1-flash-lite** (budget pair;
  M3 human calibration still the gate for final judges — disclosed on methodology page).
  True flagships (Fable 5 $6+, Opus 4.8 $3, GPT-5.6 Sol $3.35 per eval run) exceed remaining
  budget; each is one `indiasocialbench run` away after a top-up. Reasoning-effort capped at `low`
  for reasoning families to protect both budget and max_tokens.
- 2026-07-22: The expanded public board contains 27 model configurations, including four Sarvam
  rows across model size and reasoning effort. The run stayed within a $25 API budget. One uniform
  blinded judge is used for every published score. Human agreement is still pending and is stated
  on the website and report.
- 2026-07-22: Evaluation workflow inputs are passed through environment variables and validated
  before any shell command runs. Scoring rejects results from another dataset version. Automated
  checks now run the harness tests, dataset validator, dependency audit, and static website build.
- Open: M3 human review of 50 transcripts, a second cultural reviewer, and the remaining 36
  scenarios for M4.

## 13. Immediate next actions (for the next agent/session)

1. Complete M3 human review on 50 stratified transcripts and publish the agreement result.
2. Ask a second native speaker to review all 18 pilot scenarios.
3. Revise any rubric criterion or scenario that does not agree with human judgment.
4. Expand the dataset only after the current method passes those checks.
5. Publish the finished report and contact Indian model teams with the results.
