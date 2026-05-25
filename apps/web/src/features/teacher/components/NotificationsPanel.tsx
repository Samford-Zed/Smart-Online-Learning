import {
  BellOff,
  CheckCheck,
  ClipboardList,
  FileCheck2,
  MessageSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useT } from "../../../i18n/I18nProvider";
import { getTeacherDashboard } from "../services/teacher.api";

export type TeacherNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: typeof ClipboardList;
  iconBg: string;
  iconColor: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

type Props = {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

export function NotificationsPanel({ triggerRef, onClose }: Props) {
  const t = useT();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<TeacherNotification[]>([]);

  useEffect(() => {
    getTeacherDashboard().then((data: any) => {
      const notifs: TeacherNotification[] = [];
      (data?.pendingFeedback || []).forEach((f: any, i: number) => {
        notifs.push({
          id: `pf-${f.id ?? i}`,
          title: `Pending Submission: ${f.assignmentTitle || "Assignment"}`,
          body: `${f.studentName || "A student"} submitted work awaiting your review.`,
          time: f.submittedAt ? timeAgo(f.submittedAt) : "Recently",
          read: false,
          icon: ClipboardList,
          iconBg: "bg-indigo-50",
          iconColor: "text-indigo-600",
        });
      });
      if (data?.stats?.pendingGrades > 0) {
        notifs.push({
          id: "pending-grades",
          title: `${data.stats.pendingGrades} Grade(s) Pending`,
          body: "You have submissions that need grading.",
          time: "Now",
          read: false,
          icon: FileCheck2,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
        });
      }
      (data?.classes || []).forEach((c: any, i: number) => {
        if (Number(c.studentCount) > 0) {
          notifs.push({
            id: `class-${c.id ?? i}`,
            title: c.name || "Active Class",
            body: `${c.studentCount} student(s) enrolled.`,
            time: "Active",
            read: true,
            icon: MessageSquare,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
          });
        }
      });
      setItems(notifs.length ? notifs : []);
    }).catch(() => setItems([]));
  }, []);
  const [tab, setTab] = useState<"all" | "unread">("all");

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, triggerRef]);

  const visible = tab === "unread" ? items.filter((n) => !n.read) : items;
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearAll = () => setItems([]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{t("Notifications")}</p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          {t("Mark all read")}
        </button>
      </header>

      <div className="flex gap-1 border-b border-slate-100 px-3 py-2">
        <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
          {t("All")} ({items.length})
        </TabBtn>
        <TabBtn active={tab === "unread"} onClick={() => setTab("unread")}>
          {t("Unread")} ({unreadCount})
        </TabBtn>
      </div>

      <ul className="max-h-[380px] overflow-y-auto">
        {visible.length === 0 ? (
          <li className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <BellOff className="h-6 w-6 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              {tab === "unread"
                ? t("You're all caught up.")
                : t("No notifications yet.")}
            </p>
          </li>
        ) : (
          visible.map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    !n.read ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${n.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm leading-snug ${
                          n.read
                            ? "text-slate-700"
                            : "font-semibold text-slate-900"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {n.time}
                    </p>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>

      <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
        <button
          onClick={clearAll}
          disabled={items.length === 0}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("Clear all")}
        </button>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          {t("View all")}
        </button>
      </footer>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
