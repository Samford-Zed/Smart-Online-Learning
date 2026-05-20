import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Play,
  FileText,
  Mail,
  CheckCircle2,
  Lock,
  Video,
  BookOpen,
  FlaskConical,
  Users,
  ChevronLeft,
  Download,
  X,
  Send,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { api } from "../../../services/api";
import {
  fetchCourseBySlug,
  type CourseDetail,
  type Lesson,
  type LessonStatus,
  type ModuleTopic,
  type UpcomingItem,
} from "../data/courseDetailData";

/**
 * Course Detail page — opens when the student clicks a class card.
 * Shows the course header (with progress + Resume / Syllabus actions),
 * a module/lesson list, and a right-rail with instructor, course resources,
 * and upcoming items.
 *
 * Data comes from `fetchCourseBySlug(slug)`; swap with a real API later.
 */
export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadCourse = async () => {
      try {
        // Try to fetch from API first
        const apiCourse = await api.getStudentClassDetails(slug ?? "");
        if (apiCourse && active) {
          // Transform API course to CourseDetail format
          const apiModules = (apiCourse as any).modules || [];
          const transformed: CourseDetail = {
            slug: slug ?? "",
            badge: (apiCourse as any).badge || (apiCourse as any).tagline || "",
            title: (apiCourse as any).title || (apiCourse as any).name || "Untitled Course",
            instructor: (apiCourse as any).instructor || (apiCourse as any).teacher || "Unknown",
            meta: (apiCourse as any).meta || `Semester Course`,
            progress: (apiCourse as any).progress || 0,
            instructorBio: {
              name: (apiCourse as any).instructor || "Unknown",
              avatar: (apiCourse as any).instructorImage || "https://i.pravatar.cc/80?img=32",
            },
            resources: ((apiCourse as any).resources || []).map((r: any, i: number) => ({
              id: r.id || `resource-${i}`,
              title: r.title || r.name || `Resource ${i + 1}`,
              iconKey: r.iconKey || r.icon || "textbook",
            })),
            upcoming: ((apiCourse as any).upcoming || []).map((u: any, i: number) => ({
              id: u.id || `upcoming-${i}`,
              monthShort: u.monthShort || "NOV",
              day: u.day || i + 1,
              title: u.title || u.name || "Upcoming",
              due: u.due || u.deadline || "TBD",
            })),
            modules: apiModules.map((m: any, i: number) => {
              const lessons = (m.lessons || []);
              return {
                id: m.id || `module-${i}`,
                topic: `TOPIC ${i + 1}`,
                state: i === 0 ? "current" : "locked" as const,
                title: m.title || m.name || `Module ${i + 1}`,
                progress: i === 0 ? Math.round((lessons.filter((l: any) => l.status === "completed").length / Math.max(lessons.length, 1)) * 100) : null,
                lockedMeta: i > 0 ? `${lessons.length} Lessons` : undefined,
                lessons: lessons.map((l: any, j: number) => ({
                  id: String(l.id) || `lesson-${j}`,
                  index: `${i + 1}.${j + 1}`,
                  title: l.title || l.name || `Lesson ${j + 1}`,
                  meta: l.meta || (l.type === "video" ? `${l.duration || "10 min"} video` : "Reading & Quiz"),
                  metaIcon: l.metaIcon || (l.type === "video" ? "video" : "book"),
                  status: (l.status || "locked") as LessonStatus,
                  unlockHint: l.status === "locked" && j > 0 ? `Complete lesson ${j} to unlock` : undefined,
                })),
              };
            }),
          };
          setCourse(transformed);
          setLoading(false);
          return;
        }
      } catch {
        // API failed, fall through to mock
      }

      // Try mock data as fallback
      const mockCourse = await fetchCourseBySlug(slug ?? "");
      if (active) {
        setCourse(mockCourse);
        setLoading(false);
      }
    };

    loadCourse();
    return () => {
      active = false;
    };
  }, [slug]);

  /** Finds the current lesson ID (first lesson with status "current"). */
  const currentLessonId = useMemo(() => {
    if (!course) return null;
    for (const m of course.modules) {
      const cur = m.lessons.find((l) => l.status === "current");
      if (cur) return cur.id;
    }
    return null;
  }, [course]);

  function handleResume() {
    const target = currentLessonId ?? course?.modules[0]?.lessons[0]?.id ?? "l3";
    navigate(`/student/classes/${slug}/lesson/${target}`);
  }

  function handleStartLesson(lid: string) {
    navigate(`/student/classes/${slug}/lesson/${lid}`);
  }

  function handleDownloadResource(title: string) {
    const blob = new Blob(
      [`Resource: ${title}\n(downloaded from SOLS Course Resources)`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen bg-surface-page font-sans text-ink-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 pb-12 pt-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-ink-500"
          >
            <Link to="/student/classes" className="hover:text-ink-700">
              Classes
            </Link>
            <ChevronRight className="size-4" aria-hidden />
            <span className="text-ink-900">{course?.title ?? "Course"}</span>
          </nav>

          {loading && (
            <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
              Loading course…
            </div>
          )}

          {!loading && !course && (
            <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
              <p className="text-sm text-ink-700">
                Course not found.{" "}
                <Link
                  to="/student/classes"
                  className="font-semibold text-brand hover:underline"
                >
                  Back to Classes
                </Link>
              </p>
            </div>
          )}

          {course && (
            <>
              <CourseHeader
                course={course}
                onResume={handleResume}
                onSyllabus={() => setShowSyllabus(true)}
              />

              <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                {/* Modules column */}
                <section>
                  <h2 className="text-base font-bold text-ink-900">Modules</h2>
                  <div className="mt-3 flex flex-col gap-4">
                    {course.modules.map((m) => (
                      <ModuleCard
                        key={m.id}
                        module={m}
                        onStart={handleStartLesson}
                      />
                    ))}
                  </div>
                </section>

                {/* Right rail */}
                <aside className="flex flex-col gap-4">
                  <InstructorCard
                    course={course}
                    onMessage={() => setShowMessage(true)}
                  />
                  <ResourcesCard
                    course={course}
                    onDownload={handleDownloadResource}
                  />
                  <UpcomingCard items={course.upcoming} />
                </aside>
              </div>

              {/* Back link for small screens */}
              <div className="mt-8 lg:hidden">
                <Link
                  to="/student/classes"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Back to Classes
                </Link>
              </div>

              {/* Modals */}
              {showSyllabus && (
                <SyllabusModal
                  course={course}
                  onClose={() => setShowSyllabus(false)}
                  onStart={handleStartLesson}
                />
              )}
              {showMessage && (
                <MessageComposerModal
                  recipient={course.instructorBio}
                  onClose={() => setShowMessage(false)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------ Course header ------------------------------ */

function CourseHeader({
  course,
  onResume,
  onSyllabus,
}: {
  course: CourseDetail;
  onResume: () => void;
  onSyllabus: () => void;
}) {
  return (
    <section className="relative mt-3 overflow-hidden rounded-2xl border border-ink-200 bg-white p-6 shadow-card animate-fade-in-up">
      {/* Decorative gradient circle */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 65%)",
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
            <FlaskConical className="size-3.5" aria-hidden />
            {course.badge}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            <span className="font-medium text-ink-700">
              Instructor: {course.instructor}
            </span>{" "}
            <span className="mx-1.5">·</span> {course.meta}
          </p>

          {/* Progress */}
          <div className="mt-5 max-w-[460px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-500">Course Progress</span>
              <span className="font-semibold text-brand">
                {course.progress}%
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            <Play className="size-4 fill-white" aria-hidden />
            Resume Course
          </button>
          <button
            type="button"
            onClick={onSyllabus}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-5 text-sm font-semibold text-brand transition hover:bg-ink-50"
          >
            <FileText className="size-4" aria-hidden />
            Syllabus
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Module card ------------------------------ */

function ModuleCard({
  module: m,
  onStart,
}: {
  module: ModuleTopic;
  onStart: (lid: string) => void;
}) {
  const locked = m.state === "locked";

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-card animate-fade-in-up ${
        locked ? "border-ink-200" : "border-ink-200"
      }`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[11px] font-bold uppercase tracking-wider ${
              locked ? "text-ink-500" : "text-brand"
            }`}
          >
            {m.topic}
          </p>
          <h3
            className={`mt-1 text-lg font-bold ${
              locked ? "text-ink-700" : "text-ink-900"
            }`}
          >
            {m.title}
          </h3>
          {m.lockedMeta && (
            <p className="mt-1 text-xs text-ink-500">{m.lockedMeta}</p>
          )}
        </div>

        {m.progress !== null && (
          <div className="flex min-w-[180px] items-center gap-3 rounded-xl border border-ink-200 px-3 py-2">
            <span className="text-[11px] font-medium text-ink-500">
              Module Progress
            </span>
            <span className="text-xs font-semibold text-ink-900">
              {m.progress}%
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
                style={{ width: `${m.progress}%` }}
              />
            </div>
          </div>
        )}

        {locked && (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-500">
            <Lock className="size-3.5" aria-hidden />
            Locked
          </span>
        )}
      </header>

      {!locked && (
        <ul className="mt-4 flex flex-col">
          {m.lessons.map((l) => (
            <LessonRow key={l.id} lesson={l} onStart={onStart} />
          ))}
        </ul>
      )}
    </article>
  );
}

/* ------------------------------ Lesson row ------------------------------ */

function LessonRow({
  lesson,
  onStart,
}: {
  lesson: Lesson;
  onStart: (lid: string) => void;
}) {
  const isCurrent = lesson.status === "current";
  const isLocked = lesson.status === "locked";

  return (
    <li
      className={`relative flex flex-wrap items-center gap-4 rounded-xl px-3 py-3 ${
        isCurrent ? "bg-brand/5" : ""
      }`}
    >
      {isCurrent && (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-brand"
        />
      )}

      <LessonStatusIcon status={lesson.status} />

      <div className="min-w-0 flex-1">
        <h4
          className={`text-sm font-semibold ${
            isCurrent
              ? "text-brand"
              : isLocked
                ? "text-ink-500"
                : "text-ink-900"
          }`}
        >
          {lesson.index} {lesson.title}
        </h4>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
          <LessonMetaIcon kind={lesson.metaIcon} />
          {lesson.meta}
        </p>
      </div>

      {(isCurrent || lesson.status === "completed") && (
        <button
          type="button"
          onClick={() => onStart(lesson.id)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
            isCurrent
              ? "bg-brand text-white hover:bg-brand-600"
              : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
          }`}
        >
          {isCurrent ? "Start" : "Review"}
        </button>
      )}
    </li>
  );
}

function LessonStatusIcon({ status }: { status: LessonStatus }) {
  switch (status) {
    case "completed":
      return (
        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-5" aria-hidden />
        </span>
      );
    case "current":
      return (
        <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
          <Play className="size-4 fill-white" aria-hidden />
        </span>
      );
    case "locked":
      return (
        <span className="flex size-9 items-center justify-center rounded-full bg-ink-100 text-ink-400">
          <Lock className="size-4" aria-hidden />
        </span>
      );
  }
}

function LessonMetaIcon({ kind }: { kind: Lesson["metaIcon"] }) {
  const cls = "size-3.5";
  switch (kind) {
    case "video":
      return <Video className={cls} aria-hidden />;
    case "book":
      return <BookOpen className={cls} aria-hidden />;
    case "lab":
      return <FlaskConical className={cls} aria-hidden />;
    case "quiz":
      return <FileText className={cls} aria-hidden />;
  }
}

/* --------------------------- Right rail blocks --------------------------- */

function InstructorCard({
  course,
  onMessage,
}: {
  course: CourseDetail;
  onMessage: () => void;
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
        Instructor
      </h3>
      <div className="mt-3 flex items-center gap-3">
        <img
          src={course.instructorBio.avatar}
          alt={course.instructorBio.name}
          className="size-12 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold text-ink-900">
            {course.instructorBio.name}
          </p>
          <button
            type="button"
            onClick={onMessage}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            <Mail className="size-3.5" aria-hidden />
            Message
          </button>
        </div>
      </div>
    </section>
  );
}

function ResourcesCard({
  course,
  onDownload,
}: {
  course: CourseDetail;
  onDownload: (title: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
        Course Resources
      </h3>
      <ul className="mt-3 flex flex-col gap-3">
        {course.resources.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onDownload(r.title)}
              className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left text-sm text-ink-900 transition hover:bg-ink-50"
            >
              <ResourceIcon kind={r.iconKey} />
              <span className="font-medium">{r.title}</span>
              <Download className="ml-auto size-4 text-ink-400" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResourceIcon({ kind }: { kind: "textbook" | "lab" | "forum" }) {
  switch (kind) {
    case "textbook":
      return (
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <BookOpen className="size-5" aria-hidden />
        </span>
      );
    case "lab":
      return (
        <span className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
          <FlaskConical className="size-5" aria-hidden />
        </span>
      );
    case "forum":
      return (
        <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Users className="size-5" aria-hidden />
        </span>
      );
  }
}

function UpcomingCard({ items }: { items: UpcomingItem[] }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <header className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
          Upcoming
        </h3>
        <Link
          to="/student/schedule"
          className="text-xs font-semibold text-brand hover:underline"
        >
          View All
        </Link>
      </header>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((u) => (
          <li
            key={u.id}
            className="flex items-center gap-3 rounded-xl border border-ink-100 p-2.5"
          >
            <span className="flex size-12 flex-col items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {u.monthShort}
              </span>
              <span className="text-base font-bold leading-none">{u.day}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">
                {u.title}
              </p>
              <p className="mt-0.5 text-xs font-medium text-rose-600">
                {u.due}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------ Syllabus modal ------------------------------ */

function SyllabusModal({
  course,
  onClose,
  onStart,
}: {
  course: CourseDetail;
  onClose: () => void;
  onStart: (lid: string) => void;
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
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card animate-scale-in"
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              {course.title} — Syllabus
            </h2>
            <p className="text-xs text-ink-500">
              {course.meta} · {course.modules.length} modules
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {course.modules.map((m, mi) => (
            <div key={m.id} className="mb-5 last:mb-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    m.state === "locked" ? "text-ink-400" : "text-brand"
                  }`}
                >
                  Module {mi + 1}
                </span>
                {m.state === "locked" && (
                  <Lock className="size-3 text-ink-400" aria-hidden />
                )}
              </div>
              <h3
                className={`text-base font-bold ${
                  m.state === "locked" ? "text-ink-500" : "text-ink-900"
                }`}
              >
                {m.title}
              </h3>
              {m.lockedMeta && (
                <p className="text-xs text-ink-400">{m.lockedMeta}</p>
              )}

              {m.lessons.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {m.lessons.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <LessonStatusIcon status={l.status} />
                        <div>
                          <p className="text-sm font-semibold text-ink-900">
                            {l.index} {l.title}
                          </p>
                          <p className="text-xs text-ink-500">
                            {l.meta}
                          </p>
                        </div>
                      </div>
                      {(l.status === "current" || l.status === "completed") && (
                        <button
                          type="button"
                          onClick={() => onStart(l.id)}
                          className="inline-flex h-7 items-center gap-1 rounded-md bg-brand px-2.5 text-xs font-semibold text-white transition hover:bg-brand-600"
                        >
                          {l.status === "current" ? "Start" : "Review"}
                          <ArrowUpRight className="size-3" aria-hidden />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <footer className="border-t border-ink-100 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ----------------------------- Message composer ----------------------------- */

function MessageComposerModal({
  recipient,
  onClose,
}: {
  recipient: { name: string; avatar: string };
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function submit() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card animate-scale-in"
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="size-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-sm font-bold text-ink-900">
                Message {recipient.name}
              </h2>
              <p className="text-xs text-ink-500">
                Course: Biology 101
              </p>
            </div>
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

        <div className="px-5 py-4">
          {sent ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2
                className="mx-auto size-10 text-emerald-600"
                aria-hidden
              />
              <p className="mt-2 text-sm font-semibold text-emerald-700">
                Message sent successfully
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <label className="block text-xs font-semibold text-ink-500">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Question about the assignment"
                className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />

              <label className="mt-3 block text-xs font-semibold text-ink-500">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Type your message..."
                className="mt-1 w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </>
          )}
        </div>

        {!sent && (
          <footer className="flex items-center justify-end gap-2 border-t border-ink-100 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!subject.trim() || !body.trim() || sending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="size-4" aria-hidden />
              {sending ? "Sending…" : "Send"}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
