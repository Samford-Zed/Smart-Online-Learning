import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  CheckSquare,
  UsersRound,
  BarChart3,
  LineChart,
  UserCog,
  HelpCircle,
  LogOut,
  ChevronDown,
  ClipboardCheck,
  LayoutGrid,
  ClipboardList,
  FileText,
  Megaphone,
  Settings,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useT } from "../../../i18n/I18nProvider";

type NavItem = {
  key: string;
  /** Translation key under `admin.sidebar.*` */
  tKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  to?: string;
  badge?: number;
  children?: { tKey: string; to: string }[];
};

const items: NavItem[] = [
  { key: "dashboard",      tKey: "dashboard",      icon: LayoutDashboard, to: "/admin/dashboard" },
  { key: "teachers",       tKey: "teachers",       icon: GraduationCap,   to: "/admin/teachers" },
  { key: "parents",        tKey: "parents",        icon: Users,           to: "/admin/parents" },
  { key: "courses",        tKey: "courses",        icon: BookOpen,        to: "/admin/courses" },
  { key: "curriculum",     tKey: "curriculum",     icon: LayoutGrid,      to: "/admin/curriculum" },
  { key: "enrollments",    tKey: "enrollments",    icon: ClipboardList,   to: "/admin/enrollments" },
  { key: "settings",       tKey: "settings",       icon: Settings,         to: "/admin/settings" },
  { key: "calendar",       tKey: "calendar",       icon: CalendarDays,    to: "/admin/calendar" },
  { key: "tasks",          tKey: "tasks",          icon: CheckSquare,     to: "/admin/tasks" },
  { key: "students",       tKey: "students",       icon: UsersRound,      to: "/admin/students" },
  { key: "attendance",     tKey: "attendance",     icon: ClipboardCheck,  to: "/admin/attendance" },
  { key: "exams",          tKey: "exams",          icon: FileText,        to: "/admin/exams" },
  { key: "reports",        tKey: "reports",        icon: BarChart3,       to: "/admin/reports" },
  { key: "announcements",  tKey: "announcements",  icon: Megaphone,       to: "/admin/announcements" },
  { key: "userManagement", tKey: "userManagement", icon: UserCog,         to: "/admin/users" },
  { key: "analytics",      tKey: "analytics",      icon: LineChart,       to: "/admin/analytics" },
  { key: "managePages",    tKey: "managePages",    icon: LayoutGrid,      to: "/admin/manage-pages" },
];

export function AdminSidebar() {
  const location = useLocation();
  const { t } = useT();

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-ink-200 bg-white px-3 py-5 md:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 pb-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-violet-600">
          <GraduationCap className="size-5 text-white" aria-hidden />
        </span>
        <span className="text-lg font-bold tracking-tight text-ink-900">
          EduSmart K-12
        </span>
      </div>

      {/* Navigation — scrollable */}
      <nav className="flex flex-col gap-0.5 overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) =>
          item.children ? (
            <CollapseGroup
              key={item.key}
              item={item}
              pathname={location.pathname}
            />
          ) : (
            <NavLink
              key={item.key}
              to={item.to!}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-ink-700 hover:bg-violet-50 hover:text-violet-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="size-[18px] shrink-0" aria-hidden />
                  <span className="flex-1">{t(`admin.sidebar.${item.tKey}`)}</span>
                  {item.badge ? (
                    <span className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? "bg-white/25 text-white" : "bg-violet-100 text-violet-700"}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-0.5 border-t border-ink-100 pt-3">
        <a
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100"
        >
          <HelpCircle className="size-[18px]" aria-hidden />
          {t("admin.sidebar.helpCenter")}
        </a>
        <a
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="size-[18px]" aria-hidden />
          {t("admin.sidebar.logout")}
        </a>
      </div>
    </aside>
  );
}

function CollapseGroup({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const { t } = useT();
  const isChildActive = item.children?.some((c) =>
    pathname.startsWith(c.to),
  );
  const [open, setOpen] = useState(!!isChildActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isChildActive
            ? "bg-violet-50 text-violet-700"
            : "text-ink-700 hover:bg-violet-50 hover:text-violet-700"
        }`}
      >
        <item.icon className="size-[18px] shrink-0" aria-hidden />
        <span className="flex-1 text-left">{t(`admin.sidebar.${item.tKey}`)}</span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="ml-8 mt-0.5 flex flex-col gap-0.5">
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "text-violet-700 font-semibold"
                    : "text-ink-500 hover:text-ink-900"
                }`
              }
            >
              {t(`admin.sidebar.${child.tKey}`)}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
