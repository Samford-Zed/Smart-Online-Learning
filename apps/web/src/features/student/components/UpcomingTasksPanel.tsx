import { useState } from "react";
import { AlertTriangle, FileText, BookOpen, FlaskConical, CheckCircle2, Circle, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "@/i18n/I18nProvider";

type Urgency = "urgent" | "upcoming" | "later";

type Task = {
  id: string;
  title: string;
  description: string;
  urgency: Urgency;
  urgencyLabel: string;
  actionLabel: string;
  actionTo: string;
  icon: React.ElementType;
  done: boolean;
};

const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Math Worksheet #5",
    description: "Complete all 15 algebra problems.",
    urgency: "urgent",
    urgencyLabel: "Due Tomorrow",
    actionLabel: "Submit Assignment",
    actionTo: "/student/assignments",
    icon: FileText,
    done: false,
  },
  {
    id: "t2",
    title: "Science Project Proposal",
    description: "Submit your topic and initial research outline.",
    urgency: "upcoming",
    urgencyLabel: "Due in 3 days",
    actionLabel: "Continue Working",
    actionTo: "/student/assignments",
    icon: FlaskConical,
    done: false,
  },
  {
    id: "t3",
    title: "Read Chapter 3",
    description: "Amharic Literature prep for discussion.",
    urgency: "later",
    urgencyLabel: "Next Week",
    actionLabel: "Open Resources",
    actionTo: "/student/resources",
    icon: BookOpen,
    done: false,
  },
];

const URGENCY_STYLES: Record<Urgency, { border: string; badge: string; badgeText: string }> = {
  urgent:   { border: "border-red-400",  badge: "text-red-600",  badgeText: "bg-red-50"   },
  upcoming: { border: "border-brand",    badge: "text-brand",    badgeText: "bg-brand/5"  },
  later:    { border: "border-ink-200",  badge: "text-ink-500",  badgeText: "bg-ink-50"   },
};

/**
 * Upcoming Tasks — right-column panel with task cards, checkoff, and calendar link.
 */
export function UpcomingTasksPanel({ tasks: apiTasks }: { tasks?: unknown[] }) {
  const { t } = useT();
  // Convert API tasks to internal format, or use mock data if no API data
  const initialTasks = apiTasks && apiTasks.length > 0
    ? apiTasks.map((t: any, i) => ({
        id: t.id || `task-${i}`,
        title: t.title || t.name || "Untitled Task",
        description: t.description || "",
        urgency: (t.urgency || "later") as Urgency,
        urgencyLabel: t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString()}` : (t.urgencyLabel || "Later"),
        actionLabel: "View",
        actionTo: t.link || "/student/assignments",
        icon: FileText,
        done: t.completed || t.done || false,
      }))
    : INITIAL_TASKS;
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  function toggleDone(id: string) {
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  const pending = tasks.filter((t) => !t.done).length;

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">
          {t("student.upcomingTasks")}
        </h3>
        {pending > 0 ? (
          <span className="flex size-6 items-center justify-center rounded-full bg-red-100 text-[11px] font-bold text-red-600">
            {pending}
          </span>
        ) : (
          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-600">
            ✓
          </span>
        )}
      </header>

      <div className="mt-4 flex flex-col gap-3">
        {tasks.map((task) => {
          const s = URGENCY_STYLES[task.urgency];
          const Icon = task.icon;
          return (
            <article
              key={task.id}
              className={`rounded-xl border-l-4 bg-ink-50 p-3 transition ${s.border} ${task.done ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleDone(task.id)}
                    aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                    className="mt-0.5 shrink-0 transition hover:scale-110"
                  >
                    {task.done
                      ? <CheckCircle2 className="size-4 text-emerald-500" />
                      : <Circle className="size-4 text-ink-300" />
                    }
                  </button>
                  <span className={`text-sm font-semibold text-ink-900 ${task.done ? "line-through" : ""}`}>
                    {task.title}
                  </span>
                </div>
                <div className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${s.badge}`}>
                  {task.urgency === "urgent" && <AlertTriangle className="size-3.5" aria-hidden />}
                  {task.urgencyLabel}
                </div>
              </div>
              <p className="mt-1 pl-6 text-xs text-ink-500">{task.description}</p>
              {!task.done && (
                <div className="mt-3 pl-6">
                  <Link
                    to={task.actionTo}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      task.urgency === "upcoming"
                        ? "bg-brand text-white hover:bg-brand-600 shadow-card"
                        : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 shadow-card"
                    }`}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {task.actionLabel}
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <span className="text-xs text-ink-400">
          {tasks.filter((t) => t.done).length}/{tasks.length} completed
        </span>
        <Link
          to="/student/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
        >
          <CalendarDays className="size-3.5" />
          View Calendar
        </Link>
      </div>
    </section>
  );
}
