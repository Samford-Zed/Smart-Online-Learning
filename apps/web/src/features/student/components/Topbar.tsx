import type { ButtonHTMLAttributes } from "react";
import { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  Search,
  Bell,
  Settings,
  UserCircle,
  LogOut,
  BookOpen,
  Star,
  ChevronDown,
  X,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useT } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { api } from "@/services/api";

type Notif = { id: string; text: string; sub: string; unread: boolean };

const INITIAL_NOTIFS: Notif[] = [
  { id: "n1", text: "Math Worksheet #5 is due tomorrow",         sub: "2 min ago",   unread: true  },
  { id: "n2", text: "Science quiz graded — you scored 88/100",   sub: "1 hour ago",  unread: true  },
  { id: "n3", text: "New resource uploaded: Chapter 4 notes",    sub: "3 hours ago", unread: false },
  { id: "n4", text: "Class schedule updated for next week",      sub: "Yesterday",   unread: false },
];

/**
 * Top app bar: brand, search, language, notifications, settings, avatar.
 */
export function Topbar() {
  const { t } = useT();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Real user data
  const [user, setUser] = useState<{ id: number; fullName: string; email: string; role: string; grade_level?: string } | null>(null);

  // Load current user and notifications on mount
  useEffect(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem("user");
    let localUser = null;
    if (stored) {
      try { 
        localUser = JSON.parse(stored);
        setUser(localUser); 
      } catch {}
    }
    // Also try to fetch from API for latest data (but don't overwrite fullName with username)
    api.getMe().then((u) => {
      if (u) {
        // Preserve the localStorage fullName if API returns a username-like name
        const apiFullName = u.fullName || "";
        const localFullName = localUser?.fullName || "";
        // If API returns something like "samizenebe508" (username with numbers), keep local name
        const isApiUsername = /\d/.test(apiFullName) || apiFullName === u.email?.split('@')[0];
        const mergedUser = {
          ...u,
          fullName: (isApiUsername && localFullName) ? localFullName : apiFullName,
        };
        setUser(mergedUser);
        localStorage.setItem("user", JSON.stringify(mergedUser));
      }
    }).catch(() => {
      // Fallback: already loaded from localStorage
    });

    // Fetch real notifications from API
    loadNotifications();
  }, []);

  // Load notifications from API
  async function loadNotifications() {
    try {
      const response = await api.getStudentNotifications();
      if (response && Array.isArray(response) && response.length > 0) {
        // Transform API notifications to Notif format
        const apiNotifs: Notif[] = response.map((n: any) => ({
          id: String(n.id || n.notification_id || `api-${Math.random()}`),
          text: n.title || n.message || n.text || "New notification",
          sub: n.subtitle || n.timestamp || n.time || "Just now",
          unread: n.is_read === false || n.read === false || n.unread === true,
        }));
        setNotifs(apiNotifs);
      }
      // If no API notifications, keep mock data
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Keep mock data as fallback
    }
  }

  const userName = user?.fullName || user?.email?.split('@')[0] || "Student";
  const userFirstName = userName.split(' ')[0];
  const userEmail = user?.email || "student@school.edu";
  const userGrade = user?.grade_level || "Grade 10";
  const userRole = user?.role || "Student";
  const userAvatar = user?.fullName 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`
    : null;

  const unreadCount = notifs.filter((n) => n.unread).length;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node))
        setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setShowProfile(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/student/resources?q=${encodeURIComponent(query.trim())}`);
  }

  async function markAllRead() {
    // Mark all as read locally
    setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })));
    // Try to sync with backend
    try {
      const unreadNotifs = notifs.filter((n) => n.unread);
      await Promise.all(unreadNotifs.map((n) => api.markNotificationRead(n.id)));
    } catch (error) {
      // Silent fail - already marked as read locally
    }
  }

  function dismissNotif(id: string) {
    setNotifs((ns) => ns.filter((n) => n.id !== id));
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-ink-200 bg-white px-6">
      {/* Brand */}
      <div className="flex items-center gap-2 pr-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <GraduationCap className="size-5" aria-hidden />
        </span>
        <span className="text-lg font-bold tracking-tight text-brand">
          EduSmart K-12
        </span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex max-w-md flex-1 items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-ink-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("common.search")}
          className="h-10 w-full rounded-full border border-ink-200 bg-ink-50 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-500 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <button
            type="button"
            aria-label={t("common.notifications")}
            onClick={() => { setShowNotifs((o) => !o); setShowProfile(false); }}
            className="flex size-9 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100"
          >
            <Bell className="size-5" />
          </button>
          {unreadCount > 0 && (
            <span className="pointer-events-none absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}

          {showNotifs && (
            <div className="absolute right-0 top-11 z-30 w-80 rounded-2xl border border-ink-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <h3 className="text-sm font-bold text-ink-900">{t("topbar.notificationsTitle")}</h3>
                <button onClick={markAllRead} className="text-xs font-semibold text-brand hover:underline">
                  {t("common.markAllRead")}
                </button>
              </div>
              <ul className="max-h-72 divide-y divide-ink-50 overflow-y-auto">
                {notifs.length === 0 && (
                  <li className="px-4 py-6 text-center text-xs text-ink-400">All caught up!</li>
                )}
                {notifs.map((n) => (
                  <li key={n.id} className={`flex items-start gap-3 px-4 py-3 transition hover:bg-ink-50 ${n.unread ? "bg-brand/5" : ""}`}>
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.unread ? "bg-brand" : "bg-ink-200"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug text-ink-800">{n.text}</p>
                      <p className="mt-0.5 text-[10px] text-ink-400">{n.sub}</p>
                    </div>
                    <button onClick={() => dismissNotif(n.id)} className="mt-0.5 shrink-0 text-ink-300 hover:text-ink-600">
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-ink-100 px-4 py-2.5 text-center">
                <Link to="/student/schedule" onClick={() => setShowNotifs(false)} className="text-xs font-semibold text-brand hover:underline">
                  View schedule
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          to="/student/settings"
          aria-label={t("common.settings")}
          className="flex size-9 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100"
        >
          <Settings className="size-5" />
        </Link>

        {/* Avatar / Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => { setShowProfile((o) => !o); setShowNotifs(false); }}
            className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-0.5 pl-0.5 pr-2.5 transition hover:bg-ink-50"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={`${userFirstName} avatar`}
                className="size-8 rounded-full border-2 border-white bg-surface-100 object-cover shadow-card"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand/10 text-brand">
                <User className="size-4" />
              </span>
            )}
            <span className="hidden text-xs font-semibold text-ink-900 sm:block">{userFirstName}</span>
            <ChevronDown className={`size-3.5 text-ink-400 transition-transform ${showProfile ? "rotate-180" : ""}`} aria-hidden />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-11 z-30 w-52 rounded-2xl border border-ink-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="size-10 rounded-full bg-surface-100 object-cover ring-2 ring-brand/20" />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand ring-2 ring-brand/20">
                    <User className="size-5" />
                  </span>
                )}
                <div>
                  <p className="text-sm font-bold text-ink-900">{userName}</p>
                  <p className="text-xs text-ink-500">{userGrade} · {userRole}</p>
                </div>
              </div>
              <div className="py-1.5">
                <Link to="/student/settings" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-brand/5 hover:text-brand">
                  <UserCircle className="size-4" /> My Profile
                </Link>
                <Link to="/student/grades" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-brand/5 hover:text-brand">
                  <Star className="size-4" /> My Grades
                </Link>
                <Link to="/student/classes" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-brand/5 hover:text-brand">
                  <BookOpen className="size-4" /> My Classes
                </Link>
                <Link to="/student/settings" onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-brand/5 hover:text-brand">
                  <Settings className="size-4" /> Settings
                </Link>
              </div>
              <div className="border-t border-ink-100 py-1.5">
                <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  <LogOut className="size-4" /> Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex size-9 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100"
    >
      {children}
    </button>
  );
}
