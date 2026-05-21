import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "../../../i18n/I18nProvider";
import { FeedbackKpiCards } from "../components/feedback/FeedbackKpiCards";
import { FeedbackList } from "../components/feedback/FeedbackList";
import { FeedbackThread } from "../components/feedback/FeedbackThread";
import type { FeedbackItem } from "../data/feedback";
import { getFeedback, getFeedbackStats, replyFeedback, resolveFeedback } from "../services/teacher.api";

const statusLabel: Record<FeedbackItem["status"], string> = {
  new: "New",
  in_progress: "In Progress",
  replied: "Replied",
};

const csvCell = (value: string) =>
  `"${String(value ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

export function StudentFeedback() {
  const t = useT();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [threads, statistics] = await Promise.all([getFeedback(), getFeedbackStats()]);
      setItems(threads);
      setStats(statistics);
      if (threads.length > 0 && !selectedId) {
        setSelectedId(threads[0].id);
      }
    } catch (error) {
      console.error("Failed to load feedback", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const counts = items.reduce(
      (acc, it) => {
        acc[it.status] = (acc[it.status] ?? 0) + 1;
        return acc;
      },
      { new: 0, in_progress: 0, replied: 0 } as Record<
        FeedbackItem["status"],
        number
      >
    );

    const summary: string[][] = [
      ["Student Feedback Report"],
      ["Generated", new Date().toLocaleString()],
      ["Total in queue", String(items.length)],
      ["New", String(counts.new)],
      ["In Progress", String(counts.in_progress)],
      ["Replied", String(counts.replied)],
      ["Lifetime received", String(stats?.totalReceived ?? 0)],
      ["Pending (overall)", String(stats?.pending ?? 0)],
      ["Average rating", String(stats?.averageRating ?? 0)],
      [],
    ];

    const headers = [
      "ID",
      "Student",
      "Class",
      "Course",
      "Title",
      "Status",
      "Received",
      "Messages",
      "Last Message",
    ];

    const rows = items.map((it) => {
      const last = it.thread[it.thread.length - 1];
      return [
        it.id,
        it.studentName,
        it.studentClass,
        it.course ?? "",
        it.title,
        statusLabel[it.status],
        it.time,
        String(it.thread.length),
        last ? `${last.authorName}: ${last.body}` : "",
      ];
    });

    const csv = [
      ...summary.map((r) => r.map(csvCell).join(",")),
      headers.map(csvCell).join(","),
      ...rows.map((r) => r.map(csvCell).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `student-feedback-report_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToast(t("Feedback report exported."));
    window.setTimeout(() => setToast(null), 2500);
  };

  const selected = items.find((i) => i.id === selectedId) || items[0] || null;

  const sendReply = async (id: string, body: string) => {
    try {
      await replyFeedback(id, body);
      await fetchData();
      setToast(t("Reply sent successfully."));
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error("Failed to reply", err);
    }
  };

  const markResolved = async (id: string) => {
    try {
      await resolveFeedback(id);
      await fetchData();
      setToast(t("Thread marked as resolved."));
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error("Failed to resolve", err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t("Student Feedback")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("Review, manage, and respond to student inquiries and feedback.")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Download className="h-4 w-4" />
          {t("Export Report")}
        </button>
      </header>

      <FeedbackKpiCards stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="min-h-[560px]">
          <FeedbackList
            items={items}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>
        <div className="min-h-[560px]">
          {selected && (
            <FeedbackThread
              item={selected}
              onMarkResolved={markResolved}
              onSendReply={sendReply}
            />
          )}
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
