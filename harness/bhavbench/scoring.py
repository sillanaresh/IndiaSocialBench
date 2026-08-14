"""Aggregation per PLAN §3.3. Every number on the leaderboard is produced here.

criterion scores -> item score (weighted mean, judges averaged)
  -> dimension-language cell mean -> dimension score (mean over langs)
  -> overall (mean over dimensions) ; language gap = overall(en) - overall(hi)
Bootstrap CIs resample items within each model.
"""

from __future__ import annotations

import datetime
import json
import random
from collections import defaultdict
from pathlib import Path

from .dataset import DIMENSIONS, LANGS, dataset_hash, load_scenarios


def item_score(judgments: list[dict], weights: dict) -> float | None:
    """Mean over judges of weighted criterion mean. None if all judges saw a refusal."""
    per_judge = []
    for j in judgments:
        if j["refused"]:
            continue
        num = den = 0.0
        for cid, entry in j["criteria"].items():
            w = weights.get(cid, 1.0)
            num += w * entry["score"]
            den += w
        per_judge.append(num / den)
    return sum(per_judge) / len(per_judge) if per_judge else None


def _aggregate(items: list[dict]) -> dict:
    """items: [{dimension, lang, score(None=refused)}] -> overall/dims/gaps/refusal."""
    cells = defaultdict(list)  # (dim, lang) -> scores
    refusals = 0
    scored = 0
    for it in items:
        if it["score"] is None:
            refusals += 1
            continue
        scored += 1
        cells[(it["dimension"], it["lang"])].append(it["score"])

    def dim_lang(dim, lang):
        vals = cells.get((dim, lang))
        return sum(vals) / len(vals) if vals else None

    dims = {}
    for dim in DIMENSIONS:
        by_lang = {lang: dim_lang(dim, lang) for lang in LANGS}
        present = [v for v in by_lang.values() if v is not None]
        dims[dim] = {
            "overall": sum(present) / len(present) if present else None,
            "by_lang": by_lang,
        }

    present_dims = [d["overall"] for d in dims.values() if d["overall"] is not None]
    overall = sum(present_dims) / len(present_dims) if present_dims else None

    def overall_for_lang(lang):
        vals = [dims[d]["by_lang"][lang] for d in DIMENSIONS if dims[d]["by_lang"].get(lang) is not None]
        return sum(vals) / len(vals) if vals else None

    by_lang_overall = {lang: overall_for_lang(lang) for lang in LANGS}
    gap = None
    if by_lang_overall["en"] is not None and by_lang_overall["hi"] is not None:
        gap = by_lang_overall["en"] - by_lang_overall["hi"]
    gap_hing = None
    if by_lang_overall["en"] is not None and by_lang_overall["hing"] is not None:
        gap_hing = by_lang_overall["en"] - by_lang_overall["hing"]

    total = scored + refusals
    return {
        "overall": overall,
        "by_lang": by_lang_overall,
        "dimensions": dims,
        "language_gap_en_hi": gap,
        "language_gap_en_hing": gap_hing,
        "refusal_rate": refusals / total if total else None,
        "n_items_scored": scored,
        "n_refusals": refusals,
    }


def bootstrap_ci(items: list[dict], n: int = 1000, seed: int = 7) -> list[float] | None:
    rng = random.Random(seed)
    scored = [it for it in items if it["score"] is not None]
    if len(scored) < 5:
        return None
    overalls = []
    for _ in range(n):
        sample = [rng.choice(scored) for _ in scored]
        o = _aggregate(sample)["overall"]
        if o is not None:
            overalls.append(o)
    overalls.sort()
    return [overalls[int(0.025 * len(overalls))], overalls[int(0.975 * len(overalls))]]


def score_model(run_dir: Path, scenarios_by_id: dict, judge_filter: list[str] | None = None) -> dict:
    config = json.loads((run_dir / "run_config.json").read_text())
    judgments_dir = run_dir / "judgments"
    by_item = defaultdict(list)
    judges = set()
    for jf in sorted(judgments_dir.glob("*.json")) if judgments_dir.exists() else []:
        j = json.loads(jf.read_text())
        if judge_filter and j["judge"] not in judge_filter:
            continue
        by_item[j["item_id"]].append(j)
        judges.add(j["judge"])

    items = []
    errors = 0
    for item_file in sorted((run_dir / "items").glob("*.json")):
        record = json.loads(item_file.read_text())
        if record["status"] == "error":
            errors += 1
            continue
        judgments = by_item.get(record["item_id"], [])
        if not judgments:
            continue
        weights = scenarios_by_id[record["scenario_id"]].rubric_weights
        items.append(
            {
                "item_id": record["item_id"],
                "dimension": record["dimension"],
                "lang": record["lang"],
                "score": item_score(judgments, weights),
            }
        )

    agg = _aggregate(items)
    agg.update(
        {
            "model": config["model"],
            "slug": config["slug"],
            "mock": config.get("mock", False),
            "n_errors": errors,
            "judges": sorted(judges),
            "ci95": bootstrap_ci(items),
            "items": items,
        }
    )
    return agg


MIN_ITEMS = 40  # models judged on fewer items are excluded because their ranks would be misleading


def build_leaderboard(raw_dir: Path, out_path: Path, judge_filter: list[str] | None = None) -> dict:
    scenarios_by_id = {s.id: s for s in load_scenarios()}
    current_dataset_hash = dataset_hash()
    models = []
    excluded = []
    for run_dir in sorted(raw_dir.iterdir()):
        config_path = run_dir / "run_config.json"
        if not config_path.exists():
            continue
        config = json.loads(config_path.read_text())
        if config.get("dataset_hash") != current_dataset_hash:
            excluded.append(
                {
                    "model": config["model"],
                    "slug": config["slug"],
                    "n_items": 0,
                    "reason": "dataset version does not match the current benchmark",
                }
            )
            continue
        m = score_model(run_dir, scenarios_by_id, judge_filter)
        if m["overall"] is None:
            continue
        if m["n_items_scored"] + m["n_refusals"] < MIN_ITEMS:
            excluded.append(
                {"model": m["model"], "slug": m["slug"], "n_items": m["n_items_scored"] + m["n_refusals"],
                 "reason": "insufficient coverage (provider errors)"}
            )
            continue
        models.append(m)
    models.sort(key=lambda m: m["overall"], reverse=True)

    board = {
        "generated_at": datetime.datetime.now(datetime.UTC).isoformat(),
        "dataset_hash": current_dataset_hash,
        "sample": any(m["mock"] for m in models),
        "dimensions": list(DIMENSIONS),
        "langs": list(LANGS),
        "models": models,
        "excluded": excluded,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(board, ensure_ascii=False, indent=1))
    return board
