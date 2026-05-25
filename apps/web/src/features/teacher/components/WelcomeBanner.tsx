import { MessageSquare } from "lucide-react";
import { useT } from "../../../i18n/I18nProvider";

type Props = {
  pendingCount: number;
  onReview?: () => void;
  name?: string;
};

export function WelcomeBanner({ pendingCount, onReview, name }: Props) {
  const t = useT();
  return (
    <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-indigo-50 p-6 ring-1 ring-indigo-100 md:flex-row md:items-center">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {name ? `${t("Welcome back,")} ${name}!` : t("Welcome back!")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {pendingCount} {t("pending feedback requests today.")}
        </p>
      </div>
      <button
        type="button"
        onClick={onReview}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <MessageSquare className="h-4 w-4" />
        {t("Review Feedback")}
      </button>
    </section>
  );
}
