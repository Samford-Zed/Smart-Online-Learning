import { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Filter, MoreHorizontal, X, ChevronLeft, ChevronRight, Eye, Edit2, Trash2,
  Ban, Check, Mail, Phone, MapPin, Users as UsersIcon, GraduationCap, BookOpen, Award,
  AlertTriangle, User, Calendar, CheckCircle2, Pause, UserPlus, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type StudentStatus = "Active" | "Inactive" | "Suspended";

type Student = {
  id: string;
  name: string;
  avatar: string;
  studentId: string;
  grade: string;
  section: string;
  subject: string;
  email: string;
  phone: string;
  address: string;
  parent: string;
  parentPhone: string;
  dob: string;
  joinDate: string;
  gpa: number;
  attendance: number;
  status: StudentStatus;
};

const INITIAL: Student[] = [
  { id: "s1", name: "Evelyn Harper",  avatar: "https://i.pravatar.cc/120?img=44", studentId: "PRE43178", grade: "Grade 10", section: "A", subject: "Science",    email: "evelyn@school.edu",  phone: "+1 555-0101", address: "12 Oak St., Springfield",   parent: "Margaret Harper", parentPhone: "+1 555-0100", dob: "2008-03-12", joinDate: "2022-09-01", gpa: 3.9, attendance: 98, status: "Active" },
  { id: "s2", name: "Diana Plenty",   avatar: "https://i.pravatar.cc/120?img=36", studentId: "PRE43174", grade: "Grade 11", section: "B", subject: "Mathematics", email: "diana@school.edu",   phone: "+1 555-0102", address: "45 Maple Ave., Riverside",  parent: "Robert Plenty",   parentPhone: "+1 555-0103", dob: "2007-07-22", joinDate: "2021-09-01", gpa: 3.7, attendance: 95, status: "Active" },
  { id: "s3", name: "John Millar",    avatar: "https://i.pravatar.cc/120?img=15", studentId: "PRE43187", grade: "Grade 10", section: "A", subject: "History",     email: "john@school.edu",    phone: "+1 555-0104", address: "88 Pine Rd., Lakeside",     parent: "Sarah Millar",    parentPhone: "+1 555-0105", dob: "2008-11-05", joinDate: "2022-09-01", gpa: 3.6, attendance: 86, status: "Active" },
  { id: "s4", name: "Sofia Martinez", avatar: "https://i.pravatar.cc/120?img=47", studentId: "PRE43201", grade: "Grade 9",  section: "C", subject: "Literature",  email: "sofia@school.edu",   phone: "+1 555-0106", address: "9 Cedar Ln., Eastwood",     parent: "Carlos Martinez", parentPhone: "+1 555-0107", dob: "2009-05-17", joinDate: "2023-09-01", gpa: 3.8, attendance: 91, status: "Active" },
  { id: "s5", name: "Noah Williams",  avatar: "https://i.pravatar.cc/120?img=12", studentId: "PRE43195", grade: "Grade 12", section: "A", subject: "Physics",     email: "noah@school.edu",    phone: "+1 555-0108", address: "3 Birch Ct., Hillcrest",    parent: "James Williams",  parentPhone: "+1 555-0109", dob: "2006-02-28", joinDate: "2020-09-01", gpa: 3.5, attendance: 77, status: "Inactive" },
  { id: "s6", name: "Amara Osei",     avatar: "https://i.pravatar.cc/120?img=23", studentId: "PRE43202", grade: "Grade 9",  section: "A", subject: "Art",         email: "amara@school.edu",   phone: "+1 555-0110", address: "17 Elm Blvd., Westfield",   parent: "Kofi Osei",       parentPhone: "+1 555-0111", dob: "2009-09-09", joinDate: "2023-09-01", gpa: 4.0, attendance: 100, status: "Active" },
  { id: "s7", name: "Luca Bianchi",   avatar: "https://i.pravatar.cc/120?img=8",  studentId: "PRE43211", grade: "Grade 11", section: "B", subject: "Chemistry",   email: "luca@school.edu",    phone: "+1 555-0112", address: "22 Willow Way, Newtown",    parent: "Marco Bianchi",   parentPhone: "+1 555-0113", dob: "2007-12-14", joinDate: "2021-09-01", gpa: 3.4, attendance: 86, status: "Active" },
  { id: "s8", name: "Priya Sharma",   avatar: "https://i.pravatar.cc/120?img=38", studentId: "PRE43219", grade: "Grade 10", section: "C", subject: "Biology",     email: "priya@school.edu",   phone: "+1 555-0114", address: "5 Rose Dr., Sunnybrook",    parent: "Ravi Sharma",     parentPhone: "+1 555-0115", dob: "2008-06-30", joinDate: "2022-09-01", gpa: 3.9, attendance: 64, status: "Suspended" },
];

const STATUS_META: Record<StudentStatus, { bg: string; text: string; dot: string }> = {
  Active:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Inactive:  { bg: "bg-ink-100",    text: "text-ink-600",     dot: "bg-ink-400" },
  Suspended: { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500" },
};

const GRADES = ["All","Grade 9","Grade 10","Grade 11","Grade 12"];
const SECTIONS = ["A","B","C"];
const PAGE_SIZE = 6;

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | StudentStatus>("All");
  const [page, setPage] = useState(1);
  const [viewTarget, setViewTarget] = useState<Student | null>(null);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2400); }

  // Load students from API
  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const response = await api.getAdminUsers({ role: 'student', limit: 1000 });
      if (response.success) {
        // Transform backend data to frontend format
        const transformed = response.data.users.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
          studentId: u.student_id || `PRE${String(u.id).padStart(5, '0')}`,
          grade: u.grade_level ? `Grade ${u.grade_level}` : 'Grade 9',
          section: u.section || 'A',
          subject: u.subject || 'Science',
          email: u.email,
          phone: u.phone || '',
          address: u.address || '',
          parent: u.parent_name || '',
          parentPhone: u.parent_phone || '',
          dob: u.date_of_birth || '',
          joinDate: u.created_at?.split('T')[0] || new Date().toISOString().slice(0,10),
          gpa: u.gpa || 3.0,
          attendance: u.attendance || 100,
          status: (u.status || 'Active') as StudentStatus,
        }));
        setStudents(transformed);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
      showToast("Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => students.filter(s => {
    const q = search.toLowerCase();
    if (q && !s.name.toLowerCase().includes(q) && !s.studentId.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q) && !s.parent.toLowerCase().includes(q)) return false;
    if (gradeFilter !== "All" && s.grade !== gradeFilter) return false;
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    return true;
  }), [students, search, gradeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function addStudent(s: Student) { setStudents(ss => [s, ...ss]); setShowAdd(false); showToast(`${s.name} added`); }
  function updateStudent(s: Student) { setStudents(ss => ss.map(x => x.id === s.id ? s : x)); setEditTarget(null); setViewTarget(s); showToast(`${s.name} updated`); }
  function changeStatus(id: string, status: StudentStatus) {
    setStudents(ss => ss.map(s => s.id === id ? { ...s, status } : s));
    if (viewTarget?.id === id) setViewTarget(v => v ? { ...v, status } : v);
    showToast(`Student ${status.toLowerCase()}`);
  }
  function removeStudent() {
    if (!deleteTarget) return;
    setStudents(ss => ss.filter(s => s.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} removed`);
    setDeleteTarget(null); setViewTarget(null);
  }

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === "Active").length,
    inactive: students.filter(s => s.status === "Inactive").length,
    suspended: students.filter(s => s.status === "Suspended").length,
  };

  const STAT_CARDS = [
    { label: "Total Students", value: stats.total,     icon: UsersIcon,    gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Active",         value: stats.active,    icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { label: "Inactive",       value: stats.inactive,  icon: Pause,        gradient: "from-ink-500 to-ink-400" },
    { label: "Suspended",      value: stats.suspended, icon: Ban,          gradient: "from-red-500 to-rose-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Students</h1>
              <p className="text-sm text-ink-500">{filtered.length} of {stats.total} students</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-100">
              <UserPlus className="size-4" /> Add Student
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
          <div className="mb-4 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search by name, ID, email, parent..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-80 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex items-center gap-1.5">
              <Filter className="size-4 text-ink-400" />
              {GRADES.map(g => (
                <button key={g} onClick={() => { setGradeFilter(g); setPage(1); }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${gradeFilter === g ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {g}
                </button>
              ))}
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as "All" | StudentStatus); setPage(1); }}
              className="h-8 rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 outline-none">
              <option value="All">All Statuses</option>
              {(Object.keys(STATUS_META) as StudentStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">GPA</th>
                    <th className="px-4 py-3 text-left">Attendance</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(s => (
                    <tr key={s.id} onClick={() => setViewTarget(s)}
                      className="border-b border-ink-50 last:border-0 cursor-pointer transition hover:bg-violet-50/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={s.avatar} alt={s.name} className="size-9 rounded-full bg-surface-100 object-cover ring-2 ring-violet-100" />
                          <div>
                            <p className="font-semibold text-ink-900">{s.name}</p>
                            <p className="text-xs text-ink-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-ink-500">{s.studentId}</td>
                      <td className="px-4 py-3.5 text-xs text-ink-700">{s.grade}-{s.section}</td>
                      <td className="px-4 py-3.5">
                        <span className={`font-bold ${s.gpa >= 3.8 ? "text-emerald-600" : s.gpa >= 3.5 ? "text-violet-700" : s.gpa >= 3.0 ? "text-amber-600" : "text-red-600"}`}>{s.gpa.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                            <div className={`h-full transition-all ${s.attendance >= 90 ? "bg-emerald-500" : s.attendance >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.attendance}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-ink-700">{s.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_META[s.status].bg} ${STATUS_META[s.status].text}`}>
                          <span className={`size-1.5 rounded-full ${STATUS_META[s.status].dot}`} />{s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <button onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)} className="rounded-md p-1 text-ink-400 hover:bg-ink-100">
                            <MoreHorizontal className="size-4" />
                          </button>
                          {menuOpen === s.id && (
                            <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                              <button onClick={() => { setViewTarget(s); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Profile</button>
                              <button onClick={() => { setEditTarget(s); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Edit2 className="size-3.5" />Edit Info</button>
                              <div className="my-1 border-t border-ink-100" />
                              <p className="px-3 pt-1 text-[9px] font-bold uppercase text-ink-400">Change Status</p>
                              {(Object.keys(STATUS_META) as StudentStatus[]).filter(st => st !== s.status).map(st => (
                                <button key={st} onClick={() => { changeStatus(s.id, st); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-violet-50">
                                  <span className={`size-2 rounded-full ${STATUS_META[st].dot}`} />Mark {st}
                                </button>
                              ))}
                              <div className="my-1 border-t border-ink-100" />
                              <button onClick={() => { setDeleteTarget(s); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center"><Loader2 className="mx-auto size-8 animate-spin text-violet-500" /><p className="mt-2 text-sm text-ink-400">Loading students...</p></td></tr>
                  )}
                  {!loading && paged.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-ink-400">No students match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
              <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`size-7 rounded-lg text-xs font-semibold ${page === i + 1 ? "bg-violet-600 text-white" : "hover:bg-ink-100 text-ink-600"}`}>{i + 1}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {viewTarget && !editTarget && <StudentDetail student={viewTarget} onClose={() => setViewTarget(null)} onEdit={() => setEditTarget(viewTarget)} onDelete={() => setDeleteTarget(viewTarget)} onStatusChange={(st) => changeStatus(viewTarget.id, st)} />}
      {showAdd && <StudentModal mode="create" onClose={() => setShowAdd(false)} onSave={addStudent} />}
      {editTarget && <StudentModal mode="edit" student={editTarget} onClose={() => setEditTarget(null)} onSave={updateStudent} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Student</h3>
            <p className="mt-1 text-sm text-ink-500">Delete <strong>{deleteTarget.name}</strong>? This cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={removeStudent} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
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

/* ─────────── Student Detail ─────────── */
function StudentDetail({ student: s, onClose, onEdit, onDelete, onStatusChange }: {
  student: Student; onClose: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: (st: StudentStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-6 pb-16 text-white">
          <div className="flex items-start justify-between">
            <span className={`inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur`}>
              <span className={`size-1.5 rounded-full ${STATUS_META[s.status].dot}`} />{s.status}
            </span>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>
        <div className="px-6">
          <div className="-mt-14 mb-4 flex items-end gap-4">
            <img src={s.avatar} alt={s.name} className="size-24 rounded-2xl border-4 border-white bg-surface-100 object-cover shadow-lg" />
            <div className="pb-2">
              <h2 className="text-xl font-bold text-ink-900">{s.name}</h2>
              <p className="text-xs text-ink-500 font-mono">{s.studentId}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <MetricCard icon={GraduationCap} label="Grade" value={`${s.grade.replace("Grade ","")}-${s.section}`} gradient="from-violet-500 to-fuchsia-500" />
            <MetricCard icon={Award} label="GPA" value={s.gpa.toFixed(2)} gradient="from-amber-500 to-orange-500" />
            <MetricCard icon={BookOpen} label="Attendance" value={`${s.attendance}%`} gradient="from-emerald-500 to-teal-500" />
          </div>

          {/* Contact */}
          <section className="mb-5">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wide text-ink-400">Contact</h3>
            <div className="space-y-2">
              <InfoRow icon={Mail} label="Email" value={s.email} />
              <InfoRow icon={Phone} label="Phone" value={s.phone} />
              <InfoRow icon={MapPin} label="Address" value={s.address} />
            </div>
          </section>

          {/* Parent */}
          <section className="mb-5">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wide text-ink-400">Parent / Guardian</h3>
            <div className="space-y-2">
              <InfoRow icon={User} label="Name" value={s.parent} />
              <InfoRow icon={Phone} label="Phone" value={s.parentPhone} />
            </div>
          </section>

          {/* Academic */}
          <section className="mb-5">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wide text-ink-400">Academic</h3>
            <div className="space-y-2">
              <InfoRow icon={BookOpen} label="Subject" value={s.subject} />
              <InfoRow icon={Calendar} label="Date of Birth" value={new Date(s.dob).toLocaleDateString("en-US",{ month:"long", day:"numeric", year:"numeric" })} />
              <InfoRow icon={Calendar} label="Joined" value={new Date(s.joinDate).toLocaleDateString("en-US",{ month:"long", year:"numeric" })} />
            </div>
          </section>

          {/* Status changer */}
          <section className="mb-5">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-400">Change Status</h3>
            <div className="flex gap-2">
              {(Object.keys(STATUS_META) as StudentStatus[]).map(st => (
                <button key={st} onClick={() => onStatusChange(st)}
                  className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold transition ${s.status === st ? `border-transparent ${STATUS_META[st].bg} ${STATUS_META[st].text}` : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                  {st}
                </button>
              ))}
            </div>
          </section>

          <div className="flex gap-3 pb-6">
            <button onClick={onDelete} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 className="size-4" />Delete</button>
            <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"><Edit2 className="size-4" />Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, gradient }: { icon: typeof Mail; label: string; value: string; gradient: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-sm`}>
      <Icon className="mb-1 size-4 opacity-90" />
      <p className="text-[10px] font-semibold uppercase opacity-90">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-ink-400">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

/* ─────────── Student Modal (Create/Edit) ─────────── */
const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function StudentModal({ mode, student, onClose, onSave }: {
  mode: "create" | "edit"; student?: Student; onClose: () => void; onSave: (s: Student) => void;
}) {
  const seed = student || {} as Student;
  const [form, setForm] = useState<Student>({
    id: seed.id || `s${Date.now()}`,
    name: seed.name || "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed.name || 'new'}`,
    studentId: seed.studentId || `PRE${Math.floor(Math.random()*90000)+10000}`,
    grade: seed.grade || "Grade 9",
    section: seed.section || "A",
    subject: seed.subject || "Science",
    email: seed.email || "",
    phone: seed.phone || "",
    address: seed.address || "",
    parent: seed.parent || "",
    parentPhone: seed.parentPhone || "",
    dob: seed.dob || "",
    joinDate: seed.joinDate || new Date().toISOString().slice(0,10),
    gpa: seed.gpa || 3.0,
    attendance: seed.attendance ?? 100,
    status: seed.status || "Active",
  });
  function set<K extends keyof Student>(k: K, v: Student[K]) { setForm(f => ({ ...f, [k]: v })); }
  const valid = form.name.trim() && form.email.trim() && form.studentId.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><UserPlus className="size-5" />{mode === "create" ? "Add New Student" : "Edit Student"}</h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase text-ink-400">Basic Info</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *"><input value={form.name} onChange={e => set("name", e.target.value)} className={fieldCls} /></Field>
              <Field label="Student ID *"><input value={form.studentId} onChange={e => set("studentId", e.target.value)} className={fieldCls} /></Field>
              <Field label="Email *"><input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={fieldCls} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={e => set("phone", e.target.value)} className={fieldCls} /></Field>
              <Field label="Date of Birth"><input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className={fieldCls} /></Field>
              <Field label="Address"><input value={form.address} onChange={e => set("address", e.target.value)} className={fieldCls} /></Field>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase text-ink-400">Academic</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Grade">
                <select value={form.grade} onChange={e => set("grade", e.target.value)} className={fieldCls}>
                  {GRADES.filter(g => g !== "All").map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Section">
                <select value={form.section} onChange={e => set("section", e.target.value)} className={fieldCls}>
                  {SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Subject"><input value={form.subject} onChange={e => set("subject", e.target.value)} className={fieldCls} /></Field>
              <Field label="GPA"><input type="number" step={0.1} min={0} max={4} value={form.gpa} onChange={e => set("gpa", parseFloat(e.target.value) || 0)} className={fieldCls} /></Field>
              <Field label="Attendance %"><input type="number" min={0} max={100} value={form.attendance} onChange={e => set("attendance", parseInt(e.target.value) || 0)} className={fieldCls} /></Field>
              <Field label="Status">
                <select value={form.status} onChange={e => set("status", e.target.value as StudentStatus)} className={fieldCls}>
                  {(Object.keys(STATUS_META) as StudentStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase text-ink-400">Parent / Guardian</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Parent Name"><input value={form.parent} onChange={e => set("parent", e.target.value)} className={fieldCls} /></Field>
              <Field label="Parent Phone"><input value={form.parentPhone} onChange={e => set("parentPhone", e.target.value)} className={fieldCls} /></Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!valid} className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:shadow-lg">
            {mode === "create" ? <><Plus className="size-4" />Add Student</> : <><Check className="size-4" />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
