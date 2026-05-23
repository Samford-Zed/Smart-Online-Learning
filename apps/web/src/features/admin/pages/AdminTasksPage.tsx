import { useState, useMemo, useEffect } from "react";
import {
  Plus, X, Circle, CheckCircle2, Clock, MoreHorizontal, Search, Calendar, Flag, User,
  Edit2, Trash2, Eye, AlertTriangle, Check, ListTodo, TrendingUp, Flame, ClipboardList,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type Priority = "High" | "Medium" | "Low";
type TaskStatus = "To Do" | "In Progress" | "Done";
type Tag = "Academic" | "Administrative" | "Communication" | "Facilities" | "Finance";

type Task = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar: string;
  priority: Priority;
  due: string;              // ISO YYYY-MM-DD
  status: TaskStatus;
  tag: Tag;
  checklist: { text: string; done: boolean }[];
};

const ASSIGNEES = [
  { name: "Admin",              avatar: "https://i.pravatar.cc/80?img=47" },
  { name: "Dr. Alice Monroe",   avatar: "https://i.pravatar.cc/80?img=49" },
  { name: "Mr. James Okafor",   avatar: "https://i.pravatar.cc/80?img=11" },
  { name: "Ms. Clara Zhang",    avatar: "https://i.pravatar.cc/80?img=45" },
  { name: "Mr. David Mensah",   avatar: "https://i.pravatar.cc/80?img=14" },
  { name: "Ms. Fatima Hassan",  avatar: "https://i.pravatar.cc/80?img=41" },
];

const PRIORITY_META: Record<Priority, { bg: string; text: string; ring: string; gradient: string }> = {
  High:   { bg: "bg-red-50",     text: "text-red-700",     ring: "ring-red-200",     gradient: "from-red-500 to-orange-500" },
  Medium: { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   gradient: "from-amber-500 to-yellow-500" },
  Low:    { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", gradient: "from-emerald-500 to-teal-500" },
};

const TAG_META: Record<Tag, string> = {
  Academic:       "bg-violet-100 text-violet-700",
  Administrative: "bg-blue-100 text-blue-700",
  Communication:  "bg-cyan-100 text-cyan-700",
  Facilities:     "bg-orange-100 text-orange-700",
  Finance:        "bg-emerald-100 text-emerald-700",
};

const COLUMNS: TaskStatus[] = ["To Do", "In Progress", "Done"];

const COL_META: Record<TaskStatus, { icon: React.ReactNode; accent: string; dotBg: string }> = {
  "To Do":       { icon: <Circle className="size-4 text-ink-400" />,        accent: "border-t-ink-400",     dotBg: "bg-ink-100" },
  "In Progress": { icon: <Clock className="size-4 text-amber-500" />,       accent: "border-t-amber-400",   dotBg: "bg-amber-100" },
  "Done":        { icon: <CheckCircle2 className="size-4 text-emerald-500" />, accent: "border-t-emerald-400", dotBg: "bg-emerald-100" },
};

function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtDate(iso: string) { if (!iso) return "—"; return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function daysUntil(iso: string) {
  if (!iso) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(iso); d.setHours(0,0,0,0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

const INITIAL: Task[] = [
  { id: "tk1", title: "Upload Q3 exam results",          description: "Add Biology & Math exam results to the portal and notify parents.", assignee: "Dr. Alice Monroe", assigneeAvatar: ASSIGNEES[1].avatar, priority: "High",   due: "2024-10-30", status: "To Do",       tag: "Academic", checklist: [{text:"Collect results from teachers",done:true},{text:"Upload to portal",done:false},{text:"Send parent notifications",done:false}] },
  { id: "tk2", title: "Review teacher applications",     description: "Screen applications for 3 open positions.",                          assignee: "Admin",             assigneeAvatar: ASSIGNEES[0].avatar, priority: "High",   due: "2024-10-28", status: "To Do",       tag: "Administrative", checklist: [{text:"Shortlist CVs",done:false},{text:"Schedule interviews",done:false}] },
  { id: "tk3", title: "Update course schedules",         description: "Reschedule Chemistry labs for November.",                            assignee: "Mr. David Mensah",  assigneeAvatar: ASSIGNEES[4].avatar, priority: "Medium", due: "2024-11-02", status: "In Progress", tag: "Academic", checklist: [{text:"Gather conflicts",done:true},{text:"Draft new schedule",done:true},{text:"Approval",done:false}] },
  { id: "tk4", title: "Send parent newsletter",          description: "Monthly newsletter with academic updates.",                          assignee: "Admin",             assigneeAvatar: ASSIGNEES[0].avatar, priority: "Medium", due: "2024-10-31", status: "In Progress", tag: "Communication", checklist: [{text:"Draft content",done:true},{text:"Design template",done:false},{text:"Send",done:false}] },
  { id: "tk5", title: "Audit student attendance",        description: "Generate attendance report for Q3.",                                 assignee: "Mr. James Okafor", assigneeAvatar: ASSIGNEES[2].avatar, priority: "Low",    due: "2024-11-05", status: "In Progress", tag: "Academic", checklist: [] },
  { id: "tk6", title: "Library inventory update",        description: "Catalog new book arrivals.",                                         assignee: "Admin",             assigneeAvatar: ASSIGNEES[0].avatar, priority: "Low",    due: "2024-11-08", status: "Done",        tag: "Facilities", checklist: [{text:"Receive shipment",done:true},{text:"Catalog books",done:true}] },
  { id: "tk7", title: "Publish fall term grades",        description: "Grades approved and ready to publish.",                              assignee: "Admin",             assigneeAvatar: ASSIGNEES[0].avatar, priority: "High",   due: "2024-10-25", status: "Done",        tag: "Academic", checklist: [{text:"Final review",done:true},{text:"Publish",done:true}] },
];

type PriorityFilter = "All" | Priority;

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");
  const [tagFilter, setTagFilter] = useState<"All" | Tag>("All");
  const [showCreate, setShowCreate] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2400); }

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const res = await api.getAdminTasks();
      if (res.success && res.data.length > 0) {
        setTasks(res.data.map((t: any) => ({
          id: String(t.id),
          title: t.title,
          description: t.description || "",
          assignee: t.assignee || "Admin",
          assigneeAvatar: t.assignee_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.assignee}`,
          priority: t.priority as Priority,
          due: t.due ? String(t.due).slice(0, 10) : "",
          status: t.status as TaskStatus,
          tag: t.tag as Tag,
          checklist: Array.isArray(t.checklist) ? t.checklist : [],
        })));
      } else {
        setTasks(INITIAL);
      }
    } catch {
      setTasks(INITIAL);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase();
    if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.assignee.toLowerCase().includes(q)) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (tagFilter !== "All" && t.tag !== tagFilter) return false;
    return true;
  }), [tasks, search, priorityFilter, tagFilter]);

  async function moveTask(id: string, to: TaskStatus) {
    try {
      await api.updateAdminTask(id, { status: to });
      setTasks(ts => ts.map(t => t.id === id ? { ...t, status: to } : t));
      showToast(`Moved to ${to}`);
    } catch { showToast("Failed to move task"); }
  }
  async function addTask(t: Task) {
    try {
      const res = await api.createAdminTask({
        title: t.title, description: t.description, assignee: t.assignee,
        assignee_avatar: t.assigneeAvatar, priority: t.priority,
        due: t.due || null, status: t.status, tag: t.tag, checklist: t.checklist,
      });
      const created: Task = { ...t, id: String(res.data?.id || Date.now()) };
      setTasks(ts => [created, ...ts]); setShowCreate(false);
      showToast(`"${t.title}" added`);
    } catch (err: any) { showToast(err.message || "Failed to create task"); }
  }
  async function updateTask(t: Task) {
    try {
      await api.updateAdminTask(t.id, {
        title: t.title, description: t.description, assignee: t.assignee,
        assignee_avatar: t.assigneeAvatar, priority: t.priority,
        due: t.due || null, status: t.status, tag: t.tag, checklist: t.checklist,
      });
      setTasks(ts => ts.map(x => x.id === t.id ? t : x)); setEditTask(null); setViewTask(t);
      showToast("Task updated");
    } catch (err: any) { showToast(err.message || "Failed to update task"); }
  }
  async function toggleCheck(taskId: string, idx: number) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newChecklist = task.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c);
    try {
      await api.updateAdminTask(taskId, { checklist: newChecklist });
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, checklist: newChecklist } : t));
    } catch { setTasks(ts => ts.map(t => t.id === taskId ? { ...t, checklist: newChecklist } : t)); }
  }
  async function removeTask() {
    if (!deleteTask) return;
    try {
      await api.deleteAdminTask(deleteTask.id);
      setTasks(ts => ts.filter(t => t.id !== deleteTask.id));
      showToast("Task deleted"); setDeleteTask(null); setViewTask(null);
    } catch (err: any) { showToast(err.message || "Failed to delete task"); }
  }

  /* stats */
  const todayStr = today();
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Done").length;
  const progressPct = total === 0 ? 0 : Math.round(completed / total * 100);
  const overdue = tasks.filter(t => t.status !== "Done" && t.due && t.due < todayStr).length;
  const dueToday = tasks.filter(t => t.status !== "Done" && t.due === todayStr).length;

  const STAT_CARDS = [
    { label: "Total Tasks",  value: total,      icon: ListTodo,    gradient: "from-violet-500 to-fuchsia-500" },
    { label: "In Progress",  value: tasks.filter(t => t.status === "In Progress").length, icon: Clock, gradient: "from-amber-500 to-orange-500" },
    { label: "Completed",    value: `${progressPct}%`, icon: TrendingUp, gradient: "from-emerald-500 to-green-500" },
    { label: "Overdue",      value: overdue,    icon: Flame,       gradient: "from-red-500 to-rose-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pb-12 pt-6">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Tasks</h1>
              <p className="text-sm text-ink-500">{filtered.length} of {tasks.length} tasks · {dueToday > 0 && <span className="font-bold text-amber-600">{dueToday} due today</span>}{dueToday > 0 && overdue > 0 && " · "}{overdue > 0 && <span className="font-bold text-red-600">{overdue} overdue</span>}</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-100">
              <Plus className="size-4" /> Add Task
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
              <input type="search" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 w-64 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex gap-1.5">
              {(["All","High","Medium","Low"] as PriorityFilter[]).map(p => (
                <button key={p} onClick={() => setPriorityFilter(p)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${priorityFilter === p ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {p}
                </button>
              ))}
            </div>
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value as "All" | Tag)}
              className="h-8 rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 outline-none">
              <option value="All">All Tags</option>
              {(Object.keys(TAG_META) as Tag[]).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Kanban */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {COLUMNS.map(col => {
              const colTasks = filtered.filter(t => t.status === col);
              const meta = COL_META[col];
              return (
                <div key={col} className="flex flex-col gap-3">
                  <div className={`flex items-center gap-2 rounded-2xl border-t-4 border border-ink-200 bg-white px-4 py-3 shadow-card ${meta.accent}`}>
                    {meta.icon}
                    <span className="font-bold text-ink-900">{col}</span>
                    <span className={`ml-auto flex size-6 items-center justify-center rounded-full ${meta.dotBg} text-xs font-bold text-ink-700`}>{colTasks.length}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {colTasks.map((t, i) => (
                      <TaskCard key={t.id} task={t} idx={i}
                        onOpen={() => setViewTask(t)}
                        onMove={(to) => moveTask(t.id, to)}
                        onEdit={() => setEditTask(t)}
                        onDelete={() => setDeleteTask(t)}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="rounded-2xl border-2 border-dashed border-ink-200 py-8 text-center text-xs text-ink-400">No tasks</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreate && <TaskModal mode="create" onClose={() => setShowCreate(false)} onSave={addTask} />}
      {editTask && <TaskModal mode="edit" task={editTask} onClose={() => setEditTask(null)} onSave={updateTask} />}
      {viewTask && !editTask && (
        <TaskDetail task={viewTask} onClose={() => setViewTask(null)} onEdit={() => setEditTask(viewTask)} onDelete={() => setDeleteTask(viewTask)}
          onMove={(to) => { moveTask(viewTask.id, to); setViewTask({ ...viewTask, status: to }); }}
          onToggleCheck={(idx) => { toggleCheck(viewTask.id, idx); setViewTask({ ...viewTask, checklist: viewTask.checklist.map((c,i) => i===idx ? {...c, done: !c.done} : c) }); }}
        />
      )}
      {deleteTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Task</h3>
            <p className="mt-1 text-sm text-ink-500">Delete <strong>{deleteTask.title}</strong>?</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTask(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={removeTask} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
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

/* ─────────── Task Card ─────────── */
function TaskCard({ task: t, idx, onOpen, onMove, onEdit, onDelete }: {
  task: Task; idx: number; onOpen: () => void;
  onMove: (to: TaskStatus) => void; onEdit: () => void; onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const others = COLUMNS.filter(c => c !== t.status);
  const pri = PRIORITY_META[t.priority];
  const du = daysUntil(t.due);
  const overdue = t.status !== "Done" && du !== null && du < 0;
  const dueToday = du === 0;
  const completedCount = t.checklist.filter(c => c.done).length;

  return (
    <div onClick={onOpen}
      className="group cursor-pointer rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition hover:shadow-md hover:scale-[1.01] hover:border-violet-300 animate-fade-in-up"
      style={{ animationDelay: `${idx * 40}ms` }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pri.bg} ${pri.text}`}>
            <Flag className="mr-0.5 inline size-2.5" />{t.priority}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TAG_META[t.tag]}`}>{t.tag}</span>
        </div>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(o => !o)} className="rounded-md p-1 text-ink-400 hover:bg-ink-100">
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-30 w-44 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
              <button onClick={() => { onOpen(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Eye className="size-3.5" />View Details</button>
              <button onClick={() => { onEdit(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50"><Edit2 className="size-3.5" />Edit</button>
              <div className="my-1 border-t border-ink-100" />
              <p className="px-3 pt-1 text-[9px] font-bold uppercase text-ink-400">Move to</p>
              {others.map(col => (
                <button key={col} onClick={() => { onMove(col); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-violet-50">
                  <span className={`size-2 rounded-full ${col === "Done" ? "bg-emerald-500" : col === "In Progress" ? "bg-amber-500" : "bg-ink-400"}`} />{col}
                </button>
              ))}
              <div className="my-1 border-t border-ink-100" />
              <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button>
            </div>
          )}
        </div>
      </div>

      <h4 className="text-sm font-bold text-ink-900 leading-snug">{t.title}</h4>
      {t.description && <p className="mt-1 text-xs text-ink-500 line-clamp-2">{t.description}</p>}

      {t.checklist.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-ink-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="size-3" />{completedCount}/{t.checklist.length}</span>
            <span>{Math.round(completedCount / t.checklist.length * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${pri.gradient} transition-all`} style={{ width: `${completedCount / t.checklist.length * 100}%` }} />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="size-6 rounded-full bg-violet-100 flex items-center justify-center ring-2 ring-white">
            <User className="size-4 text-violet-600" />
          </div>
          <span className="truncate text-[11px] text-ink-500 max-w-[90px]">{t.assignee}</span>
        </div>
        {t.due && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${overdue ? "bg-red-50 text-red-600" : dueToday ? "bg-amber-50 text-amber-700" : "bg-ink-50 text-ink-600"}`}>
            <Calendar className="size-3" />{overdue ? `${Math.abs(du!)}d late` : dueToday ? "Today" : fmtDate(t.due)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────── Task Detail ─────────── */
function TaskDetail({ task: t, onClose, onEdit, onDelete, onMove, onToggleCheck }: {
  task: Task; onClose: () => void; onEdit: () => void; onDelete: () => void;
  onMove: (to: TaskStatus) => void; onToggleCheck: (idx: number) => void;
}) {
  const pri = PRIORITY_META[t.priority];
  const completedCount = t.checklist.filter(c => c.done).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className={`bg-gradient-to-br ${pri.gradient} p-5 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur"><Flag className="mr-0.5 inline size-2.5" />{t.priority}</span>
              <span className={`rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase backdrop-blur`}>{t.tag}</span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur">{t.status}</span>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
          <h2 className="mt-3 text-xl font-bold">{t.title}</h2>
          {t.description && <p className="mt-1 text-sm text-white/90">{t.description}</p>}
        </div>

        <div className="p-6">
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
              <img src={t.assigneeAvatar} alt={t.assignee} className="size-10 rounded-full object-cover ring-2 ring-white" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-ink-400">Assigned To</p>
                <p className="truncate text-sm font-semibold text-ink-900">{t.assignee}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-600"><Calendar className="size-5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase text-ink-400">Due Date</p>
                <p className="text-sm font-semibold text-ink-900">{fmtDate(t.due)}</p>
              </div>
            </div>
          </div>

          {/* Status mover */}
          <div className="mb-5">
            <p className="mb-2 text-[10px] font-bold uppercase text-ink-400">Status</p>
            <div className="flex gap-2">
              {COLUMNS.map(col => (
                <button key={col} onClick={() => onMove(col)}
                  className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold transition ${t.status === col ? "border-violet-600 bg-violet-50 text-violet-700" : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist */}
          {t.checklist.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase text-ink-400">Checklist</p>
                <span className="text-xs font-bold text-ink-600">{completedCount}/{t.checklist.length}</span>
              </div>
              <div className="mb-3 h-2 rounded-full bg-ink-100 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${pri.gradient} transition-all`} style={{ width: `${completedCount / t.checklist.length * 100}%` }} />
              </div>
              <div className="space-y-2">
                {t.checklist.map((c, i) => (
                  <button key={i} onClick={() => onToggleCheck(i)}
                    className={`flex w-full items-center gap-3 rounded-xl border border-ink-100 px-3 py-2 text-left transition hover:border-violet-300 ${c.done ? "bg-ink-50" : "bg-white"}`}>
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-md transition ${c.done ? "bg-violet-600" : "border border-ink-300"}`}>
                      {c.done && <Check className="size-3 text-white" />}
                    </span>
                    <span className={`flex-1 text-sm ${c.done ? "text-ink-400 line-through" : "text-ink-700"}`}>{c.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onDelete} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 className="size-4" />Delete</button>
            <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"><Edit2 className="size-4" />Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Task Modal (Create/Edit) ─────────── */
const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function TaskModal({ mode, task, onClose, onSave }: {
  mode: "create" | "edit"; task?: Task; onClose: () => void; onSave: (t: Task) => void;
}) {
  const seed = task || {} as Task;
  const [form, setForm] = useState({
    title: seed.title || "",
    description: seed.description || "",
    assignee: seed.assignee || ASSIGNEES[0].name,
    assigneeAvatar: seed.assigneeAvatar || ASSIGNEES[0].avatar,
    priority: (seed.priority || "Medium") as Priority,
    due: seed.due || "",
    status: (seed.status || "To Do") as TaskStatus,
    tag: (seed.tag || "Academic") as Tag,
    checklist: seed.checklist || [] as { text: string; done: boolean }[],
    checkInput: "",
  });
  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })); }
  function selectAssignee(name: string) {
    const a = ASSIGNEES.find(x => x.name === name)!;
    setForm(f => ({ ...f, assignee: a.name, assigneeAvatar: a.avatar }));
  }
  function addCheck() {
    if (!form.checkInput.trim()) return;
    setForm(f => ({ ...f, checklist: [...f.checklist, { text: f.checkInput.trim(), done: false }], checkInput: "" }));
  }
  function removeCheck(i: number) { setForm(f => ({ ...f, checklist: f.checklist.filter((_, idx) => idx !== i) })); }

  const valid = form.title.trim();

  function submit() {
    if (!valid) return;
    onSave({
      id: task?.id || `tk${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      assignee: form.assignee,
      assigneeAvatar: form.assigneeAvatar,
      priority: form.priority,
      due: form.due,
      status: form.status,
      tag: form.tag,
      checklist: form.checklist,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardList className="size-5" />{mode === "create" ? "New Task" : "Edit Task"}</h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Title *"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title..." className={fieldCls} autoFocus /></Field>
          <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={`${fieldCls} h-auto py-2`} placeholder="What needs to be done?" /></Field>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Assign to</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ASSIGNEES.map(a => (
                <button key={a.name} type="button" onClick={() => selectAssignee(a.name)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-2 text-left transition ${form.assignee === a.name ? "border-violet-600 bg-violet-50" : "border-ink-200 hover:border-violet-300"}`}>
                  <img src={a.avatar} alt={a.name} className="size-7 rounded-full object-cover" />
                  <span className="truncate text-xs font-semibold text-ink-700">{a.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <div className="flex gap-1.5">
                {(["High","Medium","Low"] as Priority[]).map(p => (
                  <button key={p} type="button" onClick={() => set("priority", p)}
                    className={`flex-1 rounded-xl border-2 py-1.5 text-xs font-bold transition ${form.priority === p ? `border-transparent bg-gradient-to-br ${PRIORITY_META[p].gradient} text-white` : "border-ink-200 text-ink-500 hover:border-violet-300"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as TaskStatus)} className={fieldCls}>
                {COLUMNS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date"><input type="date" value={form.due} onChange={e => set("due", e.target.value)} className={fieldCls} /></Field>
            <Field label="Tag">
              <select value={form.tag} onChange={e => set("tag", e.target.value as Tag)} className={fieldCls}>
                {(Object.keys(TAG_META) as Tag[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Checklist ({form.checklist.length})</p>
            <div className="flex gap-2">
              <input value={form.checkInput} onChange={e => set("checkInput", e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCheck())}
                placeholder="Add a subtask..." className={fieldCls} />
              <button onClick={addCheck} className="rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700">Add</button>
            </div>
            {form.checklist.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {form.checklist.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-ink-100 bg-ink-50 px-3 py-1.5">
                    <span className="flex-1 text-xs text-ink-700">{c.text}</span>
                    <button onClick={() => removeCheck(i)} className="rounded p-1 text-ink-400 hover:bg-red-100 hover:text-red-600"><X className="size-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">Cancel</button>
          <button onClick={submit} disabled={!valid} className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:shadow-lg">
            {mode === "create" ? <><Plus className="size-4" />Create</> : <><Check className="size-4" />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
