import { useEffect, useState } from "react";
import {
  Search, Plus, X, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, Clock, XCircle,
  Users, GraduationCap, BookOpen, ClipboardList, Mail, Phone, Eye, Trash2, Check, AlertTriangle,
  User, Calendar, Award, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { useT } from "../../../i18n/I18nProvider";
import { api } from "../../../services/api";

type EnrollStatus = "approved" | "pending" | "rejected";

type Enrollment = {
  id: number; 
  student_id: number;
  student_name: string;
  student_email: string;
  subject_id: number;
  subject_name: string;
  enrollment_date: string; 
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
};

const STATUS_COLORS: Record<EnrollStatus | string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending:  "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
};

const STATUS_ICON: Record<EnrollStatus | string, React.ReactNode> = {
  approved: <CheckCircle2 className="size-3.5 text-emerald-500" />,
  pending:  <Clock className="size-3.5 text-amber-500" />,
  rejected: <XCircle className="size-3.5 text-red-500" />,
};

const PAGE_SIZE = 7;
const STATUSES: Array<"All" | EnrollStatus> = ["All", "approved", "pending", "rejected"];

export default function AdminEnrollmentsPage() {
  const { t } = useT();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | EnrollStatus>("All");
  const [page, setPage] = useState(1);
  const [showWizard, setShowWizard] = useState(false);
  const [viewTarget, setViewTarget] = useState<Enrollment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, [statusFilter]);

  async function loadEnrollments() {
    setLoading(true);
    try {
      const filters = statusFilter === "All" ? {} : { status: statusFilter.toLowerCase() };
      const response = await api.getAdminEnrollments(filters);
      if (response.success) {
        setEnrollments(response.data);
      }
    } catch (error) {
      console.error("Failed to load enrollments:", error);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = (e.student_name || '').toLowerCase().includes(q) || (e.subject_name || '').toLowerCase().includes(q) || String(e.student_id).includes(q);
    const matchStatus = statusFilter === "All" || e.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function approve(id: number) {
    try {
      const response = await api.updateAdminEnrollmentStatus(id, 'approved');
      if (response.success) {
        setEnrollments(es => es.map(e => e.id === id ? { ...e, status: "approved" } : e));
        showToast("Enrollment approved");
      }
    } catch (error) {
      console.error("Failed to approve enrollment:", error);
    }
  }
  async function reject(id: number) {
    try {
      const response = await api.updateAdminEnrollmentStatus(id, 'rejected');
      if (response.success) {
        setEnrollments(es => es.map(e => e.id === id ? { ...e, status: "rejected" } : e));
        showToast("Enrollment rejected");
      }
    } catch (error) {
      console.error("Failed to reject enrollment:", error);
    }
  }
  function handleAdd(e: Enrollment) { setEnrollments(es => [e, ...es]); setShowWizard(false); showToast(`${e.student_name} enrolled in ${e.subject_name}`); }
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const response = await api.deleteAdminEnrollment(deleteTarget.id);
      if (response.success) {
        setEnrollments(es => es.filter(e => e.id !== deleteTarget.id));
        showToast("Enrollment removed");
      }
    } catch (error) {
      console.error("Failed to delete enrollment:", error);
    }
    setDeleteTarget(null);
  }

  const statValues = {
    total: enrollments.length,
    approved: enrollments.filter(e => e.status === "approved").length,
    pending: enrollments.filter(e => e.status === "pending").length,
    rejected: enrollments.filter(e => e.status === "rejected").length,
  };

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
                <h1 className="text-2xl font-bold tracking-tight text-white">{t("admin.pages.enrollments")}</h1>
                <p className="mt-1 text-sm text-white/85">{t("admin.pages.enrollmentsSub", { count: filtered.length })}</p>
              </div>
              <button onClick={() => setShowWizard(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-md transition hover:scale-[1.03] hover:shadow-xl">
                <Plus className="size-4" /> {t("admin.pages.enrollStudent")}
              </button>
            </div>
          </div>

          {/* Gradient stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Enrollments", value: statValues.total,    icon: ClipboardList, gradient: "from-violet-500 via-purple-500 to-fuchsia-500" },
              { label: "Approved",          value: statValues.approved, icon: CheckCircle2,  gradient: "from-emerald-500 via-teal-500 to-cyan-500" },
              { label: "Pending",           value: statValues.pending,  icon: Clock,         gradient: "from-amber-500 via-orange-500 to-yellow-500" },
              { label: "Rejected",          value: statValues.rejected, icon: XCircle,       gradient: "from-rose-500 via-red-500 to-pink-500" },
            ].map((s, i) => (
              <div key={s.label} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 text-white shadow-md ring-1 ring-white/20 transition animate-fade-in-up hover:shadow-xl hover:scale-[1.03]`}
                style={{ animationDelay: `${i * 60}ms` }}>
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
          <div className="mb-4 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search student, course, or ID..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-80 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${statusFilter === s ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {s === "All" ? s : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">Enrolled</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(e => (
                    <tr key={e.id} onClick={() => setViewTarget(e)} className="border-b border-ink-50 last:border-0 hover:bg-violet-50/20 transition cursor-pointer">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-full bg-violet-100 flex items-center justify-center ring-2 ring-violet-100">
                            <User className="size-5 text-violet-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-ink-900">{e.student_name}</p>
                            <p className="text-xs text-ink-400 font-mono">ID: {e.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-ink-900">{e.subject_name}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-600">-</td>
                      <td className="px-4 py-3.5 text-xs text-ink-600">-</td>
                      <td className="px-4 py-3.5 text-xs text-ink-500">
                        {new Date(e.enrollment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[e.status]}`}>
                          {STATUS_ICON[e.status]}{e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5" onClick={ev => ev.stopPropagation()}>
                        {e.status === "pending" ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => approve(e.id)} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition">Approve</button>
                            <button onClick={() => reject(e.id)} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition">Reject</button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button onClick={() => setMenuOpen(menuOpen === e.id ? null : e.id)} className="rounded-md p-1 text-ink-400 hover:bg-ink-100"><MoreHorizontal className="size-4" /></button>
                            {menuOpen === e.id && (
                              <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                                <button onClick={() => { setViewTarget(e); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Details</button>
                                <button onClick={() => { setDeleteTarget(e); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Remove</button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-ink-400">No enrollments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
              <span>Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i+1)} className={`size-7 rounded-lg text-xs font-semibold ${page===i+1?"bg-violet-600 text-white":"hover:bg-ink-100 text-ink-600"}`}>{i+1}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {viewTarget && <EnrollmentDetail enrollment={viewTarget} onClose={() => setViewTarget(null)} onApprove={() => { approve(viewTarget.id); setViewTarget(null); }} onReject={() => { reject(viewTarget.id); setViewTarget(null); }} />}
      {showWizard && <EnrollmentWizard onClose={() => setShowWizard(false)} onAdd={handleAdd} nextId={enrollments.length + 1} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Remove Enrollment</h3>
            <p className="mt-1 text-sm text-ink-500">Remove <strong>{deleteTarget.student_name}</strong> from <strong>{deleteTarget.subject_name}</strong>?</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Remove</button>
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

/* ──────── Enrollment Detail ──────── */
function EnrollmentDetail({ enrollment: e, onClose, onApprove, onReject }: { enrollment: Enrollment; onClose: () => void; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl animate-fade-in-up" onClick={ev => ev.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-ink-900">Enrollment Details</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-5 text-ink-500" /></button>
        </div>
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="size-16 rounded-full bg-violet-100 flex items-center justify-center ring-4 ring-violet-100">
              <User className="size-8 text-violet-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink-900">{e.student_name}</h3>
              <p className="text-sm text-ink-500">ID: {e.student_id}</p>
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[e.status]}`}>
                {STATUS_ICON[e.status]}{e.status.charAt(0).toUpperCase() + e.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-violet-100 bg-violet-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-violet-700"><BookOpen className="size-3.5" />Enrolled Subject</h4>
            <p className="text-base font-bold text-ink-900">{e.subject_name}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-ink-500"><Calendar className="size-3" />Enrolled on {new Date(e.enrollment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Student Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><User className="size-4" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase text-ink-400">Student ID</p>
                  <p className="truncate text-sm font-semibold text-ink-900">{e.student_id}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Mail className="size-4" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase text-ink-400">Email</p>
                  <p className="truncate text-sm font-semibold text-ink-900">{e.student_email}</p>
                </div>
              </div>
            </div>
          </div>

          {e.notes && (
            <div className="mb-6 rounded-xl border border-ink-100 bg-white p-4">
              <h4 className="mb-2 text-xs font-bold uppercase text-ink-400">Notes</h4>
              <p className="text-sm text-ink-600">{e.notes}</p>
            </div>
          )}

          {e.status === "pending" && (
            <div className="flex gap-3">
              <button onClick={onReject} className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition">Reject</button>
              <button onClick={onApprove} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">Approve Enrollment</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────── Multi-Step Enrollment Wizard ──────── */
const ENROLL_STEPS = ["Select Student", "Choose Course", "Confirm"];

type StudentResult = { id: number; name: string; email: string; grade_level: string | null };
type SubjectResult = { id: number; name: string; grade: string; instructor: string | null };

function EnrollmentWizard({ onClose, onAdd, nextId }: { onClose: () => void; onAdd: (e: Enrollment) => void; nextId: number }) {
  const [step, setStep] = useState(0);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectResult | null>(null);
  const [enrollDate, setEnrollDate] = useState(new Date().toISOString().slice(0, 10));
  
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [subjects, setSubjects] = useState<SubjectResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search students from API
  useEffect(() => {
    if (studentSearch.length < 2) {
      setStudentResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await api.searchAdminStudents(studentSearch, 20);
        if (response.success) {
          setStudentResults(response.data);
        }
      } catch (error) {
        console.error("Failed to search students:", error);
      } finally {
        setSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [studentSearch]);

  // Load subjects when entering step 1
  useEffect(() => {
    if (step === 1) {
      loadSubjects();
    }
  }, [step]);

  async function loadSubjects() {
    setLoadingSubjects(true);
    try {
      const response = await api.getSubjects();
      if (response.success) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error("Failed to load subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  }

  const stepValid = [!!selectedStudent, !!selectedSubject, true];
  function next() { if (stepValid[step] && step < ENROLL_STEPS.length - 1) setStep(s => s + 1); }
  function prev() { if (step > 0) setStep(s => s - 1); }

  async function submit() {
    if (!selectedStudent || !selectedSubject) return;
    
    setSubmitting(true);
    try {
      const response = await api.createAdminEnrollment({
        student_id: selectedStudent.id,
        subject_id: selectedSubject.id,
        notes: `Enrolled on ${enrollDate}`
      });
      
      if (response.success) {
        const enrollment = response.data;
        const formattedDate = new Date(enrollDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        onAdd({
          id: enrollment.id,
          student_id: selectedStudent.id,
          student_name: selectedStudent.name,
          student_email: selectedStudent.email,
          subject_id: selectedSubject.id,
          subject_name: selectedSubject.name,
          enrollment_date: enrollment.enrollment_date,
          status: enrollment.status,
          notes: enrollment.notes
        });
        onClose();
      }
    } catch (error) {
      console.error("Failed to create enrollment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-xl animate-scale-in">
        <div className="border-b border-ink-100 px-6 pt-6 pb-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900">Enroll Student</h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
          </div>
          <div className="flex items-center gap-2">
            {ENROLL_STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={`flex flex-col items-center ${i <= step ? "text-violet-600" : "text-ink-400"}`}>
                  <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition ${i < step ? "bg-violet-600 text-white" : i === step ? "bg-violet-600 text-white ring-4 ring-violet-100" : "bg-ink-100 text-ink-500"}`}>
                    {i < step ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span className="mt-1 text-[10px] font-semibold whitespace-nowrap">{s}</span>
                </div>
                {i < ENROLL_STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-violet-600" : "bg-ink-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[320px]">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-700">Search and select a student (type at least 2 characters)</p>
              <label className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
                <input 
                  value={studentSearch} 
                  onChange={e => setStudentSearch(e.target.value)} 
                  placeholder="Search by name or email..."
                  className="h-10 w-full rounded-xl border border-ink-200 pl-9 pr-3 text-sm outline-none focus:border-violet-400" />
                {searching && <Loader2 className="absolute right-3 size-4 animate-spin text-ink-400" />}
              </label>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {studentResults.map(s => (
                  <button key={s.id} onClick={() => setSelectedStudent(s)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${selectedStudent?.id === s.id ? "border-violet-600 bg-violet-50" : "border-ink-200 hover:border-violet-300"}`}>
                    <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <User className="size-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                      <p className="text-xs text-ink-500 font-mono">{s.email} · {s.grade_level || 'N/A'}</p>
                    </div>
                    {selectedStudent?.id === s.id && <Check className="size-5 text-violet-600" />}
                  </button>
                ))}
                {studentSearch.length < 2 && <p className="py-6 text-center text-xs text-ink-400">Type at least 2 characters to search</p>}
                {studentSearch.length >= 2 && !searching && studentResults.length === 0 && <p className="py-6 text-center text-xs text-ink-400">No students found</p>}
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-700">Choose a subject to enroll {selectedStudent?.name} in</p>
              {loadingSubjects ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-violet-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => setSelectedSubject(s)}
                      className={`rounded-xl border-2 p-3 text-left transition ${selectedSubject?.id === s.id ? "border-violet-600 bg-violet-50" : "border-ink-200 hover:border-violet-300"}`}>
                      <p className="text-sm font-bold text-ink-900">{s.name}</p>
                      <p className="text-xs text-ink-500">Grade {s.grade}</p>
                      <p className="mt-1 text-xs text-ink-400">By {s.instructor || 'TBA'}</p>
                    </button>
                  ))}
                </div>
              )}
              {!loadingSubjects && subjects.length === 0 && <p className="py-6 text-center text-xs text-ink-400">No subjects found</p>}
            </div>
          )}
          {step === 2 && selectedStudent && selectedSubject && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase text-ink-400">Confirm Enrollment</p>

              <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4">
                <div className="size-12 rounded-full bg-violet-100 flex items-center justify-center ring-2 ring-violet-200">
                  <User className="size-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-ink-400">Student</p>
                  <p className="text-sm font-bold text-ink-900">{selectedStudent.name}</p>
                  <p className="text-xs text-ink-500">{selectedStudent.email} · Grade {selectedStudent.grade_level || 'N/A'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-[10px] font-semibold uppercase text-violet-700">Subject</p>
                <p className="text-sm font-bold text-ink-900">{selectedSubject.name}</p>
                <p className="text-xs text-ink-500">Grade {selectedSubject.grade} · {selectedSubject.instructor || 'TBA'}</p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-700">Enrollment Date</span>
                <input type="date" value={enrollDate} onChange={e => setEnrollDate(e.target.value)}
                  className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400" />
              </label>

              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                <strong>Note:</strong> This enrollment will be created with <strong>Pending</strong> status and require admin approval.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={prev} disabled={step === 0 || submitting}
            className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 disabled:opacity-40 hover:bg-ink-100">
            <ChevronLeft className="size-4" /> Back
          </button>
          <span className="text-xs text-ink-500">Step {step + 1} of {ENROLL_STEPS.length}</span>
          {step < ENROLL_STEPS.length - 1 ? (
            <button onClick={next} disabled={!stepValid[step] || submitting}
              className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-violet-700">
              Next <ChevronRight className="size-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700">
              {submitting ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : "Confirm Enrollment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
