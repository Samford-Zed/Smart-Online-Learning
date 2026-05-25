import { CheckCircle2, Clock, FileWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { useT } from "../../../i18n/I18nProvider";

const dotStyles: Record<string, string> = {
  success: "bg-emerald-500",
  info: "bg-indigo-500",
  warning: "bg-amber-500",
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

export function RecentActivity() {
  const t = useT();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.getParentActivities().then((acts: any[]) => {
      setItems((acts || []).slice(0, 5));
    }).catch(() => {});
  }, []);

  if (!items.length) return null;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
      <h3 className="text-base font-semibold text-slate-900">
        {t("Recent Activity")}
      </h3>

      <ul className="mt-5 space-y-5">
        {items.map((item: any, idx: number) => {
          const status = item.status || (item.score >= 80 ? "success" : item.type === "submission" ? "warning" : "info");
          const title = item.title || item.description || "Activity";
          const time = item.timestamp ? timeAgo(item.timestamp) : item.created_at ? timeAgo(item.created_at) : item.time || "";
          const pending = item.pending_grade || item.pendingGrade || false;
          return (
          <li key={item.id ?? idx} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`mt-1 h-3 w-3 rounded-full ring-4 ring-white ${
                  dotStyles[status] ?? "bg-slate-400"
                }`}
              >
                {status === "success" && (
                  <CheckCircle2 className="hidden" />
                )}
              </div>
              {idx !== items.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-slate-200" />
              )}
            </div>

            <div className="-mt-0.5 flex-1 pb-1">
              <p className="text-sm font-semibold leading-snug text-slate-900">
                {title}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {time}
              </p>

              {pending && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
                  <FileWarning className="h-3 w-3" />
                  {t("Pending Grade")}
                </span>
              )}
            </div>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
