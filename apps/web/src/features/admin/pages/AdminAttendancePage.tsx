import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import {
  Search, Download, CheckCircle2, XCircle, Clock, Minus, X, Users as UsersIcon, TrendingUp,
  CalendarDays, AlertTriangle, ChevronLeft, ChevronRight, Mail, Phone, Award, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type AttStatus = "Present" | "Absent" | "Late" | "Excused";

type Student = {
  id: string; name: string; avatar: string; studentId: string; grade: string; section: string;
  email: string; phone: string;
  week: Record<"mon"|"tue"|"wed"|"thu"|"fri", AttStatus>;
  percent: number;            // current week
  yearlyPercent: number;      // overall year
  streak: number;             // days perfect attendance
  totalDays: number;          // days attended out of full year
  totalYearDays: number;      // total school days so far
  dailyHistory: { date: string; status: AttStatus }[];    // last 30 days
  monthlyHistory: { month: string; percent: number; present: number; absent: number; late: number }[]; // last 6 months
};

const STATUS_META: Record<AttStatus, { icon: React.ReactNode; bg: string; text: string; dot: string; soft: string; color: string }> = {
  Present: { icon: <CheckCircle2 className="size-4 text-emerald-500" />, bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", soft: "bg-emerald-100", color: "#10b981" },
  Absent:  { icon: <XCircle className="size-4 text-red-500" />,          bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     soft: "bg-red-100",     color: "#ef4444" },
  Late:    { icon: <Clock className="size-4 text-amber-500" />,          bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   soft: "bg-amber-100",   color: "#f59e0b" },
  Excused: { icon: <Minus className="size-4 text-ink-400" />,            bg: "bg-ink-50",     text: "text-ink-600",     dot: "bg-ink-400",     soft: "bg-ink-100",     color: "#94a3b8" },
};

/* Build mock daily history */
function buildDaily(seed: AttStatus[]): { date: string; status: AttStatus }[] {
  const out: { date: string; status: AttStatus }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    const status = seed[(29 - i) % seed.length];
    out.push({ date: d.toISOString().slice(0,10), status });
  }
  return out;
}

function buildMonthly(rates: number[]): Student["monthlyHistory"] {
  const months = ["May","Jun","Jul","Aug","Sep","Oct"];
  return months.map((m, i) => {
    const total = 22;
    const present = Math.round(total * rates[i] / 100);
    const absent = Math.round((100 - rates[i]) * total / 100 * 0.6);
    const late = total - present - absent;
    return { month: m, percent: rates[i], present, absent: Math.max(0, absent), late: Math.max(0, late) };
  });
}

const MOCK: Student[] = [
  { id: "1", name: "Evelyn Harper",  avatar: "https://i.pravatar.cc/120?img=44", studentId: "PRE43178", grade: "Grade 10", section: "A", email: "evelyn@school.edu",  phone: "+1 555-0101",
    week: { mon:"Present", tue:"Present", wed:"Present", thu:"Present", fri:"Present" }, percent: 100, yearlyPercent: 98, streak: 15, totalDays: 58, totalYearDays: 60,
    dailyHistory: buildDaily(["Present","Present","Present","Present","Present","Late","Present","Present"]),
    monthlyHistory: buildMonthly([95,98,100,97,99,98]) },
  { id: "2", name: "Diana Plenty",   avatar: "https://i.pravatar.cc/120?img=36", studentId: "PRE43174", grade: "Grade 11", section: "B", email: "diana@school.edu",   phone: "+1 555-0102",
    week: { mon:"Present", tue:"Late", wed:"Present", thu:"Present", fri:"Present" }, percent: 95, yearlyPercent: 94, streak: 8, totalDays: 56, totalYearDays: 60,
    dailyHistory: buildDaily(["Present","Late","Present","Present","Present","Present","Absent","Present"]),
    monthlyHistory: buildMonthly([93,92,95,94,96,94]) },
  { id: "3", name: "John Millar",    avatar: "https://i.pravatar.cc/120?img=15", studentId: "PRE43187", grade: "Grade 10", section: "A", email: "john@school.edu",    phone: "+1 555-0104",
    week: { mon:"Absent", tue:"Present", wed:"Present", thu:"Late", fri:"Present" }, percent: 76, yearlyPercent: 86, streak: 3, totalDays: 52, totalYearDays: 60,
    dailyHistory: buildDaily(["Present","Absent","Present","Late","Present","Present","Present","Absent"]),
    monthlyHistory: buildMonthly([82,85,88,87,89,86]) },
  { id: "4", name: "Sofia Martinez", avatar: "https://i.pravatar.cc/120?img=47", studentId: "PRE43201", grade: "Grade 9",  section: "C", email: "sofia@school.edu",   phone: "+1 555-0106",
    week: { mon:"Present", tue:"Present", wed:"Excused", thu:"Present", fri:"Present" }, percent: 91, yearlyPercent: 91, streak: 5, totalDays: 55, totalYearDays: 60,
    dailyHistory: buildDaily(["Present","Present","Excused","Present","Present","Present","Present","Late"]),
    monthlyHistory: buildMonthly([88,90,92,91,93,91]) },
  { id: "5", name: "Noah Williams",  avatar: "https://i.pravatar.cc/120?img=12", studentId: "PRE43195", grade: "Grade 12", section: "A", email: "noah@school.edu",    phone: "+1 555-0108",
    week: { mon:"Absent", tue:"Absent", wed:"Present", thu:"Present", fri:"Late" }, percent: 66, yearlyPercent: 77, streak: 1, totalDays: 46, totalYearDays: 60,
    dailyHistory: buildDaily(["Absent","Present","Late","Present","Absent","Present","Present","Absent"]),
    monthlyHistory: buildMonthly([72,75,78,80,79,77]) },
  { id: "6", name: "Amara Osei",     avatar: "https://i.pravatar.cc/120?img=23", studentId: "PRE43202", grade: "Grade 9",  section: "A", email: "amara@school.edu",   phone: "+1 555-0110",
    week: { mon:"Present", tue:"Present", wed:"Present", thu:"Present", fri:"Present" }, percent: 100, yearlyPercent: 100, streak: 25, totalDays: 60, totalYearDays: 60,
    dailyHistory: buildDaily(["Present"]),
    monthlyHistory: buildMonthly([100,100,100,100,100,100]) },
  { id: "7", name: "Luca Bianchi",   avatar: "https://i.pravatar.cc/120?img=8",  studentId: "PRE43211", grade: "Grade 11", section: "B", email: "luca@school.edu",    phone: "+1 555-0112",
    week: { mon:"Late", tue:"Present", wed:"Present", thu:"Absent", fri:"Present" }, percent: 82, yearlyPercent: 86, streak: 2, totalDays: 52, totalYearDays: 60,
    dailyHistory: buildDaily(["Late","Present","Present","Absent","Present","Present","Late","Present"]),
    monthlyHistory: buildMonthly([84,85,87,86,88,86]) },
  { id: "8", name: "Priya Sharma",   avatar: "https://i.pravatar.cc/120?img=38", studentId: "PRE43219", grade: "Grade 10", section: "C", email: "priya@school.edu",   phone: "+1 555-0114",
    week: { mon:"Absent", tue:"Absent", wed:"Absent", thu:"Present", fri:"Present" }, percent: 55, yearlyPercent: 64, streak: 0, totalDays: 38, totalYearDays: 60,
    dailyHistory: buildDaily(["Absent","Absent","Present","Present","Absent","Late","Absent","Present"]),
    monthlyHistory: buildMonthly([60,62,65,68,66,64]) },
];

const DAYS = ["mon","tue","wed","thu","fri"] as const;
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri"];
const GRADES = ["All","Grade 9","Grade 10","Grade 11","Grade 12"];

export default function AdminAttendancePage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const res = await api.getAdminAttendance();
      if (res.success && res.data?.students) {
        const transformed: Student[] = res.data.students.map((u: any) => {
          const totalRecorded = Number(u.total_recorded) || 0;
          const presentDays = Number(u.present_days) || 0;
          const absentDays  = Number(u.absent_days)  || 0;
          const lateDays    = Number(u.late_days)    || 0;
          const totalYearDays = Math.max(totalRecorded, 60);
          const yearlyPercent = totalRecorded > 0 ? Math.round(presentDays / totalRecorded * 100) : 100;
          const rawHistory: { date: string; status: AttStatus }[] = (u.history || []).map((h: any) => ({
            date: String(h.date).slice(0, 10),
            status: h.status as AttStatus,
          }));
          const week = deriveWeekFromHistory(rawHistory);
          const weekPresent = Object.values(week).filter(s => s === "Present").length;
          const weekPercent = Math.round(weekPresent / 5 * 100);
          return {
            id: String(u.id),
            name: u.name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
            studentId: `PRE${String(u.id).padStart(5, '0')}`,
            grade: u.grade_level ? `Grade ${u.grade_level}` : 'Grade 9',
            section: 'A',
            email: u.email || '',
            phone: u.phone || '—',
            week,
            percent: weekPercent,
            yearlyPercent,
            streak: computeStreak(rawHistory),
            totalDays: presentDays,
            totalYearDays,
            dailyHistory: rawHistory.slice(0, 30),
            monthlyHistory: buildMonthlyHistory(rawHistory),
          };
        });
        setStudents(transformed);
      } else {
        setStudents(MOCK);
      }
    } catch (error) {
      console.error("Failed to load attendance data:", error);
      setStudents(MOCK);
    } finally {
      setLoading(false);
    }
  }

  function deriveWeekFromHistory(history: { date: string; status: AttStatus }[]): Record<"mon"|"tue"|"wed"|"thu"|"fri", AttStatus> {
    const today = new Date();
    const dayMap: Record<number, "mon"|"tue"|"wed"|"thu"|"fri"> = { 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri" };
    const week: Record<string, AttStatus> = { mon: "Absent", tue: "Absent", wed: "Absent", thu: "Absent", fri: "Absent" };
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dow = d.getDay();
      const key = dayMap[dow];
      if (!key) continue;
      const dateStr = d.toISOString().slice(0, 10);
      const entry = history.find(h => h.date === dateStr);
      week[key] = entry ? entry.status : "Absent";
    }
    return week as Record<"mon"|"tue"|"wed"|"thu"|"fri", AttStatus>;
  }

  function computeStreak(history: { date: string; status: AttStatus }[]): number {
    let streak = 0;
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    for (const h of sorted) {
      if (h.status === "Present") streak++;
      else break;
    }
    return streak;
  }

  function buildMonthlyHistory(history: { date: string; status: AttStatus }[]): Student["monthlyHistory"] {
    const months: Record<string, { present: number; absent: number; late: number; total: number }> = {};
    for (const h of history) {
      const m = new Date(h.date).toLocaleString("en-US", { month: "short" });
      if (!months[m]) months[m] = { present: 0, absent: 0, late: 0, total: 0 };
      months[m].total++;
      if (h.status === "Present") months[m].present++;
      else if (h.status === "Absent") months[m].absent++;
      else if (h.status === "Late") months[m].late++;
    }
    return Object.entries(months).slice(-6).map(([month, d]) => ({
      month,
      percent: d.total > 0 ? Math.round(d.present / d.total * 100) : 0,
      present: d.present, absent: d.absent, late: d.late,
    }));
  }

  const filtered = useMemo(() => students.filter(r =>
    (gradeFilter === "All" || r.grade === gradeFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.studentId.toLowerCase().includes(search.toLowerCase()))
  ), [students, search, gradeFilter]);

  const overall = {
    total: students.length,
    presentToday: students.filter(r => r.week.fri === "Present").length,
    absentToday: students.filter(r => r.week.fri === "Absent").length,
    lateToday: students.filter(r => r.week.fri === "Late").length,
    avgRate: students.length ? Math.round(students.reduce((a, r) => a + r.yearlyPercent, 0) / students.length) : 0,
    perfectStudents: students.filter(r => r.yearlyPercent >= 98).length,
    atRiskStudents: students.filter(r => r.yearlyPercent < 75).length,
  };

  function handleExport() {
    const csv = ["Name,ID,Grade,Mon,Tue,Wed,Thu,Fri,Week %,Yearly %",
      ...students.map(r => `${r.name},${r.studentId},${r.grade}-${r.section},${r.week.mon},${r.week.tue},${r.week.wed},${r.week.thu},${r.week.fri},${r.percent}%,${r.yearlyPercent}%`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "attendance.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const STAT_CARDS = [
    { label: "Total Students", value: overall.total,     icon: UsersIcon,    gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Present Today",  value: overall.presentToday, icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { label: "Absent Today",   value: overall.absentToday,  icon: XCircle,      gradient: "from-red-500 to-rose-500" },
    { label: "Avg. Rate",      value: `${overall.avgRate}%`, icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Attendance</h1>
              <p className="text-sm text-ink-500">Click any student to view detailed attendance</p>
            </div>
            <button onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02]">
              <Download className="size-4" /> Export CSV
            </button>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
            {STAT_CARDS.map((s, i) => (
              <div key={s.label} className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition hover:shadow-md hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}>
                <div>
                  <p className="text-xs font-semibold text-ink-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-ink-900">{s.value}</p>
                </div>
                <span className={`flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white transition group-hover:scale-110`}>
                  <s.icon className="size-5" aria-hidden />
                </span>
              </div>
            ))}
          </div>

          {/* Banner highlights */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-card">
              <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><Award className="size-6" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-90">Perfect Attendance</p>
                <p className="text-xl font-bold">{overall.perfectStudents} students</p>
                <p className="text-[11px] opacity-90">98%+ yearly attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 p-4 text-white shadow-card">
              <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><AlertTriangle className="size-6" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-90">At Risk</p>
                <p className="text-xl font-bold">{overall.atRiskStudents} students</p>
                <p className="text-[11px] opacity-90">Below 75% attendance</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 w-72 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex gap-1.5">
              {GRADES.map(g => (
                <button key={g} onClick={() => setGradeFilter(g)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${gradeFilter === g ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-3 py-3 text-left">Grade</th>
                    {DAY_LABELS.map(d => <th key={d} className="px-2 py-3 text-center">{d}</th>)}
                    <th className="px-3 py-3 text-center">Week</th>
                    <th className="px-3 py-3 text-center">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} onClick={() => setViewStudent(r)}
                      className="border-b border-ink-50 last:border-0 cursor-pointer transition hover:bg-violet-50/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={r.avatar} alt={r.name} className="size-9 rounded-full bg-surface-100 object-cover ring-2 ring-violet-100" />
                          <div>
                            <p className="font-semibold text-ink-900">{r.name}</p>
                            <p className="text-xs text-ink-400 font-mono">{r.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-ink-600">{r.grade}-{r.section}</td>
                      {DAYS.map(d => (
                        <td key={d} className={`px-2 py-3 text-center`}>
                          <div className={`inline-flex size-7 items-center justify-center rounded-lg ${STATUS_META[r.week[d]].bg}`}>
                            {STATUS_META[r.week[d]].icon}
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${r.percent >= 90 ? "bg-emerald-50 text-emerald-700" : r.percent >= 75 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>
                          {r.percent}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-ink-100">
                            <div className={`h-full transition-all ${r.yearlyPercent >= 90 ? "bg-emerald-500" : r.yearlyPercent >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${r.yearlyPercent}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-ink-700">{r.yearlyPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr><td colSpan={9} className="px-5 py-12 text-center"><Loader2 className="mx-auto size-8 animate-spin text-violet-500" /><p className="mt-2 text-sm text-ink-400">Loading attendance...</p></td></tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-ink-400">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {viewStudent && <StudentAttendanceDetail student={viewStudent} onClose={() => setViewStudent(null)} />}
    </div>
  );
}

/* ─────────── Student Attendance Detail ─────────── */
type Tab = "daily" | "weekly" | "yearly";

function StudentAttendanceDetail({ student: s, onClose }: { student: Student; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("weekly");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const absentCount = s.dailyHistory.filter(d => d.status === "Absent").length;
  const lateCount = s.dailyHistory.filter(d => d.status === "Late").length;
  const presentCount = s.dailyHistory.filter(d => d.status === "Present").length;
  const excusedCount = s.dailyHistory.filter(d => d.status === "Excused").length;

  const weekChartData = DAY_LABELS.map((d, i) => {
    const status = s.week[DAYS[i]];
    return { day: d, value: status === "Present" ? 100 : status === "Late" ? 50 : status === "Excused" ? 75 : 0, status };
  });

  const pieData = [
    { name: "Present", value: presentCount, fill: STATUS_META.Present.color },
    { name: "Late",    value: lateCount,    fill: STATUS_META.Late.color },
    { name: "Absent",  value: absentCount,  fill: STATUS_META.Absent.color },
    { name: "Excused", value: excusedCount, fill: STATUS_META.Excused.color },
  ].filter(p => p.value > 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur">{s.grade} · Section {s.section}</span>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <img src={s.avatar} alt={s.name} className="size-20 rounded-2xl border-4 border-white bg-surface-100 object-cover shadow-lg" />
            <div>
              <h2 className="text-2xl font-bold">{s.name}</h2>
              <p className="text-xs text-white/90 font-mono">{s.studentId}</p>
              <div className="mt-2 flex gap-3 text-xs">
                <span className="flex items-center gap-1"><Mail className="size-3" />{s.email}</span>
                <span className="flex items-center gap-1"><Phone className="size-3" />{s.phone}</span>
              </div>
            </div>
          </div>

          {/* Hero stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat label="Yearly Rate" value={`${s.yearlyPercent}%`} />
            <HeroStat label="This Week" value={`${s.percent}%`} />
            <HeroStat label="Streak" value={`${s.streak} days`} />
            <HeroStat label="Days" value={`${s.totalDays}/${s.totalYearDays}`} />
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="mb-5 flex rounded-xl border border-ink-200 bg-white p-0.5 shadow-sm">
            {(["daily","weekly","yearly"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition ${tab === t ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm" : "text-ink-600 hover:bg-ink-50"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* DAILY */}
          {tab === "daily" && (
            <div className="animate-fade-in">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900"><CalendarDays className="size-4 text-violet-600" />Last 30 Days</h3>
              <div className="mb-5 grid grid-cols-4 gap-3">
                {(["Present","Late","Absent","Excused"] as AttStatus[]).map(st => {
                  const count = s.dailyHistory.filter(d => d.status === st).length;
                  return (
                    <div key={st} className={`rounded-xl border ${STATUS_META[st].bg} border-ink-100 p-3`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${STATUS_META[st].dot}`} />
                        <span className={`text-[10px] font-bold uppercase ${STATUS_META[st].text}`}>{st}</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold text-ink-900">{count}</p>
                    </div>
                  );
                })}
              </div>

              {/* Mini calendar grid */}
              <div className="mb-5 rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase text-ink-400">Day-by-Day</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }} className="rounded-lg p-1 hover:bg-ink-100"><ChevronLeft className="size-3.5" /></button>
                    <span className="text-xs font-semibold text-ink-700">{new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                    <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }} className="rounded-lg p-1 hover:bg-ink-100"><ChevronRight className="size-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {["S","M","T","W","T","F","S"].map((d, i) => (
                    <div key={i} className="py-1 text-center text-[10px] font-bold text-ink-400">{d}</div>
                  ))}
                  {(() => {
                    const firstDay = new Date(year, month, 1).getDay();
                    const days = new Date(year, month+1, 0).getDate();
                    const cells = [
                      ...Array(firstDay).fill(null),
                      ...Array.from({ length: days }, (_, i) => i + 1),
                    ];
                    return cells.map((d, i) => {
                      if (d === null) return <div key={`e${i}`} />;
                      const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                      const record = s.dailyHistory.find(h => h.date === ds);
                      const today = new Date();
                      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
                      return (
                        <div key={d} title={record?.status || ""}
                          className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold ${record ? `${STATUS_META[record.status].bg} ${STATUS_META[record.status].text}` : "text-ink-400 bg-ink-50/50"} ${isToday ? "ring-2 ring-violet-500" : ""}`}>
                          {d}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Recent history list */}
              <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden">
                <div className="border-b border-ink-100 bg-ink-50 px-4 py-3 text-[10px] font-bold uppercase text-ink-500">Recent Days</div>
                <div className="divide-y divide-ink-100 max-h-64 overflow-y-auto">
                  {[...s.dailyHistory].reverse().slice(0, 15).map(d => (
                    <div key={d.date} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs font-medium text-ink-700">{new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_META[d.status].bg} ${STATUS_META[d.status].text}`}>
                        {STATUS_META[d.status].icon}{d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WEEKLY */}
          {tab === "weekly" && (
            <div className="animate-fade-in">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900"><CalendarDays className="size-4 text-violet-600" />This Week's Attendance</h3>

              <div className="mb-5 grid grid-cols-5 gap-2">
                {DAY_LABELS.map((d, i) => {
                  const status = s.week[DAYS[i]];
                  const M = STATUS_META[status];
                  return (
                    <div key={d} className={`rounded-xl border ${M.bg} border-ink-100 p-3 text-center`}>
                      <p className="text-[10px] font-bold uppercase text-ink-500">{d}</p>
                      <div className="mt-1 flex justify-center">{M.icon}</div>
                      <p className={`mt-1 text-[10px] font-bold ${M.text}`}>{status}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Weekly Pattern</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {weekChartData.map((d, i) => (
                        <Cell key={i} fill={STATUS_META[d.status].color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Week Summary</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3 text-center">
                    <p className="text-xs font-bold text-emerald-700">Present</p>
                    <p className="text-2xl font-bold text-emerald-900">{Object.values(s.week).filter(v => v === "Present").length}/5</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-center">
                    <p className="text-xs font-bold text-amber-700">Late</p>
                    <p className="text-2xl font-bold text-amber-900">{Object.values(s.week).filter(v => v === "Late").length}/5</p>
                  </div>
                  <div className="rounded-xl bg-red-50 p-3 text-center">
                    <p className="text-xs font-bold text-red-700">Absent</p>
                    <p className="text-2xl font-bold text-red-900">{Object.values(s.week).filter(v => v === "Absent").length}/5</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* YEARLY */}
          {tab === "yearly" && (
            <div className="animate-fade-in">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900"><TrendingUp className="size-4 text-violet-600" />Yearly Overview</h3>

              <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
                <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                  <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Monthly Trend (Last 6 months)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={s.monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Line type="monotone" dataKey="percent" stroke="#7c3aed" strokeWidth={3} dot={{ fill: "#7c3aed", r: 5 }} activeDot={{ r: 7 }} name="Attendance %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                  <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Last 30 days</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={0} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {pieData.map(p => (
                      <div key={p.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: p.fill }} />{p.name}</span>
                        <span className="font-bold text-ink-700">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly breakdown */}
              <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden">
                <div className="border-b border-ink-100 bg-ink-50 px-4 py-3 text-[10px] font-bold uppercase text-ink-500">Monthly Breakdown</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-[10px] font-bold uppercase text-ink-500">
                      <th className="px-4 py-2 text-left">Month</th>
                      <th className="px-3 py-2 text-center">Present</th>
                      <th className="px-3 py-2 text-center">Late</th>
                      <th className="px-3 py-2 text-center">Absent</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.monthlyHistory.map(m => (
                      <tr key={m.month} className="border-b border-ink-50 last:border-0">
                        <td className="px-4 py-2.5 text-xs font-semibold text-ink-700">{m.month}</td>
                        <td className="px-3 py-2.5 text-center text-xs text-emerald-700">{m.present}</td>
                        <td className="px-3 py-2.5 text-center text-xs text-amber-700">{m.late}</td>
                        <td className="px-3 py-2.5 text-center text-xs text-red-600">{m.absent}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${m.percent >= 90 ? "bg-emerald-50 text-emerald-700" : m.percent >= 75 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>
                            {m.percent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur">
      <p className="text-[9px] font-bold uppercase opacity-90">{label}</p>
      <p className="mt-0.5 text-lg font-bold leading-none">{value}</p>
    </div>
  );
}
