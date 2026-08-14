from bhavbench.cli import _has_minimum_judge_coverage, _judge_coverage
from bhavbench.scoring import MIN_ITEMS


def test_judge_coverage_counts_each_judge_separately(tmp_path):
    judgments = tmp_path / "judgments"
    judgments.mkdir()
    for item in range(MIN_ITEMS):
        (judgments / f"item-{item}.google_gemini-3-1-flash-lite.json").touch()
    for item in range(MIN_ITEMS - 1):
        (judgments / f"item-{item}.mock_second-judge.json").touch()

    coverage = _judge_coverage(
        tmp_path,
        ["google/gemini-3.1-flash-lite", "mock:second-judge"],
    )

    assert coverage == {
        "google/gemini-3.1-flash-lite": MIN_ITEMS,
        "mock:second-judge": MIN_ITEMS - 1,
    }
    assert not _has_minimum_judge_coverage(coverage)

    coverage["mock:second-judge"] = MIN_ITEMS
    assert _has_minimum_judge_coverage(coverage)
