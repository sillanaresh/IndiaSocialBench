"""Run one model over dataset items, producing raw transcript records.

Output layout: results/raw/<model_slug>/items/<item_id>.json plus run_config.json.
Runs are resumable: an existing non-error item file is skipped unless --force.
"""

from __future__ import annotations

import datetime
import json
from pathlib import Path

from .adapters import AdapterError, Completion, get_adapter, model_slug
from .cache import Cache
from .dataset import ANALYSIS_SYSTEM, Item, dataset_hash
from .files import write_json_atomic

# 2000 (raised from 1024): hybrid-reasoning models burn thought tokens inside
# max_tokens; 1024 starved some to empty text (finish_reason=length).
EVAL_PARAMS = {"temperature": 0.7, "max_tokens": 2000}


def _cached_complete(adapter, cache: Cache, model: str, messages, system: str) -> Completion:
    key = Cache.key(model, system, messages, EVAL_PARAMS)
    hit = cache.get(key)
    if hit:
        return Completion(text=hit["text"], usage=hit.get("usage", {}))
    comp = adapter.complete(messages, system=system, **EVAL_PARAMS)
    cache.put(key, {"text": comp.text, "usage": comp.usage})
    return comp


def run_item(adapter, cache: Cache, model: str, item: Item) -> dict:
    s = item.scenario
    record = {
        "item_id": item.id,
        "scenario_id": s.id,
        "lang": item.lang,
        "dimension": s.dimension,
        "type": s.type,
        "status": "ok",
        "turns": [],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0},
    }
    try:
        if s.type == "roleplay":
            messages = []
            for user_turn in item.variant["user_turns"]:
                messages.append({"role": "user", "content": user_turn})
                comp = _cached_complete(adapter, cache, model, messages, s.system_prompt)
                messages.append({"role": "assistant", "content": comp.text})
                for k in record["usage"]:
                    record["usage"][k] += comp.usage.get(k) or 0
            record["turns"] = messages
        else:  # analysis
            questions = "\n".join(
                f"{i + 1}. {q}" for i, q in enumerate(item.variant["questions"])
            )
            content = f"{item.variant['transcript']}\n---\n{questions}"
            messages = [{"role": "user", "content": content}]
            comp = _cached_complete(adapter, cache, model, messages, ANALYSIS_SYSTEM[item.lang])
            record["turns"] = messages + [{"role": "assistant", "content": comp.text}]
            for k in record["usage"]:
                record["usage"][k] += comp.usage.get(k) or 0
    except AdapterError as ex:
        record["status"] = "error"
        record["error"] = str(ex)
    return record


def run_model(model: str, items: list[Item], out_dir: Path, force: bool = False, log=print) -> dict:
    slug = model_slug(model)
    run_dir = out_dir / slug
    items_dir = run_dir / "items"
    current_dataset_hash = dataset_hash()
    config_path = run_dir / "run_config.json"
    if config_path.exists():
        existing_config = json.loads(config_path.read_text())
        previous_dataset_hash = existing_config.get("dataset_hash")
        if previous_dataset_hash != current_dataset_hash:
            raise AdapterError(
                "existing run uses a different dataset version; archive the old run directory "
                "before evaluating this model on the current dataset"
            )
    items_dir.mkdir(parents=True, exist_ok=True)
    adapter = get_adapter(model)
    cache = Cache(out_dir / "cache.sqlite")

    counts = {"ok": 0, "error": 0, "skipped": 0}
    for item in items:
        path = items_dir / f"{item.id}.json"
        if path.exists() and not force:
            existing = json.loads(path.read_text())
            if existing.get("status") != "error":
                counts["skipped"] += 1
                continue
        log(f"  start {item.id}")
        record = run_item(adapter, cache, model, item)
        write_json_atomic(path, record)
        counts[record["status"]] += 1
        log(f"  {record['status']:5s} {item.id}")

    config = {
        "model": model,
        "slug": slug,
        "params": EVAL_PARAMS,
        "dataset_hash": current_dataset_hash,
        "finished_at": datetime.datetime.now(datetime.UTC).isoformat(),
        "counts": counts,
        "mock": model.startswith("mock:"),
    }
    write_json_atomic(config_path, config)
    return config
