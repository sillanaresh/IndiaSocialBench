"""Judge pipeline: score raw transcripts against the rubric.

Judgments land next to the run: results/raw/<slug>/judgments/<item_id>.<judge_slug>.json
Judge protocol per PLAN §3.2: blind to model identity, justification before score,
temperature 0, refusals flagged and excluded from rubric scoring.
"""

from __future__ import annotations

import hashlib
import json
import random
import re
from pathlib import Path

from .adapters import AdapterError, get_adapter, model_slug
from .cache import Cache
from .dataset import load_rubric

JUDGE_PARAMS = {"temperature": 0.0, "max_tokens": 3000}

PROMPT_TEMPLATE = """You are an expert evaluator for BhavBench, a benchmark measuring emotional and cultural intelligence in Indian conversations. You are fluent in English, Hindi, and Hinglish, and deeply familiar with Indian social norms.

You will read a conversation between a USER (scripted) and an ASSISTANT (the model under evaluation — its identity is hidden). Score ONLY the assistant.

## Ground truth (never shown to the assistant)
Situation: {situation}
Probe design: {probe_note}
What strong looks like: {gold_rationale}

## Rubric
{rubric_block}

{judge_notes}

## Conversation ({lang} variant, dimension: {dimension})
{transcript}

## Output format
First decide: did the assistant REFUSE to engage with the scenario (safety refusal / meta-deflection)? Partial engagement is not refusal.
Then, for each criterion, write 2-4 sentences of justification FIRST, then an integer score 0-10.

Respond with ONLY this JSON (no markdown fences):
{{"refused": false, "criteria": {{{criteria_keys}}}}}
where each criterion value is {{"justification": "...", "score": N}}.
If refused is true, set every score to null."""


def build_prompt(item_record: dict, scenario, rubric: dict) -> str:
    criteria = rubric["criteria"]
    rubric_lines = []
    for c in criteria:
        rubric_lines.append(f"### {c['id']} — {c['name']}\n{c['question'].strip()}")
        for level, text in sorted(c.get("anchors", {}).items()):
            rubric_lines.append(f"  anchor {level}: {text}")
    transcript = "\n\n".join(
        f"{'USER' if t['role'] == 'user' else 'ASSISTANT'}: {t['content']}" for t in item_record["turns"]
    )
    return PROMPT_TEMPLATE.format(
        situation=scenario.situation.strip(),
        probe_note=(scenario.probe_note or "n/a — analysis task").strip(),
        gold_rationale=scenario.gold_rationale.strip(),
        rubric_block="\n".join(rubric_lines),
        judge_notes=rubric.get("notes_for_judge", "").strip(),
        lang=item_record["lang"],
        dimension=item_record["dimension"],
        transcript=transcript,
        criteria_keys=", ".join(f'"{c["id"]}": ...' for c in criteria),
    )


def parse_judgment(text: str, criterion_ids: list[str]) -> dict:
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError("no JSON object found in judge output")
    data = json.loads(m.group(0))
    refused = bool(data.get("refused"))
    out = {"refused": refused, "criteria": {}}
    for cid in criterion_ids:
        entry = data["criteria"][cid]
        score = entry.get("score")
        if not refused:
            if not isinstance(score, (int, float)) or not 0 <= score <= 10:
                raise ValueError(f"criterion {cid}: score out of range: {score!r}")
        out["criteria"][cid] = {
            "justification": str(entry.get("justification", "")),
            "score": None if refused else float(score),
        }
    return out


def mock_judgment(item_record: dict, judge: str, criterion_ids: list[str]) -> dict:
    """Deterministic synthetic judgment for mock runs (sample data only).

    Reads the mock adapter's embedded skill prior and adds per-dimension and
    per-language offsets so sample leaderboards show realistic structure
    (e.g. scores dip in hi/hing and on cultural dimensions for 'Western' mocks).
    """
    text = " ".join(t["content"] for t in item_record["turns"] if t["role"] == "assistant")
    m = re.search(r"skill=([\d.]+)", text)
    skill = float(m.group(1)) if m else 5.0
    seed = hashlib.sha256(f"{judge}|{item_record['item_id']}|{text[:64]}".encode()).hexdigest()
    rng = random.Random(seed)
    lang_penalty = {"en": 0.0, "hing": 0.6, "hi": 1.0}[item_record["lang"]]
    cultural = item_record["dimension"] != "support"
    out = {"refused": rng.random() < 0.02, "criteria": {}}
    for cid in criterion_ids:
        base = skill - (lang_penalty * (1.6 if cultural else 0.5))
        if cid == "cultural_calibration":
            base -= 0.8 if cultural else 0.0
        score = max(0.0, min(10.0, rng.gauss(base, 0.9)))
        out["criteria"][cid] = {
            "justification": f"[MOCK JUDGMENT — synthetic sample, judge={judge}]",
            "score": None if out["refused"] else round(score, 1),
        }
    return out


def judge_run(run_dir: Path, judges: list[str], scenarios_by_id: dict, out_root: Path, log=print) -> dict:
    items_dir = run_dir / "items"
    judgments_dir = run_dir / "judgments"
    judgments_dir.mkdir(exist_ok=True)
    config = json.loads((run_dir / "run_config.json").read_text())
    is_mock = config.get("mock", False)
    cache = Cache(out_root / "cache.sqlite")

    counts = {"ok": 0, "skipped": 0, "error": 0}
    for item_file in sorted(items_dir.glob("*.json")):
        record = json.loads(item_file.read_text())
        if record["status"] != "ok":
            continue
        scenario = scenarios_by_id[record["scenario_id"]]
        rubric = load_rubric(record["type"])
        criterion_ids = [c["id"] for c in rubric["criteria"]]
        for judge in judges:
            jslug = model_slug(judge)
            out_path = judgments_dir / f"{record['item_id']}.{jslug}.json"
            if out_path.exists():
                counts["skipped"] += 1
                continue
            try:
                if is_mock or judge.startswith("mock:"):
                    judgment = mock_judgment(record, judge, criterion_ids)
                else:
                    adapter = get_adapter(judge)
                    prompt = build_prompt(record, scenario, rubric)
                    messages = [{"role": "user", "content": prompt}]
                    key = Cache.key(judge, "", messages, JUDGE_PARAMS)
                    cached = cache.get(key)
                    if cached:
                        raw_text = cached["text"]
                    else:
                        raw_text = None
                    last_err = None
                    for _ in range(3):
                        try:
                            if raw_text is None:
                                comp = adapter.complete(messages, system="", **JUDGE_PARAMS)
                                raw_text = comp.text
                            judgment = parse_judgment(raw_text, criterion_ids)
                            cache.put(key, {"text": raw_text})
                            break
                        except (ValueError, json.JSONDecodeError, KeyError) as ex:
                            last_err = ex
                            raw_text = None  # force re-generation
                    else:
                        raise AdapterError(f"judge output unparseable: {last_err}")
                judgment["judge"] = judge
                judgment["item_id"] = record["item_id"]
                out_path.write_text(json.dumps(judgment, ensure_ascii=False, indent=1))
                counts["ok"] += 1
                log(f"  judged {record['item_id']} by {judge}")
            except AdapterError as ex:
                counts["error"] += 1
                log(f"  ERROR judging {record['item_id']} by {judge}: {ex}")
    return counts
