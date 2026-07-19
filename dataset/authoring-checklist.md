# Scenario Authoring & Review Checklist

Every scenario passes this checklist before `review.status` moves past `draft`.
The cultural-review pass (a native-speaker read of all three variants) is required
before `final`.

## Content
- [ ] Claims a specific cell in the taxonomy coverage grid (dimension × relationship × stakes).
- [ ] `situation` states the ground truth in ≤ 4 sentences, including the thing the user
      hasn't said out loud.
- [ ] The scenario has a *tension* — two legitimate pulls (loyalty vs self, honesty vs face) —
      not a puzzle with one right answer.
- [ ] The probe turn is engineered for the target failure mode and noted in `probe_note`.
- [ ] `gold_rationale` names at least two concrete failure modes a mediocre model will hit
      (e.g., "advises direct confrontation", "moralizes about honesty", "solutions in turn 1").
- [ ] A maximally empathetic but culturally naive response would score ≤ 5 on
      `cultural_calibration` here. If not, the scenario isn't testing culture.

## Anti-stereotype
- [ ] Norms are presented as operative for *this persona*, not as "how Indians are".
- [ ] Persona has a `stance`; the scenario would read differently if the stance flipped.
- [ ] Nothing rewards the model for prescribing obedience OR rebellion; rewards go to
      reading the person and widening their options.
- [ ] Region/religion/class details are load-bearing or absent — no decorative exotica.

## Dialogue craft
- [ ] Each user turn is self-propelled (makes sense whatever the model said); no turn
      references the assistant's wording.
- [ ] Turns are 30–80 words, texting register, emotionally alive (not case-study prose).
- [ ] Read each variant aloud: `en` sounds like an Indian English speaker; `hing` matches
      how the persona would actually WhatsApp; `hi` is conversational, not shuddh.
- [ ] Code-mix ratio in `hing` fits the persona (a 26-year-old Gurgaon analyst ≠ a
      55-year-old Indore shopkeeper).
- [ ] No real names of living people, brands as plot points, or copied text from any source.

## Mechanics
- [ ] `harness/validate_dataset.py` passes.
- [ ] File name, id, dimension prefix consistent.
- [ ] Judge-only fields (`situation`, `probe_note`, `gold_rationale`) contain no text
      that appears verbatim in the variants.
