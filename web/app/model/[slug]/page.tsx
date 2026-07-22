import Link from "next/link";
import Radar from "@/components/Radar";
import {
  DIMENSION_META,
  displayName,
  fmt,
  getJudgments,
  getLeaderboard,
  LANG_LABEL,
} from "@/lib/data";

export function generateStaticParams() {
  return getLeaderboard().models.map((m) => ({ slug: m.slug }));
}

function scoreColor(v: number) {
  if (v >= 7) return "var(--good)";
  if (v >= 4.5) return "var(--accent)";
  return "var(--bad)";
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = getLeaderboard();
  const m = board.models.find((x) => x.slug === slug)!;
  const rank = board.models.findIndex((x) => x.slug === slug) + 1;
  const axes = board.dimensions.map((d) => DIMENSION_META[d]?.short ?? d);

  const fieldAvg = board.dimensions.map((d) => {
    const vals = board.models.map((x) => x.dimensions[d]?.overall).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  });

  const worst = m.items
    .filter((it) => it.score != null)
    .sort((a, b) => a.score! - b.score!)
    .slice(0, 3);

  return (
    <div>
      <p className="small" style={{ marginTop: 26 }}>
        <Link href="/">← Leaderboard</Link>
      </p>
      <h1>
        {displayName(m.model)}{" "}
        {m.mock && <span className="chip" style={{ verticalAlign: "middle" }}>sample</span>}
      </h1>
      <p className="lede">
        Rank #{rank} · Overall <strong>{fmt(m.overall)}</strong>
        {m.ci95 && (
          <span className="muted">
            {" "}
            (95% CI {fmt(m.ci95[0])} to {fmt(m.ci95[1])})
          </span>
        )}{" "}
        · Language gap en→hi{" "}
        <strong>{m.language_gap_en_hi == null ? "N/A" : m.language_gap_en_hi.toFixed(2)}</strong> ·
        Refusal rate {m.refusal_rate == null ? "N/A" : `${(m.refusal_rate * 100).toFixed(0)}%`} ·
        Judged by {m.judges.map(displayName).join(" + ")}
      </p>
      {board.sample && (
        <div className="banner">
          <strong>Sample data.</strong> These synthetic placeholder results demonstrate the pipeline.
        </div>
      )}

      <div className="model-overview-grid">
        <div>
          <Radar
            axes={axes}
            series={[
              { name: "field average", color: "var(--ink-faint)", dash: "4 4", values: fieldAvg },
              {
                name: displayName(m.model),
                color: "var(--accent)",
                values: board.dimensions.map((d) => m.dimensions[d]?.overall ?? null),
              },
            ]}
          />
          <p className="small faint" style={{ textAlign: "center" }}>
            <span
              aria-hidden
              style={{
                borderTop: "2px solid var(--accent)",
                display: "inline-block",
                marginRight: 5,
                verticalAlign: "middle",
                width: 18,
              }}
            />
            this model ·{" "}
            <span
              aria-hidden
              style={{
                borderTop: "2px dashed var(--ink-faint)",
                display: "inline-block",
                marginRight: 5,
                verticalAlign: "middle",
                width: 18,
              }}
            />
            field average
          </p>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>By dimension &amp; language</h3>
          <div className="table-scroll" tabIndex={0} aria-label="Dimension and language scores">
            <table className="board">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Overall</th>
                  {board.langs.map((l) => (
                    <th key={l}>{LANG_LABEL[l]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {board.dimensions.map((d) => {
                  const dim = m.dimensions[d];
                  return (
                    <tr key={d}>
                      <td title={DIMENSION_META[d]?.blurb}>{DIMENSION_META[d]?.name ?? d}</td>
                      <td className="mono">{fmt(dim?.overall)}</td>
                      {board.langs.map((l) => (
                        <td key={l} className="mono muted">
                          {fmt(dim?.by_lang[l])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2>Where it struggles</h2>
      <p className="muted">The three lowest-scoring conversations, with the judge&apos;s words.</p>
      <div className="cardgrid">
        {worst.map((it) => {
          const judgments = getJudgments(m.slug, it.item_id);
          const quote =
            judgments[0] &&
            Object.values(judgments[0].criteria)
              .map((c) => c.justification)
              .find((j) => j.length > 0);
          return (
            <Link
              key={it.item_id}
              href={`/transcript/${it.item_id}/${m.slug}/`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span className="scorechip" style={{ background: scoreColor(it.score!) }}>
                  {it.score!.toFixed(1)}
                </span>
                <span className="chip accent">{DIMENSION_META[it.dimension]?.short}</span>
                <span className="chip">{LANG_LABEL[it.lang]}</span>
              </div>
              <div className="mono small">{it.item_id}</div>
              {quote && (
                <p className="small muted" style={{ marginBottom: 0 }}>
                  “{quote.slice(0, 160)}
                  {quote.length > 160 ? "…" : ""}”
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <h2>All items</h2>
      <div className="table-scroll" tabIndex={0} aria-label="All evaluated items">
        <table className="board">
          <thead>
            <tr>
              <th>Item</th>
              <th>Dimension</th>
              <th>Lang</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {m.items.map((it) => (
              <tr key={it.item_id} className="row">
                <td className="mono">
                  <Link href={`/transcript/${it.item_id}/${m.slug}/`} style={{ color: "inherit" }}>
                    {it.item_id}
                  </Link>
                </td>
                <td>{DIMENSION_META[it.dimension]?.short}</td>
                <td>{LANG_LABEL[it.lang]}</td>
                <td className="mono">{it.score == null ? <span className="chip">refused</span> : it.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
