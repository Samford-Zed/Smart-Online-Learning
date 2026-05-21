import { BookOpen, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useT } from "../../../i18n/I18nProvider";

const iconMap = {
  students: Users,
  subjects: BookOpen,
  feedback: MessageSquare,
} as const;

type StatItem = {
  id: string;
  value: string | number;
  label: any;
  badge?: { label: any; tone: "success" | "neutral" };
};

export function StatCards({ stats }: { stats: StatItem[] }) {
  const t = useT();
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {stats.map((s, i) => {
        const Icon = iconMap[s.id as keyof typeof iconMap] ?? Users;
        const highlighted = i === stats.length - 1;
        return (
          <article
            key={s.id}
            className={`relative overflow-hidden rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100 ${
              highlighted ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            {highlighted && (
              <span
                aria-hidden
                className="absolute inset-y-3 left-0 w-1 rounded-full bg-indigo-500"
              />
            )}

            <header className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>
              {s.badge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    s.badge.tone === "success"
                      ? "text-emerald-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {s.badge.tone === "success" && (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {t(s.badge.label)}
                </span>
              )}
            </header>

            <p className="mt-6 text-sm font-medium text-slate-500">{t(s.label)}</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">
              {s.value}
            </p>
          </article>
        );
      })}
    </div>
  );
}
