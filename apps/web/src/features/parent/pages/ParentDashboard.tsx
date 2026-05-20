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
  children: unknown[];
  progress: unknown;
  notifications: unknown[];
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
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
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
