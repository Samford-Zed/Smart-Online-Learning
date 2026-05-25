import { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Camera, Save, Lock, Bell, Shield, Eye, EyeOff, User, Settings, Check, X,
  AlertTriangle, Mail, Phone, MapPin, Calendar, Award, Smartphone, Monitor,
  LogOut, Trash2, Globe, Sparkles, Languages, Type, Palette, KeyRound, Activity, UserCircle,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import {
  usePreferences,
  setPreferences,
  type ThemeMode,
  type FontSize,
} from "../../student/settings/preferencesStore";
import { useT, LOCALES } from "../../../i18n/I18nProvider";
import { api } from "../../../services/api";

const TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "security",      label: "Security",      icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences",   label: "Preferences",   icon: Settings },
] as const;
type TabId = typeof TABS[number]["id"];

export default function AdminAccountPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "error" } | null>(null);
  function showToast(msg: string, tone: "success" | "error" = "success") {
    setToast({ msg, tone }); setTimeout(() => setToast(null), 2400);
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 pb-12 pt-6">

          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-ink-900">My Account</h1>
            <p className="text-sm text-ink-500">Manage your profile, security, and preferences</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
            {/* Sidebar tabs */}
            <aside className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
              <div className="rounded-2xl border border-ink-200 bg-white p-2 shadow-card">
                <nav className="flex flex-col gap-1">
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${tab === t.id ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md" : "text-ink-600 hover:bg-violet-50 hover:text-violet-700"}`}>
                      <t.icon className="size-4" />{t.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <section>
              {tab === "profile"       && <ProfileTab onToast={showToast} />}
              {tab === "security"      && <SecurityTab onToast={showToast} />}
              {tab === "notifications" && <NotificationsTab onToast={showToast} />}
              {tab === "preferences"   && <PreferencesTab onToast={showToast} />}
            </section>
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in-up ${toast.tone === "success" ? "bg-ink-900" : "bg-red-600"}`}>
          {toast.tone === "success" ? <Check className="size-4 text-emerald-400" /> : <AlertTriangle className="size-4" />} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ─────────── Profile Tab ─────────── */
function ProfileTab({ onToast }: { onToast: (msg: string, tone?: "success" | "error") => void }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "",
    email: "", phone: "",
    address: "",
    role: "Admin", joined: "",
    bio: "",
  });
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getMe().then((u: any) => {
      const fullName: string = u.fullName || u.full_name || "";
      const parts = fullName.trim().split(" ");
      setForm(f => ({
        ...f,
        firstName: parts[0] || "",
        lastName:  parts.slice(1).join(" ") || "",
        email:     u.email || "",
        phone:     u.phone || "",
        address:   u.address || "",
        bio:       u.bio || "",
        role:      u.role || "Admin",
        joined:    u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : "",
      }));
      const key = `admin_avatar_${u.id || u.email}`;
      const saved = localStorage.getItem(key);
      setAvatar(saved || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || u.email}`);
    }).catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })); }
  function pickFile() { fileInput.current?.click(); }
  function handleAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { onToast("Please choose an image file", "error"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      api.getMe().then((u: any) => {
        localStorage.setItem(`admin_avatar_${u.id || u.email}`, dataUrl);
      }).catch(() => {});
      onToast("Photo updated");
    };
    reader.readAsDataURL(file);
  }
  async function handleSave() {
    try {
      setSaving(true);
      await api.updateMe({
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        bio: form.bio,
        address: form.address,
      });
      onToast("Profile saved successfully");
    } catch {
      onToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
        <div className="h-24 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500" />
        <div className="px-6 pb-5">
          <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                {avatar.startsWith("data:")
                  ? <img src={avatar} alt="Avatar" className="size-24 rounded-2xl border-4 border-white object-cover shadow-lg" />
                  : <span className="flex size-24 items-center justify-center rounded-2xl border-4 border-white bg-violet-100 shadow-lg"><UserCircle className="size-16 text-violet-400" /></span>
                }
                <button onClick={pickFile} className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-md hover:bg-violet-700 hover:scale-110 transition">
                  <Camera className="size-4" />
                </button>
                <input ref={fileInput} type="file" accept="image/*" hidden onChange={handleAvatar} />
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-bold text-ink-900">{form.firstName} {form.lastName}</h2>
                <p className="text-sm text-ink-500">{form.email}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                  <Shield className="size-3" /> {form.role}
                </span>
              </div>
            </div>
            <button onClick={pickFile} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
              <Camera className="size-4" />Change Photo
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon={Calendar}  label="Joined"      value={form.joined}       gradient="from-violet-500 to-fuchsia-500" />
        <StatPill icon={Award}     label="Role"        value={form.role}         gradient="from-amber-500 to-orange-500" />
        <StatPill icon={Activity}  label="Status"      value="Active"            gradient="from-emerald-500 to-green-500" />
      </div>

      {/* Personal info */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-ink-900"><User className="size-4 text-violet-600" />Personal Information</h2>
        <p className="mb-5 text-xs text-ink-500">Update your personal details below</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name"><input value={form.firstName} onChange={e => set("firstName", e.target.value)} className={fieldCls} /></Field>
          <Field label="Last Name"><input value={form.lastName} onChange={e => set("lastName", e.target.value)} className={fieldCls} /></Field>
          <Field label="Email" icon={Mail}><input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={`${fieldCls} pl-9`} /></Field>
          <Field label="Phone" icon={Phone}><input value={form.phone} onChange={e => set("phone", e.target.value)} className={`${fieldCls} pl-9`} /></Field>
          <Field label="Address" icon={MapPin}><input value={form.address} onChange={e => set("address", e.target.value)} className={`${fieldCls} pl-9 sm:col-span-2`} /></Field>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-ink-700">Bio</span>
            <textarea value={form.bio} rows={3} onChange={e => set("bio", e.target.value)}
              className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none" />
            <span className="text-[10px] text-ink-400">{form.bio.length}/300</span>
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-50">
            <Save className="size-4" />{saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, gradient }: { icon: typeof User; label: string; value: string; gradient: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3 shadow-card">
      <span className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-ink-400">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

const fieldCls = "h-10 w-full rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function Field({ label, icon: Icon, children }: { label: string; icon?: typeof Mail; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-700">{label}</span>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />}
        {children}
      </div>
    </label>
  );
}

/* ─────────── Security Tab ─────────── */
function SecurityTab({ onToast }: { onToast: (msg: string, tone?: "success" | "error") => void }) {
  const [show, setShow] = useState({ curr: false, new: false, conf: false });
  const [pwd, setPwd] = useState({ curr: "", new: "", conf: "" });
  const [twoFA, setTwoFA] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function strength(p: string) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s; // 0..4
  }
  const sLevel = strength(pwd.new);
  const sLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const sColors = ["bg-ink-200", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  function updatePwd() {
    if (!pwd.curr || !pwd.new || !pwd.conf) { onToast("Fill in all fields", "error"); return; }
    if (pwd.new !== pwd.conf) { onToast("Passwords do not match", "error"); return; }
    if (sLevel < 2) { onToast("Password is too weak", "error"); return; }
    setPwd({ curr: "", new: "", conf: "" });
    onToast("Password updated successfully");
  }

  const sessions = [
    { device: "Windows PC · Chrome", location: "Springfield, IL",   active: true,  time: "Active now",     icon: Monitor },
    { device: "iPhone 14 · Safari",  location: "Springfield, IL",   active: false, time: "2 hours ago",     icon: Smartphone },
    { device: "MacBook · Firefox",   location: "Chicago, IL",       active: false, time: "Yesterday",       icon: Monitor },
  ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      {/* Change password */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-ink-900"><KeyRound className="size-4 text-violet-600" />Change Password</h2>
        <p className="mb-5 text-xs text-ink-500">Update your password regularly to keep your account secure</p>
        <div className="grid max-w-md gap-4">
          {([["Current Password","curr"],["New Password","new"],["Confirm Password","conf"]] as [string, keyof typeof show][]).map(([label, key]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">{label}</span>
              <div className="relative">
                <input type={show[key] ? "text" : "password"} value={pwd[key]} onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
                  className={`${fieldCls} pr-10`} placeholder="••••••••" />
                <button type="button" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-violet-700">
                  {show[key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {key === "new" && pwd.new && (
                <div className="mt-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <span key={i} className={`h-1 flex-1 rounded-full transition ${i <= sLevel ? sColors[sLevel] : "bg-ink-100"}`} />
                    ))}
                  </div>
                  <p className={`mt-1 text-[10px] font-bold ${sLevel >= 3 ? "text-emerald-600" : sLevel >= 2 ? "text-amber-600" : "text-red-600"}`}>{sLabels[sLevel]}</p>
                </div>
              )}
            </label>
          ))}
          <button onClick={updatePwd}
            className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg">
            <Save className="size-4" />Update Password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <Shield className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink-900">Two-Factor Authentication</h2>
              <p className="mt-0.5 text-sm text-ink-500">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Toggle on={twoFA} onChange={() => { setTwoFA(v => !v); onToast(twoFA ? "2FA disabled" : "2FA enabled"); }} />
        </div>
        {twoFA && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
            <Sparkles className="size-4" />Two-factor is <strong>enabled</strong>. An OTP will be sent to your email on login.
          </div>
        )}
      </div>

      {/* Active sessions */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-ink-900"><Activity className="size-4 text-violet-600" />Active Sessions</h2>
        <p className="mb-5 text-xs text-ink-500">Devices currently signed in to your account</p>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-white text-violet-600"><s.icon className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{s.device}</p>
                <p className="text-xs text-ink-500">{s.location} · {s.time}</p>
              </div>
              {s.active ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">Current</span>
              ) : (
                <button onClick={() => onToast("Session revoked")} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[10px] font-semibold text-ink-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                  <LogOut className="size-3" />Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border-2 border-red-100 bg-white p-6 shadow-card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-red-700"><AlertTriangle className="size-4" />Danger Zone</h2>
        <p className="mb-4 text-xs text-ink-500">Irreversible actions that affect your account</p>
        <button onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
          <Trash2 className="size-4" />Delete My Account
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in text-center">
            <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="size-6 text-red-600" /></span>
            <h3 className="text-lg font-bold text-ink-900">Delete Account</h3>
            <p className="mt-1 text-sm text-ink-500">This action cannot be undone. All your data will be permanently removed.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={() => { setConfirmDelete(false); onToast("Account deletion requested", "error"); }} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Notifications Tab ─────────── */
function NotificationsTab({ onToast }: { onToast: (msg: string, tone?: "success" | "error") => void }) {
  const [prefs, setPrefs] = useState({
    emailNewStudent: true, emailExamResults: true, emailMessages: false, emailReports: true,
    pushAnnouncements: true, pushTasks: true, pushReports: false, pushSecurity: true,
    smsUrgent: false,
  });
  type PrefKey = keyof typeof prefs;
  function toggle(k: PrefKey) { setPrefs(p => ({ ...p, [k]: !p[k] })); }

  const groups = [
    {
      title: "Email Notifications", icon: Mail, gradient: "from-blue-500 to-cyan-500", items: [
        ["emailNewStudent",  "New Student Registration", "Get notified when a new student joins"],
        ["emailExamResults", "Exam Results Uploaded",    "When teachers upload exam results"],
        ["emailMessages",    "New Messages",             "When you receive a direct message"],
        ["emailReports",     "Weekly Reports",           "Performance summary every Monday"],
      ],
    },
    {
      title: "Push Notifications", icon: Bell, gradient: "from-violet-500 to-fuchsia-500", items: [
        ["pushAnnouncements", "New Announcements", "Real-time announcement alerts"],
        ["pushTasks",         "Task Assignments",  "When a task is assigned to you"],
        ["pushReports",       "Report Generation", "When a scheduled report is ready"],
        ["pushSecurity",      "Security Alerts",   "Login from a new device or location"],
      ],
    },
    {
      title: "SMS Notifications", icon: Phone, gradient: "from-emerald-500 to-green-500", items: [
        ["smsUrgent", "Urgent Alerts Only", "Critical security and emergency messages"],
      ],
    },
  ] as const;

  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      {groups.map(g => (
        <div key={g.title} className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${g.gradient} text-white`}>
              <g.icon className="size-5" />
            </span>
            <h2 className="text-base font-bold text-ink-900">{g.title}</h2>
          </div>
          <div className="flex flex-col divide-y divide-ink-100">
            {g.items.map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{label}</p>
                  <p className="text-xs text-ink-400">{desc}</p>
                </div>
                <Toggle on={prefs[key as PrefKey]} onChange={() => toggle(key as PrefKey)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={() => onToast("Notification preferences saved")}
        className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg">
        <Save className="size-4" />Save Preferences
      </button>
    </div>
  );
}

/* ─────────── Preferences Tab ─────────── */
const FONT_OPTIONS: { value: FontSize; label: string; px: string; cls: string }[] = [
  { value: "small",    label: "Small",    px: "14px", cls: "text-sm"  },
  { value: "standard", label: "Medium",   px: "16px", cls: "text-base" },
  { value: "large",    label: "Large",    px: "18px", cls: "text-lg"  },
  { value: "xl",       label: "Extra",    px: "20px", cls: "text-xl"  },
];

function PreferencesTab({ onToast }: { onToast: (msg: string, tone?: "success" | "error") => void }) {
  const prefs = usePreferences();
  const { locale, setLocale } = useT();

  // Helpers — every change is persisted + applied immediately by setPreferences.
  function pickTheme(theme: ThemeMode)            { setPreferences({ ...prefs, theme }); onToast(`Theme: ${theme}`); }
  function pickFontSize(fontSize: FontSize)       { setPreferences({ ...prefs, fontSize }); onToast(`Font size: ${fontSize}`); }
  function pickLang(language: typeof prefs.language) {
    setPreferences({ ...prefs, language });
    setLocale(language); // syncs with I18nProvider → topbar selector + t() calls
    onToast(`Language: ${LOCALES.find(l => l.code === language)?.label ?? language}`);
  }
  function toggleHC()                              { setPreferences({ ...prefs, highContrast: !prefs.highContrast }); }

  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      {/* Theme */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-ink-900"><Palette className="size-4 text-violet-600" />Theme</h2>
        <p className="mb-5 text-xs text-ink-500">Changes apply instantly across the entire application</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: "light",  label: "Light",  preview: "bg-white border-ink-300" },
            { value: "dark",   label: "Dark",   preview: "bg-ink-900 border-ink-800" },
            { value: "system", label: "System", preview: "bg-gradient-to-br from-white via-ink-300 to-ink-900 border-ink-300" },
          ] as const).map(t => (
            <button key={t.value} onClick={() => pickTheme(t.value)}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition ${prefs.theme === t.value ? "border-violet-600 bg-violet-50 text-violet-700" : "border-ink-200 text-ink-600 hover:border-violet-300"}`}>
              <span className={`h-14 w-full rounded-lg border ${t.preview}`} />
              {t.label}
              {prefs.theme === t.value && <Check className="absolute right-2 top-2 size-4 text-violet-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-ink-900"><Type className="size-4 text-violet-600" />Font Size</h2>
        <p className="mb-5 text-xs text-ink-500">Adjusts the base font size of the application</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FONT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => pickFontSize(o.value)}
              className={`relative flex flex-col items-center gap-1 rounded-xl border-2 py-3 transition ${prefs.fontSize === o.value ? "border-violet-600 bg-violet-50" : "border-ink-200 hover:border-violet-300"}`}>
              <span className={`font-bold ${o.cls} ${prefs.fontSize === o.value ? "text-violet-700" : "text-ink-700"}`}>Aa</span>
              <span className={`text-xs font-semibold ${prefs.fontSize === o.value ? "text-violet-700" : "text-ink-500"}`}>{o.label}</span>
              <span className="text-[10px] text-ink-400">{o.px}</span>
              {prefs.fontSize === o.value && <Check className="absolute right-2 top-2 size-3.5 text-violet-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-ink-900"><Languages className="size-4 text-violet-600" />Language</h2>
        <p className="mb-5 text-xs text-ink-500">Choose your preferred display language — applied across the entire app</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LOCALES.map(l => {
            const active = locale === l.code;
            return (
              <button key={l.code} onClick={() => pickLang(l.code)}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${active ? "border-violet-600 bg-violet-50" : "border-ink-200 hover:border-violet-300 hover:bg-ink-50"}`}>
                <span className="text-2xl">{l.flag}</span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className={`text-sm font-semibold ${active ? "text-violet-700" : "text-ink-900"}`}>{l.label}</span>
                  <span className="truncate text-xs text-ink-500">{l.native}</span>
                </span>
                {active && <Check className="absolute right-2 top-2 size-4 text-violet-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-ink-900"><Settings className="size-4 text-violet-600" />Accessibility</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">High Contrast</p>
            <p className="text-xs text-ink-400">Increases contrast for improved readability</p>
          </div>
          <Toggle on={prefs.highContrast} onChange={toggleHC} />
        </div>
      </div>

      <p className="text-xs text-ink-400">
        <Sparkles className="mr-1 inline size-3 text-violet-500" />
        Preferences are saved automatically and applied across all pages.
      </p>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${on ? "bg-gradient-to-r from-violet-600 to-fuchsia-500" : "bg-ink-200"}`}>
      <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
