# IndiaSocialBench owner's guide

This guide is written for Naresh. It explains what the project does, why each major choice was
made, what the current results show, what the results do not prove, and how to discuss the work in
an interview.

Read this guide once from beginning to end. Then open the website and inspect the transcripts listed
in the study plan near the end. The goal is to understand the project well enough that you can
explain a decision in your own words and defend it when someone challenges it.

## 1. Current status

This is the project status as of July 27, 2026.

| Part | Current state |
|---|---|
| Public name | IndiaSocialBench |
| Main question | Does a language model understand emotionally difficult Indian conversations? |
| Dataset | 18 original pilot scenarios |
| Evaluated items | 50 items per complete model run |
| Language modes | Indian English, Hinglish, and Hindi |
| Dimensions | 8 |
| Public board | 28 model configurations from 16 organizations |
| Current judge | Gemini 3.1 Flash Lite |
| Published evidence | Model replies, judge explanations, scores, confidence intervals, refusals, and errors |
| Initial pilot cost | $4.97 for the first 11 published models |
| Expanded run budget | The board of 28 configurations was completed within a $30 API budget |
| Website | `https://indiasocialbench.nareshsilla.com/` |
| Research status | Public pilot. Human agreement testing is still pending |

The homepage says "28 models" because it is simpler for a general reader. The precise research
term is "28 model configurations." Sarvam 30B and Sarvam 105B each appear at low and high reasoning
effort. Those settings are separate rows because the amount of reasoning can change both quality
and cost.

The board contains 28 published rows, but this does not mean there are 28 independent model
families. It includes several models from the same organization and the additional Sarvam reasoning
settings.

## 2. The one minute explanation

You can use this structure in an interview:

> Most emotional intelligence benchmarks test general empathy in English. They do not test social
> meaning that depends on Indian language and social structure. I built IndiaSocialBench to measure
> whether a model can read indirect refusals, hierarchy, family duties, reputation, language
> switching, rituals, money obligations, and emotional support. The pilot has 18 original scenarios
> expanded into 50 comparable items across Indian English, Hinglish, and Hindi. The public board
> shows 28 model configurations from 16 organizations. Every score links to the exact model reply
> and judge explanation behind it. The expanded evaluation stayed within a $30 API budget. The
> results are public, but I describe them as provisional because human agreement testing is the next
> research step.

Do not memorize every sentence. Memorize the order:

1. State the missing measurement.
2. Explain what IndiaSocialBench tests.
3. Explain the matched language design.
4. Mention the public evidence.
5. State the current limitation before the interviewer asks.

## 3. The project in simple terms

IndiaSocialBench gives several language models the same difficult conversations. It then checks
whether each model understood the emotion, the social situation, the language style, and the
practical limits faced by the person.

Consider the phrase "dekhte hain." A literal reading is "we will see." In many situations, the
speaker is giving a polite refusal without saying "no." A model may understand every word and still
miss the real meaning. IndiaSocialBench tests this kind of failure.

The project does not ask trivia questions about India. It tests behavior inside conversations. A
model must respond to the person or analyze a conversation between two people. This makes the
benchmark closer to how an assistant is used in practice.

## 4. Important terms

| Term | Meaning in this project |
|---|---|
| Benchmark | A fixed test used to compare models |
| Scenario | One social situation created for the benchmark |
| Variant | A version of a scenario written in a specific language mode |
| Item | One scenario variant given to one model |
| Roleplay | A four turn conversation between the tested model and a fixed user script |
| Transcript analysis | A task where the model reads a completed conversation and explains what happened |
| Probe turn | A planned moment designed to expose one specific failure |
| Rubric | The written scoring rules |
| Criterion | One part of the rubric, such as cultural understanding |
| Judge | The model that applies the rubric to a transcript |
| Dimension | A group of related social skills, such as hierarchy or indirectness |
| Language gap | The English score minus the Hindi score for the same model |
| Configuration | A model plus the settings used for that run |
| Confidence interval | A range that shows how uncertain a score is because the dataset is small |
| Refusal | A case where the model does not engage with the task |
| Provider error | A failed API response, empty answer, timeout, or similar technical failure |

## 5. The problem IndiaSocialBench addresses

General emotional intelligence and Indian social understanding are different abilities.

A model can sound warm while giving advice that is unusable. It may tell a junior employee to
confront a senior manager directly. It may tell a person to ignore their family when the person has
made it clear that preserving the relationship is important. It may answer intimate Hinglish with
formal textbook Hindi. Each answer may appear reasonable outside the specific context and still
fail the user.

The benchmark separates two questions:

1. Can the model provide general emotional support?
2. Can the model understand the social meaning and constraints in this Indian conversation?

The support dimension helps answer the first question. The seven cultural dimensions help answer
the second. This separation is one of the strongest parts of the design.

## 6. The three main design decisions

### 6.1 Test cultural judgment instead of clinical psychology

The benchmark does not claim to diagnose emotions or mental health. It tests whether a model can
read social meaning and give advice that works within the person's stated situation.

This choice uses your actual knowledge. You understand the language and social situations because
you have lived around them. You do not need to claim expertise in clinical psychology. Your
responsibility is to turn your cultural knowledge into public scenarios and scoring rules that
other people can question.

If an interviewer asks what qualifies you to build this, say:

> My starting advantage was familiarity with the language and the social situations. I did not ask
> people to accept my intuition without evidence. I converted that intuition into public scenarios,
> explicit rubrics, and inspectable transcripts. The next step is to measure whether other human
> reviewers agree with the judge.

### 6.2 Use matched language versions

Sixteen scenarios have Indian English, Hinglish, and Hindi versions. The situation and scoring rules
stay the same. Two code mixing scenarios exist only in Hinglish because the act of switching
languages is the behavior being tested.

This produces 50 items:

* 16 scenarios multiplied by 3 language modes gives 48 items.
* 2 Hinglish only scenarios gives 2 more items.
* The complete run therefore contains 50 items.

The variants are parallel versions of the same situation. They are not literal translations. A
literal translation can sound unnatural. If the Hindi version sounds artificial, a lower Hindi
score may measure bad writing instead of model ability.

The matched versions create the language gap:

`language gap = English score minus Hindi score`

A positive value means the model scored lower in Hindi. A negative value means it scored higher in
Hindi.

### 6.3 Publish the evidence behind every score

Every score on the site links to the model transcript and the judge explanation. This allows a
reader to disagree with a score and inspect the exact evidence.

This does not remove judge bias. It makes the bias easier to find. The benchmark does not ask the
reader to trust a hidden scoring process.

If someone says that language model judges are unreliable, do not become defensive. Say:

> I agree that judge reliability must be measured. That is why the current results are marked
> provisional, every judgment is public, and the next research step is a blind human agreement
> study.

## 7. The eight dimensions

The benchmark uses eight dimensions. Seven focus on cultural situations. Support is the general
emotional support control.

| Dimension | What it tests | Example failure |
|---|---|---|
| Indirectness | Whether the model reads hints, polite refusals, and face saving language | Treating "dekhte hain" as a firm promise |
| Hierarchy | Whether advice accounts for age, rank, and workplace power | Telling a junior employee to publicly correct a senior manager |
| Family | Whether the model understands decisions made inside family relationships | Saying "it is your life" without addressing the relationship the user wants to preserve |
| Honor and shame | Whether the model understands reputation and social exposure without endorsing harm | Treating fear of public humiliation as irrational and irrelevant |
| Code mixing | Whether the model understands that a language switch can carry emotional meaning | Ignoring that a move from English to Hindi signals hurt or seriousness |
| Rituals | Whether the model handles grief, weddings, festivals, and religious context carefully | Combining a condolence with a work request |
| Money | Whether the model reads obligation and indirect refusal around loans and gifts | Treating a polite delay as agreement to contribute money |
| Support | Whether the model listens when the user wants to be heard | Continuing to give solutions after the user asks for no advice |

### 7.1 Why support is a control

Support is included because it is less dependent on Indian cultural knowledge. If a model performs
well on support and poorly on indirectness, the result suggests that the model can be caring but
still miss cultural meaning.

The current board supports this distinction. The average support score is 8.51. The average across
the seven cultural dimensions is 7.12.

This difference is useful evidence, but it is not proof by itself. The dataset has only 18
scenarios, and the judge has not yet been checked against human ratings.

### 7.2 The research ideas behind the dimensions

You do not need to present yourself as an academic expert. You should know the basic connection:

| Dimension | Research idea |
|---|---|
| Indirectness | Edward Hall described communication where meaning depends heavily on context. Brown and Levinson studied how people protect social face through politeness |
| Hierarchy | Hofstede's power distance work describes how societies differ in their acceptance of unequal authority |
| Family | Markus and Kitayama studied the interdependent view of the self, where identity is closely tied to relationships |
| Honor and shame | Work on face, shame, and public reputation helps explain why social exposure can shape decisions |
| Code mixing | John Gumperz studied how switching language or register can signal group identity and relationship |
| Rituals | The scenario design draws on the different social expectations around life events and religious practices |
| Money | Research on reciprocity explains how money can carry relationship obligations beyond the amount itself |
| Support | Rogerian listening focuses on understanding and reflecting before trying to solve the problem |

Use these references carefully. They help explain the design. They do not prove that every Indian
person behaves in one way.

## 8. How the dataset is built

### 8.1 The 18 scenarios

The pilot contains:

* 12 roleplay scenarios.
* 6 transcript analysis scenarios.
* 16 scenarios with three matched language versions.
* 2 Hinglish only code mixing scenarios.

The dataset covers every dimension, but the coverage is still small. The original plan calls for 54
base scenarios after the pilot method passes human review.

### 8.2 Roleplay tasks

In a roleplay item, the model talks with a scripted user for four turns. The user messages are fixed
before the evaluation starts. Every tested model receives the same user messages.

The user script is self contained. Each user message adds a new fact or emotional development
without depending on the previous model answer. This avoids a problem where one model changes the
future conversation and another model receives a different test.

Each roleplay contains a probe turn. The probe asks the model to respond at the exact moment where a
common mistake becomes tempting.

For example, the user may ask whether they should force a friend to give a clear yes or no answer.
The model must understand that a direct demand could force the friend to lie or lose face.

### 8.3 Transcript analysis tasks

In a transcript analysis item, the model reads a completed conversation between two people. It then
answers three questions:

1. What is one person actually feeling or communicating?
2. What did the other person miss?
3. What would a good next message look like?

The model answer is compared with a rationale written when the scenario was authored. This task
tests whether the model can read the situation even when it is not responsible for carrying the
conversation.

Roleplay measures response behavior. Transcript analysis measures understanding. A model can be
good at one and weaker at the other.

### 8.4 Why the users are scripted

A simulated user would add another language model to the experiment. Different tested models could
then receive different conversations. It would become difficult to tell whether a score difference
came from the evaluated model or the simulated user.

Fixed user messages improve comparison and reduce cost. The limitation is that the conversation
cannot respond naturally to every model reply. The self contained user turns reduce this problem,
but they do not remove it.

### 8.5 Why the project does not use private chat logs

Private conversations create consent and privacy problems. They can contain names, phone numbers,
financial details, health information, and other personal data. They are also difficult to publish
and may not cover the exact behavior the benchmark needs.

Original scenarios allow the author to control the tested skill, publish the full text, and include
a specific probe. Public sources can provide ideas for situation types, but the project should not
copy private or copyrighted text.

### 8.6 How the project avoids simple stereotypes

The benchmark must not imply that all Indians share one culture. Each scenario describes a specific
person with a specific relationship and stance.

The authoring rules require variation in region, religion, age, gender, class, and setting. Some
people in the scenarios accept a tradition. Some resist it. Some are unsure. Several scenarios are
designed to penalize a model that applies a cultural assumption without reading the person.

The rubric rewards understanding the person's constraints. It does not reward blind obedience to
tradition.

These rules are incomplete until a second native speaker reviews all 18 scenarios and records any
disagreements.

## 9. How one evaluation run works

The complete path is:

1. The harness loads the 18 scenario files.
2. It expands them into 50 language items.
3. It sends each item to the evaluated model.
4. It saves every model response in `results/raw/`.
5. It sends the saved transcript, hidden scenario notes, and rubric to the judge.
6. It saves the judge explanation and criterion scores.
7. The scoring code creates item, language, dimension, and overall scores.
8. It calculates confidence intervals, refusal rates, and error counts.
9. It writes the public board to `results/leaderboard.json`.
10. The website builds static pages from the stored results.

A complete model run requires many calls. Each roleplay item contains four model replies. Each
analysis item uses one reply. The judge then scores every completed item. This is why adding one
language increases both evaluation and judging cost.

## 10. How scoring works

### 10.1 Roleplay criteria

The judge scores the whole four turn transcript from 0 to 10 on five criteria:

| Criterion | Plain meaning |
|---|---|
| Emotional recognition | Did the model understand both the stated feeling and the unstated feeling? |
| Cultural calibration | Did the answer fit this person's social context? |
| Practical effectiveness | Could the person use the advice in their actual situation? |
| Language and register | Did the model use the right language style and relationship register? |
| Warmth without blind agreement | Was the model caring while still challenging a harmful plan? |

### 10.2 Transcript analysis criteria

The judge scores three criteria:

| Criterion | Plain meaning |
|---|---|
| Insight coverage | Did the model find the important signals in the conversation? |
| Cultural reading | Did it use the right cultural and relationship context? |
| Next message quality | Is the proposed message natural and useful? |

### 10.3 Why the judge explains before scoring

The prompt asks the judge to write a reason before giving a number. This makes the judge connect the
score to evidence from the transcript. It also gives a human reader something concrete to inspect.

An explanation does not guarantee a correct score. It makes unsupported scoring easier to notice.

### 10.4 How the overall score is calculated

The calculation happens in stages:

1. The criterion scores are combined into one item score. A scenario can give extra weight to its
   main criterion.
2. Item scores are averaged inside each dimension and language.
3. The available language scores are averaged into one score for each dimension.
4. The eight dimension scores receive equal weight in the overall score.

Equal dimension weighting prevents a dimension with more items from controlling the result.

Suppose one dimension has five items and another has two. A simple average across all seven items
would give the first dimension more influence. IndiaSocialBench first calculates each dimension
score and then gives the dimensions equal weight.

### 10.5 Confidence intervals

The project repeats the score calculation 1,000 times using samples drawn from the model's scored
items. The middle range of these repeated results becomes the 95 percent confidence interval.

The interval is an uncertainty warning. A wider interval means the point estimate is less stable.
If two intervals overlap, do not make a strong claim that one model is better.

The interval does not measure judge bias, scenario bias, or cultural coverage. It only shows the
uncertainty caused by the particular set of scored items.

### 10.6 Refusals

A refusal is not entered as a score of zero. A zero would mix two different failures:

* The model tried and responded badly.
* The model declined to engage.

The project reports refusal rate separately. This keeps the quality score interpretable while
preserving refusal behavior as its own result.

### 10.7 Provider errors

Technical failures are counted separately. The site shows partial item counts so a reader knows when
a row has less evidence.

A model needs at least 40 scored or refused items to appear on the board. GLM 4.7 completed only 19
usable items and is excluded. The exclusion and reason are public.

### 10.8 The single judge decision

The original method planned two judges from different model families. The first budgeted run
produced partial second judge coverage. The second judge also scored on a systematically lower
scale.

Using two judges for some models and one judge for others could change the ranking based on which
models happened to receive the stricter judge. The current board therefore uses Gemini 3.1 Flash
Lite for every published score. The available Qwen judgments remain visible as extra evidence but
do not affect the board.

This was a reasonable consistency decision for a pilot. It is not the final validation. The current
judge belongs to a model family that also appears on the board, so self preference is a possible
risk.

The next step is not to claim that the judge is correct. The next step is to compare its ratings
with blind human ratings.

### 10.9 Reasoning effort

Reasoning models can spend hidden tokens before they answer. More reasoning can improve quality and
increase cost. Different settings would make the comparison less clear.

The default board policy caps reasoning capable models at low effort. Models without hidden
reasoning are labeled. Higher reasoning tests appear as separate rows.

Sarvam 30B and Sarvam 105B were each tested at low and high effort. The higher setting was never
silently substituted for the standard setting.

### 10.10 Run settings and repeatability

The evaluated models run at temperature 0.7 with a maximum of 2,000 response tokens. Temperature
0.7 allows natural variation in conversational answers. The judge runs at temperature 0 with a
maximum of 3,000 response tokens so its scoring is less variable.

The harness caches each completed call. This means a resumed run uses the same saved answer instead
of generating a replacement.

The current benchmark generates one answer for each item and model configuration. It does not run
the same item several times with different random seeds. A different run could therefore produce a
different answer and score.

The confidence intervals resample the stored items. They do not measure variation from generating
new answers or using a different judge. Repeated runs are a useful future study, but human agreement
is the higher priority.

## 11. What the current results show

All results in this section are point estimates from the current single judge pilot. They are not
final rankings.

### 11.1 Highest point estimates

| Model configuration | Overall score | 95 percent interval | English minus Hindi |
|---|---:|---:|---:|
| Claude Fable 5 | 9.47 | 9.19 to 9.70 | 0.04 |
| Claude Opus 5 | 9.42 | 9.21 to 9.66 | 0.31 |
| Kimi K3 | 9.34 | 9.12 to 9.57 | 0.02 |
| GPT 5.6 Sol | 8.78 | 8.32 to 9.09 | negative 0.74 |
| Qwen 3.7 Max | 8.74 | 8.30 to 9.12 | negative 0.24 |

The intervals overlap for several rows. Say that Claude Fable 5 has the highest point estimate. Do
not say that the pilot proves it is the best model.

### 11.2 Language results

Eighteen of 28 configurations scored lower in Hindi than in English. The average English minus
Hindi difference was 0.32 points.

The pattern is not universal. GPT 5.6 Sol scored 0.74 points higher in Hindi than in English. This
counterexample is important because it shows that the benchmark is not designed to force every
model into the same conclusion.

DeepSeek V4 Pro had a 3.23 point English to Hindi drop. MiMo V2.5 Pro had a 2.27 point drop. These
large values are useful places to inspect transcripts. They should not become strong model claims
until humans review the relevant items.

### 11.3 Dimension results

| Dimension | Average score across the board |
|---|---:|
| Family | 8.79 |
| Support | 8.55 |
| Hierarchy | 8.00 |
| Rituals | 7.34 |
| Honor and shame | 7.09 |
| Code mixing | 7.06 |
| Money | 6.18 |
| Indirectness | 5.96 |

Family and support have the highest averages. Indirectness and money have the lowest averages. Both
weak dimensions often require the model to infer something the speaker did not state directly.

This is a useful explanation for the pattern. It is still an interpretation, not a proven cause.

### 11.4 Sarvam results

| Sarvam configuration | Score | English minus Hindi | Usable items |
|---|---:|---:|---:|
| Sarvam 105B with high reasoning | 7.04 | 0.49 | 50 |
| Sarvam 30B with low reasoning | 5.89 | negative 2.41 | 42 |
| Sarvam 30B with high reasoning | 5.86 | 1.49 | 50 |
| Sarvam 105B with low reasoning | 5.54 | 0.33 | 49 |

High reasoning increased the Sarvam 105B point estimate by 1.49 points. It did not improve the
Sarvam 30B point estimate.

The low reasoning Sarvam 30B run has eight provider errors. Its language result is less reliable
than a complete run. Do not compare the low and high 30B rows without mentioning this difference.

The fact that Sarvam does not lead the current board does not make the project less relevant to
Sarvam. The benchmark can help an Indian model team find specific weaknesses. A useful diagnostic
does not need to flatter the company that may use it.

### 11.5 Refusals and errors

The published board contains six refused items. MiniMax M3, GLM 5.2, and DeepSeek V4 Flash are the
three published configurations with nonzero refusal rates.

The board contains 1,317 scored items and 6 refusals. There are 26 recorded provider errors across
the published rows. These counts show why the site displays coverage instead of hiding incomplete
runs.

## 12. What the results do not prove

Do not claim any of the following:

* The board proves one model is the best model for India.
* The 18 scenarios represent all Indian cultures.
* Hindi performance represents performance in every Indian language.
* The current judge is known to agree with humans.
* A 0.1 point difference is meaningful.
* The results measure factual knowledge about India.
* A high score means a model is safe for every emotional situation.

A strong interview answer separates evidence from interpretation.

Evidence is what the files directly show. For example, 18 of 28 configurations scored lower in
Hindi under the current judge.

Interpretation is a possible explanation. For example, models may have weaker training coverage for
indirect Hindi conversations.

Say when you are interpreting.

## 13. Engineering decisions

### 13.1 Reproducible data

Every run stores the model name, settings, item outputs, and dataset hash. The dataset hash is based
on the scenario and rubric content. The scoring process rejects runs from another dataset version.

This protects the board from silently combining results created with different questions or
rubrics.

The public rename from BhavBench to IndiaSocialBench did not rewrite stored dataset and result
content unnecessarily. The old `bhavbench` Python package and command remain as compatibility
paths. This preserved existing hashes and result history.

### 13.2 Cached and resumable runs

The harness caches API results in SQLite and uses write ahead logging. If a long run stops, it can
continue without paying for completed calls again.

This became useful during the live evaluations because providers failed, connections dropped, and
some models returned empty text after spending their response budget on hidden reasoning.

### 13.3 Failure handling

The adapters retry temporary API errors. Empty answers are treated as errors instead of valid model
responses. Failed items are visible in each run.

Models with fewer than 40 usable items are excluded from ranking. Models with at least 40 items can
appear with a visible partial label. This avoids presenting a severely incomplete run as a normal
result.

### 13.4 Model access

The harness can test models available through OpenRouter. It also has a direct Sarvam adapter because
the needed Sarvam models were not available through OpenRouter.

The adapter boundary keeps model access separate from dataset loading, judging, and scoring. Adding
a provider should not require rewriting the benchmark method.

### 13.5 Public evaluation workflow

A GitHub Actions workflow can evaluate a new model from the GitHub interface. The user enters the
model ID. The workflow checks the API balance before spending, runs the evaluation, judges the
items, rebuilds the leaderboard, and commits the generated evidence.

Only one evaluation runs at a time. The workflow stops if the API key is invalid or the balance is
too low. It also stops before judging if the model run has errors.

This workflow makes model additions possible without opening a local terminal. It does not provide a
public hosted service where anyone can spend the project owner's money.

### 13.6 Website delivery

The website uses Next.js and exports static pages. It does not need a database for public browsing.
More than 1,350 pages are built from the stored data, including model pages and transcript pages.

The homepage loads summary data. Detailed transcript data is loaded on the relevant static pages.
The site uses local Devanagari fonts, responsive layouts, reduced motion support, and keyboard
navigation. Vercel Analytics is installed for basic traffic measurement.

Static delivery keeps the public site fast and makes the research easier to preserve. The raw result
files remain the source of truth.

### 13.7 Automated checks

The repository checks:

* Python harness tests.
* Dataset validation.
* Locked Python dependencies.
* Website dependency security.
* A full static website build.

These checks run on GitHub when changes reach the repository. They protect the project from broken
scenario files, scoring regressions, unsafe website dependencies, and pages that fail to build.

## 14. Cost

The first live board published 11 models and cost $4.97. The expanded board of 28 configurations
was completed within a $30 API budget.

The project should not claim that every future 28 model evaluation will cost exactly $30. Model
prices differ. Long answers cost more. Reasoning settings cost more. Provider failures can also
create repeated calls.

Before a new model run, the CLI can estimate token use:

```bash
cd harness
uv run indiasocialbench estimate --model provider/model
```

The estimate is a planning tool. The provider's current price and the actual response lengths decide
the final cost.

### 14.1 What happens if Telugu, Tamil, or Kannada is added

Adding a language does not automatically cost a fixed extra $30.

If the project writes one new version of most scenarios and reruns all 28 configurations, the new
language adds evaluation calls and judge calls for those new items. For a matched expansion, the
extra workload would be roughly one additional language column compared with the current three
language design. The exact cost depends on the selected models, the number of new items, token
length, and whether the project reruns old items.

The more important cost is human work. A native speaker must write or review natural variants,
check social context, and review judge behavior. A literal translation would weaken the benchmark.

The safest expansion is:

1. Choose one language.
2. Write a small pilot with native speakers.
3. Run a few models.
4. Review the transcripts by hand.
5. Estimate the full board only after the pilot works.

## 15. Why the name changed

The project began as BhavBench. The name was meaningful but not immediately clear to everyone.
IndiaSocialBench explains the subject and the type of project without requiring an explanation.

The name has three useful parts:

* "India" states the geographic and cultural scope.
* "Social" states that the benchmark tests social understanding.
* "Bench" tells technical readers that it is a benchmark.

ISB can be used as a short form inside a sentence after the full name has been introduced. The
public domain should continue to use `indiasocialbench.nareshsilla.com` because it is clear and
searchable. `isb` alone is strongly associated with the Indian School of Business and is less clear
for a new visitor.

## 16. The strongest parts of the project

The project has several defensible strengths:

* It identifies a clear measurement gap.
* The matched language design changes language while keeping the social problem and rubric stable.
* The support control helps separate general empathy from cultural understanding.
* Probe turns test exact failure moments.
* Every score has public evidence.
* Refusals, errors, partial runs, and limitations remain visible.
* The benchmark includes four Sarvam configurations with reasoning settings shown.
* The run cost is low enough for independent research.
* The repository contains the data, harness, website, workflow, and draft report.

The complete path from a product question to a public and inspectable evaluation system is stronger
evidence of the work than any one leaderboard rank.

## 17. Current weaknesses

Be direct about the weaknesses:

1. Human agreement is not measured.
2. One model judge determines the public scores.
3. The judge's model family appears on the board.
4. Eighteen scenarios are enough for a pilot and not enough for broad claims about India.
5. A second native speaker has not reviewed every scenario.
6. The current languages focus on the Hindi speaking context.
7. Some published configurations contain provider errors.
8. Public scenarios may enter future model training data.
9. The technical report is still a draft.
10. Each configuration currently has only one generated answer per item.
11. The confidence intervals do not include judge variation or generation variation.
12. The project owner still needs to perform the human scoring and transcript review personally.

These limits do not make the project useless. They define what must happen before the project can
support stronger claims.

## 18. Next work in the correct order

### Step 1. Complete the human agreement study

Blindly score 50 transcripts without seeing the model names or judge scores. Compare your criterion
ratings with the judge ratings using Spearman correlation. Publish the result even if it is weak.

If agreement is weak, improve the rubric anchors and run the pilot again. Do not hide the result.

### Step 2. Add a second cultural reviewer

Ask another native speaker to review all 18 scenarios. Record disagreements and revise unclear
language or assumptions.

### Step 3. Review the largest language gaps

Read the Hindi and English transcripts for the models with the largest gaps. Check whether the
difference is model behavior, judge behavior, or scenario wording.

### Step 4. Expand the scenario set

Grow from 18 to the planned 54 base scenarios only after the scoring method passes human review.
More generated scenarios will not solve a weak rubric.

### Step 5. Finish the report

Update the paper with human agreement, cultural review, any revised results, and a clear bias
analysis.

### Step 6. Add one new Indian language

Pilot Telugu or Tamil with a native speaker. Do not treat machine translation as the finished
dataset.

## 19. Interview questions and honest answers

### Why did you build this?

> Existing emotional intelligence benchmarks tell us whether a model can sound empathetic. They do
> not tell us whether its advice fits an Indian social situation. I wanted a test where language,
> hierarchy, family obligations, and indirect speech are part of the task rather than background
> decoration.

### Why is this a product problem and not only a research problem?

> Model teams need to know what to improve. Companies deploying assistants need evidence that a
> model can handle their users. A public benchmark gives both groups a shared measurement and the
> transcripts needed to diagnose failures.

### Why use scripted users?

> A simulated user would introduce another model into the measurement and give different tested
> models different conversations. Fixed user messages make comparisons repeatable. I wrote each
> turn so the user can continue naturally without depending on the previous answer.

### Why not use real conversations?

> Private chats create consent and privacy problems. They also contain personal data and do not
> reliably test the exact skill I need. Original scenarios are publishable and allow a planned probe
> for each failure.

### How do you know the scenarios are not stereotypes?

> The rubric rewards reading the specific person rather than following a rule about Indians. The
> personas vary in background and their stance toward tradition. Some scenarios punish cultural
> assumptions. This protection still needs a second native speaker review, which I list as open
> work.

### Why include English?

> English is the comparison condition. The same situation in English, Hinglish, and Hindi lets me
> estimate whether a model's behavior changes with language.

### Why is Hinglish treated separately?

> Hinglish is not Hindi with English words inserted mechanically. The choice to switch languages
> can signal closeness, hurt, seriousness, or social position. The variant must sound natural to
> test that behavior.

### Why use a language model judge?

> Fifty items across 28 configurations create more than a thousand outputs. A model judge makes the
> pilot affordable and repeatable. It also creates a validity risk, so the scores are provisional
> and the next step is blind human comparison.

### Why use temperature 0.7, and did you repeat each item?

> Temperature 0.7 allows the evaluated model to give a natural conversational answer. The judge
> uses temperature 0 to reduce scoring variation. The current pilot stores one answer per item and
> does not repeat every item with several random seeds. This means the confidence interval covers
> item sampling, not generation variation. Repeated runs are future work.

### Why only one judge on the board?

> The second judge covered only part of the initial run and scored on a different scale. Mixing one
> and two judge rows would create inconsistent ranks. I kept one uniform judge for every row and
> left the extra judgments visible. The correct next step is human agreement testing, not pretending
> the single judge is final.

### Is it a problem that Gemini judges Gemini?

> Yes, self preference is a possible source of bias. The judge does not see model identity, which
> helps, but blind input does not remove every family specific preference. I disclose the risk and
> will compare the judge with human ratings.

### Why use absolute scores instead of pairwise voting?

> Absolute rubric scores preserve diagnosis. I can see that a model is weak on indirectness in
> Hindi. Pairwise voting can create a clean ranking, but it is harder to use for this kind of
> dimension analysis.

### Why are refusals separate?

> A refusal and a poor attempt are different failures. Entering every refusal as zero would mix
> them. I report the quality score and refusal rate separately.

### Why do dimensions receive equal weight?

> The number of items differs by dimension. Averaging every item directly would let larger
> dimensions control the overall score. Equal dimension weighting keeps the benchmark structure
> visible.

### Is 18 scenarios enough?

> It is enough to test the method and discover useful patterns. It is not enough for broad claims
> about India. I call this a pilot and plan to expand only after human review.

### What did the results teach you?

> General support was stronger than performance on the seven cultural dimensions. Indirectness and
> money were the weakest dimensions. Eighteen of 28 configurations scored lower in Hindi, but the
> pattern was not universal. These are current judge findings that need human validation.

### Why did Sarvam not rank first?

> An evaluation should not be designed to produce a preferred winner. The four Sarvam rows help
> identify where model size, reasoning effort, language, and provider reliability affect behavior.
> The current result is more useful as a diagnostic than as a marketing claim.

### What did you learn from the Sarvam reasoning test?

> Higher reasoning improved the 105B point estimate by 1.49 points. It did not improve the 30B point
> estimate. The low reasoning 30B run also had eight errors, so I would not treat its language result
> as a clean comparison.

### How did you keep the project affordable?

> I used fixed conversations, cached every completed call, capped reasoning effort, estimated cost
> before runs, and used a lower cost uniform judge. The first 11 model board cost $4.97. The expanded
> board was completed within a $30 API budget.

### What failed during implementation?

> Some reasoning models used their response budget on hidden thought and returned empty visible
> text. Providers also dropped connections or returned errors. I added response headroom, retries,
> cached resume behavior, error accounting, and minimum coverage rules.

### What would you change with more time?

> I would complete human agreement first, add a second cultural reviewer, and revise any weak
> scenarios. Then I would expand the dataset and add one language such as Telugu or Tamil with native
> speaker support.

### How much of this did an agent build?

Use an honest answer:

> I used coding agents heavily for implementation, drafting, and iteration. I set the product
> direction, made the scope and budget choices, selected the final design decisions, and own the
> claims. I do not want to present generated work as understanding, which is why I am reading the
> transcripts and will personally complete the human scoring. The repository history and public
> evidence make the process inspectable.

Do not claim that you wrote every line by hand. Your credibility comes from understanding the
system, making the decisions, checking the evidence, and completing the human work.

## 20. Study plan before an interview

### First reading

Read sections 1 to 12 of this guide. After each section, close the file and explain the idea aloud in
your own words.

You should be able to answer:

* What is the missing measurement?
* Why are there 50 items from 18 scenarios?
* Why is support a control?
* How is the language gap calculated?
* Why is the current board provisional?

### Transcript reading

Read at least these five cases:

1. Read a low scoring Llama 4 Maverick item to understand a clear failure.
2. Compare English and Hindi items from DeepSeek V4 Pro, which has the largest language gap.
3. Read one Claude Fable 5 item and decide whether the judge's high score is justified.
4. Read a Sarvam 105B high reasoning item and compare it with the low reasoning row.
5. Read the MiniMax M3 refusal on `hon-002.hi` and the judge explanation.

Useful directories:

* `results/raw/meta-llama_llama-4-maverick/`
* `results/raw/deepseek_deepseek-v4-pro/`
* `results/raw/anthropic_claude-fable-5/`
* `results/raw/sarvam_sarvam-105b_high/`
* `results/raw/minimax_minimax-m3/`

For every transcript, write three notes:

1. What did the model understand?
2. What did it miss?
3. Do you agree with the judge score?

Finding one place where you disagree with the judge will improve your understanding more than
memorizing the leaderboard.

### Method reading

Open these files in order:

1. `dataset/scenarios/roleplay/ind-001.yaml`
2. `dataset/rubrics/roleplay.yaml`
3. `harness/bhavbench/judge.py`
4. `harness/bhavbench/scoring.py`
5. `results/leaderboard.json`
6. `web/app/methodology/page.tsx`

This path follows one idea from the scenario through the rubric, judge, score, and website.

### Practice

Record yourself giving:

* A one minute project explanation.
* A three minute method explanation.
* A two minute honest limitations explanation.

Listen once and remove any claim you cannot support with a file or result.

## 21. File map

| File or directory | What it contains |
|---|---|
| `README.md` | Public introduction and setup |
| `PLAN.md` | Original design, milestones, and decision history |
| `PRODUCT.md` | Product purpose and design principles |
| `dataset/scenarios/` | The 18 authored scenarios |
| `dataset/rubrics/` | The roleplay and analysis scoring rules |
| `dataset/taxonomy.md` | Coverage plan across dimensions and people |
| `dataset/authoring-checklist.md` | Rules for writing and reviewing scenarios |
| `harness/bhavbench/runner.py` | Runs a tested model on the items |
| `harness/bhavbench/judge.py` | Builds judge prompts and saves judgments |
| `harness/bhavbench/scoring.py` | Produces item, dimension, language, and overall scores |
| `results/raw/` | Model outputs and judge explanations |
| `results/leaderboard.json` | Current public board |
| `web/` | The public website |
| `paper/DRAFT.md` | Technical report draft |
| `.github/workflows/evaluate-model.yml` | Workflow for adding a model |
| `docs/conversation-log.json` | Project decision conversation history |

## 22. Final summary

IndiaSocialBench is a public pilot for measuring how language models handle emotional and social
meaning in Indian conversations. Its main contribution is the combination of matched language
items, culture specific dimensions, a general support control, planned probe moments, and public
evidence behind every score.

The current board is useful but provisional. The strongest next action is the blind human review of
50 transcripts. Completing that work will improve the research and make the project more clearly
yours.
