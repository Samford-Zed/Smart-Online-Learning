import { BookOpen, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../../services/api";
import { useT } from "../../../../i18n/I18nProvider";
import type { ProgressPeriodId } from "../../data/progress";

const BAR_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"];
const ICON_BG = ["bg-indigo-50", "bg-emerald-50", "bg-purple-50", "bg-amber-50", "bg-rose-50"];
const ICON_COLOR = ["text-indigo-600", "text-emerald-600", "text-purple-600", "text-amber-600", "text-rose-600"];

function gradeLabel(pct: number) {
  if (pct >= 90) return { label: "A", bg: "bg-emerald-50", color: "text-emerald-700" };
  if (pct >= 80) return { label: "B", bg: "bg-indigo-50", color: "text-indigo-700" };
  if (pct >= 70) return { label: "C", bg: "bg-amber-50", color: "text-amber-700" };
  if (pct >= 60) return { label: "D", bg: "bg-orange-50", color: "text-orange-700" };
  return { label: "F", bg: "bg-rose-50", color: "text-rose-700" };
}

type Props = { period: ProgressPeriodId };

export function SubjectPerformance({ period }: Props) {
  const t = useT();
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    api.getParentStudentProgress(period).then((data: any) => {
      setSubjects(data?.subjects || data?.subjectPerformance || []);
    }).catch(() => {});
  }, [period]);

  if (!subjects.length) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900">{t("Subject Performance")}</h3>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {subjects.map((s: any, i: number) => {
          const progress = Math.round(s.progress || s.score || s.grade || 0);
          const grade = gradeLabel(progress);
          const teacher = s.teacher || "";
          const footnote = s.footnote || s.lastAssessment || (teacher ? `Teacher: ${teacher}` : "");
          return (
            <article key={s.id || s.name || i}
              className="group rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100 transition hover:shadow-md">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_BG[i % ICON_BG.length]}`}>
                    <BookOpen className={`h-5 w-5 ${ICON_COLOR[i % ICON_COLOR.length]}`} />
                  </div>
                  <p className="text-base font-semibold text-slate-900">{s.name || s.subject}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${grade.bg} ${grade.color}`}>
                  {grade.label}
                </span>
              </header>
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t("Progress to Next Level")}</span>
                  <span className="font-semibold text-slate-700">{progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-[width] duration-500 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                    style={{ width: `${progress}%` }} />
                </div>
              </div>
              <footer className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">{footnote}</p>
                <button type="button"
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-700 hover:text-amber-800">
                  {t("View Details")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
