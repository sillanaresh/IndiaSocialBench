# BhavBench Taxonomy & Coverage Plan

Authoritative list of dimensions, the v1 coverage grid, and scenario-authoring rules.
Read PLAN.md §2 first; this file operationalizes it.

## Dimensions (stable IDs — never rename without migrating all scenario files)

| ID | Name | One-line test |
|---|---|---|
| `indirectness` | Indirect speech & face-saving | Does the model hear the "no" inside "dekhte hain" — and protect everyone's face while acting on it? |
| `hierarchy` | Hierarchy & respect registers | Can it navigate upward disagreement, aap/tum, and elder dynamics without the Western direct-feedback playbook? |
| `family` | Family & the collective self | Does it treat decisions as family-negotiated, and hold both belonging and autonomy without picking a side for the user? |
| `honor_shame` | Honor, shame & reputation | Does it treat izzat and "log kya kahenge" as real constraints to work *with*, not irrationalities to dismiss? |
| `code_mixing` | Code-mixed emotional register | Does it register that a language switch mid-conversation is an emotional event, and mirror register naturally? |
| `rituals` | Life events, ritual & religious pragmatics | Does it know the pragmatics of grief, weddings, festivals, and gifts — including what varies by community? |
| `money` | Money, obligation & reciprocity | Can it navigate loans, gifts, and obligation ledgers where a direct refusal has social cost? |
| `support` | Support calibration (control) | Venting vs solving; empathy before agenda. The culture-neutral anchor for isolating the cultural gap. |

## v1 coverage grid

Target: 54 base scenarios. Fill cells so that each dimension has 6–7 base scenarios
(≥4 roleplay, ≥2 analysis) and no relationship-type dominates. Mark cells as scenarios ship.

Relationship axes: parent/elder · in-law · spouse/partner · boss/senior · friend/peer · extended-family/community · vendor/customer/stranger.
Stakes axes: daily friction · life event · crisis.

| Dimension | Shipped (pilot) | Planned M1 | Planned M4 |
|---|---|---|---|
| indirectness | ind-001 (friend/life-event) | +2 | 6 total |
| hierarchy | hier-001 (boss/daily) | +2 | 7 total |
| family | fam-001 (parent/life-event) | +2 | 7 total |
| honor_shame | hon-001 (community/crisis) | +2 | 7 total |
| code_mixing | — | +3 (incl. 2 switch-point, hing-only) | 6 total |
| rituals | rit-001 (colleague/grief, analysis) | +2 (≥1 non-Hindu community norms) | 7 total |
| money | mon-001 (friend/crisis) | +2 | 7 total |
| support | — | +3 | 7 total |

Persona-distribution tracker (update at every batch; hard check at M4):
region N/S/E/W ≥ 8 scenarios each · ≥6 non-Hindu-context scenarios · ≥40% female personas ·
≥8 non-metro settings · persona stance toward tradition: embracing/resisting/ambivalent each ≥ 12.

## Authoring rules (condensed — full checklist in authoring-checklist.md)

1. **Grid first.** Every new scenario claims a grid cell; no duplicate cell without justification.
2. **Situation before script.** Write the `situation` ground truth and `probe_note` before any dialogue.
3. **Self-propelled turns.** Each user turn must read naturally regardless of the model's reply:
   the user advances their own arc (new fact, escalation, doubt, reversal) and never references
   the assistant's previous wording.
4. **One probe per roleplay.** Turn 3 or 4 contains the engineered moment that catches the target
   failure mode. Name it in `probe_note`.
5. **Variants are renderings, not translations.** Write each language variant as if originally
   composed in that register. Read it aloud; if it sounds like translated text, rewrite.
6. **No stereotype prescription.** The scenario shows norms operative *for this persona*. At least
   1 in 4 scenarios per dimension must punish stereotype-application (the culturally "expected"
   reading is wrong for this particular person).
7. **Original text only.** Inspiration from public sources is fine; copied text is not.
8. **LLM drafts, human ships.** Every shipped scenario must differ substantively from its LLM draft;
   the author's edit is where the benchmark's value lives.
