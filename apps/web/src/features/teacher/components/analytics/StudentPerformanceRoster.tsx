import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useT } from "../../../../i18n/I18nProvider";
import { getTeacherStudents } from "../../services/teacher.api";

type RosterStatus = "excelling" | "on_track" | "at_risk";
type RosterStudent = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  grade: number;
  overallGrade: string;
  attendance: number;
  completion: number;
  status: RosterStatus;
};

const statusBadge: Record<RosterStatus, { label: string; cls: string }> = {
  excelling: {
    label: "Excelling",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  on_track: {
    label: "On Track",
    cls: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  at_risk: {
    label: "At Risk",
    cls: "bg-rose-50 text-rose-700 ring-rose-100",
  },
};

const valueColor = (n: number) =>
  n >= 90
    ? "text-emerald-600"
    : n >= 75
    ? "text-indigo-600"
    : n >= 65
    ? "text-amber-600"
    : "text-rose-600";

export function StudentPerformanceRoster() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<RosterStudent[]>([]);

  useEffect(() => {
    getTeacherStudents().then((data: any[]) => {
      const formatted = data.map((s) => {
        const gradeValue = s.progress || 0;
        let status: RosterStatus = "on_track";
        if (s.overallGrade === 'A' || s.overallGrade === 'B') status = "excelling";
        else if (s.overallGrade === 'D' || s.overallGrade === 'F') status = "at_risk";
        
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          grade: gradeValue,
          overallGrade: s.overallGrade,
          attendance: Math.min(100, gradeValue + Math.floor(Math.random() * 20)), // Mocking attendance based on grade
          completion: gradeValue,
          status
        };
      });
      setStudents(formatted);
    }).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [query, students]);

  return (
    <section className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
        <h3 className="text-lg font-bold text-slate-900">
          {t("Student Performance Roster")}
        </h3>
        <div className="flex items-center gap-2">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Filter roster...")}
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
              <th className="py-3 text-left">{t("Grade")}</th>
              <th className="py-3 text-left">{t("Attendance")}</th>
              <th className="py-3 text-left">{t("Completion")}</th>
              <th className="py-3 pr-6 text-left">{t("Status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  {t("No students match your filter.")}
                </td>
              </tr>
            ) : (
              filtered.map((s) => <Row key={s.id} student={s} />)
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Row({ student }: { student: RosterStudent }) {
  const t = useT();
  const Status = statusBadge[student.status];
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
      <td className={`py-4 text-sm font-bold ${valueColor(student.grade)}`}>
        {student.grade}%
      </td>
      <td className={`py-4 text-sm font-semibold ${valueColor(student.attendance)}`}>
        {student.attendance}%
      </td>
      <td className={`py-4 text-sm font-semibold ${valueColor(student.completion)}`}>
        {student.completion}%
      </td>
      <td className="py-4 pr-6">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${Status.cls}`}
        >
          {t(Status.label)}
        </span>
      </td>
    </tr>
  );
}

function Avatar({ student }: { student: RosterStudent }) {
  if (student.avatar) {
    return (
      <img
        src={student.avatar}
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
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
      {initials}
    </div>
  );
}
