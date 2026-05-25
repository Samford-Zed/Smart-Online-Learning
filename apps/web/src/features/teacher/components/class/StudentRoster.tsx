import {
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useT } from "../../../../i18n/I18nProvider";
import { type AttendanceStatus, type Student } from "../../data/classManagement";

const PAGE_SIZE = 3;

const statusBadge: Record<
  AttendanceStatus,
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  present: {
    label: "Present",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: CheckCircle2,
  },
  late: {
    label: "Late",
    cls: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: Clock,
  },
  absent: {
    label: "Absent",
    cls: "bg-rose-50 text-rose-700 ring-rose-100",
    icon: XCircle,
  },
};

const gradeColor = (pct: number) =>
  pct >= 85
    ? "text-emerald-600"
    : pct >= 75
    ? "text-indigo-600"
    : pct >= 65
    ? "text-amber-600"
    : "text-rose-600";

type Props = {
  totalStudents: number;
  students?: Student[];
};

export function StudentRoster({ totalStudents, students = [] }: Props) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q)
    );
  }, [query, students]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(filtered.length, totalStudents) / PAGE_SIZE)
  );
  const start = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <section className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
        <h3 className="text-base font-semibold text-slate-900">{t("Roster")}</h3>
        <div className="flex items-center gap-2">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("Search students...")}
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <button
            aria-label="Filters"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-6 text-left">{t("Student")}</th>
              <th className="py-3 text-left">{t("ID")}</th>
              <th className="py-3 text-left">{t("Grade")}</th>
              <th className="py-3 text-left">{t("Status")}</th>
              <th className="py-3 pr-6 text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  {t("No students match your search.")}
                </td>
              </tr>
            ) : (
              pageItems.map((s) => <Row key={s.id} student={s} />)
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-3">
        <p className="text-xs text-slate-500">
          {t("Showing")} {start} {t("to")} {end} {t("of")} {totalStudents} {t("students")}
        </p>
        <Pager page={page} totalPages={totalPages} onChange={setPage} />
      </footer>
    </section>
  );
}

function Row({ student }: { student: Student }) {
  const t = useT();
  const Status = statusBadge[student.status];
  const StatusIcon = Status.icon;

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-4 pl-6">
        <div className="flex items-center gap-3">
          <Avatar student={student} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {student.name}
            </p>
            <p className="truncate text-xs text-slate-500">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 font-mono text-xs text-slate-600">
        {student.studentId}
      </td>
      <td className="py-4">
        <span className={`text-sm font-bold ${gradeColor(student.gradePct)}`}>
          {student.grade} {student.gradePct}%
        </span>
      </td>
      <td className="py-4">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${Status.cls}`}
        >
          <StatusIcon className="h-3 w-3" />
          {t(Status.label)}
        </span>
      </td>
      <td className="py-4 pr-6 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            aria-label={`Message ${student.name}`}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            aria-label={`View ${student.name}`}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Avatar({ student }: { student: Student }) {
  if (student.avatarUrl) {
    return (
      <img
        src={student.avatarUrl}
        alt={student.name}
        className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }
  const initials = student.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
      {initials}
    </div>
  );
}

function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  const t = useT();
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => i + 1
  );
  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("Prev")}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`min-w-[28px] rounded-md px-2 py-1 text-xs font-semibold ${
            p === page
              ? "bg-indigo-600 text-white"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("Next")}
      </button>
    </div>
  );
}
