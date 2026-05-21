import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Award,
  Plus,
  Lightbulb,
  Check,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { api } from "../../../services/api";

// Types matching API response
type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  due?: string; // Alias for dueDate from API
  status: "pending" | "in-progress" | "submitted" | "graded";
  score?: number;
  maxScore: number;
  type: string;
  action?: "submit" | "view" | "continue" | "feedback"; // From API
};

type StatusKey = "pending" | "in-progress" | "submitted" | "graded";

type Tab = "all" | "pending" | "submitted" | "graded";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "submitted", label: "Submitted" },
  { id: "graded", label: "Graded" },
];

/** Student Assignments page. */
export default function AssignmentsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Fetch real assignments from API
    api.getStudentAssignments()
      .then((data: any[]) => {
        if (!active) return;
        // Transform API data to Assignment format
        const apiItems: Assignment[] = data.map((a) => ({
          id: String(a.id || a.assignment_id),
          title: a.title || a.name || "Untitled",
          subject: a.subject || a.course || "General",
          dueDate: a.dueDate || a.due_date || a.due || new Date().toISOString(),
          status: (a.status || "pending") as Assignment["status"],
          score: a.score,
          maxScore: a.maxScore || a.max_score || 100,
          type: a.type || "Assignment",
        }));
        setItems(apiItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch assignments:", err);
        setItems([]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = items
    .filter((a) => {
      if (tab === "all") return true;
      if (tab === "pending")
        return a.status === "pending" || a.status === "in-progress";
      if (tab === "submitted") return a.status === "submitted";
      return a.status === "graded";
    })
    .filter((a) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q)
      );
    });

  /** Routes to the first pending item to start a new submission flow. */
  function handleNewSubmission() {
    const next =
      items.find((a) => a.status === "pending") ??
      items.find((a) => a.status === "in-progress") ??
      items[0];
    if (next) navigate(`/student/assignments/${next.id}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-6 py-6 lg:px-10">
          <div className="mx-auto max-w-[1280px]">
            {/* Header */}
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                  Assignments
                </h1>
                <p className="mt-1 text-sm text-ink-500">
                  You have 5 active assignments
                </p>
              </div>
              <button
                type="button"
                onClick={handleNewSubmission}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
              >
                <Plus className="size-4" aria-hidden />
                New Submission
              </button>
            </header>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                icon={AlertCircle}
                label="Due Today"
                value="2"
                tileBg="#fee2e2"
                tileColor="#dc2626"
              />
              <StatCard
                icon={Clock}
                label="Due This Week"
                value="3"
                tileBg="#fef3c7"
                tileColor="#d97706"
              />
              <StatCard
                icon={CheckCircle2}
                label="Submitted"
                value="12"
                tileBg="#d1fae5"
                tileColor="#059669"
              />
              <StatCard
                icon={Award}
                label="Graded"
                value="8"
                tileBg="#dbeafe"
                tileColor="#2563eb"
              />
            </div>

            {/* Body grid: list + tips */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* Left: tabs + table */}
              <section>
                {/* Search + tabs */}
                <div className="mb-3 flex items-center gap-3">
                  <label className="relative flex max-w-md flex-1 items-center">
                    <Search
                      className="pointer-events-none absolute left-3 size-4 text-ink-500"
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search assignments…"
                      className="h-10 w-full rounded-full border border-ink-200 bg-white pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-6 border-b border-ink-200">
                  {TABS.map((t) => {
                    const active = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={
                          "-mb-px border-b-2 pb-2.5 text-sm font-semibold transition " +
                          (active
                            ? "border-brand text-brand"
                            : "border-transparent text-ink-500 hover:text-ink-700")
                        }
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
                  {/* Table header */}
                  <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] items-center gap-4 border-b border-ink-200 bg-ink-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <span>Assignment</span>
                    <span>Due Date</span>
                    <span>Status</span>
                    <span>Score</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <ul>
                    {visible.map((a, i) => (
                      <li
                        key={a.id}
                        onClick={() =>
                          navigate(`/student/assignments/${a.id}`)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            navigate(`/student/assignments/${a.id}`);
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        style={{
                          animationDelay: `${i * 60}ms`,
                        }}
                        className={
                          "grid cursor-pointer grid-cols-[2fr_1.2fr_1fr_1fr_1fr] items-center gap-4 px-5 py-4 text-sm outline-none transition hover:bg-ink-50 focus:bg-brand/5 animate-fade-in-up " +
                          (i !== visible.length - 1
                            ? "border-b border-ink-100"
                            : "")
                        }
                      >
                        <div>
                          <div className="font-semibold text-ink-900">
                            {a.title}
                          </div>
                          <span className="mt-1 inline-flex rounded bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                            {a.subject}
                          </span>
                        </div>

                        <div className="text-ink-700">{a.due}</div>

                        <div>
                          <StatusPill status={a.status} />
                        </div>

                        <div
                          className={
                            a.status === "graded"
                              ? "font-semibold text-emerald-600"
                              : "text-ink-500"
                          }
                        >
                          {a.score}
                        </div>

                        <div
                          className="flex justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionButton action={a.action} id={a.id} />
                        </div>
                      </li>
                    ))}
                  </ul>

                  {visible.length === 0 && (
                    <div className="px-5 py-10 text-center text-sm text-ink-500">
                      Nothing to show here yet.
                    </div>
                  )}
                </div>
              </section>

              {/* Right: tips */}
              <TipsCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------- Components ------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  tileBg,
  tileColor,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  tileBg: string;
  tileColor: string;
}) {
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span
          className="flex size-6 items-center justify-center rounded-full"
          style={{ backgroundColor: tileBg }}
        >
          <Icon className="size-3.5" style={{ color: tileColor }} aria-hidden />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
          {label}
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold text-ink-900">{value}</div>
    </article>
  );
}

function StatusPill({ status }: { status: StatusKey }) {
  const map: Record<
    StatusKey,
    { label: string; bg: string; text: string }
  > = {
    pending: { label: "Pending", bg: "#fde2e4", text: "#b91c1c" },
    "in-progress": { label: "In Progress", bg: "#fde4c7", text: "#c2410c" },
    submitted: { label: "Submitted", bg: "#bbf7d0", text: "#047857" },
    graded: { label: "Graded", bg: "#dbeafe", text: "#1d4ed8" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function ActionButton({
  action,
  id,
}: {
  action: Assignment["action"];
  id: string;
}) {
  const to = `/student/assignments/${id}`;
  if (action === "submit") {
    return (
      <Link
        to={to}
        className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-card transition hover:bg-brand-600"
      >
        Submit
      </Link>
    );
  }
  if (action === "continue") {
    return (
      <Link
        to={to}
        className="rounded-lg border border-ink-200 bg-white px-4 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
      >
        Continue
      </Link>
    );
  }
  if (action === "view") {
    return (
      <Link
        to={to}
        className="text-xs font-semibold text-brand transition hover:underline"
      >
        View
      </Link>
    );
  }
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition hover:underline"
    >
      Feedback
      <ChevronRight className="size-3.5" aria-hidden />
    </Link>
  );
}

function TipsCard() {
  const tips = [
    "Ensure all files are in PDF or DOCX format before uploading.",
    "Check the rubric attached to the assignment details for grading criteria.",
    "Late submissions will incur a 10% penalty per day.",
    "Reach out to your teacher via Messages if you need an extension.",
  ];
  return (
    <aside
      className="self-start rounded-2xl border border-amber-200 p-5 shadow-card"
      style={{ backgroundColor: "#fdeed1" }}
    >
      <header className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-amber-500 text-white">
          <Lightbulb className="size-4" aria-hidden />
        </span>
        <h3 className="text-sm font-bold text-ink-900">Tips: How to Submit</h3>
      </header>

      <ul className="mt-4 flex flex-col gap-3">
        {tips.map((t) => (
          <li key={t} className="flex items-start gap-2 text-sm text-ink-700">
            <Check
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden
            />
            <span className="leading-5">{t}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
