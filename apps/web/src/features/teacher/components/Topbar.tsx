import { Bell, ChevronDown, Globe, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n, useT } from "../../../i18n/I18nProvider";
import type { Language } from "../../../i18n/translations";
import { NotificationsPanel } from "./NotificationsPanel";

type Props = {
  title: string;
  onOpenSettings?: () => void;
};

export function Topbar({ title, onOpenSettings }: Props) {
  const t = useT();
  const [openNotif, setOpenNotif] = useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(true);
  const [unreadCount] = useState(1);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const syncUser = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setUserName(u.fullName || u.full_name || u.name || "");
        setUserAvatar(u.avatar || null);
      }
    } catch {}
  };

  useEffect(() => {
    syncUser();
    window.addEventListener("user-updated", syncUser);
    return () => window.removeEventListener("user-updated", syncUser);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur md:px-10">
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            ref={bellRef}
            type="button"
            aria-label={t("Notifications")}
            aria-haspopup="dialog"
            aria-expanded={openNotif}
            onClick={() => {
              setOpenNotif((v) => !v);
              setHasUnreadNotif(false);
            }}
            className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotif && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          {openNotif && (
            <NotificationsPanel
              triggerRef={bellRef}
              onClose={() => setOpenNotif(false)}
            />
          )}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Divider */}
        <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || "Profile"}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 ring-2 ring-white shadow-sm">
              <UserCircle className="h-6 w-6 text-indigo-500" />
            </span>
          )}
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900">{userName || t("portal.teacher")}</p>
            <p className="text-xs text-slate-500">{t("portal.teacher")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher() {
  const { lang, setLang, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (code: Language) => {
    setLang(code);
    setOpen(false);
  };

  const FLAG: Record<Language, string> = { en: "🇬🇧", am: "🇪🇹", om: "🇪🇹" };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <Globe className="h-4 w-4 text-slate-400" />
        <span className="text-sm">{FLAG[lang]}</span>
        <span className="text-sm font-semibold uppercase text-slate-700">
          {lang}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-xl ring-1 ring-slate-200"
        >
          {languages.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => select(l.code)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-indigo-50 font-semibold text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{l.nativeLabel}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {l.code}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
