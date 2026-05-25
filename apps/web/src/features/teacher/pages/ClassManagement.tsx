import { useEffect, useState } from "react";
import { useT } from "../../../i18n/I18nProvider";
import {
  AnnouncementsView,
  type Announcement,
} from "../components/class/AnnouncementsView";
import { AttendanceSummary } from "../components/class/AttendanceSummary";
import { AttendanceView } from "../components/class/AttendanceView";
import { ClassHeader } from "../components/class/ClassHeader";
import { ClassKpiCards } from "../components/class/ClassKpiCards";
import { ClassTabs, type ClassTab } from "../components/class/ClassTabs";
import {
  EditClassModal,
  type ClassInfoEditable,
} from "../components/class/EditClassModal";
import { GradeDistribution } from "../components/class/GradeDistribution";
import { GradebookView } from "../components/class/GradebookView";
import { GradeReportModal } from "../components/class/GradeReportModal";
import { StudentRoster } from "../components/class/StudentRoster";
import { type AttendanceStatus, type Student } from "../data/classManagement";
import { getMyClasses, getClassStudents } from "../services/teacher.api";

export function ClassManagement() {
  const t = useT();
  const [tab, setTab] = useState<ClassTab>("roster");
  const [info, setInfo] = useState<ClassInfoEditable>({
    department: "",
    title: "My Class",
    meta: "",
  });
  const [apiStudents, setApiStudents] = useState<Student[]>([]);
  const [classSlug, setClassSlug] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    getMyClasses().then((classes: any[]) => {
      if (!classes?.length) return;
      const first = classes[0];
      const slug = first.slug || String(first.id);
      setClassSlug(slug);
      setInfo({
        department: first.subject || first.department || "",
        title: first.name || first.title || "My Class",
        meta: first.schedule || first.description || "",
      });
      return getClassStudents(slug);
    }).then((studentsRaw: any) => {
      if (!Array.isArray(studentsRaw)) return;
      const mapped: Student[] = studentsRaw.map((s: any) => ({
        id: String(s.id),
        name: s.full_name || s.name || "Student",
        email: s.email || "",
        avatarUrl: "",
        studentId: s.student_id || `#${s.id}`,
        grade: s.grade || "—",
        gradePct: Number(s.grade_pct || s.score || 0),
        status: (s.attendance_status || "present") as AttendanceStatus,
      }));
      setApiStudents(mapped);
      setAttendance(mapped.reduce((acc, s) => { acc[s.id] = s.status; return acc; }, {} as Record<string, AttendanceStatus>));
      setGrades(mapped.reduce((acc, s) => { acc[s.id] = s.gradePct; return acc; }, {} as Record<string, number>));
    }).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const handleExport = () => {
    const headers = [
      "Student ID",
      "Name",
      "Email",
      "Grade",
      "Grade %",
      "Attendance",
    ];
    const rows = apiStudents.map((s) => [
      s.studentId,
      s.name,
      s.email,
      s.grade,
      String(s.gradePct),
      s.status,
    ]);
    const meta = [
      [`Class\t${info.title}`],
      [`Department\t${info.department}`],
      [`Details\t${info.meta}`],
      [`Exported\t${new Date().toLocaleString()}`],
      [],
    ];
    const csv = [
      ...meta.map((r) => r.join(",")),
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = info.title.replace(/[^a-z0-9-]+/gi, "_").toLowerCase();
    a.href = url;
    a.download = `${safe || "class"}_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t("Class data exported."));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ClassHeader
        info={info}
        onEdit={() => setEditOpen(true)}
        onExport={handleExport}
      />
      <ClassKpiCards
        totalStudents={apiStudents.length}
        attendanceRate={apiStudents.length ? Math.round(apiStudents.filter(s => s.status === "present").length / apiStudents.length * 100) : 0}
        avgPerformance={apiStudents.length ? Math.round(apiStudents.reduce((a, s) => a + s.gradePct, 0) / apiStudents.length) : 0}
        avgGrade={(() => { const avg = apiStudents.length ? apiStudents.reduce((a, s) => a + s.gradePct, 0) / apiStudents.length : 0; return avg >= 93 ? "A" : avg >= 90 ? "A-" : avg >= 87 ? "B+" : avg >= 83 ? "B" : avg >= 80 ? "B-" : avg >= 77 ? "C+" : avg >= 73 ? "C" : avg >= 70 ? "C-" : avg >= 60 ? "D" : avg > 0 ? "F" : "—"; })()}
      />
      <ClassTabs active={tab} onChange={setTab} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {tab === "roster" && (
            <StudentRoster totalStudents={apiStudents.length} students={apiStudents} />
          )}
          {tab === "attendance" && (
            <AttendanceView
              attendance={attendance}
              students={apiStudents}
              onChange={(id, status) =>
                setAttendance((prev) => ({ ...prev, [id]: status }))
              }
              onMarkAll={(status) => {
                setAttendance(
                  apiStudents.reduce(
                    (acc, s) => {
                      acc[s.id] = status;
                      return acc;
                    },
                    {} as Record<string, AttendanceStatus>
                  )
                );
                showToast(`${t("All marked")} ${t(status)}.`);
              }}
            />
          )}
          {tab === "gradebook" && (
            <GradebookView
              grades={grades}
              students={apiStudents}
              onChange={(id, pct) =>
                setGrades((prev) => ({ ...prev, [id]: pct }))
              }
            />
          )}
          {tab === "announcements" && (
            <AnnouncementsView
              items={announcements}
              onAdd={(a) => {
                setAnnouncements((prev) => [
                  {
                    id: `a${Date.now()}`,
                    createdAt: Date.now(),
                    ...a,
                  },
                  ...prev,
                ]);
                showToast(t("Announcement posted."));
              }}
              onDelete={(id) =>
                setAnnouncements((prev) => prev.filter((x) => x.id !== id))
              }
              onTogglePin={(id) =>
                setAnnouncements((prev) =>
                  prev.map((x) =>
                    x.id === id ? { ...x, pinned: !x.pinned } : x
                  )
                )
              }
            />
          )}
        </div>

        <aside className="space-y-4">
          <AttendanceSummary
            present={Object.values(attendance).filter(s => s === "present").length}
            late={Object.values(attendance).filter(s => s === "late").length}
            absent={Object.values(attendance).filter(s => s === "absent").length}
          />
          <GradeDistribution onViewReport={() => setReportOpen(true)} students={apiStudents} />
        </aside>
      </div>

      {editOpen && (
        <EditClassModal
          initial={info}
          onClose={() => setEditOpen(false)}
          onSave={(next) => {
            setInfo(next);
            showToast(t("Class details updated."));
          }}
        />
      )}
      {reportOpen && <GradeReportModal onClose={() => setReportOpen(false)} />}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

