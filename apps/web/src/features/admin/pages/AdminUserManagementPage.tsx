import { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, MoreHorizontal, X, Shield, ChevronLeft, ChevronRight, Edit2, Trash2,
  CheckCircle2, Ban, Pause, Eye, AlertTriangle, Check, Mail, Calendar, Clock,
  UserCog, Users as UsersIcon, GraduationCap, User as UserIcon, UserPlus, Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type Role = "Admin" | "Teacher" | "Student" | "Parent";
type UserStatus = "Active" | "Inactive" | "Suspended" | "Pending";

type SystemUser = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: Role;
  lastLogin: string;
  status: UserStatus;
  joined: string;
};

const ROLE_META: Record<Role, { bg: string; text: string; gradient: string; icon: typeof UserIcon }> = {
  Admin:   { bg: "bg-violet-100",  text: "text-violet-700",  gradient: "from-violet-500 to-fuchsia-500", icon: Shield },
  Teacher: { bg: "bg-cyan-100",    text: "text-cyan-700",    gradient: "from-cyan-500 to-teal-500",      icon: GraduationCap },
  Student: { bg: "bg-emerald-100", text: "text-emerald-700", gradient: "from-emerald-500 to-green-500",  icon: UsersIcon },
  Parent:  { bg: "bg-orange-100",  text: "text-orange-600",  gradient: "from-orange-500 to-amber-500",   icon: UserIcon },
};

const STATUS_META: Record<UserStatus, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  Active:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: <CheckCircle2 className="size-3" /> },
  Inactive:  { bg: "bg-ink-100",    text: "text-ink-600",     dot: "bg-ink-400",     icon: <Pause className="size-3" /> },
  Suspended: { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     icon: <Ban className="size-3" /> },
  Pending:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   icon: <Clock className="size-3" /> },
};


const PAGE_SIZE = 7;

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | Role>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [viewUser, setViewUser] = useState<SystemUser | null>(null);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<SystemUser | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2400); }

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await api.getAdminUsers({ limit: 200 });
      if (res.success && res.data?.users) {
        const mapped: SystemUser[] = res.data.users.map((u: any) => ({
          id: String(u.id),
          name: u.name || u.full_name || "Unknown",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || u.id}`,
          email: u.email || "",
          phone: u.phone || "—",
          role: capitalize(u.role) as Role,
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never",
          status: u.is_active === false ? "Inactive" : "Active",
          joined: new Date(u.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s; }

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (statusFilter !== "All" && u.status !== statusFilter) return false;
    return true;
  }), [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function changeStatus(id: string, status: UserStatus) {
    const isActive = status === "Active";
    try {
      await api.updateAdminUser(id, { is_active: isActive });
      setUsers(us => us.map(u => u.id === id ? { ...u, status } : u));
      if (viewUser?.id === id) setViewUser(v => v ? { ...v, status } : v);
      showToast(`User marked as ${status}`);
    } catch (err) {
      showToast("Failed to update status");
    }
  }
  async function addUser(u: SystemUser) {
    try {
      const res = await api.createAdminUser({
        name: u.name,
        email: u.email,
        password: "TempPass123!",
        role: u.role.toLowerCase(),
      });
      const created: SystemUser = {
        ...u,
        id: String(res.data?.id || Date.now()),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
      };
      setUsers(us => [created, ...us]);
      setShowAdd(false);
      showToast(`User ${u.email} created`);
    } catch (err: any) {
      showToast(err.message || "Failed to create user");
    }
  }
  async function updateUser(u: SystemUser) {
    try {
      await api.updateAdminUser(u.id, {
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role.toLowerCase(),
        is_active: u.status === "Active",
      });
      setUsers(us => us.map(x => x.id === u.id ? u : x));
      setEditUser(null);
      setViewUser(u);
      showToast("User updated");
    } catch (err: any) {
      showToast(err.message || "Failed to update user");
    }
  }
  async function removeUser() {
    if (!deleteUser) return;
    try {
      await api.deleteAdminUser(deleteUser.id);
      setUsers(us => us.filter(u => u.id !== deleteUser.id));
      showToast(`${deleteUser.name} removed`);
      setDeleteUser(null); setViewUser(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete user");
    }
  }

  const stats = {
    total:     users.length,
    active:    users.filter(u => u.status === "Active").length,
    suspended: users.filter(u => u.status === "Suspended").length,
    pending:   users.filter(u => u.status === "Pending").length,
  };

  const STAT_CARDS = [
    { label: "Total Users",  value: stats.total,     icon: UserCog,      gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Active",       value: stats.active,    icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { label: "Suspended",    value: stats.suspended, icon: Ban,          gradient: "from-red-500 to-rose-500" },
    { label: "Pending",      value: stats.pending,   icon: Clock,        gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          {loading && (
            <div className="mb-4 flex items-center gap-2 text-sm text-ink-400"><Loader2 className="size-4 animate-spin" />Loading users…</div>
          )}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">User Management</h1>
              <p className="text-sm text-ink-500">{filtered.length} of {users.length} system users</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-100">
              <UserPlus className="size-4" /> Invite User
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

          {/* Role pills with counts */}
          <div className="mb-5 flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            {(["Admin","Teacher","Student","Parent"] as Role[]).map(r => {
              const count = users.filter(u => u.role === r).length;
              const M = ROLE_META[r];
              const active = roleFilter === r;
              return (
                <button key={r} onClick={() => { setRoleFilter(active ? "All" : r); setPage(1); }}
                  className={`group flex items-center gap-2 overflow-hidden rounded-xl border p-0.5 text-sm font-semibold transition hover:shadow-md ${active ? "border-transparent shadow-md" : "border-ink-200 bg-white text-ink-700"}`}>
                  <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${active ? `bg-gradient-to-r ${M.gradient} text-white` : ""}`}>
                    <M.icon className="size-4" />
                    {r}
                  </span>
                  <span className={`pr-3 text-xs font-bold ${active ? "text-ink-900" : "text-ink-500"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search by name or email..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-72 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as "All" | UserStatus); setPage(1); }}
              className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-violet-400">
              <option value="All">All Statuses</option>
              {(Object.keys(STATUS_META) as UserStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Last Login</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(u => {
                    const RM = ROLE_META[u.role];
                    return (
                      <tr key={u.id} onClick={() => setViewUser(u)}
                        className="border-b border-ink-50 last:border-0 cursor-pointer transition hover:bg-violet-50/30">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.name} className="size-9 rounded-full object-cover ring-2 ring-violet-100" />
                            <div>
                              <p className="font-semibold text-ink-900">{u.name}</p>
                              <p className="text-xs text-ink-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${RM.bg} ${RM.text}`}>
                            <RM.icon className="size-3" />{u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-500">{u.lastLogin}</td>
                        <td className="px-4 py-3.5 text-xs text-ink-500">{u.joined}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_META[u.status].bg} ${STATUS_META[u.status].text}`}>
                            <span className={`size-1.5 rounded-full ${STATUS_META[u.status].dot}`} />{u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                              className="rounded-md p-1 text-ink-400 hover:bg-ink-100">
                              <MoreHorizontal className="size-4" />
                            </button>
                            {menuOpen === u.id && (
                              <div className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                                <button onClick={() => { setViewUser(u); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Profile</button>
                                <button onClick={() => { setEditUser(u); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Edit2 className="size-3.5" />Edit User</button>
                                <div className="my-1 border-t border-ink-100" />
                                <p className="px-3 pt-1 text-[9px] font-bold uppercase text-ink-400">Set Status</p>
                                {(["Active","Inactive","Suspended"] as UserStatus[]).filter(s => s !== u.status).map(s => (
                                  <button key={s} onClick={() => { changeStatus(u.id, s); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-violet-50">
                                    <span className={`size-2 rounded-full ${STATUS_META[s].dot}`} />Mark {s}
                                  </button>
                                ))}
                                <div className="my-1 border-t border-ink-100" />
                                <button onClick={() => { setDeleteUser(u); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paged.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-ink-400">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
              <span>Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button disabled={page===1} onClick={() => setPage(p => p-1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i+1)} className={`size-7 rounded-lg text-xs font-semibold ${page===i+1?"bg-violet-600 text-white":"hover:bg-ink-100 text-ink-600"}`}>{i+1}</button>
                ))}
                <button disabled={page===totalPages} onClick={() => setPage(p => p+1)} className="rounded-lg p-1.5 hover:bg-ink-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {viewUser && !editUser && <UserDetail user={viewUser} onClose={() => setViewUser(null)} onEdit={() => setEditUser(viewUser)} onDelete={() => setDeleteUser(viewUser)} onStatusChange={(st) => changeStatus(viewUser.id, st)} />}
      {showAdd && <UserModal mode="create" onClose={() => setShowAdd(false)} onSave={addUser} />}
      {editUser && <UserModal mode="edit" user={editUser} onClose={() => setEditUser(null)} onSave={updateUser} />}
      {deleteUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete User</h3>
            <p className="mt-1 text-sm text-ink-500">Permanently delete <strong>{deleteUser.name}</strong>?</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteUser(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={removeUser} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
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

/* ─────────── User Detail ─────────── */
function UserDetail({ user: u, onClose, onEdit, onDelete, onStatusChange }: {
  user: SystemUser; onClose: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: (st: UserStatus) => void;
}) {
  const RM = ROLE_META[u.role];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className={`relative bg-gradient-to-br ${RM.gradient} p-6 pb-16 text-white`}>
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur">
              <RM.icon className="size-3" />{u.role}
            </span>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>
        <div className="px-6">
          <div className="-mt-14 mb-4 flex items-end gap-4">
            <img src={u.avatar} alt={u.name} className="size-24 rounded-2xl border-4 border-white object-cover shadow-lg" />
            <div className="pb-2">
              <h2 className="text-xl font-bold text-ink-900">{u.name}</h2>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_META[u.status].bg} ${STATUS_META[u.status].text}`}>
                <span className={`size-1.5 rounded-full ${STATUS_META[u.status].dot}`} />{u.status}
              </span>
            </div>
          </div>

          <section className="mb-5">
            <h3 className="mb-3 text-[10px] font-bold uppercase text-ink-400">Contact</h3>
            <div className="space-y-2">
              <InfoRow icon={Mail} label="Email" value={u.email} />
              <InfoRow icon={UserIcon} label="Phone" value={u.phone} />
            </div>
          </section>

          <section className="mb-5">
            <h3 className="mb-3 text-[10px] font-bold uppercase text-ink-400">Account</h3>
            <div className="space-y-2">
              <InfoRow icon={Calendar} label="Joined" value={u.joined} />
              <InfoRow icon={Clock} label="Last Login" value={u.lastLogin} />
            </div>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-[10px] font-bold uppercase text-ink-400">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["Active","Inactive","Suspended","Pending"] as UserStatus[]).map(s => (
                <button key={s} onClick={() => onStatusChange(s)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-xs font-bold transition ${u.status === s ? `border-transparent ${STATUS_META[s].bg} ${STATUS_META[s].text}` : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                  {STATUS_META[s].icon}{s}
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

/* ─────────── User Modal ─────────── */
const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function UserModal({ mode, user, onClose, onSave }: {
  mode: "create" | "edit"; user?: SystemUser; onClose: () => void; onSave: (u: SystemUser) => void;
}) {
  const seed = user || {} as SystemUser;
  const [form, setForm] = useState<SystemUser>({
    id: seed.id || `u${Date.now()}`,
    name: seed.name || "",
    avatar: seed.avatar || `https://i.pravatar.cc/120?img=${Math.floor(Math.random()*70)+1}`,
    email: seed.email || "",
    phone: seed.phone || "",
    role: seed.role || "Teacher",
    lastLogin: seed.lastLogin || "Never",
    status: seed.status || (mode === "create" ? "Pending" : "Active"),
    joined: seed.joined || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  });
  function set<K extends keyof SystemUser>(k: K, v: SystemUser[K]) { setForm(f => ({ ...f, [k]: v })); }
  const valid = form.email.trim() && (mode === "edit" || true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">{mode === "create" ? <UserPlus className="size-5" /> : <Edit2 className="size-5" />}{mode === "create" ? "Invite User" : "Edit User"}</h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {mode === "edit" && <Field label="Name *"><input value={form.name} onChange={e => set("name", e.target.value)} className={fieldCls} /></Field>}
          <Field label="Email *"><input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={fieldCls} placeholder="user@school.edu" autoFocus /></Field>
          <Field label="Phone"><input value={form.phone} onChange={e => set("phone", e.target.value)} className={fieldCls} /></Field>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Role</p>
            <div className="grid grid-cols-2 gap-2">
              {(["Admin","Teacher","Student","Parent"] as Role[]).map(r => {
                const RM = ROLE_META[r];
                return (
                  <button key={r} type="button" onClick={() => set("role", r)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${form.role === r ? `border-transparent bg-gradient-to-br ${RM.gradient} text-white` : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                    <RM.icon className="size-4" />{r}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "edit" && (
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as UserStatus)} className={fieldCls}>
                {(Object.keys(STATUS_META) as UserStatus[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">Cancel</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid}
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:shadow-lg">
            {mode === "create" ? <><Mail className="size-4" />Send Invite</> : <><Check className="size-4" />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
