const TAU = Math.PI * 2;

export interface RadarSeries {
  name: string;
  color: string;
  dash?: string;
  values: (number | null)[]; // 0-10, one per axis
}

export default function Radar({
  axes,
  series,
  size = 340,
}: {
  axes: string[];
  series: RadarSeries[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 52;
  const angle = (i: number) => -Math.PI / 2 + (TAU * i) / axes.length;
  const pt = (i: number, v: number) => [cx + r * (v / 10) * Math.cos(angle(i)), cy + r * (v / 10) * Math.sin(angle(i))];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Per-dimension radar chart" style={{ maxWidth: 420, width: "100%" }}>
      {[2.5, 5, 7.5, 10].map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, i) => pt(i, ring).join(",")).join(" ")}
          fill="none"
          stroke="var(--line)"
          strokeWidth={1}
        />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 10);
        const [lx, ly] = pt(i, 12.1);
        return (
          <g key={a}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10.5}
              fill="var(--ink-soft)"
              fontFamily="var(--font-ui), sans-serif"
            >
              {a}
            </text>
          </g>
        );
      })}
      {series.map((s) => (
        <g key={s.name}>
          <polygon
            points={s.values.map((v, i) => pt(i, v ?? 0).join(",")).join(" ")}
            fill={s.dash ? "none" : `color-mix(in srgb, ${s.color} 14%, transparent)`}
            stroke={s.color}
            strokeWidth={s.dash ? 1.5 : 2}
            strokeDasharray={s.dash}
            strokeLinejoin="round"
          />
          {!s.dash &&
            s.values.map((v, i) => {
              const [x, y] = pt(i, v ?? 0);
              return <circle key={i} cx={x} cy={y} r={2.6} fill={s.color} />;
            })}
        </g>
      ))}
    </svg>
  );
}
