import { useState } from "react";
import { useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Users,
  ChevronRight,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Building,
  BookMarked,
  Heart,
  Briefcase,
} from "lucide-react";

type Role = "student" | "teacher" | "parent";

/* ─── Step indicators ─── */
function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                  done
                    ? "border-brand bg-brand text-white"
                    : active
                    ? "border-brand bg-white text-brand"
                    : "border-ink-200 bg-white text-ink-400"
                }`}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  active ? "text-brand" : done ? "text-ink-600" : "text-ink-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-4 h-0.5 w-10 flex-1 transition ${
                  i < current ? "bg-brand" : "bg-ink-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Generic field ─── */
function Field({
  label, id, icon: Icon, error, children,
}: {
  label: string; id?: string; icon?: React.ElementType; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-ink-700">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        )}
        {children}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

const inputCls = (hasIcon: boolean) =>
  `h-12 w-full rounded-xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${hasIcon ? "pl-10 pr-4" : "px-4"}`;

const selectCls = (hasIcon: boolean) =>
  `h-12 w-full appearance-none rounded-xl border border-ink-200 bg-white text-sm text-ink-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${hasIcon ? "pl-10 pr-4" : "px-4"}`;

/* ══════════════ STUDENT STEPS ══════════════ */
type StudentData = {
  phone: string; dob: string; gender: string; address: string;
  grade: string; section: string; studentId: string; emergencyName: string; emergencyPhone: string;
};

function StudentStep1({ data, onChange, onNext }: { data: StudentData; onChange: (k: keyof StudentData, v: string) => void; onNext: () => void }) {
  const [errors, setErrors] = useState<Partial<StudentData>>({});
  function validate() {
    const e: Partial<StudentData> = {};
    if (!data.phone) e.phone = "Phone is required";
    if (!data.dob) e.dob = "Date of birth is required";
    if (!data.gender) e.gender = "Gender is required";
    return e;
  }
  function next() { const e = validate(); setErrors(e); if (!Object.keys(e).length) onNext(); }
  return (
    <div className="flex flex-col gap-4">
      <Field label="Phone Number" id="phone" icon={Phone} error={errors.phone}>
        <input id="phone" type="tel" placeholder="+251 91 234 5678" value={data.phone} onChange={e => onChange("phone", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Date of Birth" id="dob" icon={Calendar} error={errors.dob}>
        <input id="dob" type="date" value={data.dob} onChange={e => onChange("dob", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Gender" id="gender" error={errors.gender}>
        <select id="gender" value={data.gender} onChange={e => onChange("gender", e.target.value)} className={selectCls(false)}>
          <option value="">Select gender</option>
          <option>Male</option><option>Female</option><option>Prefer not to say</option>
        </select>
      </Field>
      <Field label="Home Address" id="address" icon={MapPin}>
        <input id="address" type="text" placeholder="e.g. Bole, Addis Ababa" value={data.address} onChange={e => onChange("address", e.target.value)} className={inputCls(true)} />
      </Field>
      <button type="button" onClick={next} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90">
        Next <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function StudentStep2({ data, onChange, onNext, onBack }: { data: StudentData; onChange: (k: keyof StudentData, v: string) => void; onNext: () => void; onBack: () => void }) {
  const [errors, setErrors] = useState<Partial<StudentData>>({});
  function validate() {
    const e: Partial<StudentData> = {};
    if (!data.grade) e.grade = "Grade is required";
    if (!data.section) e.section = "Section is required";
    return e;
  }
  function next() { const e = validate(); setErrors(e); if (!Object.keys(e).length) onNext(); }
  return (
    <div className="flex flex-col gap-4">
      <Field label="Grade Level" id="grade" icon={BookMarked} error={errors.grade}>
        <select id="grade" value={data.grade} onChange={e => onChange("grade", e.target.value)} className={selectCls(true)}>
          <option value="">Select grade</option>
          {[...Array(12)].map((_, i) => <option key={i + 1}>Grade {i + 1}</option>)}
        </select>
      </Field>
      <Field label="Section" id="section" error={errors.section}>
        <select id="section" value={data.section} onChange={e => onChange("section", e.target.value)} className={selectCls(false)}>
          <option value="">Select section</option>
          {["A","B","C","D","E"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Student ID (optional)" id="studentId" icon={Hash}>
        <input id="studentId" type="text" placeholder="e.g. STU-2024-0042" value={data.studentId} onChange={e => onChange("studentId", e.target.value)} className={inputCls(true)} />
      </Field>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
          <ArrowLeft className="size-4" /> Back
        </button>
        <button type="button" onClick={next} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90">
          Next <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function StudentStep3({ data, onChange, onSubmit, onBack, submitting }: { data: StudentData; onChange: (k: keyof StudentData, v: string) => void; onSubmit: () => void; onBack: () => void; submitting: boolean }) {
  const [errors, setErrors] = useState<Partial<StudentData>>({});
  function validate() {
    const e: Partial<StudentData> = {};
    if (!data.emergencyName) e.emergencyName = "Emergency contact name is required";
    if (!data.emergencyPhone) e.emergencyPhone = "Emergency contact phone is required";
    return e;
  }
  function submit() { const e = validate(); setErrors(e); if (!Object.keys(e).length) onSubmit(); }
  return (
    <div className="flex flex-col gap-4">
      <Field label="Emergency Contact Name" id="emergencyName" icon={User} error={errors.emergencyName}>
        <input id="emergencyName" type="text" placeholder="e.g. Tigist Bekele" value={data.emergencyName} onChange={e => onChange("emergencyName", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Emergency Contact Phone" id="emergencyPhone" icon={Phone} error={errors.emergencyPhone}>
        <input id="emergencyPhone" type="tel" placeholder="+251 91 000 0000" value={data.emergencyPhone} onChange={e => onChange("emergencyPhone", e.target.value)} className={inputCls(true)} />
      </Field>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
          <ArrowLeft className="size-4" /> Back
        </button>
        <button type="button" onClick={submit} disabled={submitting} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90 disabled:opacity-60">
          {submitting ? <><Loader2 className="size-4 animate-spin" />Saving…</> : <>Complete Registration <ArrowRight className="size-4" /></>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════ TEACHER STEPS ══════════════ */
type TeacherData = {
  phone: string; dob: string; gender: string;
  subject: string; qualification: string; experience: string;
  employeeId: string; department: string;
};

function TeacherStep1({ data, onChange, onNext }: { data: TeacherData; onChange: (k: keyof TeacherData, v: string) => void; onNext: () => void }) {
  const [errors, setErrors] = useState<Partial<TeacherData>>({});
  function validate() {
    const e: Partial<TeacherData> = {};
    if (!data.phone) e.phone = "Phone is required";
    if (!data.gender) e.gender = "Gender is required";
    return e;
  }
  function next() { const e = validate(); setErrors(e); if (!Object.keys(e).length) onNext(); }
  return (
    <div className="flex flex-col gap-4">
      <Field label="Phone Number" id="t-phone" icon={Phone} error={errors.phone}>
        <input id="t-phone" type="tel" placeholder="+251 91 234 5678" value={data.phone} onChange={e => onChange("phone", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Date of Birth" id="t-dob" icon={Calendar}>
        <input id="t-dob" type="date" value={data.dob} onChange={e => onChange("dob", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Gender" id="t-gender" error={errors.gender}>
        <select id="t-gender" value={data.gender} onChange={e => onChange("gender", e.target.value)} className={selectCls(false)}>
          <option value="">Select gender</option>
          <option>Male</option><option>Female</option><option>Prefer not to say</option>
        </select>
      </Field>
      <button type="button" onClick={next} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90">
        Next <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function TeacherStep2({ data, onChange, onNext, onBack }: { data: TeacherData; onChange: (k: keyof TeacherData, v: string) => void; onNext: () => void; onBack: () => void }) {
  const [errors, setErrors] = useState<Partial<TeacherData>>({});
  function validate() {
    const e: Partial<TeacherData> = {};
    if (!data.subject) e.subject = "Subject is required";
    if (!data.qualification) e.qualification = "Qualification is required";
    return e;
  }
  function next() { const e = validate(); setErrors(e); if (!Object.keys(e).length) onNext(); }
  return (
    <div className="flex flex-col gap-4">
      <Field label="Primary Subject" id="t-subject" icon={BookOpen} error={errors.subject}>
        <select id="t-subject" value={data.subject} onChange={e => onChange("subject", e.target.value)} className={selectCls(true)}>
          <option value="">Select subject</option>
          {["Mathematics","Science","English","Amharic","History","Geography","Physics","Chemistry","Biology","ICT","Art","Physical Education"].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Highest Qualification" id="t-qual" icon={BookMarked} error={errors.qualification}>
        <select id="t-qual" value={data.qualification} onChange={e => onChange("qualification", e.target.value)} className={selectCls(true)}>
          <option value="">Select qualification</option>
          {["Bachelor's Degree","Master's Degree","PhD","Diploma","Certificate"].map(q => <option key={q}>{q}</option>)}
        </select>
      </Field>
      <Field label="Years of Experience" id="t-exp" icon={Briefcase}>
        <select id="t-exp" value={data.experience} onChange={e => onChange("experience", e.target.value)} className={selectCls(true)}>
          <option value="">Select experience</option>
          {["Less than 1 year","1–3 years","3–5 years","5–10 years","10+ years"].map(x => <option key={x}>{x}</option>)}
        </select>
      </Field>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
          <ArrowLeft className="size-4" /> Back
        </button>
        <button type="button" onClick={next} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90">
          Next <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function TeacherStep3({ data, onChange, onSubmit, onBack, submitting }: { data: TeacherData; onChange: (k: keyof TeacherData, v: string) => void; onSubmit: () => void; onBack: () => void; submitting: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Employee ID (optional)" id="t-empId" icon={Hash}>
        <input id="t-empId" type="text" placeholder="e.g. TCH-2024-007" value={data.employeeId} onChange={e => onChange("employeeId", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Department / School" id="t-dept" icon={Building}>
        <input id="t-dept" type="text" placeholder="e.g. Science Department" value={data.department} onChange={e => onChange("department", e.target.value)} className={inputCls(true)} />
      </Field>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
          <ArrowLeft className="size-4" /> Back
        </button>
        <button type="button" onClick={onSubmit} disabled={submitting} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(5,150,105,0.25)] transition hover:bg-emerald-700 disabled:opacity-60">
          {submitting ? <><Loader2 className="size-4 animate-spin" />Saving…</> : <>Complete Registration <ArrowRight className="size-4" /></>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════ PARENT STEPS ══════════════ */
type ParentData = {
  phone: string; occupation: string; address: string;
  childName: string; childGrade: string; childId: string;
  relationship: string;
};

function ParentStep1({ data, onChange, onNext }: { data: ParentData; onChange: (k: keyof ParentData, v: string) => void; onNext: () => void }) {
  const [errors, setErrors] = useState<Partial<ParentData>>({});
  function validate() {
    const e: Partial<ParentData> = {};
    if (!data.phone) e.phone = "Phone is required";
    if (!data.relationship) e.relationship = "Relationship is required";
    return e;
  }
  function next() { const e = validate(); setErrors(e); if (!Object.keys(e).length) onNext(); }
  return (
    <div className="flex flex-col gap-4">
      <Field label="Phone Number" id="p-phone" icon={Phone} error={errors.phone}>
        <input id="p-phone" type="tel" placeholder="+251 91 234 5678" value={data.phone} onChange={e => onChange("phone", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Relationship to Student" id="p-rel" icon={Heart} error={errors.relationship}>
        <select id="p-rel" value={data.relationship} onChange={e => onChange("relationship", e.target.value)} className={selectCls(true)}>
          <option value="">Select relationship</option>
          {["Father","Mother","Guardian","Grandparent","Sibling","Other"].map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Occupation (optional)" id="p-occ" icon={Briefcase}>
        <input id="p-occ" type="text" placeholder="e.g. Engineer" value={data.occupation} onChange={e => onChange("occupation", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Home Address" id="p-addr" icon={MapPin}>
        <input id="p-addr" type="text" placeholder="e.g. Bole, Addis Ababa" value={data.address} onChange={e => onChange("address", e.target.value)} className={inputCls(true)} />
      </Field>
      <button type="button" onClick={next} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90">
        Next <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function ParentStep2({ data, onChange, onSubmit, onBack, submitting }: { data: ParentData; onChange: (k: keyof ParentData, v: string) => void; onSubmit: () => void; onBack: () => void; submitting: boolean }) {
  const [errors, setErrors] = useState<Partial<ParentData>>({});
  function validate() {
    const e: Partial<ParentData> = {};
    if (!data.childName) e.childName = "Child's name is required";
    if (!data.childGrade) e.childGrade = "Child's grade is required";
    return e;
  }
  function submit() { const e = validate(); setErrors(e); if (!Object.keys(e).length) onSubmit(); }
  return (
    <div className="flex flex-col gap-4">
      <Field label="Child's Full Name" id="p-childName" icon={User} error={errors.childName}>
        <input id="p-childName" type="text" placeholder="e.g. Elias Bekele" value={data.childName} onChange={e => onChange("childName", e.target.value)} className={inputCls(true)} />
      </Field>
      <Field label="Child's Grade" id="p-childGrade" icon={BookMarked} error={errors.childGrade}>
        <select id="p-childGrade" value={data.childGrade} onChange={e => onChange("childGrade", e.target.value)} className={selectCls(true)}>
          <option value="">Select grade</option>
          {[...Array(12)].map((_, i) => <option key={i + 1}>Grade {i + 1}</option>)}
        </select>
      </Field>
      <Field label="Child's Student ID (optional)" id="p-childId" icon={Hash}>
        <input id="p-childId" type="text" placeholder="e.g. STU-2024-0042" value={data.childId} onChange={e => onChange("childId", e.target.value)} className={inputCls(true)} />
      </Field>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
          <ArrowLeft className="size-4" /> Back
        </button>
        <button type="button" onClick={submit} disabled={submitting} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(124,58,237,0.25)] transition hover:bg-violet-700 disabled:opacity-60">
          {submitting ? <><Loader2 className="size-4 animate-spin" />Saving…</> : <>Complete Registration <ArrowRight className="size-4" /></>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════ SUCCESS SCREEN ══════════════ */
function SuccessScreen({ role, name }: { role: Role; name: string }) {
  const navigate = useNavigate();
  const ROLE_META = {
    student: { icon: GraduationCap, color: "text-brand", bg: "bg-brand/10", label: "Student Portal", to: "/student/dashboard" },
    teacher: { icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", label: "Teacher Dashboard", to: "/teacher" },
    parent: { icon: Users, color: "text-violet-600", bg: "bg-violet-50", label: "Parent Portal", to: "/parent" },
  };
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className={`flex size-20 items-center justify-center rounded-full ${meta.bg}`}>
        <Icon className={`size-10 ${meta.color}`} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-ink-900">You're all set, {name}!</h2>
        <p className="mt-2 text-sm text-ink-500">Your profile has been created. Welcome to EduSmart K-12.</p>
      </div>
      <div className="w-full rounded-2xl border border-ink-100 bg-ink-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Registration complete</p>
        <div className="mt-2 flex items-center gap-2">
          <Check className="size-4 text-green-500" />
          <span className="text-sm text-ink-700">Account created</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <Check className="size-4 text-green-500" />
          <span className="text-sm text-ink-700">Profile information saved</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <Check className="size-4 text-green-500" />
          <span className="text-sm text-ink-700">Role assigned: <span className={`font-semibold capitalize ${meta.color}`}>{role}</span></span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(meta.to, { replace: true })}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90"
      >
        Go to {meta.label} <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

/* ══════════════ MAIN PAGE ══════════════ */
const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; color: string; accent: string; steps: string[] }> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "text-brand",
    accent: "bg-brand/10",
    steps: ["Personal Info", "Academic Info", "Emergency Contact"],
  },
  teacher: {
    label: "Teacher",
    icon: BookOpen,
    color: "text-emerald-600",
    accent: "bg-emerald-50",
    steps: ["Personal Info", "Professional Info", "School Details"],
  },
  parent: {
    label: "Parent",
    icon: Users,
    color: "text-violet-600",
    accent: "bg-violet-50",
    steps: ["Your Info", "Child's Info"],
  },
};

export default function CompleteProfilePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const role = (searchParams.get("role") ?? "student") as Role;
  const state = (location.state ?? {}) as { fullName?: string; email?: string };
  const fullName = state.fullName ?? "";

  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
  const RoleIcon = config.icon;

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [studentData, setStudentData] = useState<StudentData>({
    phone: "", dob: "", gender: "", address: "",
    grade: "", section: "", studentId: "",
    emergencyName: "", emergencyPhone: "",
  });
  const [teacherData, setTeacherData] = useState<TeacherData>({
    phone: "", dob: "", gender: "",
    subject: "", qualification: "", experience: "",
    employeeId: "", department: "",
  });
  const [parentData, setParentData] = useState<ParentData>({
    phone: "", occupation: "", address: "",
    childName: "", childGrade: "", childId: "",
    relationship: "",
  });

  function patchStudent(k: keyof StudentData, v: string) { setStudentData(d => ({ ...d, [k]: v })); }
  function patchTeacher(k: keyof TeacherData, v: string) { setTeacherData(d => ({ ...d, [k]: v })); }
  function patchParent(k: keyof ParentData, v: string) { setParentData(d => ({ ...d, [k]: v })); }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setDone(true);
  }

  const firstName = fullName.split(" ")[0] || "there";

  return (
    <main className="flex min-h-screen w-full bg-white font-sans">
      {/* Left panel */}
      <aside
        aria-hidden
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-8 lg:flex"
        style={{
          backgroundImage:
            "linear-gradient(141deg, rgba(0,26,66,0.63) 0%, rgba(0,88,190,0.53) 40%, rgba(33,112,228,0.59) 100%), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative flex items-center gap-2 text-white">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-[32px] font-bold leading-10 tracking-tight">EduSmart K-12</span>
        </div>
        <div className="relative max-w-[448px] pb-12">
          <h1 className="text-[40px] font-bold leading-[48px] tracking-tight text-white">
            Almost there,<br />{firstName}!
          </h1>
          <p className="mt-4 text-base leading-7 text-blue-100">
            Complete your {config.label.toLowerCase()} profile so we can personalise your experience on the platform.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {config.steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl p-3 transition ${i === step && !done ? "bg-white/20" : "opacity-60"}`}>
                <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${i < step || done ? "bg-white text-brand" : "bg-white/20 text-white"}`}>
                  {i < step || done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className="text-sm font-semibold text-white">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <span className="h-2 w-12 rounded-full bg-blue-100" />
          <span className="size-2 rounded-full bg-blue-100/50" />
          <span className="size-2 rounded-full bg-blue-100/50" />
        </div>
      </aside>

      {/* Right: form panel */}
      <section className="relative flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="flex w-full max-w-[448px] flex-col gap-6">
          {done ? (
            <SuccessScreen role={role} name={firstName} />
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <span className={`flex size-12 items-center justify-center rounded-2xl ${config.accent}`}>
                  <RoleIcon className={`size-6 ${config.color}`} />
                </span>
                <h2 className="text-2xl font-bold text-ink-900">Complete your profile</h2>
                <p className="text-sm text-ink-500">
                  Step {step + 1} of {config.steps.length} — {config.steps[step]}
                </p>
              </div>

              {/* Step bar */}
              <div className="flex justify-center">
                <StepBar steps={config.steps} current={step} />
              </div>

              {/* Role-specific step content */}
              {role === "student" && step === 0 && (
                <StudentStep1 data={studentData} onChange={patchStudent} onNext={() => setStep(1)} />
              )}
              {role === "student" && step === 1 && (
                <StudentStep2 data={studentData} onChange={patchStudent} onNext={() => setStep(2)} onBack={() => setStep(0)} />
              )}
              {role === "student" && step === 2 && (
                <StudentStep3 data={studentData} onChange={patchStudent} onSubmit={handleSubmit} onBack={() => setStep(1)} submitting={submitting} />
              )}
              {role === "teacher" && step === 0 && (
                <TeacherStep1 data={teacherData} onChange={patchTeacher} onNext={() => setStep(1)} />
              )}
              {role === "teacher" && step === 1 && (
                <TeacherStep2 data={teacherData} onChange={patchTeacher} onNext={() => setStep(2)} onBack={() => setStep(0)} />
              )}
              {role === "teacher" && step === 2 && (
                <TeacherStep3 data={teacherData} onChange={patchTeacher} onSubmit={handleSubmit} onBack={() => setStep(1)} submitting={submitting} />
              )}
              {role === "parent" && step === 0 && (
                <ParentStep1 data={parentData} onChange={patchParent} onNext={() => setStep(1)} />
              )}
              {role === "parent" && step === 1 && (
                <ParentStep2 data={parentData} onChange={patchParent} onSubmit={handleSubmit} onBack={() => setStep(0)} submitting={submitting} />
              )}

              <p className="text-center text-xs text-ink-400">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>

        <p className="absolute bottom-6 text-sm text-ink-500">
          Need help?{" "}
          <a href="#" className="text-brand hover:underline">Contact Support</a>
        </p>
      </section>
    </main>
  );
}
