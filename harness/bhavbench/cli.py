"""BhavBench CLI.

  bhavbench run   --model openai/gpt-5.6-sol [--langs en,hing,hi] [--force]
  bhavbench judge --model openai/gpt-5.6-sol --judges anthropic/claude-sonnet-5,google/gemini-3.5-flash
  bhavbench score
  bhavbench estimate --model X   (rough token/cost preview, no API calls)

Env: OPENROUTER_API_KEY, SARVAM_API_KEY. Model spec prefixes: sarvam:, mock:.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .adapters import model_slug
from .dataset import REPO_ROOT, expand_items, load_scenarios
from .judge import judge_run
from .runner import run_model
from .scoring import build_leaderboard

RESULTS = REPO_ROOT / "results"
RAW = RESULTS / "raw"


def _items(langs: str):
    scenarios = load_scenarios()
    return expand_items(scenarios, tuple(langs.split(",")))


def cmd_run(args):
    items = _items(args.langs)
    print(f"running {args.model} on {len(items)} items")
    config = run_model(args.model, items, RAW, force=args.force)
    print(f"done: {config['counts']}")
    if config["counts"]["error"]:
        print("run has errors — rerun before scoring (PLAN §3.4)", file=sys.stderr)
        sys.exit(2)


def cmd_judge(args):
    scenarios_by_id = {s.id: s for s in load_scenarios()}
    run_dir = RAW / model_slug(args.model)
    if not run_dir.exists():
        sys.exit(f"no run found at {run_dir}; run `bhavbench run` first")
    counts = judge_run(run_dir, args.judges.split(","), scenarios_by_id, RAW)
    print(f"judging done: {counts}")
    if counts["error"]:
        sys.exit(2)


def cmd_score(args):
    board = build_leaderboard(RAW, RESULTS / "leaderboard.json")
    flag = "  [SAMPLE DATA]" if board["sample"] else ""
    print(f"leaderboard written: {len(board['models'])} models{flag}")
    for rank, m in enumerate(board["models"], 1):
        gap = m["language_gap_en_hi"]
        print(
            f"  {rank}. {m['model']:40s} overall={m['overall']:.2f}"
            f"  gap(en-hi)={gap:+.2f}" if gap is not None else f"  {rank}. {m['model']}"
        )


def cmd_estimate(args):
    items = _items(args.langs)
    # rough: roleplay = 4 completions of ~350 tok out / growing ~1.5k tok in; analysis = 1 x 600 out
    comp_in = comp_out = 0
    for it in items:
        if it.scenario.type == "roleplay":
            comp_in += 4 * 1500
            comp_out += 4 * 350
        else:
            comp_in += 1200
            comp_out += 600
    judge_in = len(items) * 2 * 3500
    judge_out = len(items) * 2 * 900
    print(f"items: {len(items)}")
    print(f"eval model tokens : ~{comp_in / 1e6:.2f}M in / {comp_out / 1e6:.2f}M out")
    print(f"judges (2) tokens : ~{judge_in / 1e6:.2f}M in / {judge_out / 1e6:.2f}M out")
    print("at typical frontier pricing ($3/M in, $15/M out): "
          f"~${(comp_in * 3 + comp_out * 15) / 1e6:.2f} eval + ${(judge_in * 3 + judge_out * 15) / 1e6:.2f} judging per model")


def main():
    p = argparse.ArgumentParser(prog="bhavbench")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("run", help="run a model over the dataset")
    r.add_argument("--model", required=True)
    r.add_argument("--langs", default="en,hing,hi")
    r.add_argument("--force", action="store_true", help="rerun existing items")
    r.set_defaults(fn=cmd_run)

    j = sub.add_parser("judge", help="judge a completed run")
    j.add_argument("--model", required=True)
    j.add_argument("--judges", required=True, help="comma-separated judge model specs")
    j.set_defaults(fn=cmd_judge)

    s = sub.add_parser("score", help="aggregate all runs into results/leaderboard.json")
    s.set_defaults(fn=cmd_score)

    e = sub.add_parser("estimate", help="token/cost preview without API calls")
    e.add_argument("--model", default="-")
    e.add_argument("--langs", default="en,hing,hi")
    e.set_defaults(fn=cmd_estimate)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
