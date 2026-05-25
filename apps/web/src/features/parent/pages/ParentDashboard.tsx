import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { ChildSummaryCard } from "../components/ChildSummaryCard";
import { CurrentSubjects } from "../components/CurrentSubjects";
import { RecentActivity } from "../components/RecentActivity";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { api } from "../../../services/api";
import type { RouteId } from "../routes";

type Props = {
  onNavigate: (id: RouteId) => void;
};

type DashboardData = {
  parentName?: string;
  child?: any;
  children?: unknown[];
  progress?: unknown;
  notifications?: unknown[];
  currentSubjects?: unknown[];
  recentActivity?: unknown[];
  summary?: any;
};

export function ParentDashboard({ onNavigate }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getParentDashboard()
      .then((res: DashboardData) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: { message: string }) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  const noLinkedChild =
    error?.toLowerCase().includes("no linked student") ||
    error?.toLowerCase().includes("not found") ||
    (!data?.child && !data?.children?.length);

  if (noLinkedChild) {
    const stored = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
    const name = stored.fullName || stored.full_name || stored.name || "";
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl bg-white p-10 text-center shadow-card ring-1 ring-slate-100 mt-12">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
          <UserPlus className="h-8 w-8 text-indigo-500" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {name ? `Welcome, ${name}!` : "Welcome to your Parent Portal"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your account is not yet linked to a student. Please contact your school administrator to link your account to your child's profile.
          </p>
        </div>
        <button
          onClick={() => onNavigate("settings")}
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50 p-8 text-center text-rose-600 ring-1 ring-rose-100">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left/main column */}
      <div className="space-y-6 lg:col-span-2">
        <WelcomeBanner onViewReport={() => onNavigate("progress")} />
        <CurrentSubjects />
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <ChildSummaryCard />
        <RecentActivity />
      </div>
    </div>
  );
}
