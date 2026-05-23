import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Calendar as CalendarIcon,
  GraduationCap, Users as UsersIcon, BookOpen, Bell, Trash2, Pencil, Check, AlertTriangle,
  FileText, User, Layers, Search, Sparkles, CalendarDays,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

/* ─────────────────────────── Types & Categories ─────────────────────────── */
type EventType = "curriculum" | "class" | "meeting" | "exam" | "holiday" | "assignment";

type CalEvent = {
  id: string;
  title: string;
  date: string;          // "YYYY-MM-DD" — start
  endDate?: string;      // multi-day end
  startTime?: string;    // "HH:MM" 24h
  endTime?: string;      // "HH:MM" 24h
  allDay?: boolean;
  location?: string;
  type: EventType;
  description?: string;
  attendees?: string;
};

const TYPE_META: Record<EventType, {
  label: string; bg: string; bgSoft: string; text: string; border: string; ring: string;
  dot: string; gradient: string; icon: typeof CalendarIcon;
}> = {
  curriculum: { label: "Curriculum", bg: "bg-violet-600",  bgSoft: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  ring: "ring-violet-300",  dot: "bg-violet-500",  gradient: "from-violet-500 to-fuchsia-500", icon: BookOpen },
  class:      { label: "Class",      bg: "bg-blue-600",    bgSoft: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    ring: "ring-blue-300",    dot: "bg-blue-500",    gradient: "from-blue-500 to-cyan-500",      icon: GraduationCap },
  meeting:    { label: "Meeting",    bg: "bg-cyan-600",    bgSoft: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    ring: "ring-cyan-300",    dot: "bg-cyan-500",    gradient: "from-cyan-500 to-teal-500",      icon: UsersIcon },
  exam:       { label: "Exam",       bg: "bg-red-600",     bgSoft: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     ring: "ring-red-300",     dot: "bg-red-500",     gradient: "from-red-500 to-orange-500",     icon: FileText },
  holiday:    { label: "Holiday",    bg: "bg-emerald-600", bgSoft: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-300", dot: "bg-emerald-500", gradient: "from-emerald-500 to-green-500",  icon: Bell },
  assignment: { label: "Assignment", bg: "bg-amber-600",   bgSoft: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   ring: "ring-amber-300",   dot: "bg-amber-500",   gradient: "from-amber-500 to-orange-500",   icon: Layers },
};

const TYPES: EventType[] = ["curriculum","class","meeting","exam","holiday","assignment"];

/* ─────────────────────────── Date helpers ─────────────────────────── */
const pad = (n: number) => String(n).padStart(2, "0");
const dstr = (y: number, m: number, d: number) => `${y}-${pad(m+1)}-${pad(d)}`;
const parseDate = (s: string) => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const sameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate()+n); return c; };
const startOfWeek = (d: Date) => addDays(d, -d.getDay());
const daysInMonth = (y: number, m: number) => new Date(y, m+1, 0).getDate();
const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ─────────────────────────── Mock data ─────────────────────────── */
const Y = new Date().getFullYear();
const TM = new Date().getMonth();

function buildInitial(): CalEvent[] {
  return [
    // curriculum (year-long)
    { id: "cu1", title: "Fall Semester Begins",    date: dstr(Y, 8, 5),  type: "curriculum", allDay: true,  location: "Campus",          description: "Official start of Fall semester for all grades." },
    { id: "cu2", title: "Mid-Term Examinations",   date: dstr(Y, 9, 14), endDate: dstr(Y, 9, 18), type: "exam",       allDay: true, location: "All Halls", description: "Mid-term examinations across all subjects." },
    { id: "cu3", title: "Winter Break",            date: dstr(Y, 11, 20), endDate: dstr(Y, 11, 31), type: "holiday", allDay: true, location: "—",      description: "Schools closed for winter break." },
    { id: "cu4", title: "Spring Semester Begins",  date: dstr(Y+1, 0, 8), type: "curriculum", allDay: true,  location: "Campus",          description: "Spring term begins." },
    { id: "cu5", title: "Final Examinations",      date: dstr(Y+1, 4, 15), endDate: dstr(Y+1, 4, 25), type: "exam", allDay: true, location: "Exam Halls", description: "End-of-year final examinations." },
    { id: "cu6", title: "Graduation Ceremony",     date: dstr(Y+1, 5, 10), startTime: "10:00", endTime: "12:00", type: "curriculum", location: "Main Auditorium", description: `Class of ${Y+1} graduation.` },

    // current month: classes
    { id: "cl1", title: "Biology 101 Lecture",     date: dstr(Y, TM, 7),  startTime: "09:00", endTime: "10:30", type: "class",   location: "Room 204", description: "Cell structure and function." },
    { id: "cl2", title: "Calculus Workshop",       date: dstr(Y, TM, 9),  startTime: "11:00", endTime: "12:30", type: "class",   location: "Room 308", description: "Derivatives practice session." },
    { id: "cl3", title: "Physics Lab",             date: dstr(Y, TM, 16), startTime: "13:00", endTime: "15:00", type: "class",   location: "Lab B",    description: "Electromagnetic induction experiments." },
    { id: "cl4", title: "Literature Class",        date: dstr(Y, TM, 22), startTime: "11:00", endTime: "12:00", type: "class",   location: "Room 101", description: "Modern poetry analysis." },
    { id: "cl5", title: "Chemistry Lecture",       date: dstr(Y, TM, 24), startTime: "10:00", endTime: "11:30", type: "class",   location: "Room 211", description: "Organic compounds intro." },

    // meetings
    { id: "m1",  title: "Staff Meeting",           date: dstr(Y, TM, 9),  startTime: "14:00", endTime: "15:30", type: "meeting", location: "Conference Room", attendees: "All teachers", description: "Monthly staff sync." },
    { id: "m2",  title: "Parent-Teacher Conf.",    date: dstr(Y, TM, 21), startTime: "15:00", endTime: "18:00", type: "meeting", location: "Main Hall",       attendees: "Parents & Homeroom Teachers", description: "Term progress reviews." },
    { id: "m3",  title: "Dept. Heads Meeting",     date: dstr(Y, TM, 28), startTime: "10:00", endTime: "11:00", type: "meeting", location: "Admin Boardroom", attendees: "Heads of Department" },

    // exams + assignments
    { id: "ex1", title: "Math Mid-Term",           date: dstr(Y, TM, 14), startTime: "10:00", endTime: "12:00", type: "exam",       location: "Exam Hall A" },
    { id: "ex2", title: "Calculus Quiz",           date: dstr(Y, TM, 28), startTime: "09:00", endTime: "10:00", type: "exam",       location: "Exam Hall B" },
    { id: "as1", title: "Biology Essay Due",       date: dstr(Y, TM, 18), startTime: "23:59", endTime: "23:59", type: "assignment", location: "Online", description: "Cell respiration essay deadline." },

    { id: "h1",  title: "School Founding Day",     date: dstr(Y, TM, 25), type: "holiday", allDay: true, location: "Campus" },
  ];
}

/* ─────────────────────────── Page ─────────────────────────── */
type View = "day" | "week" | "month" | "year";

export default function AdminCalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [view, setView] = useState<View>("month");
  const [events, setEvents] = useState<CalEvent[]>(buildInitial());
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<EventType, boolean>>({ curriculum:true, class:true, meeting:true, exam:true, holiday:true, assignment:true });

  // modals
  const [showAdd, setShowAdd] = useState(false);
  const [addPrefill, setAddPrefill] = useState<Partial<CalEvent> | null>(null);
  const [viewEvent, setViewEvent] = useState<CalEvent | null>(null);
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<CalEvent | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2400); }

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const res = await api.getAdminCalendar();
      if (res.success && res.data.length > 0) {
        const mapped: CalEvent[] = res.data.map((e: any) => ({
          id: String(e.id),
          title: e.title,
          date: String(e.date).slice(0, 10),
          endDate: e.end_date ? String(e.end_date).slice(0, 10) : undefined,
          startTime: e.start_time || undefined,
          endTime: e.end_time || undefined,
          allDay: e.all_day,
          location: e.location || undefined,
          type: e.type as EventType,
          description: e.description || undefined,
          attendees: e.attendees || undefined,
        }));
        setEvents(mapped);
      }
    } catch {
      // keep initial mock data on error
    }
  }

  /* nav */
  function navigate(dir: -1 | 0 | 1) {
    if (dir === 0) { setCursor(new Date(today.getFullYear(), today.getMonth(), today.getDate())); return; }
    const c = new Date(cursor);
    if (view === "day")    c.setDate(c.getDate() + dir);
    if (view === "week")   c.setDate(c.getDate() + dir * 7);
    if (view === "month")  c.setMonth(c.getMonth() + dir);
    if (view === "year")   c.setFullYear(c.getFullYear() + dir);
    setCursor(c);
  }

  /* filtering */
  const visible = useMemo(() => events.filter(e => {
    if (!filters[e.type]) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !(e.location?.toLowerCase().includes(q)) && !(e.description?.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [events, filters, search]);

  function eventsOnDate(d: Date) {
    const ds = dstr(d.getFullYear(), d.getMonth(), d.getDate());
    return visible.filter(e => e.endDate ? e.date <= ds && ds <= e.endDate : e.date === ds);
  }

  /* CRUD */
  async function addEvent(e: CalEvent) {
    try {
      const res = await api.createAdminCalendarEvent({
        title: e.title, date: e.date, end_date: e.endDate || null,
        start_time: e.startTime || null, end_time: e.endTime || null,
        all_day: e.allDay || false, location: e.location || null,
        type: e.type, description: e.description || null, attendees: e.attendees || null,
      });
      const created: CalEvent = { ...e, id: String(res.data?.id || Date.now()) };
      setEvents(es => [...es, created]); setShowAdd(false); setAddPrefill(null);
      showToast(`"${e.title}" added`);
    } catch (err: any) { showToast(err.message || "Failed to add event"); }
  }
  async function updateEvent(e: CalEvent) {
    try {
      await api.updateAdminCalendarEvent(e.id, {
        title: e.title, date: e.date, end_date: e.endDate || null,
        start_time: e.startTime || null, end_time: e.endTime || null,
        all_day: e.allDay || false, location: e.location || null,
        type: e.type, description: e.description || null, attendees: e.attendees || null,
      });
      setEvents(es => es.map(x => x.id === e.id ? e : x)); setEditEvent(null); setViewEvent(null);
      showToast("Event updated");
    } catch (err: any) { showToast(err.message || "Failed to update event"); }
  }
  async function removeEvent() {
    if (!deleteEvent) return;
    try {
      await api.deleteAdminCalendarEvent(deleteEvent.id);
      setEvents(es => es.filter(e => e.id !== deleteEvent.id));
      showToast("Event deleted"); setDeleteEvent(null); setViewEvent(null);
    } catch (err: any) { showToast(err.message || "Failed to delete event"); }
  }

  function openAddOnDate(d: Date) {
    setAddPrefill({ date: dstr(d.getFullYear(), d.getMonth(), d.getDate()) });
    setShowAdd(true);
  }

  /* counts for sidebar */
  const upcoming = useMemo(() => {
    const todayStr = dstr(today.getFullYear(), today.getMonth(), today.getDate());
    return [...visible].filter(e => e.date >= todayStr).sort((a,b) => a.date.localeCompare(b.date) || (a.startTime||"").localeCompare(b.startTime||"")).slice(0, 8);
  }, [visible]);

  /* heading text */
  const headingText = useMemo(() => {
    if (view === "day")   return cursor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (view === "week")  { const s = startOfWeek(cursor); const e = addDays(s, 6); return `${s.toLocaleDateString("en-US",{ month:"short", day:"numeric" })} – ${e.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}`; }
    if (view === "month") return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;
    return `${cursor.getFullYear()}`;
  }, [view, cursor]);

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pb-12 pt-6">

          {/* Hero header */}
          <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-white shadow-lg animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold"><CalendarDays className="size-7" />School Calendar</h1>
                <p className="mt-1 text-sm text-white/90">Yearly curriculum, class schedules, meetings & events — all in one place</p>
              </div>
              <button onClick={() => { setAddPrefill(null); setShowAdd(true); }}
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow-md transition hover:scale-[1.03] active:scale-100">
                <Sparkles className="size-4 text-amber-500 transition group-hover:rotate-12" /> Create Event
              </button>
            </div>

            {/* Quick stats */}
            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-6">
              {TYPES.map(t => {
                const M = TYPE_META[t]; const Icon = M.icon;
                const count = events.filter(e => e.type === t).length;
                const on = filters[t];
                return (
                  <button key={t} onClick={() => setFilters(f => ({ ...f, [t]: !f[t] }))}
                    className={`group flex items-center gap-2 rounded-xl backdrop-blur p-2.5 text-left transition ${on ? "bg-white/20 hover:bg-white/30" : "bg-white/5 opacity-50 hover:opacity-80"}`}>
                    <span className="flex size-9 items-center justify-center rounded-lg bg-white/30 text-white"><Icon className="size-4" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-white/90">{M.label}</p>
                      <p className="text-base font-bold leading-none">{count}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
            {/* ───── Sidebar ───── */}
            <aside className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
              {/* Mini calendar */}
              <MiniCalendar cursor={cursor} setCursor={setCursor} events={visible} />

              {/* Search */}
              <div className="rounded-2xl border border-ink-200 bg-white p-3 shadow-card">
                <label className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
                    className="h-9 w-full rounded-xl border border-ink-200 pl-9 pr-3 text-xs outline-none focus:border-violet-400" />
                </label>
              </div>

              {/* Filters */}
              <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">Categories</h3>
                <div className="flex flex-col gap-1.5">
                  {TYPES.map(t => {
                    const M = TYPE_META[t];
                    const on = filters[t];
                    return (
                      <label key={t} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-ink-50">
                        <span className={`flex size-4 items-center justify-center rounded-md ${on ? M.bg : "bg-ink-100"} transition`}>
                          {on && <Check className="size-3 text-white" />}
                        </span>
                        <input type="checkbox" checked={on} onChange={() => setFilters(f => ({ ...f, [t]: !f[t] }))} className="hidden" />
                        <span className={`flex-1 text-xs font-medium ${on ? "text-ink-800" : "text-ink-400"}`}>{M.label}</span>
                        <span className="text-[10px] font-bold text-ink-400">{events.filter(e => e.type === t).length}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming */}
              <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
                  <Bell className="size-3" />Upcoming
                </h3>
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {upcoming.map(e => {
                    const M = TYPE_META[e.type];
                    return (
                      <button key={e.id} onClick={() => setViewEvent(e)}
                        className={`group text-left rounded-xl border ${M.border} ${M.bgSoft} p-2.5 transition hover:shadow-sm hover:scale-[1.02]`}>
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 inline-block h-full w-1 shrink-0 self-stretch rounded-full ${M.bg}`} />
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-xs font-bold ${M.text}`}>{e.title}</p>
                            <p className="mt-0.5 text-[10px] text-ink-500">
                              {parseDate(e.date).toLocaleDateString("en-US",{ month:"short", day:"numeric" })}
                              {e.startTime && ` · ${e.startTime}`}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {upcoming.length === 0 && <p className="py-4 text-center text-[11px] text-ink-400">No upcoming events</p>}
                </div>
              </div>
            </aside>

            {/* ───── Main calendar area ───── */}
            <section className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-card animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-gradient-to-r from-white to-ink-50/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(-1)} className="rounded-xl border border-ink-200 bg-white p-2 hover:bg-ink-50 transition">
                    <ChevronLeft className="size-4 text-ink-600" />
                  </button>
                  <button onClick={() => navigate(0)} className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                    Today
                  </button>
                  <button onClick={() => navigate(1)} className="rounded-xl border border-ink-200 bg-white p-2 hover:bg-ink-50 transition">
                    <ChevronRight className="size-4 text-ink-600" />
                  </button>
                  <h2 className="ml-2 text-lg font-bold text-ink-900">{headingText}</h2>
                </div>

                <div className="flex rounded-xl border border-ink-200 bg-white p-0.5 shadow-sm">
                  {(["day","week","month","year"] as View[]).map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${view === v ? "bg-violet-600 text-white shadow-sm" : "text-ink-600 hover:bg-ink-50"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* View body */}
              <div className="p-3 sm:p-4">
                {view === "month" && <MonthView cursor={cursor} eventsOnDate={eventsOnDate} onEventClick={setViewEvent} onDayClick={openAddOnDate} today={today} />}
                {view === "week"  && <WeekView  cursor={cursor} visible={visible} onEventClick={setViewEvent} onSlotClick={openAddOnDate} today={today} />}
                {view === "day"   && <DayView   cursor={cursor} visible={visible} onEventClick={setViewEvent} onSlotClick={openAddOnDate} today={today} />}
                {view === "year"  && <YearView  cursor={cursor} visible={visible} today={today} onMonthClick={(m) => { const c = new Date(cursor); c.setMonth(m); setCursor(c); setView("month"); }} />}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showAdd && <EventModal mode="create" prefill={addPrefill} onClose={() => { setShowAdd(false); setAddPrefill(null); }} onSave={addEvent} />}
      {editEvent && <EventModal mode="edit" event={editEvent} onClose={() => setEditEvent(null)} onSave={updateEvent} />}
      {viewEvent && !editEvent && <EventDetail event={viewEvent} onClose={() => setViewEvent(null)} onEdit={() => setEditEvent(viewEvent)} onDelete={() => setDeleteEvent(viewEvent)} />}
      {deleteEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Event</h3>
            <p className="mt-1 text-sm text-ink-500">Delete <strong>{deleteEvent.title}</strong>? This cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteEvent(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={removeEvent} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
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

/* ─────────────────────────── Mini Calendar ─────────────────────────── */
function MiniCalendar({ cursor, setCursor, events }: { cursor: Date; setCursor: (d: Date) => void; events: CalEvent[] }) {
  const [m, setM] = useState({ y: cursor.getFullYear(), mo: cursor.getMonth() });
  const today = new Date();
  const firstDay = firstDayOfMonth(m.y, m.mo);
  const total = daysInMonth(m.y, m.mo);
  const cells = Array.from({ length: firstDay + total }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  function prev() { setM(p => p.mo === 0 ? { y: p.y - 1, mo: 11 } : { y: p.y, mo: p.mo - 1 }); }
  function next() { setM(p => p.mo === 11 ? { y: p.y + 1, mo: 0 } : { y: p.y, mo: p.mo + 1 }); }
  function hasEvent(d: number) {
    const ds = dstr(m.y, m.mo, d);
    return events.some(e => e.endDate ? e.date <= ds && ds <= e.endDate : e.date === ds);
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-ink-900">{MONTH_NAMES[m.mo]} {m.y}</p>
        <div className="flex gap-0.5">
          <button onClick={prev} className="rounded-lg p-1 hover:bg-ink-100"><ChevronLeft className="size-3.5 text-ink-600" /></button>
          <button onClick={next} className="rounded-lg p-1 hover:bg-ink-100"><ChevronRight className="size-3.5 text-ink-600" /></button>
        </div>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-px text-center">
        {DAYS_SHORT.map(d => <span key={d} className="text-[9px] font-bold uppercase text-ink-400">{d[0]}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const isToday = sameDay(new Date(m.y, m.mo, d), today);
          const isCursor = sameDay(new Date(m.y, m.mo, d), cursor);
          const has = hasEvent(d);
          return (
            <button key={d} onClick={() => setCursor(new Date(m.y, m.mo, d))}
              className={`relative flex size-7 items-center justify-center rounded-lg text-[11px] font-semibold transition ${isCursor ? "bg-violet-600 text-white" : isToday ? "bg-violet-100 text-violet-700" : "text-ink-700 hover:bg-ink-100"}`}>
              {d}
              {has && !isCursor && <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-violet-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── Month View ─────────────────────────── */
function MonthView({ cursor, eventsOnDate, onEventClick, onDayClick, today }: {
  cursor: Date; eventsOnDate: (d: Date) => CalEvent[]; onEventClick: (e: CalEvent) => void; onDayClick: (d: Date) => void; today: Date;
}) {
  const y = cursor.getFullYear(), mo = cursor.getMonth();
  const firstDay = firstDayOfMonth(y, mo);
  const total = daysInMonth(y, mo);
  // Build 6-week grid (42 cells) with leading prev-month and trailing next-month days
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ date: addDays(new Date(y, mo, 1), i - firstDay), inMonth: false });
  for (let i = 1; i <= total; i++) cells.push({ date: new Date(y, mo, i), inMonth: true });
  while (cells.length < 42) cells.push({ date: addDays(cells[cells.length-1].date, 1), inMonth: false });

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-ink-100">
        {DAYS_SHORT.map((d, i) => (
          <div key={d} className={`py-2 text-center text-[11px] font-bold uppercase tracking-wide ${i===0||i===6 ? "text-violet-500" : "text-ink-500"}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-ink-100 -mr-px -mb-px">
        {cells.map((c, i) => {
          const isToday = sameDay(c.date, today);
          const isWeekend = c.date.getDay() === 0 || c.date.getDay() === 6;
          const dayEvents = eventsOnDate(c.date);
          return (
            <div key={i} onClick={() => onDayClick(c.date)}
              className={`group relative min-h-[110px] cursor-pointer p-1.5 transition hover:bg-violet-50/40 ${!c.inMonth ? "bg-ink-50/40" : isWeekend ? "bg-ink-50/20" : "bg-white"}`}>
              <div className="mb-1 flex items-center justify-between">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${isToday ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-sm" : c.inMonth ? "text-ink-700" : "text-ink-300"}`}>
                  {c.date.getDate()}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onDayClick(c.date); }}
                  className="rounded p-0.5 text-ink-300 opacity-0 transition group-hover:opacity-100 hover:bg-violet-100 hover:text-violet-600">
                  <Plus className="size-3" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {dayEvents.slice(0, 3).map(e => {
                  const M = TYPE_META[e.type];
                  return (
                    <button key={e.id} onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
                      className={`group/event flex items-center gap-1 truncate rounded-md ${M.bgSoft} px-1.5 py-0.5 text-left text-[10px] font-semibold ${M.text} transition hover:shadow-sm hover:scale-[1.02]`}>
                      <span className={`size-1.5 shrink-0 rounded-full ${M.bg}`} />
                      {e.startTime && !e.allDay && <span className="font-bold opacity-80">{e.startTime}</span>}
                      <span className="truncate">{e.title}</span>
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="px-1 text-[10px] font-bold text-ink-400">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── Week View ─────────────────────────── */
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am - 8pm

function WeekView({ cursor, visible, onEventClick, onSlotClick, today }: {
  cursor: Date; visible: CalEvent[]; onEventClick: (e: CalEvent) => void; onSlotClick: (d: Date) => void; today: Date;
}) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  function eventsForDay(d: Date) {
    const ds = dstr(d.getFullYear(), d.getMonth(), d.getDate());
    return visible.filter(e => e.endDate ? e.date <= ds && ds <= e.endDate : e.date === ds);
  }

  function timeToY(time: string) {
    const [h, m] = time.split(":").map(Number);
    return ((h - HOURS[0]) * 60 + m) * (48 / 60); // 48px per hour
  }

  return (
    <div className="overflow-auto">
      {/* All-day band */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-100">
        <div className="border-r border-ink-100 px-2 py-2 text-right text-[10px] font-bold uppercase text-ink-400">All day</div>
        {days.map((d, i) => {
          const allDay = eventsForDay(d).filter(e => e.allDay || (e.endDate && e.endDate !== e.date));
          return (
            <div key={i} className="min-h-[36px] border-r border-ink-100 p-1">
              <div className="flex flex-col gap-0.5">
                {allDay.map(e => {
                  const M = TYPE_META[e.type];
                  return (
                    <button key={e.id} onClick={() => onEventClick(e)} className={`truncate rounded ${M.bg} px-1.5 py-0.5 text-left text-[10px] font-semibold text-white shadow-sm transition hover:shadow-md`}>
                      {e.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day headers */}
      <div className="sticky top-0 z-10 grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-100 bg-white">
        <div className="border-r border-ink-100" />
        {days.map((d, i) => {
          const isToday = sameDay(d, today);
          return (
            <div key={i} className="border-r border-ink-100 py-2 text-center">
              <p className="text-[10px] font-bold uppercase text-ink-400">{DAYS_SHORT[d.getDay()]}</p>
              <p className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow" : "text-ink-700"}`}>
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
        {/* Hour labels */}
        <div className="border-r border-ink-100">
          {HOURS.map(h => (
            <div key={h} className="h-12 px-2 text-right text-[10px] font-semibold text-ink-400">
              <span className="-translate-y-1.5 inline-block">{h === 12 ? "12 PM" : h > 12 ? `${h-12} PM` : `${h} AM`}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((d, i) => {
          const dayEvents = eventsForDay(d).filter(e => !e.allDay && !(e.endDate && e.endDate !== e.date) && e.startTime);
          return (
            <div key={i} className="relative border-r border-ink-100">
              {HOURS.map(h => (
                <div key={h} onClick={() => { const dt = new Date(d); dt.setHours(h); onSlotClick(dt); }}
                  className="h-12 cursor-pointer border-b border-ink-50 transition hover:bg-violet-50/30" />
              ))}
              {dayEvents.map(e => {
                const top = timeToY(e.startTime!);
                const bottom = e.endTime ? timeToY(e.endTime) : top + 30;
                const height = Math.max(20, bottom - top);
                const M = TYPE_META[e.type];
                return (
                  <button key={e.id} onClick={() => onEventClick(e)}
                    style={{ top: `${top}px`, height: `${height}px` }}
                    className={`absolute left-1 right-1 overflow-hidden rounded-lg bg-gradient-to-br ${M.gradient} px-2 py-1 text-left text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg`}>
                    <p className="truncate text-[10px] font-bold leading-tight">{e.title}</p>
                    <p className="truncate text-[9px] opacity-90">{e.startTime}{e.endTime && ` – ${e.endTime}`}</p>
                    {height > 50 && e.location && <p className="mt-0.5 truncate text-[9px] opacity-80">📍 {e.location}</p>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── Day View ─────────────────────────── */
function DayView({ cursor, visible, onEventClick, onSlotClick, today }: {
  cursor: Date; visible: CalEvent[]; onEventClick: (e: CalEvent) => void; onSlotClick: (d: Date) => void; today: Date;
}) {
  const ds = dstr(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  const dayEvents = visible.filter(e => e.endDate ? e.date <= ds && ds <= e.endDate : e.date === ds);
  const allDay = dayEvents.filter(e => e.allDay || (e.endDate && e.endDate !== e.date));
  const timed = dayEvents.filter(e => !e.allDay && !(e.endDate && e.endDate !== e.date) && e.startTime);
  const isToday = sameDay(cursor, today);

  function timeToY(time: string) { const [h, m] = time.split(":").map(Number); return ((h - HOURS[0]) * 60 + m) * (48 / 60); }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div>
        {/* All-day events */}
        {allDay.length > 0 && (
          <div className="mb-3 rounded-xl border border-ink-100 bg-ink-50/50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase text-ink-400">All-day</p>
            <div className="flex flex-wrap gap-2">
              {allDay.map(e => {
                const M = TYPE_META[e.type];
                return (
                  <button key={e.id} onClick={() => onEventClick(e)}
                    className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br ${M.gradient} px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:scale-[1.03]`}>
                    {e.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Time grid */}
        <div className="relative grid grid-cols-[80px_1fr] rounded-xl border border-ink-100 bg-white">
          <div className="border-r border-ink-100">
            {HOURS.map(h => (
              <div key={h} className="h-12 px-3 text-right text-[10px] font-semibold text-ink-400">
                <span className="-translate-y-1.5 inline-block">{h === 12 ? "12 PM" : h > 12 ? `${h-12} PM` : `${h} AM`}</span>
              </div>
            ))}
          </div>
          <div className="relative">
            {HOURS.map(h => (
              <div key={h} onClick={() => { const dt = new Date(cursor); dt.setHours(h); onSlotClick(dt); }}
                className="h-12 cursor-pointer border-b border-ink-50 transition hover:bg-violet-50/30" />
            ))}
            {timed.map(e => {
              const top = timeToY(e.startTime!);
              const bottom = e.endTime ? timeToY(e.endTime) : top + 40;
              const height = Math.max(28, bottom - top);
              const M = TYPE_META[e.type];
              return (
                <button key={e.id} onClick={() => onEventClick(e)}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  className={`absolute left-2 right-2 overflow-hidden rounded-xl bg-gradient-to-br ${M.gradient} px-3 py-2 text-left text-white shadow-md transition hover:scale-[1.01] hover:shadow-lg`}>
                  <p className="truncate text-sm font-bold">{e.title}</p>
                  <p className="text-[11px] opacity-90">{e.startTime}{e.endTime && ` – ${e.endTime}`}</p>
                  {height > 60 && e.location && <p className="mt-0.5 truncate text-[11px] opacity-90">📍 {e.location}</p>}
                </button>
              );
            })}
            {/* Now line */}
            {isToday && <NowLine />}
          </div>
        </div>
      </div>

      {/* Side schedule list */}
      <div className="rounded-xl border border-ink-100 bg-white p-4">
        <h3 className="mb-3 text-xs font-bold uppercase text-ink-400">Today's Schedule</h3>
        {dayEvents.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-400">No events scheduled</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dayEvents.map(e => {
              const M = TYPE_META[e.type];
              const Icon = M.icon;
              return (
                <button key={e.id} onClick={() => onEventClick(e)}
                  className={`flex items-start gap-3 rounded-xl border ${M.border} ${M.bgSoft} p-3 text-left transition hover:shadow-md hover:scale-[1.02]`}>
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${M.bg} text-white`}><Icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${M.text}`}>{e.title}</p>
                    <p className="mt-0.5 text-[10px] text-ink-500">
                      {e.allDay ? "All day" : e.startTime ? `${e.startTime}${e.endTime ? ` – ${e.endTime}` : ""}` : ""}
                    </p>
                    {e.location && <p className="text-[10px] text-ink-500">📍 {e.location}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function NowLine() {
  const now = new Date();
  if (now.getHours() < HOURS[0] || now.getHours() > HOURS[HOURS.length - 1]) return null;
  const top = ((now.getHours() - HOURS[0]) * 60 + now.getMinutes()) * (48 / 60);
  return (
    <div style={{ top: `${top}px` }} className="pointer-events-none absolute left-0 right-0 z-10 flex items-center">
      <span className="size-2.5 rounded-full bg-red-500 ring-2 ring-red-200" />
      <span className="h-0.5 flex-1 bg-red-500" />
    </div>
  );
}

/* ─────────────────────────── Year View ─────────────────────────── */
function YearView({ cursor, visible, today, onMonthClick }: {
  cursor: Date; visible: CalEvent[]; today: Date; onMonthClick: (m: number) => void;
}) {
  const y = cursor.getFullYear();
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {MONTH_NAMES.map((mName, mi) => {
        const total = daysInMonth(y, mi);
        const fd = firstDayOfMonth(y, mi);
        const cells = Array.from({ length: fd + total }, (_, i) => i < fd ? null : i - fd + 1);
        const monthEvents = visible.filter(e => {
          const sd = parseDate(e.date);
          return sd.getFullYear() === y && sd.getMonth() === mi;
        });
        return (
          <button key={mi} onClick={() => onMonthClick(mi)}
            className="group rounded-2xl border border-ink-200 bg-white p-3 text-left transition hover:border-violet-400 hover:shadow-lg hover:scale-[1.02]">
            <div className="mb-2 flex items-center justify-between">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-sm font-bold text-transparent">{mName}</span>
              {monthEvents.length > 0 && (
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 group-hover:bg-violet-600 group-hover:text-white transition">
                  {monthEvents.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-7 gap-px text-[9px]">
              {DAYS_SHORT.map(d => <div key={d} className="text-center font-bold text-ink-400">{d[0]}</div>)}
              {cells.map((d, i) => {
                if (d === null) return <div key={`e${i}`} />;
                const ds = dstr(y, mi, d);
                const has = visible.some(e => e.endDate ? e.date <= ds && ds <= e.endDate : e.date === ds);
                const isToday = sameDay(new Date(y, mi, d), today);
                return (
                  <span key={d} className={`flex size-4 items-center justify-center rounded ${isToday ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-bold" : has ? "bg-violet-100 text-violet-700 font-semibold" : "text-ink-500"}`}>
                    {d}
                  </span>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Event Detail ─────────────────────────── */
function EventDetail({ event: e, onClose, onEdit, onDelete }: {
  event: CalEvent; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const M = TYPE_META[e.type]; const Icon = M.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in" onClick={ev => ev.stopPropagation()}>
        <div className={`bg-gradient-to-br ${M.gradient} p-5 text-white`}>
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur"><Icon className="size-3" />{M.label}</span>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20 transition"><X className="size-4 text-white" /></button>
          </div>
          <h2 className="mt-3 text-xl font-bold">{e.title}</h2>
          <p className="mt-1 text-xs text-white/90">
            {parseDate(e.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {e.endDate && e.endDate !== e.date && ` → ${parseDate(e.endDate).toLocaleDateString("en-US",{ month:"long", day:"numeric" })}`}
          </p>
        </div>
        <div className="space-y-3 p-5">
          <DetailRow icon={Clock} label="Time" value={e.allDay ? "All day" : e.startTime ? `${e.startTime}${e.endTime ? ` – ${e.endTime}` : ""}` : "—"} />
          {e.location && <DetailRow icon={MapPin} label="Location" value={e.location} />}
          {e.attendees && <DetailRow icon={User} label="Attendees" value={e.attendees} />}
          {e.description && (
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
              <p className="text-[10px] font-bold uppercase text-ink-400 mb-1">Description</p>
              <p className="text-sm text-ink-700">{e.description}</p>
            </div>
          )}
          <div className="mt-5 flex gap-2">
            <button onClick={onDelete} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition"><Trash2 className="size-4" />Delete</button>
            <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"><Pencil className="size-4" />Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function DetailRow({ icon: Icon, label, value }: { icon: typeof CalendarIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-ink-400">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Event Modal (Create/Edit) ─────────────────────────── */
const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function EventModal({ mode, prefill, event, onClose, onSave }: {
  mode: "create" | "edit"; prefill?: Partial<CalEvent> | null; event?: CalEvent;
  onClose: () => void; onSave: (e: CalEvent) => void;
}) {
  const seed = event || prefill || {};
  const [form, setForm] = useState({
    title: seed.title || "",
    type: (seed.type || "class") as EventType,
    date: seed.date || dstr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    multiDay: !!seed.endDate,
    endDate: seed.endDate || "",
    allDay: !!seed.allDay,
    startTime: seed.startTime || "09:00",
    endTime: seed.endTime || "10:00",
    location: seed.location || "",
    attendees: seed.attendees || "",
    description: seed.description || "",
  });
  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })); }
  const valid = form.title.trim() && form.date;

  function submit() {
    if (!valid) return;
    onSave({
      id: event?.id || `e${Date.now()}`,
      title: form.title.trim(),
      type: form.type,
      date: form.date,
      endDate: form.multiDay && form.endDate ? form.endDate : undefined,
      allDay: form.allDay,
      startTime: form.allDay ? undefined : form.startTime,
      endTime: form.allDay ? undefined : form.endTime,
      location: form.location.trim() || undefined,
      attendees: form.attendees.trim() || undefined,
      description: form.description.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className={`bg-gradient-to-br ${TYPE_META[form.type].gradient} px-6 py-5 text-white`}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5" /> {mode === "create" ? "Create Event" : "Edit Event"}
            </h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20"><X className="size-4 text-white" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Category picker */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-ink-400">Category</p>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => {
                const M = TYPE_META[t]; const Icon = M.icon; const on = form.type === t;
                return (
                  <button key={t} type="button" onClick={() => set("type", t)}
                    className={`flex items-center gap-2 rounded-xl border-2 p-2.5 transition ${on ? `border-transparent bg-gradient-to-br ${M.gradient} text-white shadow-md` : "border-ink-200 bg-white text-ink-600 hover:border-violet-300"}`}>
                    <Icon className="size-4" />
                    <span className="text-[11px] font-bold capitalize">{M.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Event Title">
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Math Department Meeting" className={fieldCls} autoFocus />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} className={fieldCls} /></Field>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">Options</span>
              <div className="flex gap-3 pt-2">
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={form.allDay} onChange={e => set("allDay", e.target.checked)} className="size-4 rounded accent-violet-600" />
                  <span className="font-medium text-ink-700">All day</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={form.multiDay} onChange={e => set("multiDay", e.target.checked)} className="size-4 rounded accent-violet-600" />
                  <span className="font-medium text-ink-700">Multi-day</span>
                </label>
              </div>
            </div>
          </div>

          {form.multiDay && (
            <Field label="End Date"><input type="date" value={form.endDate} min={form.date} onChange={e => set("endDate", e.target.value)} className={fieldCls} /></Field>
          )}

          {!form.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time"><input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)} className={fieldCls} /></Field>
              <Field label="End Time"><input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)} className={fieldCls} /></Field>
            </div>
          )}

          <Field label="Location">
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Conference Room A" className={fieldCls} />
          </Field>

          {form.type === "meeting" && (
            <Field label="Attendees">
              <input value={form.attendees} onChange={e => set("attendees", e.target.value)} placeholder="e.g. All teachers, Department heads" className={fieldCls} />
            </Field>
          )}

          <Field label="Description">
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Optional notes..."
              className={`${fieldCls} h-auto py-2`} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">Cancel</button>
          <button onClick={submit} disabled={!valid} className={`inline-flex items-center gap-1 rounded-xl bg-gradient-to-br ${TYPE_META[form.type].gradient} px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:shadow-lg`}>
            {mode === "create" ? <><Plus className="size-4" />Create</> : <><Check className="size-4" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
