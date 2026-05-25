import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useT } from "../../../../i18n/I18nProvider";
import { type AttendanceStatus, type Student } from "../../data/classManagement";

const options: {
  value: AttendanceStatus;
  label: string;
  icon: typeof CheckCircle2;
  active: string;
  idle: string;
}[] = [
  {
    value: "present",
    label: "Present",
    icon: CheckCircle2,
    active: "bg-emerald-600 text-white",
    idle: "text-emerald-700 hover:bg-emerald-50",
  },
  {
    value: "late",
    label: "Late",
    icon: Clock,
    active: "bg-amber-500 text-white",
    idle: "text-amber-700 hover:bg-amber-50",
  },
  {
    value: "absent",
    label: "Absent",
    icon: XCircle,
    active: "bg-rose-600 text-white",
    idle: "text-rose-700 hover:bg-rose-50",
  },
];

type Props = {
  attendance: Record<string, AttendanceStatus>;
  onChange: (studentId: string, status: AttendanceStatus) => void;
  onMarkAll?: (status: AttendanceStatus) => void;
  students?: Student[];
};

export function AttendanceView({ attendance, onChange, onMarkAll, students = [] }: Props) {
  const t = useT();
  const counts = students.reduce(
    (acc, s) => {
      const v = attendance[s.id] ?? s.status;
      acc[v] += 1;
      return acc;
    },
    { present: 0, late: 0, absent: 0 } as Record<AttendanceStatus, number>
  );
  const total = students.length;
  const rate = total === 0 ? 0 : Math.round((counts.present / total) * 100);
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{t("Attendance")}</h3>
          <p className="text-xs text-slate-500">{today}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Stat label={t("Present")} value={counts.present} color="text-emerald-600" />
          <Stat label={t("Late")} value={counts.late} color="text-amber-600" />
          <Stat label={t("Absent")} value={counts.absent} color="text-rose-600" />
          <Stat label={t("Rate")} value={`${rate}%`} color="text-indigo-600" />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-6 py-2.5 text-xs">
        <span className="font-semibold text-slate-500">{t("Mark all:")} </span>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onMarkAll?.(o.value)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50"
          >
            {t(o.label)}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-slate-100">
        {students.map((s: Student) => {
          const current = attendance[s.id] ?? s.status;
          return (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {s.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {s.studentId}
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
                {options.map((o) => {
                  const Icon = o.icon;
                  const isActive = current === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => onChange(s.id, o.value)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        isActive ? o.active : o.idle
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t(o.label)}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </span>
  );
}
