import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { useT } from "../../../i18n/I18nProvider";
import { KpiCards } from "../components/progress/KpiCards";
import { PeriodToggle } from "../components/progress/PeriodToggle";
import { StrengthsAndOpportunities } from "../components/progress/StrengthsAndOpportunities";
import { SubjectPerformance } from "../components/progress/SubjectPerformance";
import type { ProgressPeriodId } from "../data/progress";

export function ChildProgress() {
  const t = useT();
  const [period, setPeriod] = useState<ProgressPeriodId>("semester");
  const [childName, setChildName] = useState("");

  useEffect(() => {
    api.getParentDashboard().then((data: any) => {
      const child = data?.child || data?.children?.[0];
      if (child) setChildName(child.fullName || child.full_name || child.name || "");
    }).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t("Progress Overview")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {childName ? `${t("Tracking")} ${childName}'s ${t("academic journey.")}`  : t("Tracking your child's academic journey.")}
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </header>

      <KpiCards period={period} />

      <SubjectPerformance period={period} />

      <StrengthsAndOpportunities />
    </div>
  );
}
