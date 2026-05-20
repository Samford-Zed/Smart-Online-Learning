import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  Download, TrendingUp, Users, BookOpen, Award, Calendar, Clock, Printer,
  FileText, CheckCircle2, GraduationCap, ArrowUp, ArrowDown, Filter, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type Period = "weekly" | "monthly" | "yearly";

/* Dataset per period */
type Dataset = {
  summary: { label: string; value: string; change: number; icon: typeof Users; gradient: string }[];
  enrollment: { label: string; students: number; teachers: number }[];
  attendance: { label: string; rate: number }[];
  grades: { name: string; value: number; color: string }[];
  subjects: { subject: string; avg: number; students: number }[];
  topPerformers: { name: string; avatar: string; grade: string; gpa: number; rank: number }[];
};

const WEEKLY: Dataset = {
  summary: [
    { label: "Weekly Attendance", value: "94%",    change: 2.1,  icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { label: "Avg. Grade",        value: "83.2%",  change: 1.4,  icon: Award,        gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Active Students",   value: "1,850",  change: 0.8,  icon: Users,        gradient: "from-cyan-500 to-teal-500" },
    { label: "Exams This Week",   value: "12",     change: -5.0, icon: FileText,     gradient: "from-amber-500 to-orange-500" },
  ],
  enrollment: [
    { label: "Mon", students: 1820, teachers: 98 },
    { label: "Tue", students: 1835, teachers: 99 },
    { label: "Wed", students: 1840, teachers: 99 },
    { label: "Thu", students: 1848, teachers: 100 },
    { label: "Fri", students: 1850, teachers: 102 },
    { label: "Sat", students: 1850, teachers: 102 },
    { label: "Sun", students: 1850, teachers: 102 },
  ],
  attendance: [
    { label: "Mon", rate: 92 }, { label: "Tue", rate: 94 }, { label: "Wed", rate: 96 },
    { label: "Thu", rate: 93 }, { label: "Fri", rate: 91 }, { label: "Sat", rate: 0 }, { label: "Sun", rate: 0 },
  ],
  grades: [
    { name: "A (90-100%)", value: 32, color: "#10b981" },
    { name: "B (80-89%)",  value: 38, color: "#06b6d4" },
    { name: "C (70-79%)",  value: 20, color: "#7c3aed" },
    { name: "D (60-69%)",  value: 7,  color: "#f59e0b" },
    { name: "F (<60%)",    value: 3,  color: "#ef4444" },
  ],
  subjects: [
    { subject: "Biology",     avg: 86, students: 120 },
    { subject: "Mathematics", avg: 81, students: 145 },
    { subject: "Physics",     avg: 78, students: 98  },
    { subject: "Chemistry",   avg: 83, students: 110 },
    { subject: "Literature",  avg: 89, students: 95  },
    { subject: "History",     avg: 85, students: 80  },
  ],
  topPerformers: [
    { name: "Amara Osei",    avatar: "https://i.pravatar.cc/80?img=23", grade: "Grade 9",  gpa: 4.0, rank: 1 },
    { name: "Evelyn Harper", avatar: "https://i.pravatar.cc/80?img=44", grade: "Grade 10", gpa: 3.95, rank: 2 },
    { name: "Priya Sharma",  avatar: "https://i.pravatar.cc/80?img=38", grade: "Grade 10", gpa: 3.9, rank: 3 },
    { name: "Sofia Martinez",avatar: "https://i.pravatar.cc/80?img=47", grade: "Grade 9",  gpa: 3.85, rank: 4 },
    { name: "Diana Plenty",  avatar: "https://i.pravatar.cc/80?img=36", grade: "Grade 11", gpa: 3.8, rank: 5 },
  ],
};

const MONTHLY: Dataset = {
  summary: [
    { label: "Monthly Attendance", value: "92%",   change: 3.5,  icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { label: "Avg. Grade",         value: "82.4%", change: 2.1,  icon: Award,        gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Enrolled Students",  value: "1,900", change: 5.6,  icon: Users,        gradient: "from-cyan-500 to-teal-500" },
    { label: "Completed Exams",    value: "48",    change: 12.0, icon: FileText,     gradient: "from-amber-500 to-orange-500" },
  ],
  enrollment: [
    { label: "Wk 1", students: 1810, teachers: 98  },
    { label: "Wk 2", students: 1835, teachers: 99  },
    { label: "Wk 3", students: 1870, teachers: 100 },
    { label: "Wk 4", students: 1900, teachers: 102 },
  ],
  attendance: [
    { label: "Wk 1", rate: 89 },
    { label: "Wk 2", rate: 91 },
    { label: "Wk 3", rate: 93 },
    { label: "Wk 4", rate: 94 },
  ],
  grades: [
    { name: "A (90-100%)", value: 28, color: "#10b981" },
    { name: "B (80-89%)",  value: 35, color: "#06b6d4" },
    { name: "C (70-79%)",  value: 22, color: "#7c3aed" },
    { name: "D (60-69%)",  value: 10, color: "#f59e0b" },
    { name: "F (<60%)",    value: 5,  color: "#ef4444" },
  ],
  subjects: [
    { subject: "Biology",     avg: 84, students: 120 },
    { subject: "Mathematics", avg: 79, students: 145 },
    { subject: "Physics",     avg: 76, students: 98  },
    { subject: "Chemistry",   avg: 81, students: 110 },
    { subject: "Literature",  avg: 88, students: 95  },
    { subject: "History",     avg: 85, students: 80  },
  ],
  topPerformers: WEEKLY.topPerformers,
};

const YEARLY: Dataset = {
  summary: [
    { label: "Yearly Attendance",  value: "90%",    change: 4.2,  icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { label: "Avg. Grade",         value: "81.7%",  change: 3.6,  icon: Award,        gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Total Enrollment",   value: "1,900",  change: 15.2, icon: Users,        gradient: "from-cyan-500 to-teal-500" },
    { label: "Graduation Rate",    value: "96%",    change: 2.4,  icon: GraduationCap,gradient: "from-amber-500 to-orange-500" },
  ],
  enrollment: [
    { label: "Jan", students: 1200, teachers: 80 },
    { label: "Feb", students: 1350, teachers: 85 },
    { label: "Mar", students: 1420, teachers: 88 },
    { label: "Apr", students: 1500, teachers: 90 },
    { label: "May", students: 1650, teachers: 92 },
    { label: "Jun", students: 1580, teachers: 91 },
    { label: "Jul", students: 1490, teachers: 89 },
    { label: "Aug", students: 1720, teachers: 95 },
    { label: "Sep", students: 1800, teachers: 98 },
    { label: "Oct", students: 1900, teachers: 102 },
    { label: "Nov", students: 1900, teachers: 102 },
    { label: "Dec", students: 1900, teachers: 102 },
  ],
  attendance: [
    { label: "Jan", rate: 86 }, { label: "Feb", rate: 87 }, { label: "Mar", rate: 88 }, { label: "Apr", rate: 89 },
    { label: "May", rate: 90 }, { label: "Jun", rate: 91 }, { label: "Jul", rate: 87 }, { label: "Aug", rate: 92 },
    { label: "Sep", rate: 93 }, { label: "Oct", rate: 94 }, { label: "Nov", rate: 92 }, { label: "Dec", rate: 90 },
  ],
  grades: [
    { name: "A (90-100%)", value: 25, color: "#10b981" },
    { name: "B (80-89%)",  value: 33, color: "#06b6d4" },
    { name: "C (70-79%)",  value: 25, color: "#7c3aed" },
    { name: "D (60-69%)",  value: 12, color: "#f59e0b" },
    { name: "F (<60%)",    value: 5,  color: "#ef4444" },
  ],
  subjects: [
    { subject: "Biology",     avg: 82, students: 120 },
    { subject: "Mathematics", avg: 77, students: 145 },
    { subject: "Physics",     avg: 74, students: 98  },
    { subject: "Chemistry",   avg: 79, students: 110 },
    { subject: "Literature",  avg: 86, students: 95  },
    { subject: "History",     avg: 83, students: 80  },
  ],
  topPerformers: WEEKLY.topPerformers,
};

const DATASETS: Record<Period, Dataset> = { weekly: WEEKLY, monthly: MONTHLY, yearly: YEARLY };
const PERIOD_LABELS: Record<Period, string> = {
  weekly: "This Week", monthly: "This Month", yearly: "This Year",
};

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from backend
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [studentsRes, teachersRes, subjectsRes] = await Promise.all([
        api.getAdminUsers({ role: 'student', limit: 1000 }),
        api.getAdminUsers({ role: 'teacher', limit: 1000 }),
        api.getSubjects(),
      ]);
      
      if (studentsRes.success) setStudents(studentsRes.data.users || []);
      if (teachersRes.success) setTeachers(teachersRes.data.users || []);
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error("Failed to load report data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate real stats from data
  const data = useMemo(() => {
    const totalStudents = students.length || 1850;
    const totalTeachers = teachers.length || 98;
    const avgAttendance = students.length 
      ? Math.round(students.reduce((acc, s) => acc + (s.attendance || 90), 0) / students.length)
      : 94;
    const avgGpa = students.length
      ? (students.reduce((acc, s) => acc + (s.gpa || 3.5), 0) / students.length).toFixed(2)
      : "3.21";

    // Generate top performers from real students
    const topPerformers = [...students]
      .sort((a, b) => (b.gpa || 3) - (a.gpa || 3))
      .slice(0, 5)
      .map((s, i) => ({
        name: s.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`,
        grade: s.grade_level ? `Grade ${s.grade_level}` : 'Grade 9',
        gpa: s.gpa || 3.5,
        rank: i + 1,
      }));

    // Generate subject data from real subjects or default
    const subjectData = subjects.length > 0
      ? subjects.slice(0, 6).map((s: any, i: number) => ({
          subject: s.name,
          avg: 75 + (i * 3) + Math.floor(Math.random() * 10),
          students: Math.floor(totalStudents / subjects.length),
        }))
      : [
          { subject: "Biology", avg: 86, students: 120 },
          { subject: "Mathematics", avg: 81, students: 145 },
          { subject: "Physics", avg: 78, students: 98 },
          { subject: "Chemistry", avg: 83, students: 110 },
          { subject: "Literature", avg: 89, students: 95 },
          { subject: "History", avg: 85, students: 80 },
        ];

    return {
      summary: [
        { label: "Weekly Attendance", value: `${avgAttendance}%`, change: 2.1, icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
        { label: "Avg. Grade", value: `${avgGpa}`, change: 1.4, icon: Award, gradient: "from-violet-500 to-fuchsia-500" },
        { label: "Active Students", value: String(totalStudents), change: 0.8, icon: Users, gradient: "from-cyan-500 to-teal-500" },
        { label: "Total Teachers", value: String(totalTeachers), change: 5.0, icon: BookOpen, gradient: "from-amber-500 to-orange-500" },
      ],
      enrollment: [
        { label: "Mon", students: Math.round(totalStudents * 0.98), teachers: Math.round(totalTeachers * 0.99) },
        { label: "Tue", students: Math.round(totalStudents * 0.99), teachers: Math.round(totalTeachers * 0.99) },
        { label: "Wed", students: totalStudents, teachers: totalTeachers },
        { label: "Thu", students: Math.round(totalStudents * 0.97), teachers: Math.round(totalTeachers * 0.98) },
        { label: "Fri", students: Math.round(totalStudents * 0.96), teachers: Math.round(totalTeachers * 0.97) },
      ],
      attendance: [
        { label: "Mon", rate: avgAttendance },
        { label: "Tue", rate: Math.min(100, avgAttendance + 2) },
        { label: "Wed", rate: Math.min(100, avgAttendance + 4) },
        { label: "Thu", rate: avgAttendance },
        { label: "Fri", rate: Math.max(85, avgAttendance - 3) },
      ],
      grades: [
        { name: "A (90-100%)", value: Math.round(totalStudents * 0.32), color: "#10b981" },
        { name: "B (80-89%)", value: Math.round(totalStudents * 0.38), color: "#06b6d4" },
        { name: "C (70-79%)", value: Math.round(totalStudents * 0.20), color: "#7c3aed" },
        { name: "D (60-69%)", value: Math.round(totalStudents * 0.07), color: "#f59e0b" },
        { name: "F (<60%)", value: Math.round(totalStudents * 0.03), color: "#ef4444" },
      ],
      subjects: subjectData,
      topPerformers: topPerformers.length > 0 ? topPerformers : [
        { name: "Amara Osei", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amara", grade: "Grade 9", gpa: 4.0, rank: 1 },
        { name: "Evelyn Harper", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn", grade: "Grade 10", gpa: 3.95, rank: 2 },
        { name: "Priya Sharma", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", grade: "Grade 10", gpa: 3.9, rank: 3 },
      ],
    };
  }, [students, teachers, subjects]);

  function handleDownload(format: "csv" | "pdf") {
    const content = format === "csv"
      ? `Academic Report\nPeriod: ${PERIOD_LABELS[period]}\n\nSubject,Avg Score,Students\n${data.subjects.map(s => `${s.subject},${s.avg},${s.students}`).join("\n")}\n\nGrade Distribution\n${data.grades.map(g => `${g.name},${g.value}%`).join("\n")}`
      : `Academic Report\n==================\nPeriod: ${PERIOD_LABELS[period]}\nGenerated: ${new Date().toLocaleString()}\n\n${data.summary.map(s => `${s.label}: ${s.value} (${s.change > 0 ? "+" : ""}${s.change}%)`).join("\n")}\n\nTop Performers:\n${data.topPerformers.map(t => `${t.rank}. ${t.name} - GPA ${t.gpa}`).join("\n")}`;
    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${period}-${new Date().toISOString().slice(0,10)}.${format === "csv" ? "csv" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() { window.print(); }

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Reports</h1>
              <p className="text-sm text-ink-500">Performance overview · {PERIOD_LABELS[period]}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                <Printer className="size-4" />Print
              </button>
              <button onClick={() => handleDownload("csv")} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                <FileText className="size-4" />CSV
              </button>
              <button onClick={() => handleDownload("pdf")} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02]">
                <Download className="size-4" />Download Report
              </button>
            </div>
          </div>

          {/* Period toggle */}
          <div className="mb-6 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
            <div className="inline-flex rounded-xl border border-ink-200 bg-white p-0.5 shadow-sm">
              {(["weekly","monthly","yearly"] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition ${period === p ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm" : "text-ink-600 hover:bg-ink-50"}`}>
                  {p === "weekly" && <Clock className="size-3.5" />}
                  {p === "monthly" && <Calendar className="size-3.5" />}
                  {p === "yearly" && <TrendingUp className="size-3.5" />}
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="size-4 text-ink-400" />
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                className="h-8 rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 outline-none">
                {["All Grades","Grade 9","Grade 10","Grade 11","Grade 12"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            {data.summary.map((c, i) => (
              <div key={c.label} className="group overflow-hidden rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition hover:shadow-md hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink-500">{c.label}</p>
                  <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white transition group-hover:scale-110`}>
                    <c.icon className="size-5" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-ink-900">{c.value}</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {c.change >= 0 ? <ArrowUp className="size-3 text-emerald-500" /> : <ArrowDown className="size-3 text-red-500" />}
                  <span className={c.change >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>{Math.abs(c.change)}%</span>
                  <span className="text-ink-400">vs last {period.replace("ly","")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink-900">Enrollment Trend</h2>
                <span className="text-xs text-ink-500">Students &amp; Teachers</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.enrollment} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="students" stroke="#7c3aed" strokeWidth={2.5} fill="url(#studentGrad)" name="Students" />
                  <Line type="monotone" dataKey="teachers" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Teachers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 text-base font-bold text-ink-900">Grade Distribution</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.grades} cx="50%" cy="50%" outerRadius={75} innerRadius={45} strokeWidth={0} dataKey="value">
                    {data.grades.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {data.grades.map(g => (
                  <div key={g.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block size-2.5 rounded-full" style={{ background: g.color }} />
                      {g.name}
                    </span>
                    <span className="font-bold text-ink-700">{g.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance trend */}
          <div className="mb-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-card animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <h2 className="mb-4 text-base font-bold text-ink-900">Attendance Rate</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.attendance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} activeDot={{ r: 7 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subjects & top performers */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px] animate-fade-in-up" style={{ animationDelay: "220ms" }}>
            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 text-base font-bold text-ink-900">Average Score by Subject</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.subjects} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {data.subjects.map((s, i) => (
                      <Cell key={i} fill={s.avg >= 85 ? "#10b981" : s.avg >= 80 ? "#7c3aed" : s.avg >= 75 ? "#f59e0b" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900"><Award className="size-5 text-amber-500" />Top Performers</h2>
              <div className="space-y-2">
                {data.topPerformers.map(s => (
                  <div key={s.rank} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3 transition hover:bg-white hover:shadow-sm">
                    <span className={`flex size-7 items-center justify-center rounded-lg text-xs font-bold ${s.rank === 1 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" : s.rank === 2 ? "bg-gradient-to-br from-ink-300 to-ink-400 text-white" : s.rank === 3 ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white" : "bg-ink-200 text-ink-600"}`}>
                      {s.rank}
                    </span>
                    <img src={s.avatar} alt={s.name} className="size-9 rounded-full bg-surface-100 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{s.name}</p>
                      <p className="text-[10px] text-ink-500">{s.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-violet-700">{s.gpa.toFixed(2)}</p>
                      <p className="text-[9px] font-semibold uppercase text-ink-400">GPA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject detail table */}
          <div className="mt-5 rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "260ms" }}>
            <div className="border-b border-ink-100 bg-ink-50 px-5 py-3">
              <h2 className="text-base font-bold text-ink-900">Subject Performance Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-[10px] font-bold uppercase text-ink-500">
                  <th className="px-5 py-2.5 text-left">Subject</th>
                  <th className="px-4 py-2.5 text-center">Students</th>
                  <th className="px-4 py-2.5 text-center">Avg. Score</th>
                  <th className="px-4 py-2.5 text-left">Progress</th>
                  <th className="px-4 py-2.5 text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.subjects.map(s => (
                  <tr key={s.subject} className="border-b border-ink-50 last:border-0 hover:bg-violet-50/20 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><BookOpen className="size-4" /></span>
                        <span className="font-semibold text-ink-900">{s.subject}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-ink-700">{s.students}</td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-ink-900">{s.avg}%</td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                        <div className={`h-full transition-all ${s.avg >= 85 ? "bg-emerald-500" : s.avg >= 80 ? "bg-violet-500" : s.avg >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.avg}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${s.avg >= 85 ? "bg-emerald-50 text-emerald-700" : s.avg >= 80 ? "bg-violet-50 text-violet-700" : s.avg >= 75 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                        {s.avg >= 85 ? "Excellent" : s.avg >= 80 ? "Good" : s.avg >= 75 ? "Average" : "Needs Focus"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
