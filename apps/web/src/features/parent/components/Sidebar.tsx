import {
  FileText,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Settings,
  TrendingUp,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useT } from "../../../i18n/I18nProvider";
import type { TranslationKey } from "../../../i18n/translations";
import type { RouteId } from "../routes";

type NavItem = {
  id: RouteId;
  labelKey: TranslationKey;
  icon: typeof LayoutGrid;
};

const items: NavItem[] = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: LayoutGrid },
  { id: "progress", labelKey: "nav.progress", icon: TrendingUp },
  { id: "report", labelKey: "nav.report", icon: FileText },
  { id: "logs", labelKey: "nav.logs", icon: History },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

type Props = {
  active: RouteId;
  onNavigate: (id: RouteId) => void;
};

export function Sidebar({ active, onNavigate }: Props) {
  const t = useT();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              EduSmart
            </p>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
              {t("PARENT PORTAL")}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item) => {
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
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  <span>{t(item.labelKey)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="space-y-2 px-3 pb-6">
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
