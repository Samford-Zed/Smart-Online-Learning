import { CalendarCheck, GraduationCap, Trophy, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { useT } from "../../../i18n/I18nProvider";

export function ChildSummaryCard() {
  const t = useT();
  const [childName, setChildName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [gpa, setGpa] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<number | null>(null);

  useEffect(() => {
    api.getParentDashboard().then((data: any) => {
      const child = data?.child || data?.children?.[0];
      if (child) {
        setChildName(child.fullName || child.full_name || child.name || "");
        const grade = child.grade || child.grade_level;
        setGradeLevel(grade ? (String(grade).startsWith("Grade") ? String(grade) : `Grade ${grade}`) : "");
      }
      const summary = data?.summary;
      setGpa(summary?.gpa ?? data?.progress?.gpa ?? null);
      setAttendance(summary?.attendance ?? data?.progress?.attendanceRate ?? null);
    }).catch(() => {});
  }, []);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full p-1 ring-2 ring-indigo-500">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50">
            <UserCircle className="h-16 w-16 text-indigo-400" />
          </span>
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {childName || "—"}
        </h3>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <GraduationCap className="h-3.5 w-3.5" />
          {gradeLevel || "—"}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-indigo-50/60 p-4 ring-1 ring-indigo-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <Trophy className="h-3.5 w-3.5 text-indigo-500" />
            {t("Overall GPA")}
          </div>
          <p className="mt-3 text-2xl font-bold text-indigo-600">
            {gpa != null ? gpa.toFixed(1) : "—"}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50/60 p-4 ring-1 ring-emerald-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />
            {t("Attendance")}
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {attendance != null ? `${Math.round(attendance)}%` : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
