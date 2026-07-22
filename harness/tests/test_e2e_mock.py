"""Offline end-to-end: mock run -> mock judgments -> leaderboard, in a tmp dir."""

import json

import pytest

from bhavbench.adapters import AdapterError
from bhavbench.dataset import expand_items, load_scenarios
from bhavbench.judge import judge_run
from bhavbench.runner import run_model
from bhavbench.scoring import build_leaderboard


def test_full_pipeline_offline(tmp_path):
    scenarios = load_scenarios()
    items = expand_items(scenarios)[:40]
    raw = tmp_path / "raw"

    config = run_model("mock:alpha", items, raw, log=lambda *a: None)
    assert config["counts"]["ok"] == 40 and config["counts"]["error"] == 0

    # resume: second run skips everything
    config2 = run_model("mock:alpha", items, raw, log=lambda *a: None)
    assert config2["counts"]["skipped"] == 40

    scenarios_by_id = {s.id: s for s in scenarios}
    counts = judge_run(raw / "mock_alpha", ["mock:judge-a", "mock:judge-b"], scenarios_by_id, raw, log=lambda *a: None)
    assert counts["ok"] == 80 and counts["error"] == 0

    board = build_leaderboard(raw, tmp_path / "leaderboard.json")
    assert board["sample"] is True  # mock data must always be flagged
    assert len(board["models"]) == 1
    m = board["models"][0]
    assert m["overall"] is not None and 0 <= m["overall"] <= 10
    assert m["n_items_scored"] + m["n_refusals"] == 40
    assert set(m["judges"]) == {"mock:judge-a", "mock:judge-b"}

    saved = json.loads((tmp_path / "leaderboard.json").read_text())
    assert saved["dataset_hash"] == board["dataset_hash"]

    config_path = raw / "mock_alpha" / "run_config.json"
    stale_config = json.loads(config_path.read_text())
    stale_config["dataset_hash"] = "stale-dataset"
    config_path.write_text(json.dumps(stale_config))

    with pytest.raises(AdapterError, match="different dataset version"):
        run_model("mock:alpha", items, raw, log=lambda *a: None)

    stale_board = build_leaderboard(raw, tmp_path / "stale-leaderboard.json")
    assert stale_board["models"] == []
    assert stale_board["excluded"][0]["reason"] == "dataset version does not match the current benchmark"


def test_transcripts_are_recorded_with_four_assistant_turns(tmp_path):
    scenarios = [s for s in load_scenarios() if s.type == "roleplay"][:1]
    items = expand_items(scenarios)[:1]
    run_model("mock:beta", items, tmp_path / "raw", log=lambda *a: None)
    rec = json.loads(next((tmp_path / "raw" / "mock_beta" / "items").glob("*.json")).read_text())
    roles = [t["role"] for t in rec["turns"]]
    assert roles == ["user", "assistant"] * 4
