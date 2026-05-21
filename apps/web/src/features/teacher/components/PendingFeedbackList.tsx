import { Clock } from "lucide-react";
import { useT } from "../../../i18n/I18nProvider";

export type FeedbackRequest = {
  id: string;
  initials: string;
  name: string;
  topic: string;
  time: string;
  avatarBg: string;
  avatarColor: string;
};

export function PendingFeedbackList({ items = [] }: { items?: FeedbackRequest[] }) {
  const t = useT();
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100 flex flex-col">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">
          {t("Pending")}
          <br />
          {t("Feedback")}
        </h3>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          {t("View")}
          <br />
          {t("All")}
        </button>
      </header>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400 mt-5 py-8">
          {t("No pending feedback.")}
        </div>
      ) : (
        <ul className="mt-5 space-y-5">
          {items.map((f) => (
            <li key={f.id} className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${f.avatarBg} ${f.avatarColor}`}
              >
                {f.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {f.name}
                </p>
                <p className="truncate text-xs text-slate-500">{f.topic}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {f.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
