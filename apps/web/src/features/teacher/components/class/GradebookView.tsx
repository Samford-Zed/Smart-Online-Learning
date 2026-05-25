import { Save } from "lucide-react";
import { useState } from "react";
import { useT } from "../../../../i18n/I18nProvider";
import { type Student } from "../../data/classManagement";

const letterFor = (pct: number): string => {
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 60) return "D";
  return "F";
};

const colorFor = (pct: number) =>
  pct >= 85
    ? "text-emerald-600"
    : pct >= 75
    ? "text-indigo-600"
    : pct >= 65
    ? "text-amber-600"
    : "text-rose-600";

type Props = {
  grades: Record<string, number>;
  onChange: (studentId: string, pct: number) => void;
  students?: Student[];
};

export function GradebookView({ grades, onChange, students = [] }: Props) {
  const t = useT();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const list = students.map((s) => ({
    ...s,
    pct: grades[s.id] ?? s.gradePct,
  }));
  const avg =
    list.length === 0
      ? 0
      : Math.round(list.reduce((acc, s) => acc + s.pct, 0) / list.length);
  const passing = list.filter((s) => s.pct >= 60).length;

  return (
    <section className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{t("Gradebook")}</h3>
          <p className="text-xs text-slate-500">
            {t("Edit a percentage to update the letter grade in real time.")}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-md bg-slate-50 px-2 py-1">
            <span className="text-slate-500">{t("Class avg")} </span>
            <span className="font-bold text-indigo-600">{avg}%</span>
          </span>
          <span className="rounded-md bg-slate-50 px-2 py-1">
            <span className="text-slate-500">{t("Passing")} </span>
            <span className="font-bold text-emerald-600">
              {passing}/{list.length}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setSavedAt(Date.now())}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Save className="h-3.5 w-3.5" />
            {t("Save")}
          </button>
        </div>
      </header>

      {savedAt && (
        <p className="border-b border-emerald-100 bg-emerald-50 px-6 py-2 text-xs font-medium text-emerald-700">
          {t("Gradebook saved at")} {new Date(savedAt).toLocaleTimeString()}.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-6 text-left">{t("Student")}</th>
              <th className="py-3 text-left">{t("ID")}</th>
              <th className="py-3 text-left">{t("Grade %")}</th>
              <th className="py-3 pr-6 text-left">{t("Letter")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="py-3 pl-6 text-sm font-medium text-slate-900">
                  {s.name}
                </td>
                <td className="py-3 font-mono text-xs text-slate-600">
                  {s.studentId}
                </td>
                <td className="py-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={s.pct}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isNaN(n)) return;
                      onChange(s.id, Math.max(0, Math.min(100, n)));
                    }}
                    className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </td>
                <td className={`py-3 pr-6 text-sm font-bold ${colorFor(s.pct)}`}>
                  {letterFor(s.pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
