import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../services/api";
import { useT } from "../../../i18n/I18nProvider";
import {
  ActivityFilters,
  type ActivityFiltersValue,
} from "../components/activity/ActivityFilters";
import { ActivityTimeline } from "../components/activity/ActivityTimeline";
import { WeeklySummary } from "../components/activity/WeeklySummary";

const initialFilters: ActivityFiltersValue = {
  range: "Last 7 Days",
  type: "All Activities",
  subject: "All Subjects",
};

const typeMap: Record<string, string> = {
  Quizzes: "quiz",
  Submissions: "submission",
  System: "system",
};

export function ActivityLogs() {
  const t = useT();
  const [filters, setFilters] = useState<ActivityFiltersValue>(initialFilters);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    api.getParentActivities().then((acts: any[]) => {
      setEntries(acts || []);
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((e: any) => {
      if (filters.subject !== "All Subjects" && e.subject !== filters.subject)
        return false;
      if (
        filters.type !== "All Activities" &&
        e.kind !== typeMap[filters.type]
      )
        return false;
      return true;
    });
  }, [filters, entries]);

  const handleDownload = () => {
    const lines = [
      "Day,Time,Subject,Title,Description",
      ...filtered.map((e: any) =>
        [
          e.day,
          e.time,
          e.subject,
          `"${e.title.replace(/"/g, '""')}"`,
          `"${(e.description ?? "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-history.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t("Activity History")}
          </h2>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            {t("Download Report")}
          </button>
        </header>

        <ActivityFilters value={filters} onChange={setFilters} />

        <ActivityTimeline entries={filtered} />
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <WeeklySummary />
      </aside>
    </div>
  );
}
