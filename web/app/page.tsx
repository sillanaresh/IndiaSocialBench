import type { Metadata } from "next";
import LeaderboardTable from "@/components/LeaderboardTable";
import {
  DIMENSION_META,
  displayName,
  getLeaderboard,
  getScenarios,
  leaderboardSummary,
} from "@/lib/data";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

function computeFindings(board: ReturnType<typeof getLeaderboard>) {
  const models = board.models;
  if (!models.length) return null;
  const gaps = models.map((m) => m.language_gap_en_hi).filter((g): g is number => g != null);
  const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null;
  const dropCount = gaps.filter((g) => g > 0).length;

  // field-wide weakest & strongest dimension
  const dimAvgs = board.dimensions.map((d) => {
    const vals = models.map((m) => m.dimensions[d]?.overall).filter((v): v is number => v != null);
    return { d, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
  });
  const ranked = dimAvgs.filter((x) => x.avg != null).sort((a, b) => a.avg! - b.avg!);
  const weakest = ranked[0];
  const support = dimAvgs.find((x) => x.d === "support");
  const culturalDims = dimAvgs.filter((x) => x.d !== "support" && x.avg != null);
  const culturalAvg = culturalDims.length
    ? culturalDims.reduce((a, b) => a + b.avg!, 0) / culturalDims.length
    : null;

  const refusers = models.filter((m) => (m.refusal_rate ?? 0) > 0.04);
  return { avgGap, dropCount, total: models.length, weakest, support, culturalAvg, refusers };
}

export default function Home() {
  const board = getLeaderboard();
  const nScenarios = getScenarios().length;
  const nItems = board.models[0] ? board.models[0].n_items_scored + board.models[0].n_refusals : 0;
  const f = computeFindings(board);

  return (
    <div>
      <div className="page-intro">
        <h1>Does your model understand India?</h1>
        <p className="lede">
          IndiaSocialBench measures how language models respond to emotionally difficult Indian
          conversations. It evaluates indirect refusals, family negotiations, honor and shame,
          grief etiquette, and money between friends in English, Hinglish, and Hindi. Every score
          links to the transcript and judge explanation behind it.
        </p>
        <div className="benchmark-stats">
          {[
            [String(board.models.length), "models"],
            // Revert this label to "hand-curated scenarios" after review and calibration.
            [String(nScenarios), "pilot scenarios"],
            [String(nItems || "N/A"), "items per model"],
            ["3", "language modes"],
            ["8", "dimensions"],
            ["$30", "API budget"],
          ].map(([n, label]) => (
            <div key={label} className="benchmark-stat">
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600 }}>{n}</div>
              <div className="small faint" style={{ marginTop: -4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {board.sample && (
        <div className="banner">
          <strong>Sample data.</strong> Every model below is a synthetic placeholder run through the
          real pipeline to demonstrate the benchmark. Live frontier-model results land here after the
          first funded run. No real model has been scored yet.
        </div>
      )}

      <LeaderboardTable board={leaderboardSummary(board)} />

      {!board.sample && f && (
        <>
          <h2>What the numbers say</h2>
          <div className="cardgrid">
            {f.avgGap != null && (
              <div className="card">
                <h3 style={{ marginTop: 0 }}>The pilot shows a language gap</h3>
                <p className="small muted" style={{ marginBottom: 0 }}>
                  {f.dropCount} of {f.total} models score lower when the identical situations arrive
                  in Hindi instead of English. The average drop is{" "}
                  <strong>{f.avgGap.toFixed(2)} points</strong>. Same problems, same rubric, same
                  judges; only the language changed.
                </p>
              </div>
            )}
            {f.weakest && f.support?.avg != null && (
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Culture is harder than empathy</h3>
                <p className="small muted" style={{ marginBottom: 0 }}>
                  The field averages <strong>{f.support.avg.toFixed(2)}</strong> on the
                  culture-neutral support control, but{" "}
                  {f.culturalAvg != null && (
                    <>
                      <strong>{f.culturalAvg.toFixed(2)}</strong> across the seven cultural
                      dimensions and is{" "}
                    </>
                  )}
                  weakest on <strong>{DIMENSION_META[f.weakest.d]?.name.toLowerCase()}</strong> (
                  {f.weakest.avg!.toFixed(2)}). Models know how to feel; they don&apos;t yet know how
                  India works.
                </p>
              </div>
            )}
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Refusals on family topics</h3>
              <p className="small muted" style={{ marginBottom: 0 }}>
                {f.refusers.length === 0
                  ? "No model refused ordinary Indian family conversations in this run. Refusal rates stayed under 4% across the board."
                  : `${f.refusers.map((m) => displayName(m.model)).join(", ")} refused ordinary family-life scenarios at 4% or more. Over-refusal is reported as its own column and is never hidden in the average.`}
              </p>
            </div>
          </div>
        </>
      )}

      {board.excluded && board.excluded.length > 0 && (
        <p className="small faint">
          Excluded from this board:{" "}
          {board.excluded
            .map((e) => `${displayName(e.model)} (only ${e.n_items}/50 items completed, ${e.reason})`)
            .join("; ")}
          .
        </p>
      )}
      <p className="small faint">
        Dataset {`v${board.dataset_hash}`} · generated {board.generated_at.slice(0, 10)} ·{" "}
        {nScenarios} base scenarios · single uniform blinded judge (see{" "}
        <a href="/methodology/">methodology &amp; limits</a>)
      </p>
    </div>
  );
}
