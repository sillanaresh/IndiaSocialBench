"""Small file helpers used by the evaluation pipeline."""

from __future__ import annotations

import json
from pathlib import Path


def write_json_atomic(path: Path, data: dict) -> None:
    """Write complete JSON or leave the previous file untouched."""
    tmp_dir = path.parent / "tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = tmp_dir / path.name
    tmp_path.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    tmp_path.replace(path)
