import { GraduationCap, Loader2, Plus, UserCircle, UserCircle2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../services/api";
import { useT } from "../../../../i18n/I18nProvider";
import { SettingsSection } from "../ui/SettingsSection";

export function LinkedChildrenSection() {
  const t = useT();
  const [children, setChildren] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    api.getParentDashboard().then((data: any) => {
      const child = data?.child;
      if (child) setChildren([{ ...child, primary: true }]);
      else setChildren([]);
    }).catch(() => setChildren([]));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showModal) setTimeout(() => inputRef.current?.focus(), 50);
  }, [showModal]);

  const handleLink = async () => {
    setError("");
    setSuccess("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid student email address.");
      return;
    }
    setSaving(true);
    try {
      await api.linkParentToStudent(email.trim());
      setSuccess("Student linked successfully!");
      setEmail("");
      load();
      setTimeout(() => { setShowModal(false); setSuccess(""); }, 1500);
    } catch (e: any) {
      setError(e.message || "Failed to link student. Check the email and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SettingsSection
        icon={UserCircle2}
        title={t("Linked Children")}
        description={t("Children connected to this parent account.")}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      >
        {children.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {t("No linked student yet. Use the button below to link your child.")}
          </p>
        ) : (
          <ul className="space-y-3">
            {children.map((c: any, i: number) => {
              const name = c.fullName || c.full_name || c.name || "—";
              const grade = c.grade || c.grade_level;
              const gradeLabel = grade ? (String(grade).startsWith("Grade") ? String(grade) : `Grade ${grade}`) : "";
              return (
                <li key={c.id ?? i}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 ring-2 ring-white shadow-sm">
                      <UserCircle className="h-8 w-8 text-indigo-400" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{name}</p>
                        {c.primary && (
                          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                            {t("Primary")}
                          </span>
                        )}
                      </div>
                      {gradeLabel && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                          <GraduationCap className="h-3 w-3" />
                          {gradeLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={() => { setShowModal(true); setError(""); setSuccess(""); setEmail(""); }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          {t("Link Another Child")}
        </button>
      </SettingsSection>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{t("Link a Child")}</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {t("Enter your child's registered school email address to link their account.")}
            </p>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("Child's School Email")}
              </label>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLink()}
                placeholder="e.g. child@school.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
              {success && <p className="mt-2 text-xs font-medium text-emerald-600">{success}</p>}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleLink}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Linking…")}</> : t("Link Child")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
