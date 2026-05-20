import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Shield,
  Users,
} from "lucide-react";
import {
  loginSchema,
  loginDefaultValues,
  type LoginFormValues,
} from "../validation/login.schema";
import { api } from "../../../services/api";

const ROLE_REDIRECTS: Record<string, string> = {
  student: "/student/dashboard",
  teacher: "/teacher",
  parent: "/parent",
  admin: "/admin/dashboard",
};

const ROLE_OPTIONS = [
  { value: "student", label: "Student", icon: GraduationCap, color: "text-brand" },
  { value: "teacher", label: "Teacher", icon: BookOpen, color: "text-emerald-600" },
  { value: "parent", label: "Parent", icon: Users, color: "text-violet-600" },
  { value: "admin", label: "Admin", icon: Shield, color: "text-amber-600" },
];

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
    mode: "onBlur",
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      // Call backend login API
      const response = await api.login({
        email: values.email,
        password: values.password,
      });

      // Store token and user info
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Redirect based on role
      navigate(ROLE_REDIRECTS[response.user.role] ?? "/student/dashboard", { replace: true });
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        setServerError("Invalid email or password");
      } else {
        setServerError(error.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full max-w-[448px] flex-col gap-6"
      aria-label="Login form"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-[32px] font-bold leading-10 tracking-tight text-ink-900">
          Welcome back
        </h2>
        <p className="text-sm text-ink-500">
          Sign in to continue to your portal.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex w-full items-center rounded-xl border border-ink-200 bg-ink-50 p-1">
        <span className="flex-1 rounded-lg bg-white py-2 text-center text-sm font-semibold text-brand shadow-sm">
          Sign In
        </span>
        <Link
          to="/register"
          className="flex-1 py-2 text-center text-sm font-semibold text-ink-500 transition hover:text-ink-900"
        >
          Create Account
        </Link>
      </div>

      {/* Role selector pills */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
          Sign in as
        </span>
        <div className="grid grid-cols-4 gap-2">
          {ROLE_OPTIONS.map(({ value, label, icon: Icon, color }) => {
            const active = selectedRole === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setValue("role", value as LoginFormValues["role"], { shouldValidate: true })}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-xs font-semibold transition ${
                  active
                    ? "border-brand bg-brand/5 text-brand shadow-sm"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                <Icon className={`size-5 ${active ? "text-brand" : color}`} />
                {label}
              </button>
            );
          })}
        </div>
        {errors.role && (
          <span className="text-xs text-red-600">{errors.role.message}</span>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{serverError}</span>
        </div>
      )}

      {/* Fields */}
      <div className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-ink-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@school.edu"
              {...register("email")}
              className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold text-ink-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand transition hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-12 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 transition hover:text-ink-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
        </div>

        {/* Remember me */}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" {...register("rememberMe")} className="size-4 rounded border-ink-300 accent-brand" />
          Remember me for 30 days
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-[0_2px_8px_0_rgba(0,88,190,0.25)] transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <><Loader2 className="size-4 animate-spin" aria-hidden />Signing in…</>
          ) : (
            <>Sign In<ArrowRight className="size-4" aria-hidden /></>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200" />
        <span className="text-xs text-ink-400">or continue with</span>
        <div className="h-px flex-1 bg-ink-200" />
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => window.open("https://accounts.google.com/signin", "_blank", "noopener,noreferrer")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          <GoogleIcon className="size-4" /> Google
        </button>
        <button
          type="button"
          onClick={() => window.open("https://login.microsoftonline.com", "_blank", "noopener,noreferrer")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          <MicrosoftIcon className="size-4" /> Microsoft
        </button>
      </div>

      <p className="text-center text-sm text-ink-500">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-brand hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.12A6.98 6.98 0 015.48 12c0-.74.13-1.45.36-2.12V7.04H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}
