"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang, LeaderboardModelSummary, LeaderboardSummary } from "@/lib/data";
import { labName, prettyName, reasoningInfo, weightsClass } from "@/lib/names";

type LangSel = "all" | Lang;
const LANG_LABEL: Record<LangSel, string> = { all: "All", en: "English", hing: "Hinglish", hi: "हिंदी" };
const DIM_SHORT: Record<string, string> = {
  indirectness: "Indirect",
  hierarchy: "Hierarchy",
  family: "Family",
  honor_shame: "Honor",
  code_mixing: "Mixing",
  rituals: "Rituals",
  money: "Money",
  support: "Support",
};

function overallFor(m: LeaderboardModelSummary, lang: LangSel): number | null {
  return lang === "all" ? m.overall : m.by_lang[lang];
}
function dimFor(m: LeaderboardModelSummary, dim: string, lang: LangSel): number | null {
  const d = m.dimensions[dim];
  if (!d) return null;
  return lang === "all" ? d.overall : d.by_lang[lang];
}


export default function LeaderboardTable({ board }: { board: LeaderboardSummary }) {
  const router = useRouter();
  const [lang, setLang] = useState<LangSel>("all");
  const [weights, setWeights] = useState<"all" | "open" | "closed">("all");
  const [sortKey, setSortKey] = useState<string>("overall");

  const rows = useMemo(() => {
    const sorted = board.models.filter((m) => weights === "all" || weightsClass(m.model) === weights);
    sorted.sort((a, b) => {
      const va =
        sortKey === "overall"
          ? overallFor(a, lang)
          : sortKey === "gap"
            ? a.language_gap_en_hi
            : sortKey === "refusal"
              ? a.refusal_rate
              : dimFor(a, sortKey, lang);
      const vb =
        sortKey === "overall"
          ? overallFor(b, lang)
          : sortKey === "gap"
            ? b.language_gap_en_hi
            : sortKey === "refusal"
              ? b.refusal_rate
              : dimFor(b, sortKey, lang);
      return (vb ?? -1) - (va ?? -1);
    });
    return sorted;
  }, [board.models, lang, sortKey, weights]);

  return (
    <div>
      <div className="board-controls">
        <div className="seg" role="group" aria-label="Language mode">
          {(Object.keys(LANG_LABEL) as LangSel[]).map((l) => (
            <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Weights filter">
          {(["all", "open", "closed"] as const).map((w) => (
            <button key={w} aria-pressed={weights === w} onClick={() => setWeights(w)}>
              {w === "all" ? "All models" : w === "open" ? "Open weights" : "Closed"}
            </button>
          ))}
        </div>
        <span className="small faint">
          Toggle the language to see how the ranking changes.
        </span>
      </div>

      <div className="table-scroll leaderboard-scroll">
        <table className="board leaderboard-board">
          <thead>
            <tr>
              <th></th>
              <th>Model</th>
              <th className="sortable" onClick={() => setSortKey("overall")}>
                Overall{sortKey === "overall" ? " ↓" : ""}
              </th>
              <th className="sortable hide-mobile" onClick={() => setSortKey("gap")} title="Overall(English) − Overall(Hindi)">
                Gap en→hi{sortKey === "gap" ? " ↓" : ""}
              </th>
              <th className="sortable hide-mobile" onClick={() => setSortKey("refusal")}>
                Refusals{sortKey === "refusal" ? " ↓" : ""}
              </th>
              {board.dimensions.map((d) => (
                <th key={d} className="sortable hide-mobile dimcell" onClick={() => setSortKey(d)} title={d}>
                  {DIM_SHORT[d] ?? d}
                  {sortKey === d ? " ↓" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => {
              const o = overallFor(m, lang);
              const gap = m.language_gap_en_hi;
              return (
                <tr
                  key={`${m.slug}-${lang}-${sortKey}`}
                  className="row row-animate"
                  style={{ animationDelay: `${i * 25}ms` }}
                  onClick={() => router.push(`/model/${m.slug}/`)}
                >
                <td className="rank">{i + 1}</td>
                <td className="model-name">
                  <a href={`/model/${m.slug}/`} onClick={(e) => e.preventDefault()}>
                    {prettyName(m.model)}
                  </a>
                  {m.mock && (
                    <span className="chip" style={{ marginLeft: 8 }}>
                      sample
                    </span>
                  )}
                  {m.n_items_scored + m.n_refusals < 50 && (
                    <span
                      className="chip"
                      style={{ marginLeft: 8 }}
                      title={`The published score uses ${m.n_items_scored + m.n_refusals} of 50 items. The remaining items could not be completed because of provider errors.`}
                    >
                      {m.n_items_scored + m.n_refusals}/50 judged
                    </span>
                  )}
                  <div className="small faint" style={{ fontWeight: 400 }}>
                    {labName(m.model)} · {reasoningInfo(m.model)}
                  </div>
                </td>
                <td className="overall-cell">
                  {o == null ? "N/A" : o.toFixed(2)}
                  <div className="scorebar" aria-hidden>
                    <i style={{ width: `${((o ?? 0) / 10) * 100}%` }} />
                    {lang === "all" && m.ci95 && (
                      <b
                        className="ci"
                        style={{
                          left: `${(m.ci95[0] / 10) * 100}%`,
                          width: `${((m.ci95[1] - m.ci95[0]) / 10) * 100}%`,
                        }}
                        title={`95% CI ${m.ci95[0].toFixed(2)} to ${m.ci95[1].toFixed(2)}`}
                      />
                    )}
                  </div>
                </td>
                <td className={`hide-mobile ${gap != null && gap > 0.3 ? "gap-pos" : "gap-neg"}`}>
                  {gap == null ? "N/A" : `${gap > 0 ? "−" : "+"}${Math.abs(gap).toFixed(2)}`}
                </td>
                <td className="hide-mobile mono">
                  {m.refusal_rate == null ? "N/A" : `${(m.refusal_rate * 100).toFixed(0)}%`}
                </td>
                {board.dimensions.map((d) => {
                  const v = dimFor(m, d, lang);
                  return (
                    <td key={d} className="hide-mobile dimcell">
                      <span className="dimbar" title={`${DIM_SHORT[d]}: ${v == null ? "N/A" : v.toFixed(2)}`}>
                        <i style={{ width: `${((v ?? 0) / 10) * 100}%` }} />
                      </span>
                    </td>
                  );
                })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small faint" style={{ marginTop: 10 }}>
        Scores range from 0 to 10. The whisker on the Overall bar shows the bootstrap 95% CI. “Gap en→hi” is how much the model
        loses when the same conversations arrive in Hindi (−) or gains (+). Refusals are excluded from
        scores and reported separately. Click any row for per-dimension detail and full transcripts.
        <br />
        Reasoning policy: to keep runs comparable and affordable, reasoning-capable models are run
        with thinking effort capped at “low” (marked per model above); rows labeled “high reasoning”
        are explicit higher-effort variants, shown separately so no model gets a hidden advantage.
      </p>
    </div>
  );
}
