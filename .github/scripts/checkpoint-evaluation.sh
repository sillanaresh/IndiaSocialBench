#!/usr/bin/env bash

set -euo pipefail

action=${1:?usage: checkpoint-evaluation.sh restore|save|clear MODEL_ID}
model=${2:?usage: checkpoint-evaluation.sh restore|save|clear MODEL_ID}
slug=${model//\//_}
slug=${slug//:/_}
slug=${slug//./-}
branch="eval-checkpoints/${slug}"
raw_path="results/raw/${slug}"

git config user.name "Naresh Silla"
git config user.email "silla.naresh@gmail.com"

branch_exists() {
  git ls-remote --exit-code --heads origin "refs/heads/${branch}" >/dev/null 2>&1
}

case "$action" in
  restore)
    if branch_exists; then
      git fetch --force origin "refs/heads/${branch}:refs/heads/${branch}"
      if git cat-file -e "${branch}:${raw_path}" 2>/dev/null; then
        git restore --source="$branch" --worktree -- "$raw_path"
        echo "restored saved progress for ${model}"
      fi
    else
      echo "no saved progress found for ${model}"
    fi
    ;;
  save)
    if [[ ! -d "$raw_path" ]]; then
      echo "no completed responses to save for ${model}"
      exit 0
    fi

    git add -- "$raw_path"
    if git diff --cached --quiet -- "$raw_path"; then
      echo "no new progress to save for ${model}"
      exit 0
    fi

    if git show-ref --verify --quiet "refs/heads/${branch}"; then
      parent=$(git rev-parse "refs/heads/${branch}")
    else
      parent=$(git rev-parse HEAD)
    fi
    tree=$(git write-tree)
    commit=$(git commit-tree "$tree" -p "$parent" -m "Checkpoint evaluation: ${model}")
    git update-ref "refs/heads/${branch}" "$commit"
    git push origin "refs/heads/${branch}:refs/heads/${branch}"
    git reset -- "$raw_path"
    echo "saved progress for ${model}"
    ;;
  clear)
    if branch_exists; then
      git push origin --delete "$branch"
    fi
    git update-ref -d "refs/heads/${branch}" 2>/dev/null || true
    echo "cleared saved progress for ${model}"
    ;;
  *)
    echo "unknown action: ${action}" >&2
    exit 2
    ;;
esac
