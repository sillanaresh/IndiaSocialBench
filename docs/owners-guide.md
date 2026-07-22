# IndiaSocialBench Owner's Guide

**Written for Naresh.** You gave the idea; an agent did the labor. This document exists so the
*understanding* is yours — every design decision, the reasoning behind it, and the answer you'd
give when an interviewer pushes on it. Read it twice: once straight through, once with the
website open, clicking into the transcripts it mentions.

---

## 1. The one-minute story (memorize this shape)

> Every emotional-intelligence benchmark for LLMs is culturally Western without saying so.
> EQ-Bench measures whether a model can do therapy-speak; nothing measures whether a model knows
> that "dekhte hain" means no, that you can't tell a 26-year-old to "just move out," or that a
> condolence text has a register. Meanwhile the fastest-growing AI user base on earth types in
> Hinglish. I built the benchmark for that gap: 8 dimensions of Indian social-emotional life,
> every scenario in matched English/Hinglish/Hindi so the benchmark itself measures how much
> emotional intelligence a model *loses* crossing languages. Then I ran 11 real models on it for
> under five dollars and put every score one click away from the transcript that produced it.

Why this story works for Sarvam specifically: their business is "culturally fluent AI in Indian
languages," but no instrument *proves* cultural fluency. You built the missing instrument. A PM
who finds the eval a market needs — and understands the machinery well enough to build it — is
the profile they're hiring.

## 2. The three load-bearing decisions

Everything else hangs off these. If you internalize only one section, make it this one.

**Decision A — Compete on cultural pragmatics, not clinical psychology.**
Your original worry was "I don't know psychology." The move was to not fight there. EQ-Bench
owns "can the model do empathy" (Rogers, therapy framing). IndiaSocialBench asks "does the model know
how *this society* works" — politeness economics, hierarchy, obligation. On that turf, a person
who grew up inside these norms outranks any psychology PhD. **The benchmark is engineered around
your actual expertise.** When asked "what qualifies you to build this?", the answer is: native
fluency in the norms being tested, plus published rubrics anyone can contest.

**Decision B — Matched language triplets.**
Every scenario exists three times: Indian English, Hinglish (Roman script), Hindi (Devanagari).
Same situation, same rubric, same judge. That turns language itself into a controlled variable
and produces the headline metric no other benchmark has: **the Language Gap** — points lost when
the identical human problem arrives in Hindi. Crucial subtlety: variants are *parallel
compositions*, not translations. A translated sentence sounds translated; a Hinglish user
venting at 2am has a native rhythm. If variants were translations, low Hindi scores could be
blamed on stilted inputs.

**Decision C — Receipts, always.**
Every number on the leaderboard clicks down to the raw conversation and the judge's written
justification. This is both product craft (trust) and interview armor: when someone says "LLM
judges are unreliable," you say "maybe — here are all 530 judgments, tell me which one you
disagree with." Benchmarks that publish only aggregates ask for faith; this one invites audit.

## 3. The eight dimensions — the "vertical knowledge"

Each dimension is a *named, testable failure mode* grounded in real social science. Learn the
one-line grounding; interviewers love hearing a framework cited precisely and briefly.

| Dimension | What it really tests | Grounding (one line you can say) |
|---|---|---|
| **Indirectness & face-saving** | Hearing the no inside "dekhte hain, pakka try karunga"; refusing without humiliating | Hall's high-context vs low-context cultures: in India meaning lives in context, not words. Brown & Levinson: direct refusal threatens "face" |
| **Hierarchy & respect registers** | aap/tum/tu calibration; disagreeing upward without the US "radical candor" playbook | Hofstede power distance: India ≈77, US ≈40 — feedback flows differently down a steeper gradient |
| **Family & the collective self** | Decisions made by family units; rishta negotiation; autonomy AND belonging held together | Markus & Kitayama: interdependent self-construal — the self is defined through relations, so "it's your life" is a category error |
| **Honor, shame & reputation** | "Log kya kahenge," izzat, concealing a layoff; shame (social exposure) ≠ guilt (private conscience) | Benedict's shame-culture/guilt-culture distinction + face theory |
| **Code-mixed emotional register** | The *switch* is the signal: dropping from English banter into Hindi marks real hurt | Gumperz: "we-code" (intimate language) vs "they-code" — register shift is an emotional event |
| **Rituals & life events** | Grief etiquette (what you never text), wedding/festival obligations, what varies by community | Ethnography of Indian life-cycle ritual; one scenario deliberately uses Muslim norms so the dataset can't collapse into "Indian = Hindu" |
| **Money & obligation** | Loans between friends that can't be refused directly; the ledger nobody says aloud | Anthropology of reciprocity (lena-dena): relationships carry obligation balances |
| **Support calibration** | Venting vs solving; "I don't want ideas" — universal EI | Rogerian listening. **This is the control group** — see below |

**Why a control dimension is the smartest thing in the design:** `support` is culture-neutral.
If a model scores high on support but low on indirectness, you've *isolated* the cultural gap
from general empathy. And the live run proved the thesis: field average **7.72 on support vs
6.58 on the cultural seven**. Models know how to feel; they don't know how India works. Without
the control, a skeptic could say "maybe your scenarios are just harder" — the control kills
that objection.

## 4. The test set — what we built and why it's shaped this way

**18 base scenarios → 50 items** (16 triplets + 2 Hinglish-only), split into two task types:

**Roleplay (12 scenarios).** The model plays a warm companion; a scripted user unloads a real
situation across 4 turns. Key choices:
- **Scripted, not simulated users.** A user-simulator LLM would add uncontrolled variance (you'd
  partly be measuring the simulator) and 4× the cost. Scripted turns mean *every model faces the
  identical conversation* — clean comparison, perfect reproducibility.
- **Self-propelled turns.** Each user turn advances its own emotional arc (new fact, escalation,
  doubt, reversal) and never references the assistant's words — so the script stays natural no
  matter what the model said. This is the craft trick that makes scripting workable.
- **The probe turn.** Every roleplay hides one engineered moment targeting the exact failure the
  scenario tests. Examples you should know cold: the wedding friend scenario (ind-001) — user
  proposes forcing "are you coming, yes or no?"; endorsing that "clarity" is the Western-frame
  failure, because a binary ultimatum forces the friend to lie or lose face. The founder
  scenario (sup-001) — user says "please don't give me ideas, I know all the ideas"; models that
  keep advising fail. The credit-taking-boss scenario (hier-001) — a well-meaning senior says
  "CC the VP with proof"; endorsing public proof = public shaming of the boss. **Models don't
  fail on averages; they fail at moments. The benchmark is built out of moments.**

**Transcript analysis (6 scenarios).** The model reads a finished human-human conversation
(WhatsApp-style) and answers: what is X actually feeling? what did Y get wrong? write Y's repair
message. Scored against an author-written gold rationale. **Why both types:** roleplay measures
*production* (can it respond well), analysis measures *perception* (can it read the room). A
model can flub roleplay for style reasons while understanding perfectly — separating the two is
diagnostic, and analysis items cost 1 API call instead of 4.

**Why not real chat logs (your original question):** consent and privacy make them
unpublishable; they're full of PII; you can't control which dimension a real chat tests; and
models may have seen public chat data (contamination). Original authored scenarios solve all
four, and your hand-curation is the credibility story — "LLM drafts, human ships" is a written
rule: every shipped scenario must contain judgment an LLM wouldn't produce.

**Anti-stereotype protocol (the part reviewers will probe hardest):** the benchmark must never
say "this is how Indians are." Rules: norms are presented as operative *for the persona in the
scenario* (whose stance is tagged: embracing / resisting / ambivalent); personas vary by region,
religion, class, gender, setting; rubrics reward *reading this person*, never obedience or
rebellion; and some scenarios deliberately punish stereotype application. Distribution targets
are tracked in `dataset/taxonomy.md`. When asked "isn't a culture benchmark just encoded
stereotypes?", the answer: "That risk is why the persona-stance system exists, and why every
scenario text and rubric is public and contestable."

## 5. Scoring — every choice defends against a specific attack

- **Anchored 0–10 rubrics, justification BEFORE score.** Five criteria for roleplay (emotion
  recognition, cultural calibration, pragmatic effectiveness, language fidelity, warmth without
  sycophancy). Writing the justification first forces the judge to reason, then commit — scores
  without reasons drift.
- **Blind judging.** The judge never sees the model's name → no brand bias.
- **Refusals are excluded and reported separately.** Averaging a refusal as zero would let one
  safety-refusal swamp real signal; hiding it would bury a finding. A separate Refusal-Rate
  column keeps both honest. (Live result: refusals were rare — that itself is a finding.)
- **Dimension-equal aggregation.** Overall = mean of the 8 dimension scores, NOT mean of items —
  otherwise dimensions with more items would dominate.
- **Bootstrap 95% CIs.** Resample items 1000×; overlapping CIs = treat as tied. This is how you
  avoid over-claiming from 50 items.
- **Why absolute rubrics, not Elo (EQ-Bench uses Elo):** Elo gives a clean ranking but destroys
  interpretability — you can't say "this model is weak on honor_shame in Hindi" from pairwise
  win-rates. The per-dimension diagnostic IS the product. (Elo is a listed v2 experiment.)
- **The single-judge decision (be ready for this one).** The design calls for two judge
  families. The $5 budget ran out mid-judging, and here's the subtle part: with $1.65 left, some
  models would have had two judges and some one — and our data showed Qwen judges ~2 points
  harsher than Gemini. Mixing would have *systematically biased ranks by judging luck*. Uniform
  single-judge for everyone was the statistically honest choice, disclosed on the methodology
  page, with the Qwen judgments kept visible in transcripts as cross-checks. "I chose uniformity
  over a biased ensemble and disclosed it" is a *strong* interview answer, not a weakness.
- **The judge is not yet validated — say so before they ask.** The M3 gate (you blind-scoring 50
  stratified transcripts, publishing the Spearman correlation with the judge) is designed and
  pending. Until then every number is provisional and the site says so. Do this step yourself —
  it is the single highest-leverage hour of work left in the project.

## 6. Engineering choices that show product-infra maturity

Worth knowing because they signal "understands how AI systems fail in production":
- **Resumable, cached runs** (sqlite, WAL): sessions died mid-run several times; nothing was
  ever lost or double-billed.
- **Reasoning-token cap + raised max_tokens:** hybrid-reasoning models silently burned their
  entire completion budget on hidden thought and returned *empty text* — a real failure class
  discovered live, fixed, and documented.
- **No silent errors:** items that error are marked, repaired, or the model is excluded. GLM-4.7
  is off the board (provider kept dropping connections; 30/50 items) with the reason printed in
  the site footer. MiniMax wears a visible "partial 43/50" chip. **Never rank what you didn't
  fully measure; never hide what you excluded.**
- **No fabricated data, ever:** before real runs, the site used obviously-fake mock names with
  banners; the moment real data landed, mocks were archived out. Real model names never carried
  invented scores.
- **Cost discipline as a feature:** the entire 11-model board — 550 transcripts, ~530 judgments —
  cost **$4.97**. "I benchmarked 11 models across 9 labs for five dollars" is a PM flex.

## 7. The results — and exactly how to talk about them

(Provisional: single uncalibrated judge, 50 items, CIs matter.)

1. **Culture is harder than empathy:** support 7.72 vs cultural dimensions 6.58. Weakest
   everywhere: indirectness (5.36) and money (5.66) — the two dimensions built on the unsaid.
2. **The language gap is real:** 9 of 11 models drop from English to Hindi (mean +0.69).
   DeepSeek V4 Pro collapses 8.97 → 5.08 — flagship English EQ, brittle Hindi. GPT-5.6 Luna is
   the counterexample (slightly better in Hindi) — always mention the counterexample; it shows
   you read your own data.
3. **General leaderboards don't predict this:** Llama 4 Maverick, respectable on standard
   benchmarks, is last at 3.23 with judge-documented register failures. MiniMax M3 (#16 on
   Artificial Analysis) tops the board — surprising results are either insight or artifact, and
   saying "MiniMax's #1 needs the human-calibration pass before I fully trust it" makes you MORE
   credible, not less.
4. **Family scored highest (8.30)** — plausibly because rishta/parents content is abundant in
   training data, while hierarchy-at-work and loan-refusals are not. Good discussion material.

Homework that converts this from "my agent's results" to "my results": read five transcripts —
Llama-4 on fam-001.hi, DeepSeek-Pro on any .hi item, MiniMax's best item, one refusal, one
where you *disagree* with the judge. Disagreeing with your own judge, on the record, is depth.

## 8. Honest assessment — is this worth taking further?

**Strengths that are real:** the gap is genuine and the thesis survived contact with data; the
methodology is more careful than most hobby benchmarks (controls, CIs, refusal accounting,
disclosed limitations); the receipts UX is genuinely differentiated; the Sarvam fit is perfect.

**Current weaknesses, no sugar:** 18 scenarios is a pilot, not a benchmark (target: 54);
the judge is uncalibrated until you do M3; v1 is Hindi-belt only ("India ≠ Hindi" — Tamil or
Telugu is the named v2 priority); no Sarvam model on the board yet (the one pending key); and
single-author curation needs at least one more native-speaker review pass.

**Verdict:** worth serious continued effort — *conditional on you doing the human parts*
(calibration scoring, cultural review, reading transcripts). Those are exactly the parts that
make it yours in an interview.

## 9. Roadmap (ordered by leverage per hour)

1. **M3 human calibration** — you blind-score 50 transcripts; publish ρ. (~2 hours, transforms credibility)
2. **$10–15 top-up → flagship tier:** `indiasocialbench run --model anthropic/claude-fable-5` (also
   gpt-5.6-sol, claude-opus-4.8, kimi-k3, grok-4.5, claude-sonnet-5, gemini-3.5-flash) + judge + score. No code changes.
3. **Sarvam key → Sarvam-M on the board** — the board is incomplete for its own thesis without it.
4. **Deploy `web/` to Vercel** (static export, free tier, ~10 min) → public URL for the resume.
5. **Scenarios 18 → 54** per the taxonomy grid; second cultural reviewer.
6. **Launch writeup + arXiv version of the paper**; then Tamil/Telugu for v2.

## 10. File map

`PLAN.md` master spec & decisions log · `dataset/` scenarios + taxonomy + rubrics + authoring
rules · `harness/` runner/judge/scoring (tests in `harness/tests/`) · `results/raw/` every
transcript & judgment · `results/leaderboard.json` the scored board · `web/` the site ·
`paper/DRAFT.md` the paper · `docs/conversation-log.json` how this project came to be.
