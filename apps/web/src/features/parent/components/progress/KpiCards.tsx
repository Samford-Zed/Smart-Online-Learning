import { CalendarDays, GraduationCap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../../services/api";
import { useT } from "../../../../i18n/I18nProvider";
import type { ProgressPeriodId } from "../../data/progress";

type Props = {
  period: ProgressPeriodId;
};

export function KpiCards({ period }: Props) {
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    api.getParentStudentProgress(period).then(setProgressData).catch(() => {});
  }, [period]);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <GpaCard progressData={progressData} period={period} />
      <AttendanceCard progressData={progressData} />
      <CreditsCard progressData={progressData} />
    </div>
  );
}

function CardShell({
  label,
  icon: Icon,
  iconBg,
  iconColor,
  children,
}: {
  label: string;
  icon: typeof TrendingUp;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <header className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${iconColor}`} />
        </div>
      </header>
      {children}
    </section>
  );
}

function GpaCard({ progressData, period }: { progressData: any; period: ProgressPeriodId }) {
  const t = useT();
  const gpa = progressData?.gpa ?? progressData?.currentGpa ?? null;
  const delta = progressData?.gpaDelta ?? progressData?.deltaLabel ?? null;
  const trend: { label: string; gpa: number }[] = progressData?.gpaTrend || [];
  const [hover, setHover] = useState<number | null>(trend.length - 1);

  const SCALE_MAX = 4.0;
  const SCALE_MIN = 2.5;
  const range = SCALE_MAX - SCALE_MIN;
  const heightFor = (g: number) => Math.max(8, ((g - SCALE_MIN) / range) * 100);
  const active = hover != null && trend[hover] ? trend[hover] : null;

  return (
    <CardShell label={t("Current GPA")} icon={TrendingUp} iconBg="bg-indigo-50" iconColor="text-indigo-600">
      <p className="mt-3 text-4xl font-extrabold tracking-tight text-indigo-600">
        {gpa != null ? Number(gpa).toFixed(2) : "—"}
      </p>
      <div className="mt-1 text-xs text-slate-500">
        {active ? active.label : t("Latest")}
      </div>
      {trend.length > 0 && (
        <div className="mt-4 flex h-16 items-end gap-2" onMouseLeave={() => setHover(trend.length - 1)}>
          {trend.map((p, i) => {
            const isActive = hover === i;
            const isLatest = i === trend.length - 1;
            return (
              <button key={i} type="button" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)}
                aria-label={`${p.label}: GPA ${Number(p.gpa).toFixed(2)}`}
                className="group relative flex-1 cursor-pointer focus:outline-none" style={{ height: "100%" }}>
                <span className={`block w-full rounded-t-md transition-colors ${isActive || isLatest ? "bg-indigo-600" : "bg-indigo-200"} group-hover:bg-indigo-600`}
                  style={{ height: `${heightFor(p.gpa)}%`, position: "absolute", bottom: 0, left: 0, right: 0 }} />
                {isActive && (
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                    {Number(p.gpa).toFixed(2)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {delta && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
          <TrendingUp className="h-3 w-3" />
          {delta}
        </p>
      )}
    </CardShell>
  );
}

function AttendanceCard({ progressData }: { progressData: any }) {
  const t = useT();
  const pct = Math.round(progressData?.attendanceRate ?? progressData?.attendance ?? 0);
  // Circular progress
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <CardShell
      label={t("Attendance Rate")}
      icon={CalendarDays}
      iconBg="bg-indigo-50"
      iconColor="text-indigo-600"
    >
      <p className="mt-3 text-4xl font-extrabold tracking-tight text-indigo-600">
        {progressData ? `${pct}%` : "—"}
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="#e0e7ff" strokeWidth="6" />
            <circle cx="32" cy="32" r={r} fill="none" stroke="#4f46e5" strokeWidth="6"
              strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600">
            {progressData ? `${pct}%` : "—"}
          </span>
        </div>
        <p className="text-sm leading-snug text-slate-600">
          {progressData?.attendanceSummary || t("Attendance record this period.")}
        </p>
      </div>
    </CardShell>
  );
}

function CreditsCard({ progressData }: { progressData: any }) {
  const t = useT();
  const earned = progressData?.creditsEarned ?? progressData?.credits?.earned ?? progressData?.credits ?? 0;
  const total = progressData?.creditsTotal ?? progressData?.credits?.total ?? (earned > 0 ? Math.ceil(earned * 1.3) : 18);
  const pct = (earned / total) * 100;
  return (
    <CardShell
      label={t("Credits Earned")}
      icon={GraduationCap}
      iconBg="bg-indigo-50"
      iconColor="text-indigo-600"
    >
      <p className="mt-3 text-4xl font-extrabold tracking-tight text-indigo-600">
        {progressData ? earned : "—"}
        <span className="ml-1 text-xl font-semibold text-slate-400">
          {progressData ? `/ ${total}` : ""}
        </span>
      </p>
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-center text-xs font-medium text-slate-500">
        {t("On track for promotion")}
      </p>
    </CardShell>
  );
}
