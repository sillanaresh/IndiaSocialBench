"""Load and expand the IndiaSocialBench scenario dataset."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
DATASET_DIR = REPO_ROOT / "dataset"
LANGS = ("en", "hing", "hi")
DIMENSIONS = (
    "indirectness",
    "hierarchy",
    "family",
    "honor_shame",
    "code_mixing",
    "rituals",
    "money",
    "support",
)

ANALYSIS_SYSTEM = {
    "en": (
        "You are a perceptive reader of human conversations. Read the conversation "
        "transcript and answer the questions that follow it. Be specific and ground "
        "every claim in the transcript. Answer in the language the questions are asked in."
    ),
    "hing": (
        "You are a perceptive reader of human conversations. Neeche di gayi conversation "
        "ko dhyaan se padho aur uske baad ke questions ka jawab do. Specific raho aur har "
        "claim transcript se ground karo. Jawab usi language mein do jis mein questions hain."
    ),
    "hi": (
        "आप मानवीय बातचीत के सूक्ष्म पाठक हैं। नीचे दी गई बातचीत को ध्यान से पढ़िए और उसके "
        "बाद के प्रश्नों के उत्तर दीजिए। हर बात का आधार बातचीत में दिखाइए। उत्तर उसी भाषा "
        "में दीजिए जिसमें प्रश्न पूछे गए हैं।"
    ),
}


@dataclass
class Scenario:
    id: str
    type: str  # roleplay | analysis
    dimension: str
    title: str
    situation: str
    gold_rationale: str
    variants: dict
    system_prompt: str = ""
    probe_note: str = ""
    secondary: list = field(default_factory=list)
    persona: dict = field(default_factory=dict)
    rubric_weights: dict = field(default_factory=dict)
    review: dict = field(default_factory=dict)

    @classmethod
    def from_file(cls, path: Path) -> "Scenario":
        raw = yaml.safe_load(path.read_text())
        return cls(
            id=raw["id"],
            type=raw["type"],
            dimension=raw["dimension"],
            title=raw["title"],
            situation=raw["situation"],
            gold_rationale=raw["gold_rationale"],
            variants=raw["variants"],
            system_prompt=raw.get("system_prompt", ""),
            probe_note=raw.get("probe_note", ""),
            secondary=raw.get("secondary") or [],
            persona=raw.get("persona") or {},
            rubric_weights=raw.get("rubric_weights") or {},
            review=raw.get("review") or {},
        )


@dataclass
class Item:
    """One scenario in one language: the atomic unit of evaluation."""

    scenario: Scenario
    lang: str

    @property
    def id(self) -> str:
        return f"{self.scenario.id}.{self.lang}"

    @property
    def variant(self) -> dict:
        return self.scenario.variants[self.lang]


def load_scenarios(dataset_dir: Path = DATASET_DIR) -> list[Scenario]:
    files = sorted((dataset_dir / "scenarios").rglob("*.yaml"))
    return [Scenario.from_file(f) for f in files]


def expand_items(scenarios: list[Scenario], langs=LANGS) -> list[Item]:
    items = []
    for s in scenarios:
        for lang in langs:
            if lang in s.variants:
                items.append(Item(s, lang))
    return items


def load_rubric(scenario_type: str, dataset_dir: Path = DATASET_DIR) -> dict:
    return yaml.safe_load((dataset_dir / "rubrics" / f"{scenario_type}.yaml").read_text())


def dataset_hash(dataset_dir: Path = DATASET_DIR) -> str:
    """Stable content hash of scenarios + rubrics, recorded in every run."""
    h = hashlib.sha256()
    for f in sorted(dataset_dir.rglob("*.yaml")):
        h.update(f.relative_to(dataset_dir).as_posix().encode())
        h.update(f.read_bytes())
    return h.hexdigest()[:16]
