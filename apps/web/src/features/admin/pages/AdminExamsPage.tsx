import { useState, useMemo, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import {
  Plus, Search, ClipboardList, FileText, Clock, MapPin, Users as UsersIcon, Award, TrendingUp,
  Check, X, AlertTriangle, Calendar, Edit2, Trash2, Eye, MoreHorizontal, GraduationCap,
  ChevronLeft, ChevronRight, Filter, CheckCircle2, Download, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type ExamStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
type ExamType = "Mid-Term" | "Final" | "Quiz" | "Assignment";

type StudentResult = {
  studentId: string; name: string; avatar: string; grade: string;
  score: number; maxScore: number; percent: number; letterGrade: string; status: "Pass" | "Fail" | "Absent";
};

type Exam = {
  id: string;
  title: string;
  subject: string;
  type: ExamType;
  grade: string;
  teacher: string;
  teacherAvatar: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  location: string;
  totalMarks: number;
  passMarks: number;
  status: ExamStatus;
  enrolled: number;
  results: StudentResult[];
  instructions: string;
};

const STATUS_META: Record<ExamStatus, { bg: string; text: string; dot: string; gradient: string }> = {
  Upcoming:  { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    gradient: "from-blue-500 to-cyan-500" },
  Ongoing:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   gradient: "from-amber-500 to-orange-500" },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", gradient: "from-emerald-500 to-green-500" },
  Cancelled: { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     gradient: "from-red-500 to-rose-500" },
};

const TYPE_META: Record<ExamType, string> = {
  "Mid-Term":   "bg-violet-100 text-violet-700",
  "Final":      "bg-red-100 text-red-700",
  "Quiz":       "bg-amber-100 text-amber-700",
  "Assignment": "bg-cyan-100 text-cyan-700",
};

const GRADES = ["All","Grade 9","Grade 10","Grade 11","Grade 12"];
const SUBJECTS = ["Mathematics","Biology","Physics","Chemistry","Literature","History","Computer Science","Geography"];
const TEACHERS = [
  { name: "Dr. Alice Monroe",  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
  { name: "Mr. James Okafor",  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
  { name: "Ms. Clara Zhang",   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Clara" },
  { name: "Mr. David Mensah",  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
  { name: "Ms. Fatima Hassan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima" },
];

/* mock results builder */
function makeResults(count: number, total: number, passPct: number): StudentResult[] {
  const names = [
    { name: "Evelyn Harper",  avatar: "https://i.pravatar.cc/60?img=44", grade: "Grade 10", id: "PRE43178" },
    { name: "Diana Plenty",   avatar: "https://i.pravatar.cc/60?img=36", grade: "Grade 11", id: "PRE43174" },
    { name: "John Millar",    avatar: "https://i.pravatar.cc/60?img=15", grade: "Grade 10", id: "PRE43187" },
    { name: "Sofia Martinez", avatar: "https://i.pravatar.cc/60?img=47", grade: "Grade 9",  id: "PRE43201" },
    { name: "Noah Williams",  avatar: "https://i.pravatar.cc/60?img=12", grade: "Grade 12", id: "PRE43195" },
    { name: "Amara Osei",     avatar: "https://i.pravatar.cc/60?img=23", grade: "Grade 9",  id: "PRE43202" },
    { name: "Luca Bianchi",   avatar: "https://i.pravatar.cc/60?img=8",  grade: "Grade 11", id: "PRE43211" },
    { name: "Priya Sharma",   avatar: "https://i.pravatar.cc/60?img=38", grade: "Grade 10", id: "PRE43219" },
  ];
  const scores = [92, 85, 76, 88, 65, 98, 72, 45];
  return Array.from({ length: count }, (_, i) => {
    const base = names[i % names.length];
    const score = scores[i % scores.length];
    const percent = Math.round(score / 100 * total);
    const passing = percent >= total * passPct / 100;
    return {
      studentId: base.id, name: base.name, avatar: base.avatar, grade: base.grade,
      score: percent, maxScore: total, percent: Math.round(percent/total*100),
      letterGrade: score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F",
      status: passing ? "Pass" : score < 30 ? "Absent" : "Fail",
    };
  });
}

const INITIAL: Exam[] = [
  { id: "ex1", title: "Mathematics Mid-Term", subject: "Mathematics", type: "Mid-Term", grade: "Grade 10", teacher: "Mr. James Okafor", teacherAvatar: TEACHERS[1].avatar, date: "2024-11-15", startTime: "09:00", endTime: "11:00", duration: 120, location: "Exam Hall A", totalMarks: 100, passMarks: 40, status: "Upcoming", enrolled: 120, results: [], instructions: "Closed book exam. Calculators allowed. Answer all questions." },
  { id: "ex2", title: "Biology Final",        subject: "Biology",     type: "Final",    grade: "Grade 12", teacher: "Dr. Alice Monroe",  teacherAvatar: TEACHERS[0].avatar, date: "2024-12-10", startTime: "10:00", endTime: "13:00", duration: 180, location: "Exam Hall B", totalMarks: 150, passMarks: 60, status: "Upcoming", enrolled: 85,  results: [], instructions: "3-hour comprehensive final. Bring diagrams for section B." },
  { id: "ex3", title: "Physics Quiz 3",       subject: "Physics",     type: "Quiz",     grade: "Grade 11", teacher: "Ms. Clara Zhang",   teacherAvatar: TEACHERS[2].avatar, date: "2024-10-25", startTime: "11:00", endTime: "12:00", duration: 60,  location: "Room 305",    totalMarks: 30,  passMarks: 12, status: "Completed", enrolled: 65,  results: makeResults(8, 30, 40), instructions: "Short quiz on electromagnetism." },
  { id: "ex4", title: "Chemistry Mid-Term",   subject: "Chemistry",   type: "Mid-Term", grade: "Grade 11", teacher: "Mr. David Mensah",  teacherAvatar: TEACHERS[3].avatar, date: "2024-10-28", startTime: "14:00", endTime: "16:00", duration: 120, location: "Exam Hall A", totalMarks: 100, passMarks: 40, status: "Ongoing", enrolled: 72,  results: [], instructions: "Covers chapters 1-8. Periodic table provided." },
  { id: "ex5", title: "Literature Essay",     subject: "Literature",  type: "Assignment", grade: "Grade 10", teacher: "Ms. Fatima Hassan", teacherAvatar: TEACHERS[4].avatar, date: "2024-10-18", startTime: "00:00", endTime: "23:59", duration: 0,   location: "Online",      totalMarks: 50,  passMarks: 25, status: "Completed", enrolled: 95,  results: makeResults(8, 50, 50), instructions: "Submit a 1,500-word essay on assigned novel." },
  { id: "ex6", title: "History Quiz",         subject: "History",     type: "Quiz",     grade: "Grade 9",  teacher: "Mr. James Okafor",  teacherAvatar: TEACHERS[1].avatar, date: "2024-10-05", startTime: "09:00", endTime: "10:00", duration: 60,  location: "Room 101",    totalMarks: 20,  passMarks: 8,  status: "Completed", enrolled: 54,  results: makeResults(8, 20, 40), instructions: "Modern world events 1900-1950." },
];

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ExamStatus>("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [viewExam, setViewExam] = useState<Exam | null>(null);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [deleteExam, setDeleteExam] = useState<Exam | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2400); }

  // Load teachers from API
  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      setLoading(true);
      const response = await api.getAdminUsers({ role: 'teacher', limit: 100 });
      if (response.success && response.data.users.length > 0) {
        // Transform to exam teacher format with generated avatars
        const realTeachers = response.data.users.map((t: any) => ({
          name: t.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`,
        }));
        setTeachers(realTeachers);
      } else {
        // Fallback to mock teachers
        setTeachers(TEACHERS);
      }
    } catch (error) {
      console.error("Failed to load teachers:", error);
      setTeachers(TEACHERS);
    } finally {
      setLoading(false);
    }
  }

  // Get active teachers (real or mock)
  const activeTeachers = teachers.length > 0 ? teachers : TEACHERS;

  const filtered = useMemo(() => exams.filter(e => {
    const q = search.toLowerCase();
    if (q && !e.title.toLowerCase().includes(q) && !e.subject.toLowerCase().includes(q) && !e.teacher.toLowerCase().includes(q)) return false;
    if (statusFilter !== "All" && e.status !== statusFilter) return false;
    if (gradeFilter !== "All" && e.grade !== gradeFilter) return false;
    return true;
  }), [exams, search, statusFilter, gradeFilter]);

  function addExam(e: Exam) { setExams(es => [e, ...es]); setShowCreate(false); showToast(`${e.title} created`); }
  function updateExam(e: Exam) { setExams(es => es.map(x => x.id === e.id ? e : x)); setEditExam(null); setViewExam(e); showToast("Exam updated"); }
  function changeStatus(id: string, st: ExamStatus) {
    setExams(es => es.map(e => e.id === id ? { ...e, status: st } : e));
    showToast(`Exam marked ${st.toLowerCase()}`);
  }
  function removeExam() {
    if (!deleteExam) return;
    setExams(es => es.filter(e => e.id !== deleteExam.id));
    showToast("Exam deleted");
    setDeleteExam(null); setViewExam(null);
  }

  const stats = {
    total: exams.length,
    upcoming: exams.filter(e => e.status === "Upcoming").length,
    ongoing: exams.filter(e => e.status === "Ongoing").length,
    completed: exams.filter(e => e.status === "Completed").length,
  };

  const completedExams = exams.filter(e => e.status === "Completed" && e.results.length);
  const avgPassRate = completedExams.length === 0 ? 0 :
    Math.round(completedExams.reduce((s, e) => s + e.results.filter(r => r.status === "Pass").length / e.results.length * 100, 0) / completedExams.length);

  const STAT_CARDS = [
    { label: "Total Exams",    value: stats.total,     icon: ClipboardList, gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Upcoming",       value: stats.upcoming,  icon: Calendar,      gradient: "from-blue-500 to-cyan-500" },
    { label: "Completed",      value: stats.completed, icon: CheckCircle2,  gradient: "from-emerald-500 to-green-500" },
    { label: "Pass Rate",      value: `${avgPassRate}%`, icon: TrendingUp,  gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Exams</h1>
              <p className="text-sm text-ink-500">{filtered.length} of {exams.length} exams</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02]">
              <Plus className="size-4" /> Schedule Exam
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

          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 w-72 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex gap-1.5">
              {(["All","Upcoming","Ongoing","Completed","Cancelled"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${statusFilter === s ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="size-4 text-ink-400" />
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                className="h-8 rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 outline-none">
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Exam cards grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            {filtered.map((e, i) => (
              <ExamCard key={e.id} exam={e} idx={i}
                onOpen={() => setViewExam(e)}
                onEdit={() => setEditExam(e)}
                onDelete={() => setDeleteExam(e)}
                onStatusChange={(st) => changeStatus(e.id, st)}
                menuOpen={menuOpen === e.id}
                setMenuOpen={(open) => setMenuOpen(open ? e.id : null)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-16 text-center text-sm text-ink-400">No exams match your filters.</p>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreate && <ExamModal mode="create" onClose={() => setShowCreate(false)} onSave={addExam} />}
      {editExam && <ExamModal mode="edit" exam={editExam} onClose={() => setEditExam(null)} onSave={updateExam} />}
      {viewExam && !editExam && <ExamDetail exam={viewExam} onClose={() => setViewExam(null)} onEdit={() => setEditExam(viewExam)} onDelete={() => setDeleteExam(viewExam)} onStatusChange={(st) => changeStatus(viewExam.id, st)} />}
      {deleteExam && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Exam</h3>
            <p className="mt-1 text-sm text-ink-500">Delete <strong>{deleteExam.title}</strong>?</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteExam(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={removeExam} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in-up">
          <Check className="size-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ─────────── Exam Card ─────────── */
function ExamCard({ exam: e, idx, onOpen, onEdit, onDelete, onStatusChange, menuOpen, setMenuOpen }: {
  exam: Exam; idx: number; onOpen: () => void; onEdit: () => void; onDelete: () => void;
  onStatusChange: (st: ExamStatus) => void;
  menuOpen: boolean; setMenuOpen: (open: boolean) => void;
}) {
  const M = STATUS_META[e.status];
  const daysAway = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);

  return (
    <div onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card transition hover:shadow-md hover:scale-[1.01] hover:border-violet-300 animate-fade-in-up"
      style={{ animationDelay: `${idx * 40}ms` }}>
      <div className={`h-1.5 w-full bg-gradient-to-r ${M.gradient}`} />
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${M.bg} ${M.text}`}>
              <span className={`size-1.5 rounded-full ${M.dot}`} />{e.status}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_META[e.type]}`}>{e.type}</span>
          </div>
          <div className="relative" onClick={ev => ev.stopPropagation()}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-1 text-ink-400 hover:bg-ink-100">
              <MoreHorizontal className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-30 w-44 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                <button onClick={() => { onOpen(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Details</button>
                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Edit2 className="size-3.5" />Edit</button>
                <div className="my-1 border-t border-ink-100" />
                <p className="px-3 pt-1 text-[9px] font-bold uppercase text-ink-400">Status</p>
                {(["Upcoming","Ongoing","Completed","Cancelled"] as ExamStatus[]).filter(s => s !== e.status).map(s => (
                  <button key={s} onClick={() => { onStatusChange(s); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-violet-50">
                    <span className={`size-2 rounded-full ${STATUS_META[s].dot}`} />{s}
                  </button>
                ))}
                <div className="my-1 border-t border-ink-100" />
                <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-ink-900 leading-snug">{e.title}</h3>
        <p className="mt-0.5 text-xs text-ink-500">{e.subject} · {e.grade}</p>

        <div className="mt-3 flex items-center gap-2">
          <img src={e.teacherAvatar} alt={e.teacher} className="size-6 rounded-full object-cover" />
          <span className="truncate text-xs text-ink-600">{e.teacher}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-500">
          <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" />{e.startTime}</span>
          <span className="flex items-center gap-1"><MapPin className="size-3" />{e.location}</span>
          <span className="flex items-center gap-1"><UsersIcon className="size-3" />{e.enrolled} students</span>
        </div>

        {e.status === "Upcoming" && daysAway >= 0 && (
          <div className="mt-3 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700">
            {daysAway === 0 ? "📅 Today" : daysAway === 1 ? "⏰ Tomorrow" : `⏰ In ${daysAway} days`}
          </div>
        )}
        {e.status === "Completed" && e.results.length > 0 && (
          <div className="mt-3 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
            ✓ Pass rate: {Math.round(e.results.filter(r => r.status === "Pass").length / e.results.length * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── Exam Detail ─────────── */
function ExamDetail({ exam: e, onClose, onEdit, onDelete, onStatusChange }: {
  exam: Exam; onClose: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: (st: ExamStatus) => void;
}) {
  const [tab, setTab] = useState<"overview" | "results">("overview");
  const [resultSearch, setResultSearch] = useState("");
  const M = STATUS_META[e.status];
  const pageSize = 8;
  const [page, setPage] = useState(1);

  const filteredResults = e.results.filter(r => r.name.toLowerCase().includes(resultSearch.toLowerCase()) || r.studentId.toLowerCase().includes(resultSearch.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const pagedResults = filteredResults.slice((page-1)*pageSize, page*pageSize);

  const pass = e.results.filter(r => r.status === "Pass").length;
  const fail = e.results.filter(r => r.status === "Fail").length;
  const absent = e.results.filter(r => r.status === "Absent").length;
  const avgScore = e.results.length === 0 ? 0 : Math.round(e.results.reduce((s, r) => s + r.percent, 0) / e.results.length);
  const highest = e.results.length === 0 ? 0 : Math.max(...e.results.map(r => r.percent));
  const lowest = e.results.length === 0 ? 0 : Math.min(...e.results.map(r => r.percent));

  const gradeData = ["A","B","C","D","F"].map(g => ({ grade: g, count: e.results.filter(r => r.letterGrade === g).length }));
  const COLORS = ["#10b981","#06b6d4","#7c3aed","#f59e0b","#ef4444"];

  function exportResults() {
    if (!e.results.length) return;
    const csv = ["Student,ID,Grade,Score,Max,Percent,Letter,Status",
      ...e.results.map(r => `${r.name},${r.studentId},${r.grade},${r.score},${r.maxScore},${r.percent}%,${r.letterGrade},${r.status}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${e.title}-results.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl animate-fade-in-up" onClick={ev => ev.stopPropagation()}>
        <div className={`bg-gradient-to-br ${M.gradient} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur">{e.status}</span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase backdrop-blur">{e.type}</span>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
          <h2 className="mt-3 text-2xl font-bold">{e.title}</h2>
          <p className="text-sm text-white/90">{e.subject} · {e.grade}</p>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="mb-5 flex rounded-xl border border-ink-200 bg-white p-0.5 shadow-sm">
            {(["overview","results"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition ${tab === t ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm" : "text-ink-600 hover:bg-ink-50"}`}>
                {t}{t === "results" && e.results.length > 0 && ` (${e.results.length})`}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="animate-fade-in space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={Calendar} label="Date" value={new Date(e.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} />
                <InfoCard icon={Clock} label="Time" value={`${e.startTime} - ${e.endTime} (${e.duration}m)`} />
                <InfoCard icon={MapPin} label="Location" value={e.location} />
                <InfoCard icon={UsersIcon} label="Students" value={`${e.enrolled} enrolled`} />
                <InfoCard icon={Award} label="Total Marks" value={`${e.totalMarks} pts`} />
                <InfoCard icon={CheckCircle2} label="Pass Marks" value={`${e.passMarks} pts`} />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
                <img src={e.teacherAvatar} alt={e.teacher} className="size-10 rounded-full object-cover ring-2 ring-white" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-ink-400">Invigilator</p>
                  <p className="text-sm font-semibold text-ink-900">{e.teacher}</p>
                </div>
              </div>

              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
                <h4 className="mb-2 text-[10px] font-bold uppercase text-ink-400">Instructions</h4>
                <p className="text-sm text-ink-700">{e.instructions || "No special instructions."}</p>
              </div>

              {/* Status changer */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase text-ink-400">Change Status</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["Upcoming","Ongoing","Completed","Cancelled"] as ExamStatus[]).map(s => (
                    <button key={s} onClick={() => onStatusChange(s)}
                      className={`rounded-xl border-2 py-2 text-xs font-bold transition ${e.status === s ? `border-transparent ${STATUS_META[s].bg} ${STATUS_META[s].text}` : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onDelete} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 className="size-4" />Delete</button>
                <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"><Edit2 className="size-4" />Edit</button>
              </div>
            </div>
          )}

          {tab === "results" && (
            <div className="animate-fade-in">
              {e.results.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-ink-200 py-16 text-center">
                  <FileText className="mx-auto size-10 text-ink-300" />
                  <p className="mt-3 text-sm font-semibold text-ink-600">No results yet</p>
                  <p className="text-xs text-ink-400">Results will appear here after the exam is completed.</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard label="Average" value={`${avgScore}%`} gradient="from-violet-500 to-fuchsia-500" />
                    <SummaryCard label="Highest" value={`${highest}%`} gradient="from-emerald-500 to-green-500" />
                    <SummaryCard label="Lowest" value={`${lowest}%`} gradient="from-red-500 to-rose-500" />
                    <SummaryCard label="Pass Rate" value={`${Math.round(pass / e.results.length * 100)}%`} gradient="from-amber-500 to-orange-500" />
                  </div>

                  {/* Charts */}
                  <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                      <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Grade Distribution</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={gradeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="grade" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                      <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Outcomes</h4>
                      <div className="space-y-2">
                        <OutcomeBar label="Passed" value={pass} total={e.results.length} color="bg-emerald-500" />
                        <OutcomeBar label="Failed" value={fail} total={e.results.length} color="bg-red-500" />
                        <OutcomeBar label="Absent" value={absent} total={e.results.length} color="bg-ink-400" />
                      </div>
                    </div>
                  </div>

                  {/* Results table */}
                  <div className="mb-3 flex items-center justify-between">
                    <label className="relative flex items-center">
                      <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
                      <input value={resultSearch} onChange={ev => { setResultSearch(ev.target.value); setPage(1); }} placeholder="Search student..."
                        className="h-9 w-56 rounded-xl border border-ink-200 pl-9 pr-3 text-xs outline-none focus:border-violet-400" />
                    </label>
                    <button onClick={exportResults} className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"><Download className="size-3.5" />Export CSV</button>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-ink-100 bg-ink-50 text-[10px] font-bold uppercase text-ink-500">
                          <th className="px-4 py-2.5 text-left">Student</th>
                          <th className="px-3 py-2.5 text-center">Score</th>
                          <th className="px-3 py-2.5 text-center">%</th>
                          <th className="px-3 py-2.5 text-center">Grade</th>
                          <th className="px-3 py-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedResults.map(r => (
                          <tr key={r.studentId + r.name} className="border-b border-ink-50 last:border-0">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <img src={r.avatar} alt={r.name} className="size-7 rounded-full object-cover" />
                                <div>
                                  <p className="text-xs font-semibold text-ink-900">{r.name}</p>
                                  <p className="text-[10px] text-ink-400 font-mono">{r.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-center text-xs font-semibold text-ink-700">{r.score}/{r.maxScore}</td>
                            <td className="px-3 py-2.5 text-center text-xs font-bold text-ink-900">{r.percent}%</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex size-6 items-center justify-center rounded-lg text-xs font-bold ${r.letterGrade === "A" ? "bg-emerald-100 text-emerald-700" : r.letterGrade === "B" ? "bg-cyan-100 text-cyan-700" : r.letterGrade === "C" ? "bg-violet-100 text-violet-700" : r.letterGrade === "D" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{r.letterGrade}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === "Pass" ? "bg-emerald-50 text-emerald-700" : r.status === "Fail" ? "bg-red-50 text-red-600" : "bg-ink-100 text-ink-500"}`}>{r.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-ink-100 px-4 py-2 text-xs text-ink-500">
                        <span>Page {page} of {totalPages}</span>
                        <div className="flex gap-1">
                          <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="rounded-lg p-1 hover:bg-ink-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                          <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="rounded-lg p-1 hover:bg-ink-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-ink-400">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, gradient }: { label: string; value: string; gradient: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 text-white`}>
      <p className="text-[10px] font-bold uppercase opacity-90">{label}</p>
      <p className="mt-0.5 text-2xl font-bold">{value}</p>
    </div>
  );
}

function OutcomeBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round(value / total * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-ink-700">{label}</span>
        <span className="font-bold text-ink-900">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─────────── Exam Modal ─────────── */
const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function ExamModal({ mode, exam, onClose, onSave }: {
  mode: "create" | "edit"; exam?: Exam; onClose: () => void; onSave: (e: Exam) => void;
}) {
  const seed = exam || {} as Exam;
  const [form, setForm] = useState({
    title: seed.title || "",
    subject: seed.subject || SUBJECTS[0],
    type: (seed.type || "Mid-Term") as ExamType,
    grade: seed.grade || "Grade 9",
    teacher: seed.teacher || TEACHERS[0].name,
    teacherAvatar: seed.teacherAvatar || TEACHERS[0].avatar,
    date: seed.date || "",
    startTime: seed.startTime || "09:00",
    endTime: seed.endTime || "11:00",
    duration: seed.duration || 120,
    location: seed.location || "",
    totalMarks: seed.totalMarks || 100,
    passMarks: seed.passMarks || 40,
    status: (seed.status || "Upcoming") as ExamStatus,
    enrolled: seed.enrolled || 0,
    instructions: seed.instructions || "",
  });
  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })); }
  function selectTeacher(name: string) { const t = TEACHERS.find(x => x.name === name)!; setForm(f => ({ ...f, teacher: t.name, teacherAvatar: t.avatar })); }
  const valid = form.title.trim() && form.date && form.location.trim();

  function submit() {
    if (!valid) return;
    onSave({
      id: exam?.id || `ex${Date.now()}`,
      title: form.title.trim(), subject: form.subject, type: form.type, grade: form.grade,
      teacher: form.teacher, teacherAvatar: form.teacherAvatar,
      date: form.date, startTime: form.startTime, endTime: form.endTime, duration: form.duration,
      location: form.location.trim(), totalMarks: form.totalMarks, passMarks: form.passMarks,
      status: form.status, enrolled: form.enrolled,
      results: exam?.results || [],
      instructions: form.instructions.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardList className="size-5" />{mode === "create" ? "Schedule New Exam" : "Edit Exam"}</h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Exam Title *"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Mathematics Mid-Term" className={fieldCls} autoFocus /></Field>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Exam Type</p>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(TYPE_META) as ExamType[]).map(t => (
                <button key={t} type="button" onClick={() => set("type", t)}
                  className={`rounded-xl border-2 py-2 text-xs font-bold transition ${form.type === t ? "border-violet-600 bg-violet-50 text-violet-700" : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Subject"><select value={form.subject} onChange={e => set("subject", e.target.value)} className={fieldCls}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Grade">
              <select value={form.grade} onChange={e => set("grade", e.target.value)} className={fieldCls}>
                {GRADES.filter(g => g !== "All").map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Enrolled Students"><input type="number" min={0} value={form.enrolled} onChange={e => set("enrolled", parseInt(e.target.value) || 0)} className={fieldCls} /></Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Invigilator</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TEACHERS.map(t => (
                <button key={t.name} type="button" onClick={() => selectTeacher(t.name)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-2 text-left transition ${form.teacher === t.name ? "border-violet-600 bg-violet-50" : "border-ink-200 hover:border-violet-300"}`}>
                  <img src={t.avatar} alt={t.name} className="size-7 rounded-full object-cover" />
                  <span className="truncate text-xs font-semibold text-ink-700">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Date *"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} className={fieldCls} /></Field>
            <Field label="Start"><input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)} className={fieldCls} /></Field>
            <Field label="End"><input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)} className={fieldCls} /></Field>
            <Field label="Duration (min)"><input type="number" min={0} value={form.duration} onChange={e => set("duration", parseInt(e.target.value) || 0)} className={fieldCls} /></Field>
          </div>

          <Field label="Location *"><input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Exam Hall A" className={fieldCls} /></Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Total Marks"><input type="number" min={1} value={form.totalMarks} onChange={e => set("totalMarks", parseInt(e.target.value) || 0)} className={fieldCls} /></Field>
            <Field label="Pass Marks"><input type="number" min={0} value={form.passMarks} onChange={e => set("passMarks", parseInt(e.target.value) || 0)} className={fieldCls} /></Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as ExamStatus)} className={fieldCls}>
                {(["Upcoming","Ongoing","Completed","Cancelled"] as ExamStatus[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Instructions"><textarea value={form.instructions} onChange={e => set("instructions", e.target.value)} rows={3} placeholder="Special instructions for students..." className={`${fieldCls} h-auto py-2`} /></Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">Cancel</button>
          <button onClick={submit} disabled={!valid} className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:shadow-lg">
            {mode === "create" ? <><Plus className="size-4" />Schedule</> : <><Check className="size-4" />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
