import { ArrowRight, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { useT } from "../../../i18n/I18nProvider";

const BAR_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"];
const ICON_BG = ["bg-indigo-50", "bg-emerald-50", "bg-purple-50", "bg-amber-50", "bg-rose-50"];
const ICON_COLOR = ["text-indigo-600", "text-emerald-600", "text-purple-600", "text-amber-600", "text-rose-600"];

export function CurrentSubjects() {
  const t = useT();
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    api.getParentDashboard().then((data: any) => {
      const raw = data?.currentSubjects || data?.progress?.subjects || data?.subjects || [];
      setSubjects(raw);
    }).catch(() => {});
  }, []);

  if (!subjects.length) return null;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          {t("Current Subjects")}
        </h3>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          {t("View All")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-5 space-y-5">
        {subjects.map((s: any, i: number) => {
          const progress = Math.round(s.progress || s.grade || 0);
          const detail = s.detail || s.current_unit || s.teacher || "";
          return (
            <li key={s.id || s.name || i}>
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${ICON_BG[i % ICON_BG.length]}`}>
                  <BookOpen className={`h-5 w-5 ${ICON_COLOR[i % ICON_COLOR.length]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{s.name || s.subject}</p>
                    <p className="text-sm font-semibold text-slate-700">{progress}%</p>
                  </div>
                  {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
