#!/usr/bin/env python3
"""Validate BhavBench scenario files against dataset/schema.md.

Usage: python3 harness/validate_dataset.py
Exits non-zero with a per-file error report if any invariant fails.
Requires: pyyaml
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
SCENARIO_DIR = ROOT / "dataset" / "scenarios"
RUBRIC_DIR = ROOT / "dataset" / "rubrics"

DIMENSIONS = {
    "indirectness": "ind",
    "hierarchy": "hier",
    "family": "fam",
    "honor_shame": "hon",
    "code_mixing": "mix",
    "rituals": "rit",
    "money": "mon",
    "support": "sup",
}
LANGS = ("en", "hing", "hi")
REGIONS = {"north", "south", "east", "west", "ne"}
SETTINGS = {"metro", "town", "rural"}
STANCES = {"embracing", "resisting", "ambivalent"}
DEVANAGARI = re.compile(r"[ऀ-ॿ]")

def rubric_criteria(scenario_type: str) -> set[str]:
    rubric = yaml.safe_load((RUBRIC_DIR / f"{scenario_type}.yaml").read_text())
    return {c["id"] for c in rubric["criteria"]}

def check(path: Path) -> list[str]:
    errs: list[str] = []
    e = errs.append
    try:
        s = yaml.safe_load(path.read_text())
    except yaml.YAMLError as ex:
        return [f"YAML parse error: {ex}"]

    sid, stype = s.get("id"), s.get("type")
    if sid != path.stem:
        e(f"id {sid!r} != filename stem {path.stem!r}")
    if stype not in ("roleplay", "analysis"):
        e(f"bad type {stype!r}")
    if stype and path.parent.name != stype:
        e(f"file in {path.parent.name}/ but type is {stype!r}")

    dim = s.get("dimension")
    if dim not in DIMENSIONS:
        e(f"unknown dimension {dim!r}")
    elif sid and not sid.startswith(DIMENSIONS[dim] + "-"):
        e(f"id prefix does not match dimension {dim!r} (expected {DIMENSIONS[dim]}-*)")
    for sec in s.get("secondary", []) or []:
        if sec not in DIMENSIONS:
            e(f"unknown secondary dimension {sec!r}")
        if sec == dim:
            e("secondary repeats primary dimension")

    title = s.get("title", "")
    if not title or len(title) > 60:
        e(f"title missing or >60 chars ({len(title)})")

    p = s.get("persona") or {}
    if not isinstance(p.get("age"), int):
        e("persona.age must be int")
    if p.get("gender") not in ("m", "f", "x"):
        e(f"persona.gender bad: {p.get('gender')!r}")
    if p.get("region") not in REGIONS:
        e(f"persona.region bad: {p.get('region')!r}")
    if p.get("setting") not in SETTINGS:
        e(f"persona.setting bad: {p.get('setting')!r}")
    if p.get("stance") not in STANCES:
        e(f"persona.stance bad: {p.get('stance')!r}")

    for field in ("situation", "gold_rationale"):
        if not s.get(field):
            e(f"missing {field}")
    if stype == "roleplay":
        for field in ("system_prompt", "probe_note"):
            if not s.get(field):
                e(f"missing {field} (required for roleplay)")

    weights = s.get("rubric_weights") or {}
    if stype in ("roleplay", "analysis"):
        allowed = rubric_criteria(stype)
        for k in weights:
            if k not in allowed:
                e(f"rubric_weights key {k!r} not in {stype} rubric")

    variants = s.get("variants") or {}
    exempt = s.get("variants_exempt", False)
    if exempt:
        if dim != "code_mixing":
            e("variants_exempt only allowed for code_mixing scenarios")
        if not s.get("exempt_reason"):
            e("variants_exempt requires exempt_reason")
        if set(variants) != {"hing"}:
            e("exempt scenarios must have exactly the 'hing' variant")
    elif set(variants) != set(LANGS):
        e(f"variants must be exactly {LANGS}, got {tuple(variants)}")

    shapes = {}
    for lang, v in variants.items():
        v = v or {}
        if stype == "roleplay":
            turns = v.get("user_turns") or []
            if len(turns) != 4:
                e(f"{lang}: expected 4 user_turns, got {len(turns)}")
            shapes[lang] = len(turns)
            text = "\n".join(turns)
        else:
            transcript = v.get("transcript") or ""
            questions = v.get("questions") or []
            if not transcript.strip():
                e(f"{lang}: empty transcript")
            if len(questions) != 3:
                e(f"{lang}: expected 3 questions, got {len(questions)}")
            shapes[lang] = len(questions)
            text = transcript + "\n".join(questions)

        has_dev = bool(DEVANAGARI.search(text))
        if lang == "hi" and not has_dev:
            e("hi variant contains no Devanagari")
        if lang in ("en", "hing") and has_dev:
            e(f"{lang} variant contains Devanagari (must be Roman script)")

        for judge_field in ("situation", "gold_rationale", "probe_note"):
            val = (s.get(judge_field) or "").strip()
            if val and val in text:
                e(f"{lang}: judge-only field {judge_field} leaked verbatim into variant")

    if len(set(shapes.values())) > 1:
        e(f"turn/question counts differ across variants: {shapes}")

    r = s.get("review") or {}
    if not r.get("author"):
        e("review.author missing")
    if r.get("cultural_review") not in ("pending", "passed"):
        e(f"review.cultural_review bad: {r.get('cultural_review')!r}")
    if r.get("status") not in ("draft", "pilot", "final"):
        e(f"review.status bad: {r.get('status')!r}")
    if r.get("status") == "final" and r.get("cultural_review") != "passed":
        e("status=final requires cultural_review=passed")

    return errs

def main() -> int:
    files = sorted(SCENARIO_DIR.rglob("*.yaml"))
    if not files:
        print("no scenario files found", file=sys.stderr)
        return 1
    failed = 0
    ids: dict[str, Path] = {}
    for f in files:
        errs = check(f)
        stem = f.stem
        if stem in ids:
            errs.append(f"duplicate id with {ids[stem]}")
        ids[stem] = f
        if errs:
            failed += 1
            print(f"FAIL {f.relative_to(ROOT)}")
            for err in errs:
                print(f"  - {err}")
        else:
            print(f"ok   {f.relative_to(ROOT)}")
    print(f"\n{len(files) - failed}/{len(files)} scenario files valid")
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main())
