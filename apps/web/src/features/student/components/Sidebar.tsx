import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Star,
  CalendarDays,
  Bookmark,
  ClipboardCheck,
  HelpCircle,
  LogOut,
  Lightbulb,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { NavLink, Link } from "react-router-dom";
import { useT } from "@/i18n/I18nProvider";

type NavItem = {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  to: string;
};

const items: NavItem[] = [
  { key: "dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
  { key: "myCourses", icon: BookOpen, to: "/student/classes" },
  { key: "assignments", icon: ClipboardList, to: "/student/assignments" },
  { key: "grades", icon: Star, to: "/student/grades" },
  { key: "assessments", icon: ClipboardCheck, to: "/student/assessments" },
  { key: "schedule", icon: CalendarDays, to: "/student/schedule" },
  { key: "resources", icon: Bookmark, to: "/student/resources" },
];

/**
 * Left sidebar: portal header, primary navigation, upgrade CTA, and footer links.
 */
export function Sidebar() {
  const { t } = useT();

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-ink-200 bg-white px-4 py-5 md:flex">
      {/* Portal header */}
      <div className="flex items-center gap-3 px-2 pb-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-amber-100">
          <Lightbulb className="size-5 text-amber-500" aria-hidden />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink-900">
            {t("sidebar.portal")}
          </div>
          <div className="text-xs text-ink-500">{t("sidebar.grade")}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {items.map(({ key, icon: Icon, to }) => (
          <NavLink
            key={key}
            to={to}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-3 rounded-lg bg-brand px-3 py-2.5 text-sm font-medium text-white shadow-card"
                : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100"
            }
          >
            <Icon className="size-[18px]" aria-hidden />
            {t(`sidebar.${key}`)}
          </NavLink>
        ))}
      </nav>

      {/* Footer links */}
      <div className="mt-auto flex flex-col gap-2">
        <Link
          to="/student/resources"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100"
        >
          <HelpCircle className="size-[18px]" aria-hidden />
          {t("sidebar.helpCenter")}
        </Link>
        <Link
          to="/login"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="size-[18px]" aria-hidden />
          {t("sidebar.logout")}
        </Link>
      </div>
    </aside>
  );
}
