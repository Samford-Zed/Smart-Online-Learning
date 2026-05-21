import { useEffect, useState } from "react";
import {
  Search, Plus, X, Mail, Phone, ChevronLeft, ChevronRight, MoreHorizontal,
  Eye, Pencil, Trash2, Users, GraduationCap, Briefcase, Check, AlertTriangle, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { useT } from "../../../i18n/I18nProvider";
import { api } from "../../../services/api";

type Parent = {
  id: string; name: string; avatar: string; email: string; phone: string;
  children: { name: string; grade: string; studentId: string }[];
  occupation: string; address: string; status: "Active" | "Inactive";
};

const ALL_STUDENTS = [
  { name: "Evelyn Harper",   grade: "10-A", studentId: "PRE43178" },
  { name: "Diana Plenty",    grade: "10-B", studentId: "PRE43174" },
  { name: "John Millar",     grade: "11-A", studentId: "PRE43187" },
  { name: "Sofia Martinez",  grade: "9-A",  studentId: "PRE43201" },
  { name: "Noah Williams",   grade: "9-B",  studentId: "PRE43195" },
  { name: "Amara Osei",      grade: "10-A", studentId: "PRE43210" },
  { name: "Luca Bianchi",    grade: "12-A", studentId: "PRE43215" },
  { name: "Priya Sharma",    grade: "11-B", studentId: "PRE43220" },
  { name: "Mia Chen",        grade: "10-C", studentId: "PRE43225" },
  { name: "Tariq Abdel",     grade: "12-B", studentId: "PRE43230" },
];

const INITIAL_PARENTS: Parent[] = [
  { id: "p1", name: "Margaret Harper",  avatar: "https://i.pravatar.cc/80?img=46", email: "margaret@mail.com", phone: "+1 555-1001", children: [ALL_STUDENTS[0]], occupation: "Nurse",          address: "123 Oak Street, Springfield", status: "Active" },
  { id: "p2", name: "Robert Plenty",    avatar: "https://i.pravatar.cc/80?img=9",  email: "robert@mail.com",   phone: "+1 555-1002", children: [ALL_STUDENTS[1]], occupation: "Engineer",       address: "456 Maple Ave, Greenville",   status: "Active" },
  { id: "p3", name: "Sarah Millar",     avatar: "https://i.pravatar.cc/80?img=42", email: "sarah@mail.com",    phone: "+1 555-1003", children: [ALL_STUDENTS[2]], occupation: "Teacher",        address: "789 Pine Road, Lakewood",     status: "Active" },
  { id: "p4", name: "Carlos Martinez",  avatar: "https://i.pravatar.cc/80?img=13", email: "carlos@mail.com",   phone: "+1 555-1004", children: [ALL_STUDENTS[3], ALL_STUDENTS[8]], occupation: "Accountant", address: "321 Elm Blvd, Riverside", status: "Active" },
  { id: "p5", name: "James Williams",   avatar: "https://i.pravatar.cc/80?img=19", email: "james.w@mail.com",  phone: "+1 555-1005", children: [ALL_STUDENTS[4]], occupation: "Business Owner", address: "654 Cedar Lane, Hillside",    status: "Inactive" },
  { id: "p6", name: "Kofi Osei",        avatar: "https://i.pravatar.cc/80?img=24", email: "kofi@mail.com",     phone: "+1 555-1006", children: [ALL_STUDENTS[5]], occupation: "Architect",      address: "987 Birch Way, Oakdale",      status: "Active" },
  { id: "p7", name: "Marco Bianchi",    avatar: "https://i.pravatar.cc/80?img=5",  email: "marco@mail.com",    phone: "+1 555-1007", children: [ALL_STUDENTS[6], ALL_STUDENTS[9]], occupation: "Doctor",  address: "147 Walnut Ct, Fairview", status: "Active" },
  { id: "p8", name: "Ravi Sharma",      avatar: "https://i.pravatar.cc/80?img=33", email: "ravi@mail.com",     phone: "+1 555-1008", children: [ALL_STUDENTS[7]], occupation: "Pharmacist",     address: "258 Ash Dr, Meadowbrook",     status: "Active" },
];

const STAT_CARDS = [
  { label: "Total Parents",  icon: Users,         gradient: "from-violet-500 via-purple-500 to-fuchsia-500", key: "total" },
  { label: "Active",         icon: Check,         gradient: "from-emerald-500 via-teal-500 to-cyan-500",     key: "active" },
  { label: "Total Children", icon: GraduationCap, gradient: "from-blue-500 via-sky-500 to-indigo-500",       key: "children" },
];

const PAGE_SIZE = 6;

export default function AdminParentsPage() {
  const { t } = useT();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadParents();
  }, []);
  
  async function loadParents() {
    setLoading(true);
    try {
      const response = await api.getAdminParents();
      if (response.success) {
        setParents(response.data);
      }
    } catch (error) {
      console.error("Failed to load parents:", error);
    } finally {
      setLoading(false);
    }
  }
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [viewTarget, setViewTarget] = useState<Parent | null>(null);
  const [editTarget, setEditTarget] = useState<Parent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Parent | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const filtered = parents.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) || p.children.some(c => c.name.toLowerCase().includes(q) || c.studentId.toLowerCase().includes(q));
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statValues: Record<string, number> = {
    total: parents.length, active: parents.filter(p => p.status === "Active").length,
    children: parents.reduce((s, p) => s + p.children.length, 0),
  };

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.deleteAdminParent(parseInt(deleteTarget.id));
      setParents(ps => ps.filter(p => p.id !== deleteTarget.id));
      showToast(`${deleteTarget.name} has been removed`);
    } catch (error) {
      console.error("Failed to delete parent:", error);
      showToast("Failed to remove parent");
    }
    setDeleteTarget(null);
  }

  async function handleAdd(data: any) {
    try {
      const response = await api.createAdminParent({
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        occupation: data.occupation,
        address: data.address,
        status: data.status,
        avatar: data.avatar,
        studentIds: data.children?.map((c: any) => c.id) || []
      });
      if (response.success) {
        await loadParents(); // Reload to get correct structure
        showToast(`${data.name} added successfully`);
        setShowAdd(false);
      }
    } catch (error) {
      console.error("Failed to add parent:", error);
      showToast("Failed to add parent");
    }
  }

  async function handleEdit(updated: Parent) {
    try {
      await api.updateAdminParent(parseInt(updated.id), {
        full_name: updated.name,
        email: updated.email,
        phone: updated.phone,
        occupation: updated.occupation,
        address: updated.address,
        status: updated.status
      });
      setParents(ps => ps.map(p => p.id === updated.id ? updated : p));
      setEditTarget(null);
      showToast(`${updated.name} updated successfully`);
    } catch (error) {
      console.error("Failed to update parent:", error);
      showToast("Failed to update parent");
    }
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
                <h1 className="text-2xl font-bold tracking-tight text-white">{t("admin.pages.parents")}</h1>
                <p className="mt-1 text-sm text-white/85">{t("admin.pages.parentsSub", { count: filtered.length })}</p>
              </div>
              <button onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-md transition hover:scale-[1.03] hover:shadow-xl">
                <Plus className="size-4" /> {t("admin.pages.addParent")}
              </button>
            </div>
          </div>

          {/* Gradient stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <div className="mb-4 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search by name, email, phone, or child..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-80 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-violet-400">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {paged.map((p, i) => (
              <div key={p.id} className="group rounded-2xl border border-ink-200 bg-white p-5 shadow-card hover:shadow-md transition animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.avatar} alt={p.name} className="size-11 rounded-full object-cover ring-2 ring-violet-100" />
                    <div>
                      <p className="font-semibold text-ink-900">{p.name}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-500"><Briefcase className="size-3" />{p.occupation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"}`}>
                      {p.status}
                    </span>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className="rounded-md p-1 text-ink-400 opacity-0 transition group-hover:opacity-100 hover:bg-ink-100">
                        <MoreHorizontal className="size-4" />
                      </button>
                      {menuOpen === p.id && (
                        <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                          <button onClick={() => { setViewTarget(p); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Profile</button>
                          <button onClick={() => { setEditTarget(p); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Pencil className="size-3.5" />Edit</button>
                          <button onClick={() => { setDeleteTarget(p); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 text-xs text-ink-500">
                  <span className="flex items-center gap-2"><Mail className="size-3.5 shrink-0" />{p.email}</span>
                  <span className="flex items-center gap-2"><Phone className="size-3.5 shrink-0" />{p.phone}</span>
                </div>
                <div className="mt-3 border-t border-ink-100 pt-3">
                  <p className="text-xs font-semibold text-ink-500 mb-1.5">Children ({p.children.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.children.map(c => (
                      <span key={c.studentId} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                        {c.name} <span className="text-violet-400">({c.grade})</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setViewTarget(p)}
                  className="mt-3 w-full rounded-xl border border-ink-200 py-2 text-xs font-semibold text-ink-600 transition hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700">
                  View Profile
                </button>
              </div>
            ))}
            {loading && <div className="col-span-3 py-16 text-center"><Loader2 className="mx-auto size-8 animate-spin text-violet-500" /><p className="mt-2 text-sm text-ink-400">Loading parents...</p></div>}
            {!loading && paged.length === 0 && <p className="col-span-3 py-16 text-center text-sm text-ink-400">No parents found.</p>}
          </div>

          {/* Pagination */}
          <div className="mt-5 flex items-center justify-between text-xs text-ink-500 animate-fade-in-up">
            <span>Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button disabled={page===1} onClick={() => setPage(p => p-1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`size-7 rounded-lg text-xs font-semibold ${page===i+1?"bg-violet-600 text-white":"hover:bg-ink-100 text-ink-600"}`}>{i+1}</button>
              ))}
              <button disabled={page===totalPages} onClick={() => setPage(p => p+1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        </main>
      </div>

      {/* View Profile Slide-over */}
      {viewTarget && <ParentProfile parent={viewTarget} onClose={() => setViewTarget(null)} onEdit={p => { setViewTarget(null); setEditTarget(p); }} />}
      {/* Add modal */}
      {showAdd && <AddParentModal onClose={() => setShowAdd(false)} onAdd={handleAdd} nextId={parents.length + 1} />}
      {/* Edit modal */}
      {editTarget && <EditParentModal parent={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Parent</h3>
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

/* ──────── Parent Profile Slide-over ──────── */
function ParentProfile({ parent: p, onClose, onEdit }: { parent: Parent; onClose: () => void; onEdit: (p: Parent) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-ink-900">Parent Profile</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-5 text-ink-500" /></button>
        </div>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <img src={p.avatar} alt={p.name} className="size-16 rounded-full object-cover ring-4 ring-violet-100" />
            <div>
              <h3 className="text-xl font-bold text-ink-900">{p.name}</h3>
              <p className="flex items-center gap-1 text-sm text-ink-500"><Briefcase className="size-3.5" />{p.occupation}</p>
              <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"}`}>{p.status}</span>
            </div>
          </div>

          {/* Contact info */}
          <div className="mb-6 rounded-xl border border-ink-100 bg-ink-50 p-4">
            <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Contact Information</h4>
            <div className="space-y-2.5 text-sm text-ink-700">
              <p className="flex items-center gap-2.5"><Mail className="size-4 text-ink-400" />{p.email}</p>
              <p className="flex items-center gap-2.5"><Phone className="size-4 text-ink-400" />{p.phone}</p>
              <p className="flex items-start gap-2.5"><span className="mt-0.5 text-ink-400 text-xs">Address:</span> {p.address}</p>
            </div>
          </div>

          {/* Children */}
          <div className="mb-6">
            <h4 className="mb-3 text-xs font-bold uppercase text-ink-400">Children ({p.children.length})</h4>
            <div className="space-y-2.5">
              {p.children.map(c => (
                <div key={c.studentId} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <GraduationCap className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{c.name}</p>
                      <p className="text-xs text-ink-500">Grade {c.grade}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-ink-400">{c.studentId}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onEdit(p)} className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
            Edit Parent
          </button>
        </div>
      </div>
    </div>
  );
}

type StudentResult = { id: number; name: string; email: string; grade_level: string | null };

/* ──────── Add Parent Modal ──────── */
function AddParentModal({ onClose, onAdd, nextId }: { onClose: () => void; onAdd: (data: any) => void; nextId: number }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", occupation: "", address: "" });
  const [selectedStudents, setSelectedStudents] = useState<StudentResult[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function toggleStudent(s: StudentResult) {
    setSelectedStudents(prev => prev.some(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]);
  }

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

  const valid = form.name.trim() && form.email.trim() && selectedStudents.length > 0;

  function submit() {
    if (!valid) return;
    onAdd({
      name: form.name,
      email: form.email,
      phone: form.phone,
      occupation: form.occupation,
      address: form.address,
      status: "Active",
      avatar: `https://i.pravatar.cc/80?img=${30 + nextId}`,
      children: selectedStudents.map(s => ({ id: s.id, name: s.name, studentId: String(s.id), grade: s.grade_level || 'N/A' })),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Add New Parent</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
        </div>
        <div className="flex flex-col gap-4">
          {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Occupation","occupation","text"],["Address","address","text"]].map(([label,key,type]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">{label}</span>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={label}
                className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
          ))}

          {/* Student assignment */}
          <div>
            <span className="text-xs font-semibold text-ink-700">Assign Students (children)</span>
            <p className="mb-2 text-[11px] text-ink-400">A parent can have multiple students</p>
            {selectedStudents.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedStudents.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                    {s.name} (Grade {s.grade_level || 'N/A'})
                    <button onClick={() => toggleStudent(s)} className="ml-0.5 rounded-full hover:bg-violet-200"><X className="size-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative mb-2">
              <input 
                type="text" 
                placeholder="Type at least 2 characters to search..." 
                value={studentSearch} 
                onChange={e => setStudentSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-ink-200 px-3 text-xs outline-none focus:border-violet-400" />
              {searching && <Loader2 className="absolute right-3 top-2 size-4 animate-spin text-violet-500" />}
            </div>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-ink-200 divide-y divide-ink-50">
              {studentResults.map(s => {
                const checked = selectedStudents.some(x => x.id === s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggleStudent(s)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition ${checked ? "bg-violet-50" : "hover:bg-ink-50"}`}>
                    <span>
                      <span className="font-semibold text-ink-900">{s.name}</span>
                      <span className="text-ink-400">— Grade {s.grade_level || 'N/A'}</span>
                    </span>
                    {checked && <Check className="size-3.5 text-violet-600" />}
                  </button>
                );
              })}
              {studentSearch.length >= 2 && !searching && studentResults.length === 0 && (
                <p className="px-3 py-2 text-xs text-ink-400">No students found</p>
              )}
              {studentSearch.length < 2 && (
                <p className="px-3 py-2 text-xs text-ink-400">Type at least 2 characters to search</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
          <button onClick={submit} disabled={!valid} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">Add Parent</button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Edit Parent Modal ──────── */
function EditParentModal({ parent, onClose, onSave }: { parent: Parent; onClose: () => void; onSave: (p: Parent) => void }) {
  const [form, setForm] = useState({ name: parent.name, email: parent.email, phone: parent.phone, occupation: parent.occupation, address: parent.address, status: parent.status });
  const [selectedStudents, setSelectedStudents] = useState<typeof ALL_STUDENTS[number][]>([...parent.children]);
  const [studentSearch, setStudentSearch] = useState("");

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function toggleStudent(s: typeof ALL_STUDENTS[number]) {
    setSelectedStudents(prev => prev.some(x => x.studentId === s.studentId) ? prev.filter(x => x.studentId !== s.studentId) : [...prev, s]);
  }

  const filteredStudents = ALL_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  function submit() {
    onSave({ ...parent, ...form, children: selectedStudents, status: form.status as Parent["status"] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Edit Parent</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
        </div>
        <div className="flex flex-col gap-4">
          {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Occupation","occupation","text"],["Address","address","text"]].map(([label,key,type]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">{label}</span>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
          ))}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-700">Status</span>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400">
              <option>Active</option><option>Inactive</option>
            </select>
          </label>

          {/* Student assignment */}
          <div>
            <span className="text-xs font-semibold text-ink-700">Assign Students (children)</span>
            {selectedStudents.length > 0 && (
              <div className="my-2 flex flex-wrap gap-1.5">
                {selectedStudents.map(s => (
                  <span key={s.studentId} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                    {s.name} ({s.grade})
                    <button onClick={() => toggleStudent(s)} className="ml-0.5 rounded-full hover:bg-violet-200"><X className="size-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <input type="text" placeholder="Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
              className="mb-2 h-9 w-full rounded-lg border border-ink-200 px-3 text-xs outline-none focus:border-violet-400" />
            <div className="max-h-36 overflow-y-auto rounded-xl border border-ink-200 divide-y divide-ink-50">
              {filteredStudents.map(s => {
                const checked = selectedStudents.some(x => x.studentId === s.studentId);
                return (
                  <button key={s.studentId} type="button" onClick={() => toggleStudent(s)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition ${checked ? "bg-violet-50" : "hover:bg-ink-50"}`}>
                    <span><span className="font-semibold text-ink-900">{s.name}</span> <span className="text-ink-400">— {s.grade}</span></span>
                    {checked && <Check className="size-3.5 text-violet-600" />}
                  </button>
                );
              })}
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
