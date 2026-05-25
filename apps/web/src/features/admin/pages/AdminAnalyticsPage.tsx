import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, Users, Clock, MousePointerClick, Activity } from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";


export default function AdminAnalyticsPage() {
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);
  const [subjectEnrollment, setSubjectEnrollment] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any>(null);

  useEffect(() => {
    api.getAdminEnrollmentTrends(6).then(r => {
      if (r.success && r.data?.length) setEnrollmentTrends(r.data.map((d: any) => ({ month: d.month, enrollments: Number(d.count || d.enrollments || 0) })));
    }).catch(() => {});
    api.getAdminSubjectEnrollment().then(r => {
      if (r.success && r.data?.length) setSubjectEnrollment(r.data.map((d: any) => ({ page: d.name || d.subject, views: Number(d.count || d.enrolled || 0) })));
    }).catch(() => {});
    api.getAdminPlatformStats().then(r => {
      if (r.success && r.data) setPlatformStats(r.data);
    }).catch(() => {});
  }, []);

  const kpiCards = [
    { label: "Total Students",  value: platformStats ? Number(platformStats.users?.students ?? platformStats.totalStudents ?? 0) : "—", change: "+8.4%",  up: true,  icon: Users,             bg: "bg-violet-50",  color: "text-violet-600" },
    { label: "Total Teachers",  value: platformStats ? Number(platformStats.users?.teachers ?? platformStats.totalTeachers ?? 0) : "—", change: "+5%",    up: true,  icon: Clock,             bg: "bg-cyan-50",    color: "text-cyan-600" },
    { label: "Active Subjects", value: platformStats ? Number(platformStats.subjects ?? platformStats.totalCourses ?? 0) : "—",           change: "+5.1%",  up: true,  icon: MousePointerClick, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Total Users",     value: platformStats ? Number(platformStats.users?.total  ?? platformStats.totalEnrollments ?? 0) : "—",  change: "+12%",   up: true,  icon: Activity,          bg: "bg-orange-50",  color: "text-orange-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-ink-900">Analytics & Usage</h1>
            <p className="text-sm text-ink-500">Platform engagement and usage metrics</p>
          </div>

          {/* KPI row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            {kpiCards.map((k, i) => (
              <div key={k.label} className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-card animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}>
                <span className={`flex size-11 items-center justify-center rounded-xl ${k.bg}`}>
                  <k.icon className={`size-5 ${k.color}`} />
                </span>
                <div>
                  <p className="text-xs text-ink-500">{k.label}</p>
                  <p className="text-xl font-bold text-ink-900">{k.value}</p>
                  <p className={`text-xs font-semibold flex items-center gap-0.5 ${k.up ? "text-emerald-600" : "text-red-500"}`}>
                    <TrendingUp className={`size-3 ${k.up ? "" : "rotate-180"}`} />{k.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 text-base font-bold text-ink-900">Monthly Enrollments</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={enrollmentTrends} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="enrollments" stroke="#7c3aed" strokeWidth={2.5} fill="url(#areaGrad)" name="Enrollments" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 text-base font-bold text-ink-900">Top Subjects by Enrollment</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectEnrollment.length ? subjectEnrollment : [{ page: "No data", views: 0 }]} layout="vertical" margin={{ top: 4, right: 16, left: 20, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="page" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="views" fill="#7c3aed" radius={[0, 6, 6, 0]} name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 text-base font-bold text-ink-900">Monthly Enrollment Trend</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={enrollmentTrends} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Line type="monotone" dataKey="enrollments" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4, fill: "#06b6d4" }} name="Enrollments" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 text-base font-bold text-ink-900">Device Usage Breakdown (%)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectEnrollment} barCategoryGap="35%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="desktop" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Desktop" stackId="a" />
                  <Bar dataKey="mobile"  fill="#06b6d4" radius={[4, 4, 0, 0]} name="Mobile"  stackId="a" />
                  <Bar dataKey="tablet"  fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tablet"  stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
