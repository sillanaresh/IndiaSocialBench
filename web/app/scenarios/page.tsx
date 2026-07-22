import { DIMENSION_META, getScenarios, LANG_LABEL } from "@/lib/data";

export default function ScenariosPage() {
  const scenarios = getScenarios();
  const dims = Object.keys(DIMENSION_META);
  return (
    <div>
      <div className="page-intro">
        <h1>The scenarios</h1>
        <p className="lede">
          {scenarios.length} base scenarios, each hand-curated and shipped in matched English,
          Hinglish, and Hindi renderings. Switch-point scenarios are Hinglish-only by design because
          the language switch <em>is</em> the phenomenon. Every roleplay hides a{" "}
          <strong>probe turn</strong>: an engineered moment that catches the exact failure the
          scenario tests.
        </p>
      </div>

      <h2>Eight dimensions</h2>
      <div className="cardgrid">
        {dims.map((d) => (
          <div key={d} className="card">
            <h3 style={{ marginTop: 0 }}>{DIMENSION_META[d].name}</h3>
            <p className="small muted" style={{ marginBottom: 0 }}>
              {DIMENSION_META[d].blurb}
            </p>
          </div>
        ))}
      </div>

      <h2>Browse</h2>
      {dims.map((d) => {
        const list = scenarios.filter((s) => s.dimension === d);
        if (!list.length) return null;
        return (
          <section key={d}>
            <h3>{DIMENSION_META[d].name}</h3>
            <div className="cardgrid">
              {list.map((s) => {
                const langs = Object.keys(s.variants);
                const persona = s.persona || {};
                return (
                  <details key={s.id} className="card">
                    <summary style={{ cursor: "pointer" }}>
                      <strong>{s.title}</strong>
                      <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="chip accent">{s.type}</span>
                        {langs.map((l) => (
                          <span key={l} className="chip">
                            {LANG_LABEL[l as keyof typeof LANG_LABEL] ?? l}
                          </span>
                        ))}
                        <span className="chip">
                          {persona.age}
                          {persona.gender}, {persona.region}, {persona.setting}
                        </span>
                      </div>
                    </summary>
                    <div style={{ marginTop: 12 }}>
                      <p className="small muted">
                        <strong>Situation (judge-only ground truth): </strong>
                        {s.situation}
                      </p>
                      {s.probe_note && (
                        <p className="small muted">
                          <strong>Probe design: </strong>
                          {s.probe_note}
                        </p>
                      )}
                      {s.variants.en?.user_turns && (
                        <p className="small faint">
                          <strong>Opening turn (en): </strong>“{s.variants.en.user_turns[0]}”
                        </p>
                      )}
                      {s.variants.hing?.user_turns && !s.variants.en && (
                        <p className="small faint">
                          <strong>Opening turn (hinglish): </strong>“{s.variants.hing.user_turns[0]}”
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        );
      })}

      <h2>How scenarios are made</h2>
      <div className="prose">
        <p>
          No real private conversations are ever used. Scenarios are original, authored against a
          coverage grid (dimension × relationship × stakes), drafted with LLM assistance, then
          rewritten and curated by hand under explicit anti-stereotype rules: norms are presented as
          operative <em>for the person in the scenario</em>, personas vary in region, religion,
          class, and their own stance toward tradition, and a quarter of scenarios deliberately
          punish models that apply cultural stereotypes instead of reading the actual person. A
          held-out private set and a canary string guard against training-data contamination.
        </p>
      </div>
    </div>
  );
}
