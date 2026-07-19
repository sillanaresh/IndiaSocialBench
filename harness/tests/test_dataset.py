from bhavbench.dataset import DIMENSIONS, expand_items, load_rubric, load_scenarios


def test_loads_all_scenarios():
    scenarios = load_scenarios()
    assert len(scenarios) == 18
    assert {s.dimension for s in scenarios} == set(DIMENSIONS)


def test_expand_items_respects_exempt_variants():
    scenarios = load_scenarios()
    items = expand_items(scenarios)
    # 16 triplet scenarios + 2 hing-only switch-point scenarios
    assert len(items) == 16 * 3 + 2
    hing_only = [s for s in scenarios if set(s.variants) == {"hing"}]
    assert all(s.dimension == "code_mixing" for s in hing_only)
    assert len(hing_only) == 2


def test_rubrics_load_and_have_anchored_criteria():
    for t, n in (("roleplay", 5), ("analysis", 3)):
        rubric = load_rubric(t)
        assert len(rubric["criteria"]) == n
        for c in rubric["criteria"]:
            assert c["anchors"], c["id"]


def test_item_ids_unique():
    items = expand_items(load_scenarios())
    ids = [i.id for i in items]
    assert len(ids) == len(set(ids))
