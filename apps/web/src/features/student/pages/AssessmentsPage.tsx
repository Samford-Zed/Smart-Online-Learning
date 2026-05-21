import { useEffect, useState } from "react";
import {
  Clock,
  FlaskConical,
  Calculator,
  ScrollText,
  Info,
  Wifi,
  MonitorOff,
  Timer,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { api } from "../../../services/api";
import {
  assessments as MOCK_ASSESSMENTS,
  assessmentGuidelines as MOCK_GUIDELINES,
  type Assessment,
  type AssessmentStatus,
} from "../data/assessmentsData";

/**
 * Assessments & Quizzes — student page listing Ongoing / Upcoming /
 * Completed assessments with a side panel of guidelines.
 * Layout follows the rest of the student dashboard (shared Sidebar +
 * Topbar, max-w-1200 content column).
 */
export default function AssessmentsPage() {
  const [items, setItems] = useState<Assessment[]>(MOCK_ASSESSMENTS);
  const [guidelines, setGuidelines] = useState<
    { iconKey: "wifi" | "monitor" | "timer"; text: string }[]
  >(MOCK_GUIDELINES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Fetch API assessments and append to mock data
    api.getStudentAssessments()
      .then((data: any[]) => {
        if (!active) return;
        const apiAssessments: Assessment[] = data.map((a, i) => ({
          id: `api-${a.id || i}`,
          subject: a.subject || "GENERAL",
          title: a.title || a.name || "Untitled Assessment",
          scheduledFor: a.scheduledFor || a.scheduled_for || a.dueDate || "TBD",
          duration: a.duration || "45 mins",
          durationMinutes: a.durationMinutes || a.duration_minutes || 45,
          status: (a.status || "upcoming") as AssessmentStatus,
          iconClass: a.iconClass || "bg-brand/10 text-brand",
          iconKey: (a.iconKey || "flask") as Assessment["iconKey"],
          instructions: a.instructions || a.description || "",
          questions: a.questions || [],
          resultPercent: a.resultPercent || a.score,
        }));
        setItems((prev) => [...prev, ...apiAssessments]);
        setLoading(false);
      })
      .catch(() => {
        // Silently fail - keep showing mock data
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  const ongoing = items.filter((i) => i.status === "ongoing");
  const upcoming = items.filter((i) => i.status === "upcoming");
  const completed = items.filter((i) => i.status === "completed");

  return (
    <div className="flex min-h-screen bg-surface-page font-sans text-ink-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 pb-12 pt-6">
          {/* Header */}
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
              Assessments &amp; Quizzes
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Track and manage your academic evaluations.
            </p>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left column: status sections */}
            <div className="flex flex-col gap-6">
              <Section
                title="Ongoing"
                dotClass="bg-emerald-500"
                items={ongoing}
              />
              <Section
                title="Upcoming"
                dotClass="bg-amber-400"
                items={upcoming}
              />
              <Section
                title="Completed"
                dotClass="bg-ink-300"
                items={completed}
              />
            </div>

            {/* Right column: guidelines */}
            <aside className="self-start rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <header className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Info className="size-4" aria-hidden />
                </span>
                <h2 className="text-base font-bold text-ink-900">
                  Assessment Guidelines
                </h2>
              </header>
              <ul className="mt-4 space-y-4">
                {guidelines.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <GuidelineIcon name={g.iconKey} />
                    <p className="text-sm leading-snug text-ink-700">{g.text}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------- Section -------------------------------- */

function Section({
  title,
  dotClass,
  items,
}: {
  title: string;
  dotClass: string;
  items: Assessment[];
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
        <span className={`size-2 rounded-full ${dotClass}`} aria-hidden />
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-6 text-center text-xs text-ink-500">
            No {title.toLowerCase()} assessments.
          </p>
        ) : (
          items.map((a) => <AssessmentRow key={a.id} a={a} />)
        )}
      </div>
    </section>
  );
}

/* ----------------------------- Assessment row ----------------------------- */

function AssessmentRow({ a }: { a: Assessment }) {
  return (
    <Link
      to={`/student/assessments/${a.id}`}
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md animate-fade-in-up"
    >
      {/* Subject icon tile */}
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${a.iconClass}`}
      >
        <SubjectIcon name={a.iconKey} />
      </span>

      {/* Title block */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-wider text-ink-500">
          <span>{a.subject}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 normal-case tracking-normal text-ink-500">
            <Clock className="size-3.5" aria-hidden />
            {a.duration}
          </span>
        </div>
        <h3 className="mt-0.5 text-sm font-semibold text-ink-900">{a.title}</h3>
        <p className="mt-0.5 text-xs text-ink-500">{a.scheduledFor}</p>
      </div>

      {/* Status pill + primary action */}
      <div className="ml-auto flex items-center gap-3">
        <StatusPill status={a.status} />
        <PrimaryButton status={a.status} id={a.id} />
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: AssessmentStatus }) {
  switch (status) {
    case "ongoing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          Live Now
        </span>
      );
    case "upcoming":
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Starting Soon
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-600">
          Done
        </span>
      );
  }
}

function PrimaryButton({
  status,
  id,
}: {
  status: AssessmentStatus;
  id: string;
}) {
  // Use a span instead of nested Link/button — the parent row is the Link.
  switch (status) {
    case "ongoing":
      return (
        <span className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-xs font-semibold text-white shadow-card transition group-hover:bg-brand-600">
          Start Assessment
        </span>
      );
    case "upcoming":
      return (
        <span
          className="inline-flex h-9 items-center rounded-lg border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 transition"
          data-id={id}
        >
          View Details
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex h-9 items-center rounded-lg border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 transition">
          View Results
        </span>
      );
  }
}

/* --------------------------------- Icons --------------------------------- */

function SubjectIcon({ name }: { name: Assessment["iconKey"] }) {
  const cls = "size-6";
  switch (name) {
    case "flask":
      return <FlaskConical className={cls} aria-hidden />;
    case "calculator":
      return <Calculator className={cls} aria-hidden />;
    case "scroll":
      return <ScrollText className={cls} aria-hidden />;
    default:
      return <ScrollText className={cls} aria-hidden />;
  }
}

function GuidelineIcon({ name }: { name: "wifi" | "monitor" | "timer" }) {
  const cls = "size-5 shrink-0 text-ink-500";
  switch (name) {
    case "wifi":
      return <Wifi className={cls} aria-hidden />;
    case "monitor":
      return <MonitorOff className={cls} aria-hidden />;
    case "timer":
      return <Timer className={cls} aria-hidden />;
  }
}
