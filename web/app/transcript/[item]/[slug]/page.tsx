import Link from "next/link";
import {
  DIMENSION_META,
  displayName,
  getJudgments,
  getLeaderboard,
  getScenarioById,
  getTranscript,
  LANG_LABEL,
} from "@/lib/data";

export function generateStaticParams() {
  const board = getLeaderboard();
  const params: { item: string; slug: string }[] = [];
  for (const m of board.models) {
    for (const it of m.items) {
      params.push({ item: it.item_id, slug: m.slug });
    }
  }
  return params;
}

function scoreColor(v: number) {
  if (v >= 7) return "var(--good)";
  if (v >= 4.5) return "var(--accent)";
  return "var(--bad)";
}

export default async function TranscriptPage({
  params,
}: {
  params: Promise<{ item: string; slug: string }>;
}) {
  const { item, slug } = await params;
  const record = getTranscript(slug, item)!;
  const judgments = getJudgments(slug, item);
  const scenario = getScenarioById(record.scenario_id)!;
  const board = getLeaderboard();
  const model = board.models.find((x) => x.slug === slug)!;
  const probeTurn = scenario.probe_note?.match(/turn:?\s*(\d)/i)?.[1];

  return (
    <div>
      <p className="small" style={{ marginTop: 26 }}>
        <Link href={`/model/${slug}/`}>← {displayName(model.model)}</Link>
      </p>
      <h1 style={{ fontSize: "1.6rem" }}>{scenario.title}</h1>
      <p className="muted">
        <span className="chip accent">{DIMENSION_META[record.dimension]?.name}</span>{" "}
        <span className="chip">{LANG_LABEL[record.lang]}</span>{" "}
        <span className="chip">{record.type}</span> <span className="mono small">{record.item_id}</span>
      </p>
      {board.sample && (
        <div className="banner">
          <strong>Sample data.</strong> This transcript contains synthetic mock output, not a real
          model response.
        </div>
      )}

      <div className="authors-note">
        <strong>Author&apos;s note (hidden from the model): </strong>
        {scenario.situation}
        {scenario.probe_note && (
          <>
            <br />
            <strong>Probe: </strong>
            {scenario.probe_note}
          </>
        )}
      </div>

      <div className="transcript-grid">
        <div className="chat">
          {record.turns.map((t, i) => {
            const userIndex = record.turns.slice(0, i + 1).filter((x) => x.role === "user").length;
            const isProbe = t.role === "user" && probeTurn && String(userIndex) === probeTurn;
            return (
              <div key={i} className={`bubble ${t.role}`}>
                <span className="who">{t.role === "user" ? "user (scripted)" : "model"}</span>
                {isProbe ? (
                  <span className="probe-mark" title="Probe turn: the engineered moment this scenario tests">
                    {t.content}
                  </span>
                ) : (
                  t.content
                )}
              </div>
            );
          })}
        </div>

        <aside className="judge-panel">
          <h3 style={{ marginTop: 0 }}>Judgment</h3>
          {judgments.length === 0 && <p className="muted">Not yet judged.</p>}
          {judgments.map((j) => (
            <div key={j.judge} style={{ marginBottom: 18 }}>
              <p className="small faint" style={{ margin: "0 0 6px" }}>
                Judge: {displayName(j.judge)}
                {!model.judges.includes(j.judge) && (
                  <span className="chip" style={{ marginLeft: 8 }} title="Shown for transparency; excluded from leaderboard scores to keep judging uniform across models">
                    cross-check only
                  </span>
                )}
                {j.refused && (
                  <span className="chip" style={{ marginLeft: 8 }}>
                    scored as refusal
                  </span>
                )}
              </p>
              {!j.refused &&
                Object.entries(j.criteria).map(([cid, c]) => (
                  <details key={cid}>
                    <summary>
                      <span className="scorechip" style={{ background: scoreColor(c.score ?? 0) }}>
                        {c.score?.toFixed(1)}
                      </span>
                      <span style={{ fontSize: "0.9rem" }}>{cid.replace(/_/g, " ")}</span>
                    </summary>
                    <div className="just">{c.justification || "N/A"}</div>
                  </details>
                ))}
            </div>
          ))}
          <h3>What strong looks like</h3>
          <p className="small muted">{scenario.gold_rationale}</p>
        </aside>
      </div>
    </div>
  );
}
