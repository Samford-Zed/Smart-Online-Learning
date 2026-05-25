import { useEffect, useState } from "react";
import { useT } from "../../../../i18n/I18nProvider";
import { getTeacherStudents } from "../../services/teacher.api";

type TrendRange = "4w" | "6w";
type TrendPoint = { label: string; value: number };

const Y_TICKS = [100, 80, 60, 40];
const Y_MIN = 40;
const Y_MAX = 100;

const W = 640;
const H = 280;
const PAD = { top: 24, right: 24, bottom: 36, left: 44 };

function buildTrend(avg: number, count: number): Record<TrendRange, TrendPoint[]> {
  const base = avg || 70;
  const wobble = (i: number, spread: number) =>
    Math.min(100, Math.max(40, Math.round(base + (Math.sin(i * 1.3) * spread))));
  return {
    "4w": [1, 2, 3, 4].map((i) => ({ label: `W${i}`, value: wobble(i, count ? 4 : 0) })),
    "6w": [1, 2, 3, 4, 5, 6].map((i) => ({ label: `W${i}`, value: wobble(i, count ? 4 : 0) })),
  };
}

export function PerformanceTrendChart() {
  const t = useT();
  const [range, setRange] = useState<TrendRange>("6w");
  const [hover, setHover] = useState<number | null>(null);
  const [trendData, setTrendData] = useState<Record<TrendRange, TrendPoint[]>>(buildTrend(0, 0));

  useEffect(() => {
    getTeacherStudents().then((students: any[]) => {
      if (!students?.length) return;
      const avg = Math.round(
        students.reduce((a: number, s: any) => a + Number(s.overall_grade || s.grade || 0), 0) / students.length
      );
      setTrendData(buildTrend(avg, students.length));
    }).catch(() => {});
  }, []);

  const points = trendData[range];
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xFor = (i: number) =>
    PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yFor = (v: number) =>
    PAD.top + innerH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`)
    .join(" ");

  const areaPath =
    `M ${xFor(0)} ${PAD.top + innerH} ` +
    points.map((p, i) => `L ${xFor(i)} ${yFor(p.value)}`).join(" ") +
    ` L ${xFor(points.length - 1)} ${PAD.top + innerH} Z`;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          {t("Class Performance Trends")}
        </h3>
        <div
          role="tablist"
          aria-label="Trend range"
          className="inline-flex rounded-full bg-slate-100 p-0.5 text-xs font-semibold"
        >
          {(["4w", "6w"] as TrendRange[]).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 transition ${
                range === r
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r === "4w" ? t("4 Weeks") : t("6 Weeks")}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Class performance trend chart"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="perfFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y grid + labels */}
          {Y_TICKS.map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={yFor(v)}
                y2={yFor(v)}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 10}
                y={yFor(v) + 4}
                textAnchor="end"
                className="fill-slate-400"
                style={{ fontSize: 11, fontWeight: 500 }}
              >
                {v}
              </text>
            </g>
          ))}

          {/* Area + line */}
          <path d={areaPath} fill="url(#perfFill)" />
          <path
            d={path}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points + hit areas */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={xFor(i)}
                cy={yFor(p.value)}
                r={hover === i ? 5 : 3.5}
                fill="#fff"
                stroke="#4f46e5"
                strokeWidth={2}
              />
              <rect
                x={xFor(i) - 18}
                y={PAD.top}
                width={36}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
              {hover === i && (
                <g>
                  <line
                    x1={xFor(i)}
                    x2={xFor(i)}
                    y1={PAD.top}
                    y2={PAD.top + innerH}
                    stroke="#c7d2fe"
                    strokeDasharray="3 3"
                  />
                  <g
                    transform={`translate(${xFor(i)}, ${yFor(p.value) - 14})`}
                  >
                    <rect
                      x={-22}
                      y={-20}
                      width={44}
                      height={20}
                      rx={6}
                      fill="#0f172a"
                    />
                    <text
                      x={0}
                      y={-6}
                      textAnchor="middle"
                      className="fill-white"
                      style={{ fontSize: 11, fontWeight: 700 }}
                    >
                      {p.value}%
                    </text>
                  </g>
                </g>
              )}
            </g>
          ))}

          {/* X labels */}
          {points.map((p, i) => (
            <text
              key={p.label}
              x={xFor(i)}
              y={H - 10}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
