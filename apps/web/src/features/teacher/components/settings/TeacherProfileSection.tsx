import { Camera, CheckCircle2, User, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SettingsSection } from "../../../parent/components/ui/SettingsSection";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  subject: string;
  bio: string;
};

const INITIAL: ProfileForm = {
  firstName: "Sarah",
  lastName: "Jenkins",
  email: "sarah.jenkins@eduguide.edu",
  phone: "+1 (555) 489-2167",
  title: "Senior Educator",
  subject: "Biology",
  bio: "Passionate biology teacher with 12 years of classroom experience focused on inquiry-based learning.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function readLocalUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function TeacherProfileSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localUser = readLocalUser();
  const initialForm: ProfileForm = {
    firstName: localUser?.firstName || localUser?.fullName?.split(" ")[0] || INITIAL.firstName,
    lastName: localUser?.lastName || localUser?.fullName?.split(" ").slice(1).join(" ") || INITIAL.lastName,
    email: localUser?.email || INITIAL.email,
    phone: localUser?.phone || INITIAL.phone,
    title: localUser?.title || INITIAL.title,
    subject: localUser?.subject || INITIAL.subject,
    bio: localUser?.bio || INITIAL.bio,
  };

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [savedForm, setSavedForm] = useState<ProfileForm>(initialForm);

  useEffect(() => {
    const u = readLocalUser();
    if (u?.avatar) {
      setAvatar(u.avatar);
      setSavedAvatar(u.avatar);
    }
  }, []);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const isDirty = useMemo(() => {
    if (avatar !== savedAvatar) return true;
    return (Object.keys(form) as (keyof ProfileForm)[]).some(
      (k) => form[k] !== savedForm[k]
    );
  }, [form, savedForm, avatar, savedAvatar]);

  const updateField = (key: keyof ProfileForm) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSavedAt(null);
  };

  const validate = () => {
    const next: Partial<Record<keyof ProfileForm, string>> = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Invalid email";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.title.trim()) next.title = "Required";
    if (!form.subject.trim()) next.subject = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavedForm(form);
    setSavedAvatar(avatar);
    const u = readLocalUser() || {};
    const updated = {
      ...u,
      firstName: form.firstName,
      lastName: form.lastName,
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      title: form.title,
      subject: form.subject,
      bio: form.bio,
      avatar: avatar ?? u.avatar ?? null,
    };
    localStorage.setItem("user", JSON.stringify(updated));
    window.dispatchEvent(new Event("user-updated"));
    setSaving(false);
    setSavedAt(Date.now());
  };

  const handleCancel = () => {
    setForm(savedForm);
    setErrors({});
    if (avatar !== savedAvatar) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
      setAvatar(savedAvatar);
    }
    setError(null);
    setSavedAt(null);
  };

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("Unsupported format. Use PNG, JPG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large. Max 5 MB.");
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      setObjectUrl(null);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  return (
    <SettingsSection
      icon={User}
      title="Profile Information"
      description="Update your personal details and teaching profile."
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt="Profile avatar"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-2 ring-white shadow-sm">
              <UserCircle2 className="h-10 w-10" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow ring-2 ring-white hover:bg-indigo-700"
            aria-label="Change avatar"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
          <p className="mt-0.5 text-xs text-slate-500">
            PNG, JPG, or WebP. Max 5 MB. Recommended 400×400 pixels.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Upload new
            </button>
            <button
              type="button"
              onClick={() => {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                setObjectUrl(null);
                setAvatar(null);
              }}
              disabled={!avatar}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>

      <form
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <Field label="First name" value={form.firstName} onChange={updateField("firstName")} error={errors.firstName} />
        <Field label="Last name" value={form.lastName} onChange={updateField("lastName")} error={errors.lastName} />
        <Field label="Email" type="email" value={form.email} onChange={updateField("email")} error={errors.email} />
        <Field label="Phone" type="tel" value={form.phone} onChange={updateField("phone")} error={errors.phone} />
        <Field label="Title" value={form.title} onChange={updateField("title")} error={errors.title} />
        <Field label="Primary subject" value={form.subject} onChange={updateField("subject")} error={errors.subject} />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Bio
          </label>
          <textarea
            rows={3}
            className={inputCls}
            value={form.bio}
            onChange={(e) => updateField("bio")(e.target.value)}
          />
        </div>
      </form>

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-[20px] text-xs">
          {savedAt && !isDirty && (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Changes saved
            </span>
          )}
          {isDirty && !saving && (
            <span className="text-slate-500">You have unsaved changes.</span>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || saving}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </SettingsSection>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        className={`${inputCls} ${
          error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""
        }`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}
