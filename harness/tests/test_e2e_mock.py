"""Offline end-to-end: mock run -> mock judgments -> leaderboard, in a tmp dir."""

import json

from bhavbench.dataset import expand_items, load_scenarios
from bhavbench.judge import judge_run
from bhavbench.runner import run_model
from bhavbench.scoring import build_leaderboard


def test_full_pipeline_offline(tmp_path):
    scenarios = load_scenarios()
    items = expand_items(scenarios)[:12]
    raw = tmp_path / "raw"

    config = run_model("mock:alpha", items, raw, log=lambda *a: None)
    assert config["counts"]["ok"] == 12 and config["counts"]["error"] == 0

    # resume: second run skips everything
    config2 = run_model("mock:alpha", items, raw, log=lambda *a: None)
    assert config2["counts"]["skipped"] == 12

    scenarios_by_id = {s.id: s for s in scenarios}
    counts = judge_run(raw / "mock_alpha", ["mock:judge-a", "mock:judge-b"], scenarios_by_id, raw, log=lambda *a: None)
    assert counts["ok"] == 24 and counts["error"] == 0

    board = build_leaderboard(raw, tmp_path / "leaderboard.json")
    assert board["sample"] is True  # mock data must always be flagged
    assert len(board["models"]) == 1
    m = board["models"][0]
    assert m["overall"] is not None and 0 <= m["overall"] <= 10
    assert m["n_items_scored"] + m["n_refusals"] == 12
    assert set(m["judges"]) == {"mock:judge-a", "mock:judge-b"}

    saved = json.loads((tmp_path / "leaderboard.json").read_text())
    assert saved["dataset_hash"] == board["dataset_hash"]


def test_transcripts_are_recorded_with_four_assistant_turns(tmp_path):
    scenarios = [s for s in load_scenarios() if s.type == "roleplay"][:1]
    items = expand_items(scenarios)[:1]
    run_model("mock:beta", items, tmp_path / "raw", log=lambda *a: None)
    rec = json.loads(next((tmp_path / "raw" / "mock_beta" / "items").glob("*.json")).read_text())
    roles = [t["role"] for t in rec["turns"]]
    assert roles == ["user", "assistant"] * 4
