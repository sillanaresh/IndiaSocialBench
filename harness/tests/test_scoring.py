from bhavbench.scoring import _aggregate, bootstrap_ci, item_score


def J(refused=False, **scores):
    return {
        "refused": refused,
        "criteria": {k: {"justification": "", "score": None if refused else v} for k, v in scores.items()},
    }


def test_item_score_weighted_mean_over_judges():
    judgments = [J(a=8, b=4), J(a=6, b=6)]
    assert item_score(judgments, {}) == ((8 + 4) / 2 + (6 + 6) / 2) / 2
    # weight a twice as heavy
    weighted = item_score(judgments, {"a": 2.0})
    assert weighted == ((8 * 2 + 4) / 3 + (6 * 2 + 6) / 3) / 2


def test_item_score_all_refused_is_none():
    assert item_score([J(refused=True, a=0)], {}) is None


def test_item_score_partial_refusal_uses_remaining_judge():
    assert item_score([J(refused=True, a=0), J(a=7)], {}) == 7


def _mk(dim, lang, score):
    return {"item_id": f"{dim}.{lang}", "dimension": dim, "lang": lang, "score": score}


def test_aggregate_dimension_equal_weighting():
    # support has many items, indirectness few — dimensions still weigh equally
    items = [_mk("support", "en", 8)] * 10 + [_mk("indirectness", "en", 4)]
    agg = _aggregate(items)
    assert agg["dimensions"]["support"]["overall"] == 8
    assert agg["dimensions"]["indirectness"]["overall"] == 4
    assert agg["overall"] == 6  # mean of dimension scores, not item mean


def test_language_gap():
    items = [
        _mk("support", "en", 8), _mk("support", "hi", 6), _mk("support", "hing", 7),
        _mk("money", "en", 6), _mk("money", "hi", 2), _mk("money", "hing", 5),
    ]
    agg = _aggregate(items)
    assert agg["language_gap_en_hi"] == (8 + 6) / 2 - (6 + 2) / 2
    assert agg["language_gap_en_hing"] == 7 - 6


def test_refusal_rate_and_exclusion():
    items = [_mk("support", "en", 8), _mk("support", "en", None), _mk("support", "en", None), _mk("support", "en", 6)]
    agg = _aggregate(items)
    assert agg["refusal_rate"] == 0.5
    assert agg["dimensions"]["support"]["overall"] == 7  # refusals never averaged as zeros


def test_bootstrap_ci_brackets_point_estimate():
    items = [_mk("support", "en", 5 + (i % 5)) for i in range(40)]
    agg = _aggregate(items)
    ci = bootstrap_ci(items)
    assert ci is not None and ci[0] <= agg["overall"] <= ci[1]
    assert ci[1] - ci[0] < 2.0
