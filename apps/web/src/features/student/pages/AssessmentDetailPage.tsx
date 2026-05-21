import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { api } from "../../../services/api";
import {
  fetchAssessmentById,
  assessments as MOCK_ASSESSMENTS,
  type Assessment,
} from "../data/assessmentsData";

type Mode = "intro" | "in-progress" | "submitted";

/**
 * AssessmentDetailPage — opens via /student/assessments/:id when the user
 * clicks Start Assessment / View Details / View Results on the list page.
 *
 * - Upcoming/Ongoing → shows the intro screen with a working "Start" button
 * - Once started → renders a timed multiple-choice quiz with prev/next
 *   navigation and a sidebar question palette
 * - On submit → instantly grades the student and shows score breakdown
 */
export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [mode, setMode] = useState<Mode>("intro");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadAssessment = async () => {
      const assessmentId = id ?? "";

      // If it's an API assessment (starts with "api-"), fetch from API
      if (assessmentId.startsWith("api-")) {
        const realId = assessmentId.replace("api-", "");
        try {
          const a = await api.getStudentAssessment(realId);
          if (!active) return;
          if (a) {
            setAssessment(a as Assessment);
            if ((a as any)?.status === "completed") setMode("submitted");
          }
          setLoading(false);
          return;
        } catch {
          // Fall through to mock lookup
        }
      }

      // Otherwise, try mock data first
      const mock = await fetchAssessmentById(assessmentId);
      if (!active) return;
      if (mock) {
        setAssessment(mock);
        if (mock.status === "completed") setMode("submitted");
        setLoading(false);
        return;
      }

      // If not in mock, try API as fallback
      try {
        const a = await api.getStudentAssessment(assessmentId);
        if (!active) return;
        if (a) {
          setAssessment(a as Assessment);
          if ((a as any)?.status === "completed") setMode("submitted");
        }
      } catch {
        // Assessment not found - will show empty state
      }
      setLoading(false);
    };

    loadAssessment();
    return () => {
      active = false;
    };
  }, [id]);

  // Timer tick once started.
  useEffect(() => {
    if (mode !== "in-progress") return;
    if (secondsLeft <= 0) {
      setMode("submitted");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, secondsLeft]);

  // Score (only meaningful after submit)
  const score = useMemo(() => {
    if (!assessment) return { correct: 0, total: 0, percent: 0 };
    const total = assessment.questions.length;
    if (assessment.status === "completed" && assessment.resultPercent != null) {
      return {
        correct: Math.round((assessment.resultPercent / 100) * total),
        total,
        percent: assessment.resultPercent,
      };
    }
    let correct = 0;
    for (const q of assessment.questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
    return { correct, total, percent };
  }, [assessment, answers]);

  function startQuiz() {
    if (!assessment) return;
    setSecondsLeft(assessment.durationMinutes * 60);
    setCurrentIdx(0);
    setAnswers({});
    setMode("in-progress");
  }

  function selectAnswer(qid: string, idx: number) {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  }

  function submit() {
    setMode("submitted");
  }

  function retry() {
    startQuiz();
  }

  return (
    <div className="flex min-h-screen bg-surface-page font-sans text-ink-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-8 pb-12 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-brand"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </button>

          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-ink-500"
          >
            <Link to="/student/assessments" className="hover:text-ink-700">
              Assessments
            </Link>
            <ChevronRight className="size-4" aria-hidden />
            <span className="text-ink-900">
              {assessment?.title ?? "Loading"}
            </span>
          </nav>

          {loading && (
            <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
              Loading assessment…
            </div>
          )}

          {!loading && !assessment && (
            <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
              <p className="text-sm text-ink-700">
                Assessment not found.{" "}
                <Link
                  to="/student/assessments"
                  className="font-semibold text-brand hover:underline"
                >
                  Back to Assessments
                </Link>
              </p>
            </div>
          )}

          {assessment && mode === "intro" && (
            <IntroView
              assessment={assessment}
              onStart={startQuiz}
            />
          )}

          {assessment && mode === "in-progress" && (
            <QuizView
              assessment={assessment}
              answers={answers}
              currentIdx={currentIdx}
              secondsLeft={secondsLeft}
              onSelectIndex={setCurrentIdx}
              onSelectAnswer={selectAnswer}
              onSubmit={submit}
            />
          )}

          {assessment && mode === "submitted" && (
            <ResultView
              assessment={assessment}
              correct={score.correct}
              total={score.total}
              percent={score.percent}
              onRetry={retry}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* --------------------------------- Intro --------------------------------- */

function IntroView({
  assessment,
  onStart,
}: {
  assessment: Assessment;
  onStart: () => void;
}) {
  return (
    <section
      className="mt-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-card animate-fade-in-up"
    >
      <span className="inline-flex rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
        {assessment.subject}
      </span>
      <h1 className="mt-2 text-2xl font-bold text-ink-900">
        {assessment.title}
      </h1>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
        <Clock className="size-3.5" aria-hidden />
        {assessment.duration} · {assessment.questions.length} questions ·{" "}
        {assessment.scheduledFor}
      </p>

      <hr className="my-5 border-ink-100" />
      <h2 className="text-sm font-bold text-ink-900">Instructions</h2>
      <p className="mt-2 text-sm leading-6 text-ink-700">
        {assessment.instructions}
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
      >
        <PlayCircle className="size-4 fill-white" aria-hidden />
        Start Assessment
      </button>
    </section>
  );
}

/* ---------------------------------- Quiz ---------------------------------- */

function QuizView({
  assessment,
  answers,
  currentIdx,
  secondsLeft,
  onSelectIndex,
  onSelectAnswer,
  onSubmit,
}: {
  assessment: Assessment;
  answers: Record<string, number>;
  currentIdx: number;
  secondsLeft: number;
  onSelectIndex: (i: number) => void;
  onSelectAnswer: (qid: string, idx: number) => void;
  onSubmit: () => void;
}) {
  const total = assessment.questions.length;
  const q = assessment.questions[currentIdx];
  const answered = Object.keys(answers).length;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_240px]">
      {/* Question card */}
      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card animate-fade-in-up">
        <header className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Question {currentIdx + 1} of {total}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
            <Clock className="size-3.5" aria-hidden />
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </header>

        <h2 className="mt-3 text-lg font-bold text-ink-900">{q.prompt}</h2>

        <div className="mt-4 flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectAnswer(q.id, i)}
                className={
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition " +
                  (selected
                    ? "border-brand bg-brand/5 text-ink-900 shadow-card"
                    : "border-ink-200 bg-white text-ink-700 hover:border-brand/40 hover:bg-ink-50")
                }
              >
                <span
                  className={
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold " +
                    (selected
                      ? "bg-brand text-white"
                      : "bg-ink-100 text-ink-500")
                  }
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <footer className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelectIndex(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </button>

          {currentIdx === total - 1 ? (
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-card transition hover:bg-emerald-700"
            >
              <ChevronsRight className="size-4" aria-hidden />
              Submit ({answered}/{total})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectIndex(Math.min(total - 1, currentIdx + 1))}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-semibold text-white shadow-card transition hover:bg-brand-600"
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </footer>
      </section>

      {/* Question palette */}
      <aside className="self-start rounded-2xl border border-ink-200 bg-white p-4 shadow-card animate-fade-in-up">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
          Questions
        </h3>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {assessment.questions.map((qq, i) => {
            const isCurrent = i === currentIdx;
            const isAnswered = answers[qq.id] !== undefined;
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => onSelectIndex(i)}
                aria-label={`Go to question ${i + 1}`}
                className={
                  "flex size-9 items-center justify-center rounded-lg text-xs font-bold transition " +
                  (isCurrent
                    ? "bg-brand text-white shadow-card"
                    : isAnswered
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-200")
                }
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-ink-500">
          Answered:{" "}
          <span className="font-bold text-ink-900">
            {answered}/{total}
          </span>
        </p>

        <button
          type="button"
          onClick={onSubmit}
          className="mt-3 w-full rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Submit Now
        </button>
      </aside>
    </div>
  );
}

/* --------------------------------- Result --------------------------------- */

function ResultView({
  assessment,
  correct,
  total,
  percent,
  onRetry,
}: {
  assessment: Assessment;
  correct: number;
  total: number;
  percent: number;
  onRetry: () => void;
}) {
  const passed = percent >= 60;

  return (
    <section className="mt-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-card animate-fade-in-up">
      <header className="flex items-center gap-3">
        <span
          className={
            "flex size-12 items-center justify-center rounded-full " +
            (passed
              ? "bg-emerald-100 text-emerald-600"
              : "bg-rose-100 text-rose-600")
          }
        >
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            {passed ? "Great work!" : "Keep practicing"}
          </h1>
          <p className="text-sm text-ink-500">
            {assessment.title} · {assessment.subject}
          </p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <ResultStat label="Score" value={`${percent}%`} tone={passed ? "emerald" : "rose"} />
        <ResultStat label="Correct" value={`${correct}/${total}`} tone="brand" />
        <ResultStat
          label="Status"
          value={passed ? "Passed" : "Below 60%"}
          tone={passed ? "emerald" : "rose"}
        />
      </div>

      {/* Per-question review */}
      <h2 className="mt-7 text-sm font-bold text-ink-900">Review answers</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {assessment.questions.map((q, i) => (
          <li
            key={q.id}
            className="rounded-xl border border-ink-200 bg-white p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Question {i + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-900">
              {q.prompt}
            </p>
            <p className="mt-2 text-xs text-emerald-700">
              ✓ Correct answer:{" "}
              <span className="font-bold">{q.options[q.correctIndex]}</span>
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
        >
          <RotateCcw className="size-4" aria-hidden />
          Retry
        </button>
        <Link
          to="/student/assessments"
          className="inline-flex h-10 items-center rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          Back to Assessments
        </Link>
      </div>
    </section>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "brand";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "rose"
        ? "text-rose-600"
        : "text-brand";
  return (
    <div className="rounded-xl border border-ink-200 bg-surface-page px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
