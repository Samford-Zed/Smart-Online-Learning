import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  FlaskConical,
  Lock,
  Play,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react";
import { api } from "../../../services/api";
import {
  fetchLesson,
  type LessonPlayerData,
  type LessonMaterial,
} from "../data/lessonPlayerData";

type Tab = "transcript" | "discussion";

/**
 * LessonPlayerPage — the Coursera/Udemy-style lesson view rendered when the
 * student clicks Resume Course or Start on a lesson row.
 *
 * URL: /student/classes/:slug/lesson/:lessonId
 */
export default function LessonPlayerPage() {
  const { slug = "", lessonId = "" } = useParams<{
    slug: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonPlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("transcript");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setCompleted(false);

    const loadLesson = async () => {
      try {
        // Try API first
        const apiLesson = await api.getStudentLesson(slug, lessonId);
        if (apiLesson && active) {
          // Transform API data to LessonPlayerData format
          const apiTranscript = (apiLesson as any).transcript || (apiLesson as any).transcriptCues || [];
          const apiDiscussion = (apiLesson as any).discussion || [];
          
          const transformed: LessonPlayerData = {
            id: String((apiLesson as any).id || lessonId),
            title: (apiLesson as any).title || "Untitled Lesson",
            courseTitle: (apiLesson as any).courseTitle || (apiLesson as any).subjectName || slug,
            moduleIndex: (apiLesson as any).moduleIndex || 1,
            lessonIndex: (apiLesson as any).lessonIndex || 1,
            totalLessons: (apiLesson as any).totalLessons || 10,
            type: (apiLesson as any).type || "video",
            duration: (apiLesson as any).duration || "10 min",
            videoUrl: (apiLesson as any).videoUrl || (apiLesson as any).url || "",
            transcript: Array.isArray(apiTranscript) ? apiTranscript : [{ at: "0:00", text: "Transcript not available." }],
            discussion: Array.isArray(apiDiscussion) ? apiDiscussion : [],
            materials: ((apiLesson as any).materials || (apiLesson as any).pdfs || []).map((m: any, i: number) => ({
              id: String(m.id || `mat-${i}`),
              title: m.title || `Material ${i + 1}`,
              meta: m.meta || "PDF",
              iconKey: m.iconKey || "pdf",
              action: (m.action || "download") as LessonMaterial["action"],
            })),
            hasQuiz: (apiLesson as any).hasQuiz || false,
            quizId: (apiLesson as any).quizId,
            nextLessonId: (apiLesson as any).nextLessonId,
            prevLessonId: (apiLesson as any).prevLessonId,
            knowledgeCheck: (apiLesson as any).knowledgeCheck || { description: "Test your understanding of this lesson." },
            outline: (apiLesson as any).outline || [],
            // Additional fields required by LessonPlayerData type
            courseSlug: slug,
            moduleLabel: (apiLesson as any).moduleTitle || `Module ${(apiLesson as any).moduleIndex || 1}`,
            points: (apiLesson as any).points || 0,
            lessonNumber: (apiLesson as any).lessonNumber || `Lesson ${(apiLesson as any).lessonIndex || 1}`,
            description: (apiLesson as any).description || "",
            videoPosterUrl: (apiLesson as any).videoPosterUrl || "",
          };
          setLesson(transformed);
          setLoading(false);
          return;
        }
      } catch {
        // API failed, use mock
      }

      // Fallback to mock data
      const mockLesson = await fetchLesson(slug, lessonId);
      if (active) {
        setLesson(mockLesson);
        setLoading(false);
      }
    };

    loadLesson();
    return () => {
      active = false;
    };
  }, [slug, lessonId]);

  const initials = useMemo(() => {
    return "JS"; // student initials shown in the avatar circle
  }, []);

  function goPrev() {
    if (lesson?.prevLessonId) {
      navigate(`/student/classes/${slug}/lesson/${lesson.prevLessonId}`);
    }
  }

  function goNext() {
    if (lesson?.nextLessonId) {
      navigate(`/student/classes/${slug}/lesson/${lesson.nextLessonId}`);
    }
  }

  function handleMaterial(m: LessonMaterial) {
    if (m.action === "download") {
      const blob = new Blob(
        [`Material: ${m.title}\n(downloaded from SOLS Library)`],
        { type: "text/plain" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${m.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (m.action === "external" && m.href) {
      window.open(m.href, "_blank", "noopener");
    }
  }

  return (
    <div className="min-h-screen bg-surface-page font-sans text-ink-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-ink-200 bg-white px-6">
        <Link
          to={`/student/classes/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:text-brand-600"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to Course
        </Link>
        <span className="hidden h-5 w-px bg-ink-200 sm:block" aria-hidden />
        <span className="hidden truncate text-sm font-semibold text-ink-700 sm:block">
          {lesson?.moduleLabel ?? "Loading…"}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
            <Award className="size-3.5" aria-hidden />
            {lesson?.points ?? 0} Pts
          </span>
          <span className="flex size-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {initials}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-8 pb-12 pt-6">
        {loading && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
            Loading lesson…
          </div>
        )}

        {!loading && !lesson && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
            <p className="text-sm text-ink-700">
              Lesson not found.{" "}
              <Link
                to={`/student/classes/${slug}`}
                className="font-semibold text-brand hover:underline"
              >
                Back to course
              </Link>
            </p>
          </div>
        )}

        {lesson && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Left column */}
            <div className="flex min-w-0 flex-col gap-5">
              <header className="animate-fade-in-up">
                <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                  {lesson.lessonNumber}: {lesson.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-700">
                  {lesson.description}
                </p>
              </header>

              {/* Video player */}
              <div
                className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-900 shadow-card animate-fade-in-up"
                style={{ animationDelay: "60ms" }}
              >
                <video
                  controls
                  poster={lesson.videoPosterUrl}
                  className="aspect-video w-full bg-black"
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
                {/* Subtle progress underline (mock) */}
                <div className="h-1 w-full bg-ink-700">
                  <div className="h-full w-1/3 bg-brand" />
                </div>
              </div>

              {/* Prev / Next / Mark complete */}
              <section
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-3 shadow-card animate-fade-in-up"
                style={{ animationDelay: "120ms" }}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!lesson.prevLessonId}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SkipBack className="size-4" aria-hidden />
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!lesson.nextLessonId}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <SkipForward className="size-4" aria-hidden />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCompleted((c) => !c)}
                  className={
                    "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition " +
                    (completed
                      ? "bg-emerald-600 text-white shadow-card hover:bg-emerald-700"
                      : "bg-brand text-white shadow-card hover:bg-brand-600")
                  }
                >
                  {completed ? (
                    <>
                      <Check className="size-4" aria-hidden />
                      Completed
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" aria-hidden />
                      Mark as Complete
                    </>
                  )}
                </button>
              </section>

              {/* Transcript / Discussion tabs */}
              <section
                className="rounded-2xl border border-ink-200 bg-white shadow-card animate-fade-in-up"
                style={{ animationDelay: "180ms" }}
              >
                <div className="flex items-center gap-6 border-b border-ink-200 px-5">
                  <TabButton
                    active={tab === "transcript"}
                    onClick={() => setTab("transcript")}
                    label="Transcript"
                  />
                  <TabButton
                    active={tab === "discussion"}
                    onClick={() => setTab("discussion")}
                    label={`Discussion (${lesson.discussion.length})`}
                  />
                </div>

                {tab === "transcript" ? (
                  <ul className="flex flex-col gap-3 px-5 py-5">
                    {lesson.transcript.map((cue, i) => (
                      <li
                        key={i}
                        className="grid grid-cols-[60px_1fr] gap-3 text-sm"
                      >
                        <span className="font-semibold text-brand">
                          {cue.at}
                        </span>
                        <p className="text-ink-700">{cue.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <DiscussionPanel
                    posts={lesson.discussion}
                    onPost={(body) => {
                      setLesson((prev) =>
                        prev
                          ? {
                              ...prev,
                              discussion: [
                                ...prev.discussion,
                                {
                                  id: `local-${Date.now()}`,
                                  author: "You",
                                  avatar: "https://i.pravatar.cc/80?img=47",
                                  postedAgo: "Just now",
                                  body,
                                },
                              ],
                            }
                          : prev,
                      );
                    }}
                  />
                )}
              </section>
            </div>

            {/* Right column */}
            <aside className="flex flex-col gap-5">
              <LessonOutlineCard lesson={lesson} />
              <MaterialsCard
                materials={lesson.materials}
                onPick={handleMaterial}
              />
              <KnowledgeCheckCard
                description={lesson.knowledgeCheck.description}
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

/* ----------------------------- Tab button ----------------------------- */

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "-mb-px border-b-2 py-3 text-sm font-semibold transition " +
        (active
          ? "border-brand text-brand"
          : "border-transparent text-ink-500 hover:text-ink-700")
      }
    >
      {label}
    </button>
  );
}

/* ----------------------------- Discussion ----------------------------- */

function DiscussionPanel({
  posts,
  onPost,
}: {
  posts: { id: string; author: string; avatar: string; postedAgo: string; body: string }[];
  onPost: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onPost(draft.trim());
    setDraft("");
  }

  return (
    <div className="px-5 py-5">
      {posts.length === 0 ? (
        <p className="text-sm text-ink-500">
          No questions yet. Be the first to start the discussion.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-3 rounded-xl border border-ink-100 p-3"
            >
              <img
                src={p.avatar}
                alt={p.author}
                className="size-9 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink-900">
                    {p.author}
                  </span>
                  <span className="text-xs text-ink-500">{p.postedAgo}</span>
                </div>
                <p className="mt-1 text-sm text-ink-700">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 flex items-start gap-3">
        <img
          src="https://i.pravatar.cc/80?img=47"
          alt="You"
          className="size-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Ask a question or share an insight…"
            className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* --------------------------- Lesson outline --------------------------- */

function LessonOutlineCard({ lesson }: { lesson: LessonPlayerData }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card animate-fade-in-up">
      <h2 className="text-base font-bold text-ink-900">Lesson Outline</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {lesson.outline.map((o) => (
          <li
            key={o.id}
            className={
              "flex items-start gap-3 rounded-xl px-3 py-2.5 transition " +
              (o.status === "current"
                ? "bg-brand/5"
                : o.status === "completed"
                  ? ""
                  : "")
            }
          >
            <OutlineBadge status={o.status} index={o.index} />
            <div className="min-w-0 flex-1">
              <p
                className={
                  "text-sm font-bold " +
                  (o.status === "current"
                    ? "text-brand"
                    : o.status === "locked"
                      ? "text-ink-500"
                      : "text-ink-900")
                }
              >
                {o.index}. {o.title}
              </p>
              <p
                className={
                  "mt-0.5 text-xs " +
                  (o.status === "locked" ? "text-ink-400" : "text-ink-500")
                }
              >
                {o.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function OutlineBadge({
  status,
  index,
}: {
  status: "completed" | "current" | "locked";
  index: number;
}) {
  if (status === "completed") {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-4" aria-hidden />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
        {index}
      </span>
    );
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-ink-200 text-xs font-bold text-ink-400">
      {index}
    </span>
  );
}

/* ----------------------------- Materials ----------------------------- */

function MaterialsCard({
  materials,
  onPick,
}: {
  materials: LessonMaterial[];
  onPick: (m: LessonMaterial) => void;
}) {
  return (
    <section
      className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card animate-fade-in-up"
      style={{ animationDelay: "60ms" }}
    >
      <h2 className="text-base font-bold text-ink-900">Materials</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {materials.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onPick(m)}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-100 bg-white p-2 text-left transition hover:border-brand/40 hover:bg-brand/5"
            >
              <MaterialIcon kind={m.iconKey} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-900">
                  {m.title}
                </p>
                <p className="text-xs text-ink-500">{m.meta}</p>
              </div>
              <span className="text-ink-500">
                {m.action === "download" ? (
                  <Download className="size-4" aria-hidden />
                ) : (
                  <ExternalLink className="size-4" aria-hidden />
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MaterialIcon({ kind }: { kind: LessonMaterial["iconKey"] }) {
  switch (kind) {
    case "pdf":
      return (
        <span className="flex size-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
          <FileText className="size-5" aria-hidden />
        </span>
      );
    case "lab":
      return (
        <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <FlaskConical className="size-5" aria-hidden />
        </span>
      );
    case "video":
      return (
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Play className="size-5 fill-brand" aria-hidden />
        </span>
      );
    case "doc":
      return (
        <span className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <FileText className="size-5" aria-hidden />
        </span>
      );
  }
}

/* ----------------------- Knowledge Check banner ----------------------- */

function KnowledgeCheckCard({ description }: { description: string }) {
  const navigate = useNavigate();
  return (
    <section
      className="overflow-hidden rounded-2xl p-5 text-white shadow-card animate-fade-in-up"
      style={{
        backgroundImage:
          "linear-gradient(160deg, #047857 0%, #059669 60%, #10b981 100%)",
        animationDelay: "120ms",
      }}
    >
      <div className="flex justify-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <ClipboardList className="size-6" aria-hidden />
        </span>
      </div>
      <h2 className="mt-3 text-center text-xl font-bold">Knowledge Check</h2>
      <p className="mt-2 text-center text-sm leading-snug text-emerald-50">
        {description}
      </p>
      <button
        type="button"
        onClick={() => navigate("/student/assessments")}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        Take Quiz
        <Lock className="hidden size-3.5" aria-hidden />→
      </button>
    </section>
  );
}
