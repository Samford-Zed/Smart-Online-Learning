import { ClipboardList, MessageSquare, Star } from "lucide-react";
import { useT } from "../../../../i18n/I18nProvider";

type FeedbackStats = {
  totalReceived: number;
  pending: number;
  averageRating: number;
};

export function FeedbackKpiCards({ stats }: { stats?: FeedbackStats }) {
  const t = useT();
  const safeStats = stats || { totalReceived: 0, pending: 0, averageRating: 0 };
  
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <Card
        icon={MessageSquare}
        iconBg="bg-indigo-500"
        label={t("Total Received")}
        value={safeStats.totalReceived.toString()}
      />
      <Card
        icon={ClipboardList}
        iconBg="bg-indigo-500"
        label={t("Pending Responses")}
        value={safeStats.pending.toString()}
      />
      <Card
        icon={Star}
        iconBg="bg-emerald-500"
        label={t("Average Rating")}
        value={
          <span>
            {safeStats.averageRating.toFixed(1)}
            <span className="ml-1 text-base font-semibold text-slate-400">
              / 5.0
            </span>
          </span>
        }
      />
    </div>
  );
}

function Card({
  icon: Icon,
  iconBg,
  label,
  value,
}: {
  icon: typeof Star;
  iconBg: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg} text-white`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </article>
  );
}
