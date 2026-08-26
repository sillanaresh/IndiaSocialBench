import json

from bhavbench.files import write_json_atomic


def test_write_json_atomic_replaces_complete_file(tmp_path):
    path = tmp_path / "items" / "example.json"
    path.parent.mkdir()
    path.write_text('{"state": "old"}')

    write_json_atomic(path, {"state": "new", "text": "नमस्ते"})

    assert json.loads(path.read_text()) == {"state": "new", "text": "नमस्ते"}
    assert not (path.parent / "tmp" / path.name).exists()
