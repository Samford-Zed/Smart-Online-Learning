import { useState, useMemo, useEffect } from "react";
import {
  Plus, X, Megaphone, Pin, Trash2, Edit2, Search, Globe, Users, GraduationCap,
  Calendar, Eye, AlertTriangle, Check, MoreHorizontal, Sparkles, FileText,
  CheckCircle2, Clock, Send,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type Audience = "All" | "Students" | "Teachers" | "Parents";
type AnnouncementStatus = "Published" | "Draft" | "Scheduled";
type Priority = "Normal" | "Important" | "Urgent";

type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  status: AnnouncementStatus;
  priority: Priority;
  date: string;            // human-readable
  createdAt: string;       // ISO
  pinned: boolean;
  views: number;
  author: string;
  authorAvatar: string;
  authorRole: string;
};

const AUDIENCE_META: Record<Audience, { icon: React.ReactNode; bg: string; text: string; gradient: string }> = {
  All:      { icon: <Globe className="size-3.5" />,         bg: "bg-violet-50",  text: "text-violet-700",  gradient: "from-violet-500 to-fuchsia-500" },
  Students: { icon: <Users className="size-3.5" />,         bg: "bg-emerald-50", text: "text-emerald-700", gradient: "from-emerald-500 to-green-500" },
  Teachers: { icon: <GraduationCap className="size-3.5" />, bg: "bg-cyan-50",    text: "text-cyan-700",    gradient: "from-cyan-500 to-teal-500" },
  Parents:  { icon: <Users className="size-3.5" />,         bg: "bg-orange-50",  text: "text-orange-600",  gradient: "from-orange-500 to-amber-500" },
};

const STATUS_META: Record<AnnouncementStatus, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  Published: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: <CheckCircle2 className="size-3" /> },
  Draft:     { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   icon: <FileText className="size-3" /> },
  Scheduled: { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    icon: <Clock className="size-3" /> },
};

const PRIORITY_META: Record<Priority, { bg: string; text: string; ring: string }> = {
  Normal:    { bg: "bg-ink-100",    text: "text-ink-600",   ring: "ring-ink-200" },
  Important: { bg: "bg-amber-100",  text: "text-amber-700", ring: "ring-amber-200" },
  Urgent:    { bg: "bg-red-100",    text: "text-red-700",   ring: "ring-red-200" },
};

const INITIAL: Announcement[] = [
  { id: "a1", title: "Mid-term Exam Schedule Released", body: "The mid-term exam schedule for all grades is now available on the portal. Please review your assigned dates and venues. Make sure to check your individual timetable carefully and reach out to your homeroom teacher if you spot any conflicts. All exams will start at 9:00 AM sharp. Bring your student ID, two pencils, and a calculator for math/science papers.", pinned: true,  audience: "All",      status: "Published", priority: "Important", date: "Oct 10, 2024", createdAt: "2024-10-10T09:00:00Z", views: 1840, author: "Priscilla Lily",   authorAvatar: "https://i.pravatar.cc/80?img=47", authorRole: "Admin" },
  { id: "a2", title: "Parent-Teacher Conference — Oct 21", body: "We are pleased to invite all parents to our annual Parent-Teacher Conference on October 21st at 3:00 PM in the Main Hall. This is an excellent opportunity to discuss your child's academic progress, address any concerns, and meet with subject teachers. Light refreshments will be served. Please RSVP through the parent portal by October 18th.", pinned: true, audience: "Parents", status: "Published", priority: "Urgent", date: "Oct 8, 2024",  createdAt: "2024-10-08T10:30:00Z", views: 920, author: "Priscilla Lily",   authorAvatar: "https://i.pravatar.cc/80?img=47", authorRole: "Admin" },
  { id: "a3", title: "New Library Hours Effective November", body: "Starting November 1st, the school library will be open from 7:30 AM to 6:00 PM on weekdays and 9:00 AM to 1:00 PM on Saturdays. Extended hours during exam weeks will be announced separately. The library now also features a quiet study zone on the second floor.", pinned: false, audience: "All",      status: "Published", priority: "Normal",    date: "Oct 7, 2024",  createdAt: "2024-10-07T14:15:00Z", views: 1120, author: "Dr. Alice Monroe", authorAvatar: "https://i.pravatar.cc/80?img=49", authorRole: "Librarian" },
  { id: "a4", title: "Sports Day Registration Open", body: "Students wishing to participate in Sports Day on November 15th should register with their class teacher by October 31st. Events include track & field, football, basketball, swimming, and team relays. Awards will be given for individual achievements and house performance.", pinned: false, audience: "Students", status: "Published", priority: "Normal",    date: "Oct 5, 2024",  createdAt: "2024-10-05T11:00:00Z", views: 1650, author: "Priscilla Lily",   authorAvatar: "https://i.pravatar.cc/80?img=47", authorRole: "Admin" },
  { id: "a5", title: "Teacher Professional Development Workshop", body: "A professional development workshop on \"Modern Pedagogical Approaches\" will be held on November 8th from 9:00 AM to 4:00 PM. All teaching staff must attend. Lunch will be provided. Speakers from the Ministry of Education will lead the session.", pinned: false, audience: "Teachers", status: "Draft",     priority: "Important", date: "Oct 4, 2024",  createdAt: "2024-10-04T16:45:00Z", views: 0, author: "Priscilla Lily", authorAvatar: "https://i.pravatar.cc/80?img=47", authorRole: "Admin" },
  { id: "a6", title: "School Closure for National Holiday", body: "The school will remain closed on October 28th in observance of the national holiday. Classes resume on October 29th. Online learning materials will be available on the portal for self-study.", pinned: false, audience: "All", status: "Scheduled", priority: "Normal", date: "Oct 12, 2024", createdAt: "2024-10-12T08:00:00Z", views: 0, author: "Priscilla Lily", authorAvatar: "https://i.pravatar.cc/80?img=47", authorRole: "Admin" },
];

const AUDIENCES: Array<"All" | Audience> = ["All", "Students", "Teachers", "Parents"];

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<"All" | Audience>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | AnnouncementStatus>("All");
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Announcement | null>(null);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2400); }

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const res = await api.getAdminAnnouncements();
      if (res.success && res.data.length > 0) {
        setItems(res.data.map((a: any) => ({
          id: String(a.id),
          title: a.title,
          body: a.body,
          audience: a.audience as Audience,
          status: a.status as AnnouncementStatus,
          priority: a.priority as Priority,
          pinned: a.pinned,
          views: Number(a.views) || 0,
          author: a.author_name || "Admin",
          authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.author_name || a.id}`,
          authorRole: a.author_role || "Admin",
          date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          createdAt: a.created_at,
        })));
      } else {
        setItems(INITIAL);
      }
    } catch {
      setItems(INITIAL);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => items.filter(a => {
    const q = search.toLowerCase();
    if (q && !a.title.toLowerCase().includes(q) && !a.body.toLowerCase().includes(q) && !a.author.toLowerCase().includes(q)) return false;
    if (audienceFilter !== "All" && a.audience !== audienceFilter) return false;
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    return true;
  }), [items, search, audienceFilter, statusFilter]);

  const pinned = filtered.filter(a => a.pinned);
  const rest   = filtered.filter(a => !a.pinned);

  async function togglePin(id: string) {
    const item = items.find(i => i.id === id);
    const newPinned = !item?.pinned;
    try {
      await api.updateAdminAnnouncement(id, { pinned: newPinned });
      setItems(is => is.map(i => i.id === id ? { ...i, pinned: newPinned } : i));
      showToast(newPinned ? "Pinned to top" : "Unpinned");
    } catch { showToast("Failed to update"); }
  }
  async function changeStatus(id: string, st: AnnouncementStatus) {
    try {
      await api.updateAdminAnnouncement(id, { status: st });
      setItems(is => is.map(i => i.id === id ? { ...i, status: st } : i));
      if (viewItem?.id === id) setViewItem(v => v ? { ...v, status: st } : v);
      showToast(`Marked as ${st}`);
    } catch { showToast("Failed to update status"); }
  }
  async function addItem(a: Announcement) {
    try {
      const res = await api.createAdminAnnouncement({
        title: a.title, body: a.body, audience: a.audience,
        status: a.status, priority: a.priority, pinned: a.pinned,
        author_name: a.author, author_role: a.authorRole,
      });
      const created: Announcement = { ...a, id: String(res.data?.id || Date.now()) };
      setItems(is => [created, ...is]); setShowCreate(false);
      showToast(`"${a.title}" published`);
    } catch (err: any) { showToast(err.message || "Failed to create"); }
  }
  async function updateItem(a: Announcement) {
    try {
      await api.updateAdminAnnouncement(a.id, {
        title: a.title, body: a.body, audience: a.audience,
        status: a.status, priority: a.priority, pinned: a.pinned,
      });
      setItems(is => is.map(i => i.id === a.id ? a : i)); setEditItem(null); setViewItem(a);
      showToast("Announcement updated");
    } catch (err: any) { showToast(err.message || "Failed to update"); }
  }
  async function removeItem() {
    if (!deleteItem) return;
    try {
      await api.deleteAdminAnnouncement(deleteItem.id);
      setItems(is => is.filter(i => i.id !== deleteItem.id));
      showToast("Announcement deleted"); setDeleteItem(null); setViewItem(null);
    } catch (err: any) { showToast(err.message || "Failed to delete"); }
  }
  function openView(a: Announcement) {
    if (a.status === "Published") {
      const newViews = a.views + 1;
      if (!isNaN(Number(a.id))) {
        api.updateAdminAnnouncement(a.id, { views: newViews }).catch(() => {});
      }
      setItems(is => is.map(i => i.id === a.id ? { ...i, views: newViews } : i));
      setViewItem({ ...a, views: newViews });
    } else {
      setViewItem(a);
    }
  }

  const stats = {
    total:     items.length,
    published: items.filter(i => i.status === "Published").length,
    drafts:    items.filter(i => i.status === "Draft").length,
    scheduled: items.filter(i => i.status === "Scheduled").length,
  };

  const STAT_CARDS = [
    { label: "Total",     value: stats.total,     icon: Megaphone,    gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Published", value: stats.published, icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { label: "Scheduled", value: stats.scheduled, icon: Clock,        gradient: "from-blue-500 to-cyan-500" },
    { label: "Drafts",    value: stats.drafts,    icon: FileText,     gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 pb-12 pt-6">

          {loading && <div className="mb-4 text-sm text-ink-400 flex items-center gap-2"><span className="size-3.5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent inline-block" />Loading…</div>}
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Announcements</h1>
              <p className="text-sm text-ink-500">{filtered.length} of {items.length} announcements · click any card to view</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-100">
              <Plus className="size-4" /> New Announcement
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
              <input type="search" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 w-64 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex gap-1.5">
              {AUDIENCES.map(a => (
                <button key={a} onClick={() => setAudienceFilter(a)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${audienceFilter === a ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {a}
                </button>
              ))}
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as "All" | AnnouncementStatus)}
              className="h-8 rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 outline-none">
              <option value="All">All Statuses</option>
              {(Object.keys(STATUS_META) as AnnouncementStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Pinned */}
          {pinned.length > 0 && (
            <div className="mb-5 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-500">
                <Pin className="size-3.5 text-violet-500" /> Pinned
              </p>
              <div className="flex flex-col gap-3">
                {pinned.map((a, i) => (
                  <AnnouncementCard key={a.id} item={a} delay={i * 40}
                    onOpen={() => openView(a)}
                    onPin={() => togglePin(a.id)}
                    onEdit={() => setEditItem(a)}
                    onDelete={() => setDeleteItem(a)}
                    onStatusChange={(st) => changeStatus(a.id, st)}
                    menuOpen={menuOpen === a.id}
                    setMenuOpen={(o) => setMenuOpen(o ? a.id : null)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            {rest.map((a, i) => (
              <AnnouncementCard key={a.id} item={a} delay={i * 40}
                onOpen={() => openView(a)}
                onPin={() => togglePin(a.id)}
                onEdit={() => setEditItem(a)}
                onDelete={() => setDeleteItem(a)}
                onStatusChange={(st) => changeStatus(a.id, st)}
                menuOpen={menuOpen === a.id}
                setMenuOpen={(o) => setMenuOpen(o ? a.id : null)}
              />
            ))}
            {filtered.length === 0 && <p className="py-16 text-center text-sm text-ink-400">No announcements match your filters.</p>}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreate && <AnnouncementModal mode="create" onClose={() => setShowCreate(false)} onSave={addItem} />}
      {editItem && <AnnouncementModal mode="edit" item={editItem} onClose={() => setEditItem(null)} onSave={updateItem} />}
      {viewItem && !editItem && (
        <AnnouncementDetail item={viewItem} onClose={() => setViewItem(null)}
          onEdit={() => setEditItem(viewItem)}
          onDelete={() => setDeleteItem(viewItem)}
          onPin={() => { togglePin(viewItem.id); setViewItem(v => v ? { ...v, pinned: !v.pinned } : v); }}
          onStatusChange={(st) => changeStatus(viewItem.id, st)}
        />
      )}
      {deleteItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Announcement</h3>
            <p className="mt-1 text-sm text-ink-500">Delete <strong>"{deleteItem.title}"</strong>?</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteItem(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={removeItem} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
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

/* ─────────── Announcement Card ─────────── */
function AnnouncementCard({
  item: a, delay, onOpen, onPin, onEdit, onDelete, onStatusChange, menuOpen, setMenuOpen,
}: {
  item: Announcement; delay: number;
  onOpen: () => void; onPin: () => void; onEdit: () => void; onDelete: () => void;
  onStatusChange: (st: AnnouncementStatus) => void;
  menuOpen: boolean; setMenuOpen: (o: boolean) => void;
}) {
  const aud = AUDIENCE_META[a.audience];
  const st = STATUS_META[a.status];
  const pri = PRIORITY_META[a.priority];

  return (
    <div onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card transition hover:shadow-md hover:scale-[1.005] hover:border-violet-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}>
      <div className={`h-1 w-full bg-gradient-to-r ${aud.gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${aud.gradient} text-white shadow-sm`}>
              <Megaphone className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-ink-900">{a.title}</h3>
                {a.pinned && <Pin className="size-3.5 fill-violet-500 text-violet-500" />}
                {a.priority !== "Normal" && (
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${pri.bg} ${pri.text}`}>
                    {a.priority === "Urgent" && <Sparkles className="size-2.5" />}{a.priority}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${aud.bg} ${aud.text}`}>
                  {aud.icon}{a.audience}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${st.bg} ${st.text}`}>
                  {st.icon}{a.status}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-600 line-clamp-2">{a.body}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-ink-400">
                <span className="flex items-center gap-1.5">
                  <img src={a.authorAvatar} alt="" className="size-4 rounded-full" />
                  {a.author}
                </span>
                <span className="flex items-center gap-1"><Calendar className="size-3" />{a.date}</span>
                {a.status === "Published" && <span className="flex items-center gap-1"><Eye className="size-3" />{a.views.toLocaleString()}</span>}
              </div>
            </div>
          </div>
          <div className="relative flex shrink-0 items-center gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={onPin} title={a.pinned ? "Unpin" : "Pin"}
              className={`rounded-md p-1.5 transition hover:bg-violet-50 ${a.pinned ? "text-violet-600" : "text-ink-400"}`}>
              <Pin className={`size-3.5 ${a.pinned ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100">
              <MoreHorizontal className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                <button onClick={() => { onOpen(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Details</button>
                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Edit2 className="size-3.5" />Edit</button>
                <div className="my-1 border-t border-ink-100" />
                <p className="px-3 pt-1 text-[9px] font-bold uppercase text-ink-400">Status</p>
                {(Object.keys(STATUS_META) as AnnouncementStatus[]).filter(s => s !== a.status).map(s => (
                  <button key={s} onClick={() => { onStatusChange(s); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-violet-50">
                    <span className={`size-2 rounded-full ${STATUS_META[s].dot}`} />Mark {s}
                  </button>
                ))}
                <div className="my-1 border-t border-ink-100" />
                <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Detail Modal ─────────── */
function AnnouncementDetail({ item: a, onClose, onEdit, onDelete, onPin, onStatusChange }: {
  item: Announcement; onClose: () => void; onEdit: () => void; onDelete: () => void; onPin: () => void;
  onStatusChange: (st: AnnouncementStatus) => void;
}) {
  const aud = AUDIENCE_META[a.audience];
  const pri = PRIORITY_META[a.priority];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className={`bg-gradient-to-br ${aud.gradient} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur">{aud.icon} <span className="ml-0.5">{a.audience}</span></span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur">{a.status}</span>
              {a.priority !== "Normal" && <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur">{a.priority}</span>}
              {a.pinned && <Pin className="size-4 fill-white text-white" />}
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
          <h2 className="mt-3 text-2xl font-bold leading-tight">{a.title}</h2>
        </div>

        <div className="p-6">
          {/* Author */}
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
            <img src={a.authorAvatar} alt={a.author} className="size-11 rounded-full object-cover ring-2 ring-white" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">{a.author}</p>
              <p className="text-xs text-ink-500">{a.authorRole}</p>
            </div>
            <div className="text-right text-xs text-ink-500">
              <p className="flex items-center gap-1"><Calendar className="size-3" />{a.date}</p>
              {a.status === "Published" && <p className="flex items-center justify-end gap-1 text-ink-400"><Eye className="size-3" />{a.views.toLocaleString()} views</p>}
            </div>
          </div>

          {/* Body */}
          <div className="mb-5 rounded-xl border border-ink-100 bg-white p-4">
            <h4 className="mb-2 text-[10px] font-bold uppercase text-ink-400">Message</h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{a.body}</p>
          </div>

          {/* Meta grid */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <MetaCard label="Audience" value={a.audience} />
            <MetaCard label="Priority" value={a.priority} className={`${pri.bg} ${pri.text}`} />
            <MetaCard label="Status"   value={a.status} />
          </div>

          {/* Status changer */}
          <div className="mb-5">
            <p className="mb-2 text-[10px] font-bold uppercase text-ink-400">Change Status</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_META) as AnnouncementStatus[]).map(s => (
                <button key={s} onClick={() => onStatusChange(s)}
                  className={`rounded-xl border-2 py-2 text-xs font-bold transition ${a.status === s ? `border-transparent ${STATUS_META[s].bg} ${STATUS_META[s].text}` : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={onPin} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
              <Pin className={`size-4 ${a.pinned ? "fill-violet-600 text-violet-600" : ""}`} />{a.pinned ? "Unpin" : "Pin"}
            </button>
            <button onClick={onDelete} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 className="size-4" />Delete</button>
            <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"><Edit2 className="size-4" />Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
      <p className="text-[10px] font-bold uppercase text-ink-400">{label}</p>
      <p className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${className || "text-ink-900"}`}>{value}</p>
    </div>
  );
}

/* ─────────── Create / Edit Modal ─────────── */
const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function AnnouncementModal({ mode, item, onClose, onSave }: {
  mode: "create" | "edit"; item?: Announcement; onClose: () => void; onSave: (a: Announcement) => void;
}) {
  const seed = item || {} as Announcement;
  const [form, setForm] = useState({
    title: seed.title || "",
    body: seed.body || "",
    audience: (seed.audience || "All") as Audience,
    status: (seed.status || "Published") as AnnouncementStatus,
    priority: (seed.priority || "Normal") as Priority,
  });
  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })); }
  const valid = form.title.trim() && form.body.trim();

  function submit() {
    if (!valid) return;
    const now = new Date();
    onSave({
      id: item?.id || `a${Date.now()}`,
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      status: form.status,
      priority: form.priority,
      date: item?.date || now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAt: item?.createdAt || now.toISOString(),
      pinned: item?.pinned ?? false,
      views: item?.views ?? 0,
      author: item?.author || "Priscilla Lily",
      authorAvatar: item?.authorAvatar || "https://i.pravatar.cc/80?img=47",
      authorRole: item?.authorRole || "Admin",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Megaphone className="size-5" />{mode === "create" ? "New Announcement" : "Edit Announcement"}</h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Title *"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Announcement title..." className={fieldCls} autoFocus /></Field>
          <Field label="Message *"><textarea rows={5} value={form.body} onChange={e => set("body", e.target.value)} placeholder="Write your announcement..." className={`${fieldCls} h-auto py-2 resize-none`} /></Field>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Audience</p>
            <div className="grid grid-cols-4 gap-2">
              {(["All","Students","Teachers","Parents"] as Audience[]).map(au => (
                <button key={au} type="button" onClick={() => set("audience", au)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-xs font-bold transition ${form.audience === au ? `border-transparent bg-gradient-to-br ${AUDIENCE_META[au].gradient} text-white` : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                  {AUDIENCE_META[au].icon}{au}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-ink-700">Priority</p>
              <div className="flex gap-1.5">
                {(["Normal","Important","Urgent"] as Priority[]).map(p => (
                  <button key={p} type="button" onClick={() => set("priority", p)}
                    className={`flex-1 rounded-xl border-2 py-1.5 text-xs font-bold transition ${form.priority === p ? "border-violet-600 bg-violet-50 text-violet-700" : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>{p}</button>
                ))}
              </div>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as AnnouncementStatus)} className={fieldCls}>
                {(Object.keys(STATUS_META) as AnnouncementStatus[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">Cancel</button>
          <button onClick={submit} disabled={!valid} className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:shadow-lg">
            {mode === "create" ? <><Send className="size-4" />Publish</> : <><Check className="size-4" />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
