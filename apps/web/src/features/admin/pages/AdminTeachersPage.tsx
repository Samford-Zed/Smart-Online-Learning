import { useState, useEffect } from "react";
import {
  Search, Plus, MoreHorizontal, X, Mail, Phone, ChevronLeft, ChevronRight,
  Eye, Pencil, Trash2, UsersRound, BookOpen, Award, Clock, GraduationCap, Check, AlertTriangle, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { useT } from "../../../i18n/I18nProvider";
import { api } from "../../../services/api";

type Teacher = {
  id: string; name: string; avatar: string; teacherId: string; subject: string;
  email: string; phone: string; classes: number; students: number;
  status: "Active" | "On Leave" | "Inactive";
  classAssignments: string[]; qualification: string; experience: string; joinDate: string;
};

const INITIAL_TEACHERS: Teacher[] = [
  { id: "t1", name: "Dr. Alice Monroe",   avatar: "https://i.pravatar.cc/80?img=49", teacherId: "TCH10012", subject: "Biology",     email: "alice@school.edu",   phone: "+1 555-0101", classes: 4, students: 120, status: "Active",   classAssignments: ["10-A","10-B","11-A","12-C"], qualification: "PhD Biology", experience: "12 years", joinDate: "Sep 2012" },
  { id: "t2", name: "Mr. James Okafor",   avatar: "https://i.pravatar.cc/80?img=11", teacherId: "TCH10023", subject: "Mathematics", email: "james@school.edu",   phone: "+1 555-0102", classes: 5, students: 145, status: "Active",   classAssignments: ["9-A","9-B","10-A","11-B","12-A"], qualification: "MSc Mathematics", experience: "8 years", joinDate: "Jan 2016" },
  { id: "t3", name: "Ms. Clara Zhang",    avatar: "https://i.pravatar.cc/80?img=45", teacherId: "TCH10031", subject: "Physics",     email: "clara@school.edu",   phone: "+1 555-0103", classes: 3, students: 98,  status: "On Leave", classAssignments: ["11-A","11-B","12-A"], qualification: "MSc Physics", experience: "6 years", joinDate: "Mar 2018" },
  { id: "t4", name: "Mr. David Mensah",   avatar: "https://i.pravatar.cc/80?img=14", teacherId: "TCH10044", subject: "Chemistry",   email: "david@school.edu",   phone: "+1 555-0104", classes: 4, students: 110, status: "Active",   classAssignments: ["10-A","10-C","11-A","12-B"], qualification: "MSc Chemistry", experience: "10 years", joinDate: "Aug 2014" },
  { id: "t5", name: "Ms. Fatima Hassan",  avatar: "https://i.pravatar.cc/80?img=41", teacherId: "TCH10055", subject: "Literature",  email: "fatima@school.edu",  phone: "+1 555-0105", classes: 3, students: 95,  status: "Active",   classAssignments: ["9-A","10-B","11-C"], qualification: "MA English Literature", experience: "5 years", joinDate: "Jun 2019" },
  { id: "t6", name: "Mr. Leo Fernandez",  avatar: "https://i.pravatar.cc/80?img=6",  teacherId: "TCH10066", subject: "History",     email: "leo@school.edu",     phone: "+1 555-0106", classes: 2, students: 72,  status: "Inactive", classAssignments: ["9-B","10-A"], qualification: "BA History", experience: "3 years", joinDate: "Feb 2021" },
];

const STATUS_COLORS: Record<Teacher["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700", "On Leave": "bg-amber-50 text-amber-700", Inactive: "bg-ink-100 text-ink-500",
};

const STAT_CARDS = [
  { label: "Total Teachers", icon: UsersRound,    gradient: "from-violet-500 via-purple-500 to-fuchsia-500", key: "total" },
  { label: "Active",         icon: Check,         gradient: "from-emerald-500 via-teal-500 to-cyan-500",     key: "active" },
  { label: "On Leave",       icon: Clock,         gradient: "from-amber-500 via-orange-500 to-rose-500",     key: "leave" },
  { label: "Total Students", icon: GraduationCap, gradient: "from-blue-500 via-sky-500 to-cyan-500",         key: "students" },
];

const CLASSES = ["9-A","9-B","10-A","10-B","10-C","11-A","11-B","11-C","12-A","12-B","12-C"];
const SUBJECTS = ["Biology","Mathematics","Physics","Chemistry","Literature","History","Geography","Computer Science","Art","Music"];
const PAGE_SIZE = 5;

export default function AdminTeachersPage() {
  const { t } = useT();
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);
  const [viewTarget, setViewTarget] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  // Fetch real teachers from backend
  useEffect(() => {
    async function loadTeachers() {
      try {
        setLoading(true);
        const response = await api.getAdminUsers({ role: "teacher" });
        if (response && response.data && response.data.users && Array.isArray(response.data.users)) {
          const apiTeachers: Teacher[] = response.data.users.map((u: any) => ({
            id: String(u.id),
            name: u.name || u.full_name || "Unknown",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || u.full_name || u.id}`,
            teacherId: `TCH${String(u.id).padStart(5, "0")}`,
            subject: u.grade_level ? `Grade ${u.grade_level}` : "General",
            email: u.email || "",
            phone: u.phone || "+251 9XX XXX XXX",
            classes: Math.floor(Math.random() * 5) + 1,
            students: Math.floor(Math.random() * 100) + 20,
            status: u.is_active === false ? "Inactive" : "Active",
            classAssignments: ["9-A", "10-B", "11-C"].slice(0, Math.floor(Math.random() * 3) + 1),
            qualification: u.grade_level ? "Certified Teacher" : "Teacher",
            experience: `${Math.floor(Math.random() * 10) + 2} years`,
            joinDate: new Date(u.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          }));
          setTeachers(apiTeachers);
        }
      } catch (error) {
        console.error("Failed to load teachers:", error);
        // Keep using mock data as fallback
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, []);

  const subjects = ["All", ...Array.from(new Set(teachers.map(t => t.subject)))];

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.teacherId.toLowerCase().includes(q);
    const matchSubject = subjectFilter === "All" || t.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statValues: Record<string, number> = {
    total: teachers.length, active: teachers.filter(t => t.status === "Active").length,
    leave: teachers.filter(t => t.status === "On Leave").length,
    students: teachers.reduce((sum, t) => sum + t.students, 0),
  };

  function handleDelete() {
    if (!deleteTarget) return;
    setTeachers(ts => ts.filter(t => t.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} has been removed`);
    setDeleteTarget(null);
  }

  function handleAdd(t: Teacher) {
    setTeachers(ts => [...ts, t]);
    setShowAdd(false);
    showToast(`${t.name} added successfully`);
  }

  function handleEdit(updated: Teacher) {
    setTeachers(ts => ts.map(t => t.id === updated.id ? updated : t));
    setEditTarget(null);
    showToast(`${updated.name} updated successfully`);
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
                <h1 className="text-2xl font-bold tracking-tight text-white">{t("admin.pages.teachers")}</h1>
                <p className="mt-1 text-sm text-white/85">{t("admin.pages.teachersSub", { count: filtered.length })}</p>
              </div>
              <button onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-md transition hover:scale-[1.03] hover:shadow-xl">
                <Plus className="size-4" /> {t("admin.pages.addTeacher")}
              </button>
            </div>
          </div>

          {/* Gradient stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STAT_CARDS.map((s, i) => (
              <div key={s.key} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 text-white shadow-md ring-1 ring-white/20 transition animate-fade-in-up hover:shadow-xl hover:scale-[1.03]`}
                style={{ animationDelay: `${i * 60}ms` }}>
                <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{statValues[s.key]}</p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur transition group-hover:scale-110 group-hover:rotate-6">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="mb-4 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search teachers..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-64 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-violet-400">
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Classes</th>
                    <th className="px-4 py-3 text-left">Students</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(t => (
                    <tr key={t.id} onClick={() => setViewTarget(t)} className="border-b border-ink-50 last:border-0 transition hover:bg-violet-50/30 cursor-pointer">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={t.avatar} alt={t.name} className="size-9 rounded-full object-cover ring-2 ring-violet-100" />
                          <p className="font-semibold text-ink-900">{t.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-ink-500">{t.teacherId}</td>
                      <td className="px-4 py-3.5"><span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">{t.subject}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5 text-xs text-ink-500">
                          <span className="flex items-center gap-1"><Mail className="size-3" />{t.email}</span>
                          <span className="flex items-center gap-1"><Phone className="size-3" />{t.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-ink-900">{t.classes}</td>
                      <td className="px-4 py-3.5 text-ink-700">{t.students}</td>
                      <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === t.id ? null : t.id)} className="rounded-md p-1 text-ink-400 hover:bg-ink-100"><MoreHorizontal className="size-4" /></button>
                          {menuOpen === t.id && (
                            <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                              <button onClick={() => { setViewTarget(t); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Details</button>
                              <button onClick={() => { setEditTarget(t); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Pencil className="size-3.5" />Edit Teacher</button>
                              <button onClick={() => { setDeleteTarget(t); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-ink-400">No teachers found.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
              <span>Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                {Array.from({length: totalPages}, (_,i) => (
                  <button key={i} onClick={() => setPage(i+1)} className={`size-7 rounded-lg text-xs font-semibold ${page===i+1?"bg-violet-600 text-white":"hover:bg-ink-100 text-ink-600"}`}>{i+1}</button>
                ))}
                <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* View detail slide-over */}
      {viewTarget && <TeacherDetail teacher={viewTarget} onClose={() => setViewTarget(null)} onEdit={t => { setViewTarget(null); setEditTarget(t); }} />}
      {/* Add modal */}
      {showAdd && <AddTeacherModal onClose={() => setShowAdd(false)} onAdd={handleAdd} nextId={teachers.length + 1} />}
      {/* Edit modal */}
      {editTarget && <EditTeacherModal teacher={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </span>
            <h3 className="text-lg font-bold text-ink-900">Delete Teacher</h3>
            <p className="mt-1 text-sm text-ink-500">Are you sure you want to remove <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in-up">
          <Check className="size-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ──────── Teacher Detail Slide-over ──────── */
function TeacherDetail({ teacher: t, onClose, onEdit }: { teacher: Teacher; onClose: () => void; onEdit: (t: Teacher) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-ink-900">Teacher Details</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-5 text-ink-500" /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img src={t.avatar} alt={t.name} className="size-16 rounded-full object-cover ring-4 ring-violet-100" />
            <div>
              <h3 className="text-xl font-bold text-ink-900">{t.name}</h3>
              <p className="text-sm text-ink-500">{t.subject} Teacher</p>
              <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[t.status]}`}>{t.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Teacher ID", value: t.teacherId, icon: Award },
              { label: "Qualification", value: t.qualification, icon: GraduationCap },
              { label: "Experience", value: t.experience, icon: Clock },
              { label: "Joined", value: t.joinDate, icon: BookOpen },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><item.icon className="size-4" /></span>
                <div><p className="text-[10px] font-semibold uppercase text-ink-400">{item.label}</p><p className="text-sm font-semibold text-ink-900">{item.value}</p></div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="mb-2 text-xs font-bold uppercase text-ink-400">Contact</h4>
            <div className="space-y-2 text-sm text-ink-700">
              <p className="flex items-center gap-2"><Mail className="size-4 text-ink-400" />{t.email}</p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-ink-400" />{t.phone}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="mb-2 text-xs font-bold uppercase text-ink-400">Class Assignments</h4>
            <div className="flex flex-wrap gap-2">
              {t.classAssignments.map(c => (
                <span key={c} className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{c}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl bg-blue-50 p-4 text-center"><p className="text-2xl font-bold text-blue-700">{t.classes}</p><p className="text-xs font-semibold text-blue-500">Classes</p></div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center"><p className="text-2xl font-bold text-emerald-700">{t.students}</p><p className="text-xs font-semibold text-emerald-500">Students</p></div>
          </div>

          <button onClick={() => onEdit(t)} className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
            Edit Teacher
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Add Teacher Modal ──────── */
function AddTeacherModal({ onClose, onAdd, nextId }: { onClose: () => void; onAdd: (t: Teacher) => void; nextId: number }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: SUBJECTS[0], qualification: "", experience: "", selectedClasses: [] as string[] });
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function toggleClass(c: string) { setForm(f => ({ ...f, selectedClasses: f.selectedClasses.includes(c) ? f.selectedClasses.filter(x => x !== c) : [...f.selectedClasses, c] })); }
  const valid = form.name.trim() && form.email.trim() && form.subject;

  function submit() {
    if (!valid) return;
    onAdd({
      id: `t${nextId}`, name: form.name, avatar: `https://i.pravatar.cc/80?img=${20 + nextId}`, teacherId: `TCH${10000 + nextId}`,
      subject: form.subject, email: form.email, phone: form.phone, classes: form.selectedClasses.length, students: 0,
      status: "Active", classAssignments: form.selectedClasses, qualification: form.qualification, experience: form.experience, joinDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Add New Teacher</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
        </div>
        <div className="flex flex-col gap-4">
          {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Qualification","qualification","text"],["Experience","experience","text"]].map(([label,key,type]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">{label}</span>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={label}
                className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
          ))}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-700">Subject</span>
            <select value={form.subject} onChange={e => set("subject", e.target.value)}
              className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div>
            <span className="text-xs font-semibold text-ink-700">Assign Classes &amp; Sections</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {CLASSES.map(c => (
                <button key={c} type="button" onClick={() => toggleClass(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${form.selectedClasses.includes(c) ? "bg-violet-600 text-white" : "border border-ink-200 bg-white text-ink-600 hover:bg-violet-50"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
          <button onClick={submit} disabled={!valid} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">Add Teacher</button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Edit Teacher Modal ──────── */
function EditTeacherModal({ teacher, onClose, onSave }: { teacher: Teacher; onClose: () => void; onSave: (t: Teacher) => void }) {
  const [form, setForm] = useState({ ...teacher, selectedClasses: [...teacher.classAssignments] });
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function toggleClass(c: string) { setForm(f => ({ ...f, selectedClasses: f.selectedClasses.includes(c) ? f.selectedClasses.filter(x => x !== c) : [...f.selectedClasses, c] })); }

  function submit() {
    onSave({ ...form, classAssignments: form.selectedClasses, classes: form.selectedClasses.length });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Edit Teacher</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
        </div>
        <div className="flex flex-col gap-4">
          {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Qualification","qualification","text"],["Experience","experience","text"]].map(([label,key,type]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">{label}</span>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
          ))}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-700">Subject</span>
            <select value={form.subject} onChange={e => set("subject", e.target.value)}
              className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-700">Status</span>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400">
              <option>Active</option><option>On Leave</option><option>Inactive</option>
            </select>
          </label>
          <div>
            <span className="text-xs font-semibold text-ink-700">Assign Classes &amp; Sections</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {CLASSES.map(c => (
                <button key={c} type="button" onClick={() => toggleClass(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${form.selectedClasses.includes(c) ? "bg-violet-600 text-white" : "border border-ink-200 bg-white text-ink-600 hover:bg-violet-50"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
          <button onClick={submit} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
