export default function MethodologyPage() {
  return (
    <div className="prose" style={{ marginTop: 44 }}>
      <h1>Methodology</h1>
      <p className="lede">
        Every number on the leaderboard is recomputable from raw transcripts. This page is the honest
        version — including what this benchmark cannot claim.
      </p>

      <h2>Tasks</h2>
      <p>
        <strong>Roleplay (12 of 18 scenarios).</strong> The model converses with a scripted user
        across four turns in an emotionally loaded situation. The user side is fixed in advance, so
        every model faces the identical conversation — no user-simulator variance, clean comparison,
        4× lower cost. Scripted turns are written to be <em>self-propelled</em> (the user advances
        their own arc regardless of the reply), and each roleplay contains one <em>probe turn</em>{" "}
        engineered to trigger the specific failure the scenario tests.
      </p>
      <p>
        <strong>Transcript analysis (6 of 18).</strong> The model reads a completed human-to-human
        conversation and answers three fixed questions, scored against an author-written gold
        rationale. This separates <em>perception</em> (can it read the room?) from{" "}
        <em>production</em> (can it respond well?).
      </p>

      <h2>Language triplets</h2>
      <p>
        Each scenario ships in matched English, Hinglish, and Devanagari Hindi renderings — not
        translations, but parallel compositions of the same situation. The headline{" "}
        <strong>Language Gap</strong> metric is Overall(English) − Overall(Hindi): how much emotional
        intelligence a model loses when the same human problem arrives in Hindi. Two switch-point
        scenarios exist only in Hinglish because the mid-conversation register shift <em>is</em> the
        phenomenon being tested.
      </p>

      <h2>Scoring</h2>
      <p>
        Two LLM judges from different model families score each transcript on anchored 0–10 rubrics
        (five criteria for roleplay: emotion recognition, cultural calibration, pragmatic
        effectiveness, language fidelity, warmth without sycophancy; three for analysis). Judges are
        blind to model identity and must write their justification <em>before</em> the score.
        Aggregation: criterion → item (weighted mean, judges averaged) → dimension-language cell →
        dimension (languages averaged) → overall (<em>dimensions</em> equally weighted, so no
        dimension dominates by item count). 95% CIs come from bootstrap resampling over items; models
        with overlapping CIs should be read as tied.
      </p>
      <p>
        <strong>Refusals are never averaged away.</strong> If a model declines to engage with an
        ordinary Indian family conversation, the item is excluded from rubric scoring and counted in
        a separate Refusal Rate column — over-refusal is itself a finding.
      </p>

      <h2>Known limitations</h2>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>LLM judges</strong>
            </td>
            <td>
              Judge validity is checked against blind human ratings on a stratified 50-transcript
              calibration set before any public claim; the agreement coefficient (Spearman ρ) will be
              published here, whatever it turns out to be. Judge families also appear on the
              leaderboard; per-judge score tables are published so self-preference is inspectable.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Hindi-belt skew</strong>
            </td>
            <td>
              v1 covers English, Hinglish, and Hindi. India is not Hindi; Tamil or Telugu (plus
              code-mixed variants) is the first v2 priority.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Contamination</strong>
            </td>
            <td>
              The dataset is public (openness beats leaderboard purity for this project), with a
              canary string and a small private holdout for future contamination checks.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Culture is not a lookup table</strong>
            </td>
            <td>
              Rubrics reward reading <em>the person in the scenario</em>, whose stance toward
              tradition varies, over applying any single &ldquo;Indian norm&rdquo; — and several
              scenarios deliberately punish stereotype application. Still, any benchmark of culture
              encodes choices; the scenario texts, rubrics, and judge prompts are all public so those
              choices can be challenged.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Run it yourself</h2>
      <p>
        The harness runs any OpenRouter-reachable model (plus a native Sarvam adapter) in about ten
        minutes: <code>bhavbench run --model your/model</code>, then <code>judge</code>, then{" "}
        <code>score</code>. Runs are cached, resumable, and budget-capped. To get a model on this
        board, open a GitHub issue with your run artifacts.
      </p>
    </div>
  );
}
