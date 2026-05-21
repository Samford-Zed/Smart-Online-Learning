import { useState } from "react";
import {
  Search, Plus, BookOpen, Users, User, Clock, MoreHorizontal, X, Star, Eye, Pencil, Trash2,
  Check, AlertTriangle, ChevronLeft, ChevronRight, GraduationCap, FileText, Tag, Calendar, ListChecks,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { useT } from "../../../i18n/I18nProvider";

type Course = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  teacherAvatar: string;
  students: number;
  duration: string;
  modules: number;
  rating: number;
  status: "Active" | "Draft" | "Archived";
  accentClass: string;
  description: string;
  syllabus: string[];
  startDate: string;
  level: "Beginner" | "Intermediate" | "Advanced";
};

const TEACHERS = [
  { name: "Dr. Alice Monroe",  avatar: "https://i.pravatar.cc/80?img=49" },
  { name: "Mr. James Okafor",  avatar: "https://i.pravatar.cc/80?img=11" },
  { name: "Ms. Clara Zhang",   avatar: "https://i.pravatar.cc/80?img=45" },
  { name: "Mr. David Mensah",  avatar: "https://i.pravatar.cc/80?img=14" },
  { name: "Ms. Fatima Hassan", avatar: "https://i.pravatar.cc/80?img=41" },
  { name: "Mr. Leo Fernandez", avatar: "https://i.pravatar.cc/80?img=6"  },
];

const ACCENTS = ["bg-emerald-500","bg-violet-600","bg-cyan-500","bg-orange-500","bg-rose-500","bg-amber-500","bg-brand","bg-teal-500"];

const INITIAL_COURSES: Course[] = [
  { id: "c1", title: "Biology 101: Foundations of Life", subject: "Biology",     teacher: "Dr. Alice Monroe",  teacherAvatar: "https://i.pravatar.cc/80?img=49", students: 120, duration: "12 weeks", modules: 12, rating: 4.8, status: "Active",   accentClass: "bg-emerald-500", description: "Comprehensive introduction to cellular biology, genetics, and ecological systems.", syllabus: ["Cell Structure & Function","Genetics & DNA","Evolution","Ecology","Human Anatomy"], startDate: "Sep 5, 2024", level: "Beginner" },
  { id: "c2", title: "Calculus for High Schoolers",      subject: "Mathematics", teacher: "Mr. James Okafor",  teacherAvatar: "https://i.pravatar.cc/80?img=11", students: 145, duration: "16 weeks", modules: 15, rating: 4.7, status: "Active",   accentClass: "bg-violet-600",  description: "Learn limits, derivatives, integrals, and their real-world applications.", syllabus: ["Limits","Derivatives","Integration","Applications","Differential Equations"], startDate: "Sep 5, 2024", level: "Advanced" },
  { id: "c3", title: "Physics II: Electromagnetism",     subject: "Physics",     teacher: "Ms. Clara Zhang",   teacherAvatar: "https://i.pravatar.cc/80?img=45", students: 98,  duration: "14 weeks", modules: 10, rating: 4.5, status: "Active",   accentClass: "bg-cyan-500",    description: "Explore electric and magnetic fields, circuits, and electromagnetic waves.", syllabus: ["Electric Fields","Magnetism","Circuits","Induction","Waves"], startDate: "Sep 12, 2024", level: "Intermediate" },
  { id: "c4", title: "Organic Chemistry Fundamentals",   subject: "Chemistry",   teacher: "Mr. David Mensah",  teacherAvatar: "https://i.pravatar.cc/80?img=14", students: 110, duration: "12 weeks", modules: 11, rating: 4.6, status: "Active",   accentClass: "bg-orange-500",  description: "Learn carbon compounds, reactions, and biochemical processes.", syllabus: ["Hydrocarbons","Functional Groups","Reactions","Biochemistry"], startDate: "Sep 8, 2024", level: "Intermediate" },
  { id: "c5", title: "World Literature & Composition",   subject: "Literature",  teacher: "Ms. Fatima Hassan", teacherAvatar: "https://i.pravatar.cc/80?img=41", students: 95,  duration: "10 weeks", modules: 9,  rating: 4.4, status: "Active",   accentClass: "bg-rose-500",    description: "Explore literature across cultures and develop critical writing skills.", syllabus: ["Greek Classics","Renaissance","Modern Novels","Essay Writing"], startDate: "Sep 10, 2024", level: "Beginner" },
  { id: "c6", title: "Modern World History",             subject: "History",     teacher: "Mr. Leo Fernandez", teacherAvatar: "https://i.pravatar.cc/80?img=6",  students: 0,   duration: "12 weeks", modules: 8,  rating: 0,   status: "Draft",    accentClass: "bg-amber-500",   description: "Examine major events from 1500 to present day.", syllabus: ["Renaissance","Industrial Revolution","World Wars","Cold War"], startDate: "TBD", level: "Beginner" },
  { id: "c7", title: "Introduction to Programming",      subject: "CS",          teacher: "Mr. James Okafor",  teacherAvatar: "https://i.pravatar.cc/80?img=11", students: 135, duration: "14 weeks", modules: 14, rating: 4.9, status: "Active",   accentClass: "bg-brand",       description: "Learn fundamentals of programming with Python.", syllabus: ["Variables & Types","Control Flow","Functions","OOP","Data Structures"], startDate: "Sep 5, 2024", level: "Beginner" },
  { id: "c8", title: "Environmental Science (2023)",     subject: "Science",     teacher: "Dr. Alice Monroe",  teacherAvatar: "https://i.pravatar.cc/80?img=49", students: 87,  duration: "10 weeks", modules: 8,  rating: 4.3, status: "Archived", accentClass: "bg-teal-500",    description: "Study ecosystems, climate, and sustainability.", syllabus: ["Ecosystems","Climate","Pollution","Sustainability"], startDate: "Sep 2023", level: "Intermediate" },
];

const STATUS_COLORS: Record<Course["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700", Draft: "bg-amber-50 text-amber-700", Archived: "bg-ink-100 text-ink-500",
};

const SUBJECTS = ["Biology","Mathematics","Physics","Chemistry","Literature","History","CS","Science","Geography","Art"];

export default function AdminCoursesPage() {
  const { t } = useT();
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Course["status"]>("All");
  const [showWizard, setShowWizard] = useState(false);
  const [viewTarget, setViewTarget] = useState<Course | null>(null);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const statuses: Array<"All" | Course["status"]> = ["All", "Active", "Draft", "Archived"];

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleAdd(c: Course) { setCourses(cs => [c, ...cs]); setShowWizard(false); showToast(`${c.title} created`); }
  function handleEdit(c: Course) { setCourses(cs => cs.map(x => x.id === c.id ? c : x)); setEditTarget(null); showToast(`${c.title} updated`); }
  function handleDelete() {
    if (!deleteTarget) return;
    setCourses(cs => cs.filter(c => c.id !== deleteTarget.id));
    showToast(`${deleteTarget.title} removed`);
    setDeleteTarget(null);
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          {/* Hero Header */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 p-6 shadow-lg animate-fade-in-up">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t("admin.pages.courses")}</h1>
                <p className="mt-1 text-sm text-white/85">{t("admin.pages.coursesSub", { count: filtered.length })}</p>
              </div>
              <button onClick={() => setShowWizard(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-md transition hover:scale-[1.03] hover:shadow-xl">
                <Plus className="size-4" /> {t("admin.pages.newCourse")}
              </button>
            </div>
          </div>

          {/* Gradient stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Courses",  value: courses.length, icon: BookOpen,      gradient: "from-violet-500 via-purple-500 to-fuchsia-500" },
              { label: "Active",         value: courses.filter(c => c.status === "Active").length, icon: Check,    gradient: "from-emerald-500 via-teal-500 to-cyan-500" },
              { label: "Draft",          value: courses.filter(c => c.status === "Draft").length,  icon: FileText, gradient: "from-amber-500 via-orange-500 to-rose-500" },
              { label: "Total Students", value: courses.reduce((s, c) => s + c.students, 0), icon: GraduationCap,  gradient: "from-blue-500 via-sky-500 to-indigo-500" },
            ].map((s, i) => (
              <div key={s.label} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 text-white shadow-md ring-1 ring-white/20 transition animate-fade-in-up hover:shadow-xl hover:scale-[1.03]`} style={{ animationDelay: `${i * 60}ms` }}>
                <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur transition group-hover:scale-110 group-hover:rotate-6">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search by title, subject, or teacher..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-80 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${statusFilter === s ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            {filtered.map((c, i) => (
              <div key={c.id} className="group flex flex-col rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden transition hover:shadow-md hover:scale-[1.01] animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}>
                <div className={`h-2 w-full ${c.accentClass}`} />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)} className="rounded-md p-1 text-ink-400 opacity-0 group-hover:opacity-100 hover:bg-ink-100">
                        <MoreHorizontal className="size-3.5" />
                      </button>
                      {menuOpen === c.id && (
                        <div className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                          <button onClick={() => { setViewTarget(c); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View</button>
                          <button onClick={() => { setEditTarget(c); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Pencil className="size-3.5" />Edit</button>
                          <button onClick={() => { setDeleteTarget(c); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-bold leading-snug text-ink-900">{c.title}</h3>
                  <span className="mt-1 text-xs text-ink-500">{c.subject} · {c.level}</span>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="size-6 rounded-full bg-violet-100 flex items-center justify-center ring-2 ring-violet-100">
                      <User className="size-4 text-violet-600" />
                    </div>
                    <span className="text-xs text-ink-600 truncate">{c.teacher}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-500">
                    <span className="flex items-center gap-1"><Users className="size-3.5" />{c.students}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" />{c.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen className="size-3.5" />{c.modules} modules</span>
                  </div>

                  {c.rating > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`size-3 ${n <= Math.round(c.rating) ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                      ))}
                      <span className="ml-1 text-xs font-semibold text-ink-700">{c.rating}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex gap-2">
                    <button onClick={() => setEditTarget(c)} className="flex-1 rounded-xl border border-ink-200 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 hover:border-violet-300 hover:text-violet-700 transition">Edit</button>
                    <button onClick={() => setViewTarget(c)} className="flex-1 rounded-xl bg-violet-600 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition">View</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-4 py-16 text-center text-sm text-ink-400">No courses match your search.</p>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {viewTarget && <CourseDetail course={viewTarget} onClose={() => setViewTarget(null)} onEdit={c => { setViewTarget(null); setEditTarget(c); }} />}
      {showWizard && <NewCourseWizard onClose={() => setShowWizard(false)} onAdd={handleAdd} nextId={courses.length + 1} />}
      {editTarget && <EditCourseModal course={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Course</h3>
            <p className="mt-1 text-sm text-ink-500">Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in-up">
          <Check className="size-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ──────── Course Detail ──────── */
function CourseDetail({ course: c, onClose, onEdit }: { course: Course; onClose: () => void; onEdit: (c: Course) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className={`h-3 w-full ${c.accentClass}`} />
        <div className="sticky top-3 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-ink-900">Course Details</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-5 text-ink-500" /></button>
        </div>
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[c.status]}`}>{c.status}</span>
              <h3 className="mt-2 text-xl font-bold text-ink-900">{c.title}</h3>
              <p className="text-sm text-ink-500">{c.subject} · {c.level}</p>
            </div>
            {c.rating > 0 && (
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`size-3.5 ${n <= Math.round(c.rating) ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-ink-700">{c.rating} / 5.0</span>
              </div>
            )}
          </div>

          <p className="mb-5 text-sm text-ink-700">{c.description}</p>

          <div className="mb-5 flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
            <img src={c.teacherAvatar} alt={c.teacher} className="size-11 rounded-full object-cover ring-2 ring-violet-200" />
            <div>
              <p className="text-xs text-ink-400">Instructor</p>
              <p className="text-sm font-semibold text-ink-900">{c.teacher}</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            {[
              { label: "Students", value: c.students, icon: Users },
              { label: "Duration", value: c.duration, icon: Clock },
              { label: "Modules", value: c.modules, icon: BookOpen },
              { label: "Start Date", value: c.startDate, icon: Calendar },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><item.icon className="size-4" /></span>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-ink-400">{item.label}</p>
                  <p className="text-sm font-bold text-ink-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-ink-400"><ListChecks className="size-3.5" />Syllabus</h4>
            <ol className="space-y-2">
              {c.syllabus.map((s, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{i+1}</span>
                  <p className="text-sm font-medium text-ink-700">{s}</p>
                </li>
              ))}
            </ol>
          </div>

          <button onClick={() => onEdit(c)} className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Multi-Step New Course Wizard ──────── */
const STEPS = ["Basics", "Instructor", "Schedule", "Syllabus", "Review"];

function NewCourseWizard({ onClose, onAdd, nextId }: { onClose: () => void; onAdd: (c: Course) => void; nextId: number }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", subject: SUBJECTS[0], description: "", level: "Beginner" as Course["level"],
    teacher: TEACHERS[0].name, teacherAvatar: TEACHERS[0].avatar,
    duration: "", modules: 0, startDate: "",
    syllabus: [] as string[], syllabusInput: "",
    status: "Draft" as Course["status"],
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })); }
  function selectTeacher(name: string) {
    const t = TEACHERS.find(x => x.name === name)!;
    setForm(f => ({ ...f, teacher: t.name, teacherAvatar: t.avatar }));
  }
  function addSyllabus() {
    if (!form.syllabusInput.trim()) return;
    setForm(f => ({ ...f, syllabus: [...f.syllabus, f.syllabusInput.trim()], syllabusInput: "" }));
  }
  function removeSyllabus(i: number) { setForm(f => ({ ...f, syllabus: f.syllabus.filter((_, idx) => idx !== i) })); }

  const stepValid = [
    form.title.trim() && form.subject && form.description.trim(),
    !!form.teacher,
    form.duration.trim() && form.modules > 0 && form.startDate,
    form.syllabus.length > 0,
    true,
  ];

  function next() { if (stepValid[step] && step < STEPS.length - 1) setStep(s => s + 1); }
  function prev() { if (step > 0) setStep(s => s - 1); }

  function submit() {
    onAdd({
      id: `c${nextId}`, title: form.title, subject: form.subject, description: form.description, level: form.level,
      teacher: form.teacher, teacherAvatar: form.teacherAvatar,
      students: 0, duration: form.duration, modules: form.modules, rating: 0, status: form.status,
      accentClass: ACCENTS[nextId % ACCENTS.length], syllabus: form.syllabus, startDate: form.startDate,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-xl animate-scale-in">
        {/* Header + stepper */}
        <div className="border-b border-ink-100 px-6 pt-6 pb-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900">Create New Course</h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={`flex flex-col items-center ${i <= step ? "text-violet-600" : "text-ink-400"}`}>
                  <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition ${i < step ? "bg-violet-600 text-white" : i === step ? "bg-violet-600 text-white ring-4 ring-violet-100" : "bg-ink-100 text-ink-500"}`}>
                    {i < step ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span className="mt-1 text-[10px] font-semibold">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-violet-600" : "bg-ink-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6 min-h-[280px]">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Course Title"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Algebra II" className={fieldCls} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Subject"><select value={form.subject} onChange={e => set("subject", e.target.value)} className={fieldCls}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Level"><select value={form.level} onChange={e => set("level", e.target.value as Course["level"])} className={fieldCls}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
              </div>
              <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Brief course overview..." className={`${fieldCls} h-auto py-2`} /></Field>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-700">Choose an instructor for this course</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TEACHERS.map(t => (
                  <button key={t.name} type="button" onClick={() => selectTeacher(t.name)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${form.teacher === t.name ? "border-violet-600 bg-violet-50" : "border-ink-200 hover:border-violet-300"}`}>
                    <img src={t.avatar} alt={t.name} className="size-10 rounded-full object-cover" />
                    <span className="text-sm font-semibold text-ink-900">{t.name}</span>
                    {form.teacher === t.name && <Check className="ml-auto size-5 text-violet-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Duration"><input value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="e.g. 12 weeks" className={fieldCls} /></Field>
                <Field label="Number of Modules"><input type="number" min={1} value={form.modules || ""} onChange={e => set("modules", parseInt(e.target.value) || 0)} className={fieldCls} /></Field>
              </div>
              <Field label="Start Date"><input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={fieldCls} /></Field>
              <Field label="Status"><select value={form.status} onChange={e => set("status", e.target.value as Course["status"])} className={fieldCls}><option>Draft</option><option>Active</option></select></Field>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-700">Add syllabus topics ({form.syllabus.length})</p>
              <div className="flex gap-2">
                <input value={form.syllabusInput} onChange={e => set("syllabusInput", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSyllabus())}
                  placeholder="e.g. Introduction to functions" className={fieldCls} />
                <button onClick={addSyllabus} className="rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700">Add</button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {form.syllabus.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{i+1}</span>
                    <span className="flex-1 text-sm text-ink-700">{s}</span>
                    <button onClick={() => removeSyllabus(i)} className="rounded p-1 text-ink-400 hover:bg-red-100 hover:text-red-600"><X className="size-3.5" /></button>
                  </div>
                ))}
                {form.syllabus.length === 0 && <p className="py-4 text-center text-xs text-ink-400">No topics added yet</p>}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3 text-sm">
              <p className="mb-3 text-xs font-semibold uppercase text-ink-400">Review &amp; Confirm</p>
              <ReviewItem icon={Tag} label="Title" value={form.title} />
              <ReviewItem icon={BookOpen} label="Subject / Level" value={`${form.subject} · ${form.level}`} />
              <ReviewItem icon={GraduationCap} label="Instructor" value={form.teacher} />
              <ReviewItem icon={Clock} label="Duration / Modules" value={`${form.duration} · ${form.modules} modules`} />
              <ReviewItem icon={Calendar} label="Start Date" value={form.startDate} />
              <ReviewItem icon={ListChecks} label="Syllabus" value={`${form.syllabus.length} topics`} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={prev} disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 disabled:opacity-40 hover:bg-ink-100">
            <ChevronLeft className="size-4" /> Back
          </button>
          <span className="text-xs text-ink-500">Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={!stepValid[step]}
              className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-violet-700">
              Next <ChevronRight className="size-4" />
            </button>
          ) : (
            <button onClick={submit} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Create Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}

function ReviewItem({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Icon className="size-4" /></span>
      <div>
        <p className="text-[10px] font-semibold uppercase text-ink-400">{label}</p>
        <p className="text-sm font-semibold text-ink-900">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ──────── Edit Course Modal ──────── */
function EditCourseModal({ course, onClose, onSave }: { course: Course; onClose: () => void; onSave: (c: Course) => void }) {
  const [form, setForm] = useState<Course>({ ...course });
  function set<K extends keyof Course>(k: K, v: Course[K]) { setForm(f => ({ ...f, [k]: v })); }
  function selectTeacher(name: string) {
    const t = TEACHERS.find(x => x.name === name)!;
    setForm(f => ({ ...f, teacher: t.name, teacherAvatar: t.avatar }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Edit Course</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
        </div>
        <div className="space-y-4">
          <Field label="Course Title"><input value={form.title} onChange={e => set("title", e.target.value)} className={fieldCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject"><select value={form.subject} onChange={e => set("subject", e.target.value)} className={fieldCls}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Level"><select value={form.level} onChange={e => set("level", e.target.value as Course["level"])} className={fieldCls}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={`${fieldCls} h-auto py-2`} /></Field>
          <Field label="Instructor"><select value={form.teacher} onChange={e => selectTeacher(e.target.value)} className={fieldCls}>{TEACHERS.map(t => <option key={t.name}>{t.name}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration"><input value={form.duration} onChange={e => set("duration", e.target.value)} className={fieldCls} /></Field>
            <Field label="Modules"><input type="number" value={form.modules} onChange={e => set("modules", parseInt(e.target.value) || 0)} className={fieldCls} /></Field>
          </div>
          <Field label="Status"><select value={form.status} onChange={e => set("status", e.target.value as Course["status"])} className={fieldCls}><option>Active</option><option>Draft</option><option>Archived</option></select></Field>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
