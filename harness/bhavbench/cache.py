"""SQLite completion cache: identical (model, params, prompt) never hits the API twice."""

from __future__ import annotations

import hashlib
import json
import sqlite3
from pathlib import Path


class Cache:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(path, timeout=60)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS completions (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
        )

    @staticmethod
    def key(model: str, system: str, messages, params: dict) -> str:
        blob = json.dumps(
            {"model": model, "system": system, "messages": messages, "params": params},
            sort_keys=True,
            ensure_ascii=False,
        )
        return hashlib.sha256(blob.encode()).hexdigest()

    def get(self, key: str):
        row = self.conn.execute("SELECT value FROM completions WHERE key=?", (key,)).fetchone()
        return json.loads(row[0]) if row else None

    def put(self, key: str, value: dict):
        self.conn.execute(
            "INSERT OR REPLACE INTO completions (key, value) VALUES (?, ?)",
            (key, json.dumps(value, ensure_ascii=False)),
        )
        self.conn.commit()
