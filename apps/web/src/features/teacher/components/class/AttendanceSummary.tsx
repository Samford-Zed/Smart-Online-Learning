import { CalendarDays, UserCheck } from "lucide-react";
import { useState } from "react";
import { useT } from "../../../../i18n/I18nProvider";

type Props = {
  present?: number;
  late?: number;
  absent?: number;
};

export function AttendanceSummary({ present = 0, late = 0, absent = 0 }: Props) {
  const t = useT();
  const [counts, setCounts] = useState({ present, late, absent });
  const [marked, setMarked] = useState(false);

  const total = counts.present + counts.late + counts.absent;

  const markAllPresent = () => {
    setCounts({ present: total, late: 0, absent: 0 });
    setMarked(true);
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarDays className="h-4 w-4 text-indigo-600" />
          {t("Today")}
        </div>
        <span className="text-xs font-medium text-slate-500">
          {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </header>

      <ul className="mt-4 space-y-2.5">
        <Row dot="bg-emerald-500" label={t("Present")} value={counts.present} />
        <Row dot="bg-amber-500" label={t("Late")} value={counts.late} />
        <Row dot="bg-rose-500" label={t("Absent")} value={counts.absent} />
      </ul>

      <button
        type="button"
        onClick={markAllPresent}
        disabled={marked}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserCheck className="h-4 w-4" />
        {marked ? t("All marked present") : t("Mark All Present")}
      </button>
    </section>
  );
}

function Row({
  dot,
  label,
  value,
}: {
  dot: string;
  label: string;
  value: number;
}) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="inline-flex items-center gap-2 text-slate-600">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
        {label}
      </span>
      <span className="font-semibold text-slate-900">{value}</span>
    </li>
  );
}
