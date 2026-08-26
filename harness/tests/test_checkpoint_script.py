from pathlib import Path
import subprocess


SCRIPT = Path(__file__).resolve().parents[2] / ".github" / "scripts" / "checkpoint-evaluation.sh"


def git(cwd: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def checkpoint(cwd: Path, action: str) -> None:
    subprocess.run(
        ["bash", str(SCRIPT), action, "stealth/ox-alpha"],
        cwd=cwd,
        check=True,
        capture_output=True,
        text=True,
    )


def test_checkpoint_branch_saves_restores_and_clears_progress(tmp_path):
    remote = tmp_path / "remote.git"
    work = tmp_path / "work"
    remote.mkdir()
    work.mkdir()
    git(remote, "init", "--bare")
    git(work, "init", "-b", "main")
    git(work, "config", "user.name", "Test User")
    git(work, "config", "user.email", "test@example.com")
    (work / "README.md").write_text("test repository\n")
    git(work, "add", "README.md")
    git(work, "commit", "-m", "Initial commit")
    git(work, "remote", "add", "origin", str(remote))
    git(work, "push", "-u", "origin", "main")
    main_head = git(work, "rev-parse", "HEAD")

    item = work / "results" / "raw" / "stealth_ox-alpha" / "items" / "item.json"
    item.parent.mkdir(parents=True)
    item.write_text('{"status": "ok"}\n')

    checkpoint(work, "save")

    assert git(work, "rev-parse", "HEAD") == main_head
    assert git(work, "show", "eval-checkpoints/stealth_ox-alpha:results/raw/stealth_ox-alpha/items/item.json") == '{"status": "ok"}'

    item.unlink()
    checkpoint(work, "restore")
    assert item.read_text() == '{"status": "ok"}\n'

    item.write_text('{"status": "updated"}\n')
    checkpoint(work, "save")
    assert git(work, "rev-parse", "HEAD") == main_head
    assert git(work, "show", "eval-checkpoints/stealth_ox-alpha:results/raw/stealth_ox-alpha/items/item.json") == '{"status": "updated"}'

    checkpoint(work, "clear")
    branches = git(remote, "for-each-ref", "--format=%(refname)", "refs/heads")
    assert "refs/heads/eval-checkpoints/stealth_ox-alpha" not in branches
