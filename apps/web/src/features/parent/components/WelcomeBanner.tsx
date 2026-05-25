import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { useT } from "../../../i18n/I18nProvider";

type Props = {
  onViewReport?: () => void;
};

export function WelcomeBanner({ onViewReport }: Props) {
  const t = useT();
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [topSubject, setTopSubject] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setParentName(u.fullName || u.full_name || u.name || "");
      }
    } catch {}
    api.getParentDashboard().then((data: any) => {
      if (data?.parentName) setParentName(data.parentName);
      const child = data?.child || data?.children?.[0];
      if (child) setChildName(child.fullName || child.full_name || child.name || "");
      const subjects = data?.currentSubjects || data?.progress?.subjects || data?.subjects || [];
      if (subjects.length) {
        const top = [...subjects].sort((a: any, b: any) => (b.progress || b.grade || 0) - (a.progress || a.grade || 0))[0];
        setTopSubject(top?.name || top?.subject || "");
      }
    }).catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 p-8 text-white shadow-card">
      {/* Decorative sparkles */}
      <Sparkles className="pointer-events-none absolute right-10 top-8 h-5 w-5 text-white/30" />
      <Sparkles className="pointer-events-none absolute right-24 top-24 h-8 w-8 text-white/20" />
      <Sparkles className="pointer-events-none absolute right-8 bottom-10 h-10 w-10 text-white/20" />
      <Sparkles className="pointer-events-none absolute right-40 bottom-20 h-4 w-4 text-white/25" />

      <div className="relative max-w-md space-y-4 pt-12">
        <h2 className="text-lg font-semibold">
          {parentName ? `${t("Welcome back,")} ${parentName}!` : t("Welcome back!")}
        </h2>
        <p className="text-sm leading-relaxed text-indigo-50/90">
          {childName
            ? `${t("Here is a quick overview of")} ${childName}'s ${t("progress")}.${
                topSubject ? ` ${t("Doing well in")} ${topSubject}.` : ""
              }`
            : t("Here is a quick overview of your child's progress.")}
        </p>

        <button
          type="button"
          onClick={onViewReport}
          className="group mt-2 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          {t("View Detailed Report")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}
