import { CheckCircle2, ChevronRight, Flag, Lightbulb, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../../services/api";
import { useT } from "../../../../i18n/I18nProvider";

export function StrengthsAndOpportunities() {
  const t = useT();
  const [strengths, setStrengths] = useState<string[]>([]);
  const [opportunities, setOpportunities] = useState<string[]>([]);

  useEffect(() => {
    api.getParentStudentReport().then((data: any) => {
      setStrengths(data?.strengths || data?.areasOfStrength || []);
      setOpportunities(data?.opportunities || data?.growthAreas || []);
    }).catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/40 p-6 ring-1 ring-indigo-100">
      {/* Decorative gear */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-2 h-40 w-40 rounded-full bg-slate-200/30 blur-2xl"
      />

      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <Lightbulb className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          {t("Strengths & Opportunities")}
        </h3>
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-200">
          {t("AI Insight")}
        </span>
      </header>

      <div className="relative mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title={t("Areas of Strength")}
          titleIcon={Star}
          titleColor="text-emerald-600"
          items={strengths}
          bulletIcon={CheckCircle2}
          bulletColor="text-emerald-500"
        />
        <Panel
          title={t("Growth Opportunities")}
          titleIcon={Flag}
          titleColor="text-indigo-600"
          items={opportunities}
          bulletIcon={ChevronRight}
          bulletColor="text-indigo-500"
        />
      </div>
    </section>
  );
}

function Panel({
  title,
  titleIcon: TitleIcon,
  titleColor,
  items,
  bulletIcon: BulletIcon,
  bulletColor,
}: {
  title: string;
  titleIcon: typeof Star;
  titleColor: string;
  items: string[];
  bulletIcon: typeof CheckCircle2;
  bulletColor: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <p
        className={`flex items-center gap-2 text-sm font-bold ${titleColor}`}
      >
        <TitleIcon className="h-4 w-4" />
        {title}
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
            <BulletIcon
              className={`mt-0.5 h-4 w-4 shrink-0 ${bulletColor}`}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
