import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ClassPerformanceChart } from "../components/ClassPerformanceChart";
import { PendingFeedbackList } from "../components/PendingFeedbackList";
import { StatCards } from "../components/StatCards";
import { WelcomeBanner } from "../components/WelcomeBanner";
import type { TeacherRouteId } from "../routes";
import { getTeacherDashboard } from "../services/teacher.api";

import { RecentStudentsWidget } from "../components/RecentStudentsWidget";

type Props = {
  onNavigate: (id: TeacherRouteId, context?: string) => void;
};

export function TeacherDashboard({ onNavigate }: Props) {
  const [data, setData] = useState<{ classes: any[], stats: any, pendingFeedback?: any[], students?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getTeacherDashboard()
      .then(setData)
      .catch((e) => {
        console.error(e);
        const errMsg = e.response?.data?.error || e.message || "Failed to load dashboard data";
        setErrorMsg(errMsg);
        toast.error(errMsg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Failed to load dashboard data: {errorMsg}</div>;

  const pendingCount = data.stats?.pendingGrades || 0;
  
  const statsList = [
    { id: "students", value: data.stats?.totalStudents || 0, label: "Total Students" },
    { id: "subjects", value: data.stats?.activeClasses || 0, label: "Active Classes" },
    { id: "feedback", value: pendingCount, label: "Pending Grades", badge: pendingCount > 0 ? { label: "Needs review", tone: "neutral" as const } : undefined }
  ];

  // Derive class performance data from real calculated database progress
  const performanceData = data.classes?.map((c: any) => ({
    short: (c.name || "").substring(0, 4),
    name: c.name || "Unknown",
    value: Number(c.progress || 0)
  })) || [];

  // Map pending submissions dynamically to the list structure
  const pendingFeedbackList = data.pendingFeedback?.map((f: any) => {
    const names = (f.studentName || "Student").split(" ");
    const initials = names.map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
    
    // Generate stable, beautiful avatar colors
    const colors = [
      { bg: "bg-indigo-50", text: "text-indigo-600" },
      { bg: "bg-emerald-50", text: "text-emerald-600" },
      { bg: "bg-amber-50", text: "text-amber-600" },
      { bg: "bg-rose-50", text: "text-rose-600" },
    ];
    const colorIndex = (f.studentName || "").length % colors.length;
    const color = colors[colorIndex];

    return {
      id: String(f.id),
      initials,
      name: f.studentName || "Student",
      topic: f.assignmentTitle || "Assignment",
      time: new Date(f.submittedAt).toLocaleDateString() + " " + new Date(f.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarBg: color.bg,
      avatarColor: color.text
    };
  }) || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <WelcomeBanner
        pendingCount={pendingCount}
        onReview={() => onNavigate("grade-submissions")}
      />

      <StatCards stats={statsList} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClassPerformanceChart data={performanceData} />
        </div>
        <PendingFeedbackList items={pendingFeedbackList} />
      </div>

      <RecentStudentsWidget students={data.students || []} />
    </div>
  );
}
