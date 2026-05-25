import { ArrowRight, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useT } from "../../../../i18n/I18nProvider";
import { type Student } from "../../data/classManagement";

const palette = [
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-rose-500",
];

const LETTERS = ["A", "B", "C", "D", "F"];
function computeDistribution(students: Student[]) {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  students.forEach((s) => {
    const p = s.gradePct;
    if (p >= 90) counts["A"]++;
    else if (p >= 80) counts["B"]++;
    else if (p >= 70) counts["C"]++;
    else if (p >= 60) counts["D"]++;
    else counts["F"]++;
  });
  return LETTERS.map((l) => ({ letter: l, count: counts[l] }));
}

type Props = {
  onViewReport?: () => void;
  students?: Student[];
};

export function GradeDistribution({ onViewReport, students = [] }: Props) {
  const t = useT();
  const gradeDistribution = computeDistribution(students);
  const max = Math.max(...gradeDistribution.map((d) => d.count), 1);
  const [hover, setHover] = useState<number | null>(null);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          {t("Grade Distribution")}
        </h3>
        <button
          aria-label="Options"
          className="rounded p-1 text-slate-400 hover:bg-slate-50"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </header>

      <div className="mt-5 flex h-32 items-end justify-between gap-3">
        {gradeDistribution.map((d, i) => (
          <button
            key={d.letter}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            aria-label={`${d.letter}: ${d.count} students`}
            className="group relative flex h-full flex-1 flex-col items-center justify-end"
          >
            {hover === i && (
              <span className="pointer-events-none absolute -top-7 whitespace-nowrap rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                {d.count}
              </span>
            )}
            <span
              className={`block w-full max-w-[28px] rounded-t-md transition-opacity ${
                palette[i % palette.length]
              } ${hover === i ? "opacity-100" : "opacity-80"}`}
              style={{
                height: `${Math.max(8, (d.count / max) * 100)}%`,
              }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-3">
        {gradeDistribution.map((d) => (
          <span
            key={d.letter}
            className="flex-1 text-center text-xs font-semibold text-slate-500"
          >
            {d.letter}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onViewReport}
        className="mt-5 inline-flex w-full items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        {t("View Full Report")}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}
