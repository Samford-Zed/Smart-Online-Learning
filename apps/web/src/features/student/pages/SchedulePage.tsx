import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Utensils,
  Clock,
  Download,
  Link as LinkIcon,
  X,
  CalendarDays,
  MapPin,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { api } from "../../../services/api";

/* ------------------------- Types & static data ------------------------- */

type EventKind = "live" | "assignment" | "exam" | "review";

type CalendarEvent = {
  id: string;
  title: string;
  subtitle?: string;
  extra?: string[];
  day: 0 | 1 | 2 | 3 | 4; // Mon..Fri
  startHour: number; // 8..16
  endHour: number; // exclusive
  kind: EventKind;
};

const events: CalendarEvent[] = [
  {
    id: "e1",
    title: "Physics …",
    subtitle: "Live",
    day: 0,
    startHour: 9,
    endHour: 10,
    kind: "live",
  },
  {
    id: "e2",
    title: "Study Gro…",
    subtitle: "Library",
    day: 1,
    startHour: 10,
    endHour: 12,
    kind: "review",
  },
  {
    id: "e3",
    title: "Essay Dra…",
    subtitle: "Eng Lit",
    day: 2,
    startHour: 9,
    endHour: 10,
    kind: "assignment",
  },
  {
    id: "e4",
    title: "Midterm Exam",
    subtitle: "Calculus II",
    extra: ["Room 402", "Bring calculator."],
    day: 2,
    startHour: 13,
    endHour: 15,
    kind: "exam",
  },
  {
    id: "e5",
    title: "Art History",
    subtitle: "Live",
    day: 4,
    startHour: 15,
    endHour: 16,
    kind: "live",
  },
];

type Upcoming = {
  id: string;
  title: string;
  dayPill: string;
  dayPillBg: string;
  dayPillText: string;
  time: string;
  location: string;
  cta: string;
};

const upcoming: Upcoming[] = [
  {
    id: "u1",
    title: "Essay Draft Due",
    dayPill: "Wed",
    dayPillBg: "#fef3c7",
    dayPillText: "#b45309",
    time: "9:00 AM",
    location: "English Lit",
    cta: "View Details",
  },
  {
    id: "u2",
    title: "Calculus Midterm",
    dayPill: "Thu",
    dayPillBg: "#fee2e2",
    dayPillText: "#b91c1c",
    time: "1:00 PM",
    location: "Room 402",
    cta: "Study Guide",
  },
  {
    id: "u3",
    title: "Art History Live",
    dayPill: "Fri",
    dayPillBg: "#dbeafe",
    dayPillText: "#1d4ed8",
    time: "3:00 PM",
    location: "Online",
    cta: "Prepare Link",
  },
];

const DAYS = [
  { label: "MON", date: 14 },
  { label: "TUE", date: 15 },
  { label: "WED", date: 16, today: true },
  { label: "THU", date: 17 },
  { label: "FRI", date: 18 },
];

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16]; // 8 AM – 4 PM labels
const ROW_HEIGHT = 72; // px per hour
const TIME_COL = 64; // px

const KIND_STYLES: Record<
  EventKind,
  { bg: string; border: string; title: string; subtitle: string }
> = {
  live: {
    bg: "#dbeafe",
    border: "#2563eb",
    title: "#1e3a8a",
    subtitle: "#1d4ed8",
  },
  assignment: {
    bg: "#fde4c7",
    border: "#f59e0b",
    title: "#7c2d12",
    subtitle: "#b45309",
  },
  exam: {
    bg: "#fee2e2",
    border: "#ef4444",
    title: "#7f1d1d",
    subtitle: "#991b1b",
  },
  review: {
    bg: "#bbf7d0",
    border: "#10b981",
    title: "#064e3b",
    subtitle: "#065f46",
  },
};

const DEFAULT_STYLE = KIND_STYLES.live; // fallback style

function getEventStyle(kind: EventKind) {
  return KIND_STYLES[kind] || DEFAULT_STYLE;
}

type View = "Day" | "Week" | "Month";

/* ----------------------------- Page component ----------------------------- */

export default function SchedulePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [apiEvents, setApiEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentSchedule()
      .then((data: any[]) => {
        // Transform API data to CalendarEvent format and append to existing events
        const transformed: CalendarEvent[] = data.map((e, i) => ({
          id: `api-${e.id || i}`,
          title: e.title || e.name || "Untitled",
          subtitle: e.subtitle || e.location || e.type || "",
          extra: e.extra || e.details || [],
          day: (e.day !== undefined ? e.day : new Date(e.startTime || e.date).getDay() - 1) as 0|1|2|3|4,
          startHour: e.startHour || new Date(e.startTime).getHours() || 9,
          endHour: e.endHour || new Date(e.endTime).getHours() || 10,
          kind: (e.kind || e.type || "live") as EventKind,
        }));
        setApiEvents(transformed);
        setLoading(false);
      })
      .catch(() => {
        // Silently fail - keep showing mock data
        setLoading(false);
      });
  }, []);

  // Combine mock events with API events
  const allEvents = useMemo(() => [...events, ...apiEvents], [apiEvents]);
  const [view, setView] = useState<View>("Week");
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const totalRows = HOURS.length; // 9 rows
  const gridHeight = totalRows * ROW_HEIGHT;

  // "Today" is the day flagged in DAYS (Wed, index 2).
  const todayIdx = DAYS.findIndex((d) => d.today) as 0 | 1 | 2 | 3 | 4;

  // Events that fall on today — used by the Day view.
  const dayEvents = useMemo(
    () =>
      allEvents
        .filter((e) => e.day === todayIdx)
        .sort((a, b) => a.startHour - b.startHour),
    [todayIdx],
  );

  // Display label that adapts to the active view.
  const headerLabel = useMemo(() => {
    if (view === "Day") {
      const d = DAYS[todayIdx];
      return `${d.label} · Oct ${d.date}`;
    }
    if (view === "Month") {
      return "October 2024";
    }
    const startDate = 14 + weekOffset * 7;
    const endDate = startDate + 6;
    return `Week of Oct ${startDate}–${endDate}`;
  }, [view, weekOffset, todayIdx]);

  /** Generates and downloads an .ics file with the current week's events. */
  function handleDownloadIcs() {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SOLS//Schedule//EN",
      ...allEvents.flatMap((e) => [
        "BEGIN:VEVENT",
        `UID:${e.id}@sols`,
        `SUMMARY:${e.title}${e.subtitle ? ` (${e.subtitle})` : ""}`,
        `DESCRIPTION:${e.extra?.join(" ") ?? ""}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sols-schedule.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleSync() {
    // Opens Google Calendar import URL in a new tab.
    window.open(
      "https://calendar.google.com/calendar/u/0/r/settings/export",
      "_blank",
      "noopener",
    );
  }

  /** Handles the right-rail upcoming-card CTAs. */
  function handleUpcomingCta(u: Upcoming) {
    if (u.cta === "View Details") {
      navigate("/student/assignments");
    } else if (u.cta === "Study Guide") {
      navigate("/student/resources");
    } else {
      navigate("/student/assessments");
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-6 py-6 lg:px-10">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* LEFT — calendar card */}
            <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              {/* Header */}
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                    My Schedule
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-sm text-ink-700">
                    <button
                      type="button"
                      onClick={() => setWeekOffset((w) => w - 1)}
                      className="rounded-md p-1 transition hover:bg-ink-100"
                      aria-label="Previous week"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="min-w-[160px] text-center font-medium">
                      {headerLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeekOffset((w) => w + 1)}
                      className="rounded-md p-1 transition hover:bg-ink-100"
                      aria-label="Next week"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    {weekOffset !== 0 && (
                      <button
                        type="button"
                        onClick={() => setWeekOffset(0)}
                        className="ml-2 rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-700 hover:bg-ink-200"
                      >
                        This week
                      </button>
                    )}
                  </div>
                </div>

                {/* View toggle */}
                <div className="flex items-center rounded-full border border-ink-200 bg-white p-1 text-sm">
                  {(["Day", "Week", "Month"] as View[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={
                        "rounded-full px-4 py-1 font-semibold transition " +
                        (view === v
                          ? "bg-white text-ink-900 shadow-card"
                          : "text-ink-500 hover:text-ink-700")
                      }
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </header>

              {/* Calendar grid — Week view */}
              {view === "Week" && (
              <div className="mt-5 overflow-hidden rounded-xl border border-ink-200">
                {/* Day headers */}
                <div
                  className="grid border-b border-ink-200 bg-white text-xs font-semibold text-ink-500"
                  style={{
                    gridTemplateColumns: `${TIME_COL}px repeat(${DAYS.length}, 1fr)`,
                  }}
                >
                  <div />
                  {DAYS.map((d) => (
                    <div
                      key={d.label}
                      className={
                        "flex flex-col items-center gap-1 py-2 " +
                        (d.today ? "bg-brand/5 text-brand" : "")
                      }
                    >
                      <span>{d.label}</span>
                      {d.today ? (
                        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                          {d.date}
                        </span>
                      ) : (
                        <span className="text-base font-bold text-ink-900">
                          {d.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Body with events overlay */}
                <div
                  className="relative"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `${TIME_COL}px repeat(${DAYS.length}, 1fr)`,
                    gridTemplateRows: `repeat(${totalRows}, ${ROW_HEIGHT}px)`,
                    height: gridHeight,
                  }}
                >
                  {/* Background cells */}
                  {HOURS.map((h, rowIdx) => (
                    <div key={`t-${h}`} style={{ gridColumn: 1, gridRow: rowIdx + 1 }}>
                      <div className="flex h-full items-start justify-end pr-3 pt-1 text-[11px] font-medium text-ink-500">
                        {formatHour(h)}
                      </div>
                    </div>
                  ))}

                  {HOURS.map((_, rowIdx) =>
                    DAYS.map((d, colIdx) => (
                      <div
                        key={`cell-${rowIdx}-${colIdx}`}
                        className={
                          "border-b border-l border-ink-100 " +
                          (d.today ? "bg-brand/5" : "")
                        }
                        style={{
                          gridColumn: colIdx + 2,
                          gridRow: rowIdx + 1,
                        }}
                      />
                    )),
                  )}

                  {/* Lunch row (12 PM — row index 4) */}
                  <div
                    className="flex items-center justify-center gap-2 bg-ink-100/80 text-sm font-semibold text-ink-700"
                    style={{
                      gridColumn: `2 / span ${DAYS.length}`,
                      gridRow: `${HOURS.indexOf(12) + 1}`,
                    }}
                  >
                    <Utensils className="size-4" aria-hidden />
                    Lunch Break
                  </div>

                  {/* Events */}
                  {allEvents.map((ev) => {
                    const style = getEventStyle(ev.kind);
                    const rowStart = HOURS.indexOf(ev.startHour) + 1;
                    const rowSpan = ev.endHour - ev.startHour;
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setActiveEvent(ev)}
                        className="m-1 flex flex-col gap-1 rounded-md px-2 py-1.5 text-left text-[11px] transition hover:scale-[1.02] hover:shadow-card focus:outline-none focus:ring-2 focus:ring-brand/30"
                        style={{
                          gridColumn: ev.day + 2,
                          gridRow: `${rowStart} / span ${rowSpan}`,
                          backgroundColor: style.bg,
                          borderLeft: `3px solid ${style.border}`,
                          color: style.title,
                        }}
                      >
                        <div
                          className="text-[12px] font-bold leading-tight"
                          style={{ color: style.title }}
                        >
                          {ev.title}
                        </div>
                        {ev.subtitle && (
                          <div
                            className="flex items-center gap-1 text-[11px] font-semibold"
                            style={{ color: style.subtitle }}
                          >
                            <Dot kind={ev.kind} />
                            {ev.subtitle}
                          </div>
                        )}
                        {ev.extra?.map((line) => (
                          <div
                            key={line}
                            className="text-[11px] leading-tight"
                            style={{ color: style.subtitle }}
                          >
                            {line}
                          </div>
                        ))}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Day view */}
              {view === "Day" && (
                <DayView
                  dayLabel={`${DAYS[todayIdx].label} · Oct ${DAYS[todayIdx].date}`}
                  dayEvents={dayEvents}
                  onEventClick={setActiveEvent}
                />
              )}

              {/* Month view */}
              {view === "Month" && (
                <MonthView events={allEvents} onEventClick={setActiveEvent} />
              )}

              {/* Footer row: legend + actions */}
              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-700">
                  <LegendItem color="#2563eb" label="Live Class" />
                  <LegendItem color="#f59e0b" label="Assignment" />
                  <LegendItem color="#ef4444" label="Exam" />
                  <LegendItem color="#10b981" label="Review" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSync}
                    className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                  >
                    <LinkIcon className="size-4" aria-hidden />
                    Sync with Google
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadIcs}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white shadow-card transition hover:bg-brand-600"
                  >
                    <Download className="size-4" aria-hidden />
                    ICS
                  </button>
                </div>
              </footer>
            </section>

            {/* RIGHT — upcoming panel */}
            <aside className="self-start rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink-900">
                  Upcoming This Week
                </h2>
                <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {upcoming.length + 1}
                </span>
              </header>

              <div className="mt-4 flex flex-col gap-3">
                {upcoming.map((u) => (
                  <article
                    key={u.id}
                    className="rounded-xl border border-ink-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-bold text-ink-900">
                        {u.title}
                      </div>
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                        style={{
                          backgroundColor: u.dayPillBg,
                          color: u.dayPillText,
                        }}
                      >
                        {u.dayPill}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
                      <Clock className="size-3.5" aria-hidden />
                      {u.time} · {u.location}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpcomingCta(u)}
                      className="mt-3 w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
                    >
                      {u.cta}
                    </button>
                  </article>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllUpcoming(true)}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  View All Upcoming
                </button>
              </div>
            </aside>
          </div>

          {/* Event detail modal */}
          {activeEvent && (
            <EventModal
              event={activeEvent}
              onClose={() => setActiveEvent(null)}
            />
          )}

          {/* All-upcoming modal */}
          {showAllUpcoming && (
            <AllUpcomingModal
              upcoming={upcoming}
              events={allEvents}
              onClose={() => setShowAllUpcoming(false)}
              onEventClick={(ev) => {
                setShowAllUpcoming(false);
                setActiveEvent(ev);
              }}
              onUpcomingClick={(u) => {
                setShowAllUpcoming(false);
                if (u.cta === "View Details") navigate("/student/assignments");
                else if (u.cta === "Study Guide") navigate("/student/resources");
                else navigate("/student/assessments");
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------- Day view ------------------------------- */

function DayView({
  dayLabel,
  dayEvents,
  onEventClick,
}: {
  dayLabel: string;
  dayEvents: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-ink-200">
      <header className="flex items-center justify-between border-b border-ink-200 bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand">
        <span>{dayLabel}</span>
        <span className="text-xs font-medium text-ink-700">
          {dayEvents.length}{" "}
          {dayEvents.length === 1 ? "event" : "events"}
        </span>
      </header>

      {/* Hour rows */}
      <div className="relative">
        {HOURS.map((h) => {
          if (h === 12) {
            return (
              <div
                key={`d-${h}`}
                className="flex items-center gap-2 border-b border-ink-100 bg-ink-100/80 px-4 py-2 text-sm font-semibold text-ink-700"
              >
                <Utensils className="size-4" aria-hidden />
                Lunch Break
              </div>
            );
          }
          const hourEvents = dayEvents.filter(
            (e) => e.startHour <= h && e.endHour > h,
          );
          return (
            <div
              key={`d-${h}`}
              className="flex min-h-[68px] gap-3 border-b border-ink-100 px-4 py-2 last:border-0"
            >
              <div className="w-16 shrink-0 text-[11px] font-medium text-ink-500">
                {formatHour(h)}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {hourEvents
                  .filter((e) => e.startHour === h)
                  .map((ev) => {
                    const style = getEventStyle(ev.kind);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onEventClick(ev)}
                        className="flex flex-col gap-0.5 rounded-md px-3 py-2 text-left text-xs transition hover:scale-[1.01] hover:shadow-card focus:outline-none focus:ring-2 focus:ring-brand/30"
                        style={{
                          backgroundColor: style.bg,
                          borderLeft: `3px solid ${style.border}`,
                          color: style.title,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold">{ev.title}</div>
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: style.subtitle }}
                          >
                            {formatHour(ev.startHour)} –{" "}
                            {formatHour(ev.endHour)}
                          </span>
                        </div>
                        {ev.subtitle && (
                          <div
                            className="flex items-center gap-1 text-[11px] font-semibold"
                            style={{ color: style.subtitle }}
                          >
                            <Dot kind={ev.kind} />
                            {ev.subtitle}
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}

        {dayEvents.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-ink-500">
            Nothing scheduled for today.
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Month view ------------------------------- */

const MONTH_DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/**
 * October 2024 starts on a Tuesday (Oct 1). For mock purposes we render a
 * 5-week grid (35 cells) starting on the Sunday before Oct 1 (Sep 29).
 */
const MONTH_FIRST_OFFSET = 2; // Oct 1 is Tue (index 2)
const MONTH_DAYS_IN_OCT = 31;
const TODAY_MONTH_DATE = 16; // matches "today" flag in DAYS

function MonthView({
  events,
  onEventClick,
}: {
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}) {
  // For each weekday-Mon..Fri (1..5), build a per-date event list by
  // repeating the existing CalendarEvent template across that weekday so
  // the month feels populated. (Mock-data shortcut.)
  function eventsForDate(date: number): CalendarEvent[] {
    const weekday = (MONTH_FIRST_OFFSET + (date - 1)) % 7; // 0..6
    const dayIdx = weekday - 1; // Mon=0..Fri=4 (matches CalendarEvent.day)
    if (dayIdx < 0 || dayIdx > 4) return [];
    return events.filter((e) => e.day === dayIdx);
  }

  // Build the 5×7 grid (35 cells). Cells before Oct 1 / after Oct 31 are
  // rendered as empty placeholders.
  const cells: { date: number | null }[] = [];
  for (let i = 0; i < MONTH_FIRST_OFFSET; i++) cells.push({ date: null });
  for (let d = 1; d <= MONTH_DAYS_IN_OCT; d++) cells.push({ date: d });
  while (cells.length % 7 !== 0) cells.push({ date: null });

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-ink-200">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-ink-200 bg-white text-center text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {MONTH_DAY_HEADERS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {/* 5×7 grid */}
      <div className="grid grid-cols-7 grid-rows-5">
        {cells.map((c, i) => {
          if (c.date === null) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-[88px] border-b border-l border-ink-100 bg-ink-50/40 first:border-l-0"
                style={{ borderLeft: i % 7 === 0 ? "none" : undefined }}
              />
            );
          }
          const dateEvents = eventsForDate(c.date);
          const isToday = c.date === TODAY_MONTH_DATE;
          return (
            <div
              key={`d-${c.date}`}
              className={
                "min-h-[88px] border-b border-l border-ink-100 p-1.5 transition hover:bg-ink-50/60 " +
                (i % 7 === 0 ? "border-l-0 " : "") +
                (isToday ? "bg-brand/5" : "")
              }
            >
              <div className="flex items-center justify-between">
                <span
                  className={
                    "flex size-6 items-center justify-center rounded-full text-[11px] font-bold " +
                    (isToday
                      ? "bg-brand text-white"
                      : "text-ink-700")
                  }
                >
                  {c.date}
                </span>
                {dateEvents.length > 0 && (
                  <span className="text-[10px] font-semibold text-ink-500">
                    {dateEvents.length}
                  </span>
                )}
              </div>

              <ul className="mt-1 flex flex-col gap-0.5">
                {dateEvents.slice(0, 2).map((ev) => {
                  const style = getEventStyle(ev.kind);
                  return (
                    <li key={ev.id}>
                      <button
                        type="button"
                        onClick={() => onEventClick(ev)}
                        className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-semibold transition hover:opacity-90"
                        style={{
                          backgroundColor: style.bg,
                          color: style.title,
                          borderLeft: `2px solid ${style.border}`,
                        }}
                      >
                        {ev.title}
                      </button>
                    </li>
                  );
                })}
                {dateEvents.length > 2 && (
                  <li className="px-1.5 text-[10px] font-medium text-ink-500">
                    +{dateEvents.length - 2} more
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- All Upcoming modal --------------------------- */

function AllUpcomingModal({
  upcoming,
  events,
  onClose,
  onEventClick,
  onUpcomingClick,
}: {
  upcoming: Upcoming[];
  events: CalendarEvent[];
  onClose: () => void;
  onEventClick: (e: CalendarEvent) => void;
  onUpcomingClick: (u: Upcoming) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card animate-scale-in"
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <div>
            <h2 className="text-base font-bold text-ink-900">
              All Upcoming
            </h2>
            <p className="text-xs text-ink-500">
              {upcoming.length + events.length} items in the next 14 days
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Right-rail upcoming list */}
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
            Highlights
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {upcoming.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onUpcomingClick(u)}
                  className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 text-left transition hover:border-brand/40 hover:shadow-card"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                    style={{
                      backgroundColor: u.dayPillBg,
                      color: u.dayPillText,
                    }}
                  >
                    {u.dayPill}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink-900">
                      {u.title}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {u.time} · {u.location}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-brand">
                    {u.cta}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Calendar events */}
          <h3 className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-500">
            This Week's Events
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {allEvents.map((ev) => {
              const style = getEventStyle(ev.kind);
              const day = DAYS[ev.day];
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => onEventClick(ev)}
                    className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 text-left transition hover:border-brand/40 hover:shadow-card"
                  >
                    <span
                      className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: style.bg,
                        color: style.subtitle,
                      }}
                    >
                      <span>{day.label}</span>
                      <span className="text-sm leading-none text-ink-900">
                        {day.date}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink-900">
                        {ev.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatHour(ev.startHour)} – {formatHour(ev.endHour)}
                        {ev.subtitle ? ` · ${ev.subtitle}` : ""}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: style.subtitle }}
                    >
                      {ev.kind}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="border-t border-ink-100 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ----------------------------- Event modal ----------------------------- */

function EventModal({
  event,
  onClose,
}: {
  event: CalendarEvent;
  onClose: () => void;
}) {
  const style = getEventStyle(event.kind);
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-5 shadow-card animate-scale-in"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: style.bg, color: style.subtitle }}
            >
              {event.kind}
            </span>
            <h2 className="mt-2 text-lg font-bold text-ink-900">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-700">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 text-ink-500" aria-hidden />
            {DAYS[event.day].label} · {DAYS[event.day].date} Oct
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-ink-500" aria-hidden />
            {formatHour(event.startHour)} – {formatHour(event.endHour)}
          </li>
          {event.subtitle && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-ink-500" aria-hidden />
              {event.subtitle}
            </li>
          )}
          {event.extra?.map((line) => (
            <li key={line} className="text-xs text-ink-500">
              • {line}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Small bits ------------------------------ */

function formatHour(h: number): string {
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function Dot({ kind }: { kind: EventKind }) {
  return (
    <span
      className="inline-block size-1.5 rounded-full"
      style={{ backgroundColor: getEventStyle(kind).border }}
    />
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block size-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
