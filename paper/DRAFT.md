# IndiaSocialBench: Measuring cultural and emotional intelligence in Indian conversations

**Naresh Silla**

Technical report draft, version 0.2. Results are provisional until the planned human agreement study is complete.

## Abstract

IndiaSocialBench measures how language models respond to emotionally difficult Indian conversations. The benchmark covers indirect refusals, hierarchy, family negotiation, reputation, code mixing, rituals, money, and emotional support. It contains 18 original scenarios rendered as 50 matched items in English, Hinglish, and Hindi.

The current public board contains 27 model configurations. Every model faced the same scripted conversations and was scored by the same blinded language model judge. Seventeen of 27 models scored lower in Hindi than in English. The average difference was 0.32 points on a 0 to 10 scale. Models averaged 8.51 on the general emotional support control and 7.12 across the seven cultural dimensions.

These results are evidence from a pilot, not final claims about model quality. Human review of 50 transcripts is planned. The agreement result will be published even if it is low. Every transcript, judgment, scoring rule, and result is available in the repository.

## 1. Problem

Most emotional intelligence benchmarks are written in English and focus on general empathy or emotion recognition. They do not test whether a model can read social meaning that depends on Indian language and social structure.

An answer can sound kind and still fail. A model may advise a junior employee to confront a senior manager directly. It may treat "dekhte hain" as a real promise. It may reply in formal Hindi after a user shifts into intimate Hinglish. IndiaSocialBench tests these failures as conversation behavior rather than cultural trivia.

The benchmark has three goals:

1. Measure cultural judgment separately from general emotional support.
2. Compare the same situation across English, Hinglish, and Hindi.
3. Let readers inspect every score through the source transcript and judge explanation.

## 2. Benchmark design

### 2.1 Dimensions

IndiaSocialBench uses eight dimensions.

| Dimension | What it tests |
|---|---|
| Indirectness | Whether the model reads hints, refusals, and face saving language |
| Hierarchy | Whether advice respects age, status, and workplace power |
| Family | Whether the model understands decisions made within family relationships |
| Honor and shame | Whether it recognizes reputation and social exposure without endorsing harm |
| Code mixing | Whether it reads language switching as an emotional signal |
| Rituals | Whether it handles grief, weddings, festivals, and religious context with care |
| Money | Whether it understands obligation and indirect refusal around loans and gifts |
| Support | Whether it listens before solving. This is the general emotional support control |

The cultural dimensions describe constraints that are active for the person in each scenario. They do not define one correct Indian culture. Personas differ in their region, religion, class, age, and stance toward tradition. Some scenarios penalize models that apply a stereotype instead of reading the person.

### 2.2 Tasks

Twelve scenarios use roleplay. Each model receives four fixed user turns. The user continues the conversation regardless of the model response, which keeps the comparison consistent. Every roleplay includes a probe turn designed to test a named failure.

Six scenarios use transcript analysis. The model reads a conversation between two people and answers three questions about meaning, missed signals, and the best next message. The answer is compared with an author written rationale.

Sixteen scenarios have matched English, Hinglish, and Hindi versions. Two code mixing scenarios exist only in Hinglish because the language switch is the behavior being tested. This produces 50 items per complete run.

### 2.3 Scoring

The current board uses Gemini 3.1 Flash Lite as one uniform blinded judge. The judge receives the scenario context, probe design, rubric, and transcript. It does not receive the evaluated model name. It writes a reason before assigning each score.

Roleplay items use five criteria. Transcript analysis items use three. Each criterion is scored from 0 to 10 using written anchors. Item scores are averaged within each language and dimension. Dimension scores receive equal weight in the overall score.

Refusals are not entered as zero scores. They are reported separately. Confidence intervals are estimated by resampling scored items 1,000 times. Overlapping intervals should be read as ties.

The full method calls for a second judge from another model family. We have not added it to the main score because the available second judge gave scores on a different scale. Mixing one and two judge runs would change ranks based on which models received the extra judge. The current board keeps one judge for every model and states this limit.

## 3. Evaluation

The board contains 27 model configurations from 19 providers. Models ran at temperature 0.7. Models with hidden reasoning used low reasoning effort unless the row states otherwise. Sarvam models were also tested at high reasoning effort as separate rows.

Each complete model run contains 50 items. Some provider errors reduced the number for a few models. Models with fewer than 40 scored or refused items are excluded. The leaderboard shows completed item counts and errors.

The expanded board stayed within a 25 dollar API budget. The stored result for every model includes its settings, dataset version, transcript files, and judge files.

## 4. Results

### 4.1 Overall scores

The table below shows the five highest point estimates. Confidence intervals overlap across several rows, so this is not evidence of a strict order.

| Model | Score | 95% confidence interval | English minus Hindi |
|---|---:|---:|---:|
| Claude Fable 5 | 9.47 | 9.19 to 9.70 | 0.04 |
| Kimi K3 | 9.34 | 9.12 to 9.57 | 0.02 |
| GPT 5.6 Sol | 8.78 | 8.32 to 9.09 | negative 0.74 |
| Qwen 3.7 Max | 8.74 | 8.30 to 9.12 | negative 0.24 |
| Claude Sonnet 5 | 8.64 | 8.37 to 8.96 | negative 0.11 |

### 4.2 Language difference

Seventeen of 27 models scored lower in Hindi than in English. The average difference was 0.32 points. The direction is not universal. GPT 5.6 Sol and several other models scored slightly better in Hindi.

The largest positive differences appear in models such as DeepSeek V4 Pro and MiMo V2.5 Pro. Their point estimates dropped by 3.23 and 2.27 points. These large differences need transcript review and human scoring before they should be treated as model claims.

### 4.3 Cultural dimensions

The average support score was 8.51. The average across the seven cultural dimensions was 7.12.

| Dimension | Average score |
|---|---:|
| Family | 8.74 |
| Support | 8.51 |
| Hierarchy | 7.93 |
| Rituals | 7.24 |
| Honor and shame | 7.03 |
| Code mixing | 6.99 |
| Money | 6.08 |
| Indirectness | 5.85 |

Models performed best on family situations and general support. They performed worst on indirectness and money. Both weak dimensions often require the model to infer a refusal or obligation that the speaker does not state directly.

### 4.4 Sarvam results

Sarvam appears in four separate rows because model size and reasoning effort are visible parts of the comparison.

| Model setting | Score | English minus Hindi | Completed items |
|---|---:|---:|---:|
| Sarvam 105B, high reasoning | 7.04 | 0.49 | 50 |
| Sarvam 30B, low reasoning | 5.89 | negative 2.41 | 42 |
| Sarvam 30B, high reasoning | 5.86 | 1.49 | 50 |
| Sarvam 105B, low reasoning | 5.54 | 0.33 | 49 |

High reasoning increased the Sarvam 105B point estimate by 1.49 points. It did not improve the Sarvam 30B point estimate. The low reasoning 30B run has eight provider errors, so its language result is less reliable than a complete run.

### 4.5 Refusals

Refusals were uncommon. Six refusals were recorded across the published board. MiniMax M3, GLM 5.2, and DeepSeek V4 Flash were the only published rows with a nonzero refusal rate.

## 5. Limits

Human agreement has not been measured yet. The leaderboard uses one language model judge, and that judge also belongs to a model family represented on the board. Absolute scores and close ranks are provisional.

The dataset contains 18 scenarios. It is large enough for a pilot and too small for broad claims about India. All scenarios still await a second cultural reviewer.

The language coverage is limited to English, Hinglish, and Hindi. India is not Hindi. A future version should test one Dravidian language after the current method passes human review.

The public dataset allows inspection and reuse. It also creates a contamination risk for future models. The project includes a canary and plans to keep private holdout items for later checks.

Provider errors affect a few model rows. The site shows item counts and errors so readers can judge those rows accordingly.

## 6. Reproducibility

The repository contains the scenario files, rubrics, model settings, transcripts, judge explanations, and scoring code. The public website links each score to its transcript.

The evaluation command records a dataset hash in every model run. The scoring command rejects results from another dataset version. Automated checks validate all 18 scenario files, run the offline evaluation tests, audit website packages, and build all static pages.

Website: https://indiasocialbench.nareshsilla.com/

Repository: https://github.com/sillanaresh/IndiaSocialBench

## 7. Planned validation

The remaining research task is a blind human review of 50 transcripts. The study will compare human and judge scores for each criterion using Spearman correlation. The report will publish the result even if the agreement is weak. A weak result will require revised scoring anchors and another pilot.

Until that work is complete, IndiaSocialBench should be described as a public pilot with inspectable evidence.
