import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useT } from "../../../i18n/I18nProvider";
import type { TranslationKey } from "../../../i18n/translations";
import { TEACHER_ROUTES, type TeacherRouteId } from "../routes";

type Props = {
  active: TeacherRouteId;
  onNavigate: (id: TeacherRouteId) => void;
};

const NAV_KEYS: Record<TeacherRouteId, string> = {
  dashboard: "nav.dashboard",
  classes: "nav.classManagement",
  "class-detail": "nav.classDetail",
  "grade-submissions": "nav.gradeSubmissions",
  authoring: "nav.createContent",
  resources: "nav.subjectResources",
  feedback: "nav.studentFeedback",
  analytics: "nav.performanceAnalytics",
  settings: "nav.settings",
};

export function Sidebar({ active, onNavigate }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const visibleRoutes = TEACHER_ROUTES.filter((r) => !r.hidden);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="px-6 pt-6 pb-8">
        <p className="text-lg font-extrabold tracking-tight text-slate-900">
          EduSmart K-12
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">
          {t("Role-Based Access")}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {visibleRoutes.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{t(NAV_KEYS[item.id] as TranslationKey) || item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-6">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {t("common.logout")}
        </button>
      </div>
    </aside>
  );
}
