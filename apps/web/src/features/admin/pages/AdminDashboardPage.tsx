import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  GraduationCap,
  Users,
  UsersRound,
  DollarSign,
  MoreHorizontal,
  UserPlus,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Eye,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { useT } from "../../../i18n/I18nProvider";
import { api } from "../../../services/api";
import {
  fetchStatCards,
  fetchExamResults,
  fetchGenderSplit,
  fetchStarStudents,
  fetchExamResultFeed,
  type StatCard,
  type ExamResultPoint,
  type StudentGenderSplit,
  type StarStudent,
  type ExamResultFeed,
} from "../data/adminDashboardData";

const CHART_PERIODS = ["This Week", "This Month", "This Year"] as const;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { t } = useT();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [examData, setExamData] = useState<ExamResultPoint[]>([]);
  const [gender, setGender] = useState<StudentGenderSplit | null>(null);
  const [students, setStudents] = useState<StarStudent[]>([]);
  const [feed, setFeed] = useState<ExamResultFeed[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [chartPeriod, setChartPeriod] = useState<typeof CHART_PERIODS[number]>("This Year");
  const [sortBy, setSortBy] = useState<"marks" | "percent">("marks");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [feedMenu, setFeedMenu] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch real data from API
        const dashboardData = await api.getAdminDashboard();
        if (dashboardData?.success) {
          setApiStats(dashboardData.data);
          // Transform API stats to StatCard format
          const apiStatCards: StatCard[] = [
            {
              id: "students",
              label: "Total Students",
              value: dashboardData.data.users?.students || 0,
              change: "+12%",
              changeType: "up",
              icon: "students",
            },
            {
              id: "teachers",
              label: "Teachers",
              value: dashboardData.data.users?.teachers || 0,
              change: "+5%",
              changeType: "up",
              icon: "teachers",
            },
            {
              id: "parents",
              label: "Parents",
              value: dashboardData.data.users?.parents || 0,
              change: "+8%",
              changeType: "up",
              icon: "parents",
            },
            {
              id: "subjects",
              label: "Subjects",
              value: dashboardData.data.subjects || 0,
              change: "+3",
              changeType: "up",
              icon: "earnings",
            },
          ];
          setStats(apiStatCards);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
        // Fallback to mock data
        const mockStats = await fetchStatCards();
        setStats(mockStats);
      } finally {
        setLoading(false);
      }

      // Load other mock data (to be replaced in later phases)
      fetchExamResults().then(setExamData);
      fetchGenderSplit().then(setGender);
      fetchStarStudents().then(setStudents);
      fetchExamResultFeed().then(setFeed);
    };

    loadData();
  }, []);

  function toggleRow(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function handleSort(col: "marks" | "percent") {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  }

  const sortedStudents = [...students].sort((a, b) =>
    sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
  );

  const STAT_LINKS: Record<string, string> = {
    students: "/admin/students",
    teachers: "/admin/teachers",
    parents: "/admin/parents",
    earnings: "/admin/reports",
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">
          {/* Hero header */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 p-6 shadow-lg animate-fade-in-up">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{t("admin.pages.welcome")}</h1>
                <p className="mt-1 text-sm text-white/85">{t("admin.pages.welcomeSub")}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur ring-1 ring-white/30">
                <Calendar className="size-3.5" aria-hidden />
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Stat cards — gradient, clickable with trends */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <StatCardTile key={s.id} card={s} delay={i * 60} onClick={() => navigate(STAT_LINKS[s.iconKey] || "/admin/dashboard")} />
            ))}
          </div>

          {/* Charts row */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
            {/* Bar chart with period selector */}
            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink-900">All Exam Results</h2>
                  <p className="text-xs text-ink-500">Students &amp; Teachers performance</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-4 text-xs font-medium text-ink-500 mr-3">
                    <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-violet-600" />Teacher</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-orange-400" />Student</span>
                  </div>
                  <select value={chartPeriod} onChange={e => setChartPeriod(e.target.value as typeof chartPeriod)}
                    className="h-8 rounded-lg border border-ink-200 bg-ink-50 px-2.5 text-xs font-medium text-ink-700 outline-none">
                    {CHART_PERIODS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={examData} barCategoryGap="30%" barGap={4} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : String(v)} />
                  <Tooltip cursor={{ fill: "rgba(124,58,237,0.05)" }} contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(val) => [Number(val ?? 0).toLocaleString(), ""]} />
                  <Bar dataKey="teacher" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Teacher" animationDuration={800} />
                  <Bar dataKey="student" fill="#fb923c" radius={[4, 4, 0, 0]} name="Student" animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart with percentages */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-200 bg-white p-5 shadow-card animate-fade-in-up" style={{ animationDelay: "160ms" }}>
              <div className="mb-4 flex w-full items-center justify-between">
                <h2 className="text-base font-bold text-ink-900">Students</h2>
                <button type="button" onClick={() => navigate("/admin/students")} className="rounded-md p-1 text-ink-400 hover:bg-ink-100" title="View all students">
                  <ExternalLink className="size-4" />
                </button>
              </div>
              {gender && (
                <>
                  <div className="relative">
                    <PieChart width={180} height={180}>
                      <Pie data={[{ name: "Male", value: gender.male }, { name: "Female", value: gender.female }]}
                        cx={85} cy={85} innerRadius={58} outerRadius={82} startAngle={90} endAngle={-270} strokeWidth={0} dataKey="value" animationDuration={800}>
                        <Cell fill="#7c3aed" />
                        <Cell fill="#fb923c" />
                      </Pie>
                    </PieChart>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-ink-500">Total</span>
                      <span className="text-2xl font-bold text-ink-900">{gender.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-6 text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <span className="inline-block size-3 rounded-full bg-violet-600" />
                      Male — {Math.round((gender.male / gender.total) * 100)}%
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block size-3 rounded-full bg-orange-400" />
                      Female — {Math.round((gender.female / gender.total) * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            {/* Star Students — sortable table */}
            <div className="rounded-2xl border border-ink-200 bg-white shadow-card animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <h2 className="text-base font-bold text-ink-900">Star Students</h2>
                <button type="button" onClick={() => navigate("/admin/students")} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-50">
                  View All <ArrowUpRight className="size-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-xs font-semibold text-ink-500">
                      <th className="w-10 px-5 py-3 text-left"><span className="sr-only">Select</span></th>
                      <th className="px-2 py-3 text-left">Name</th>
                      <th className="px-2 py-3 text-left">ID</th>
                      <th className="px-2 py-3 text-left cursor-pointer select-none" onClick={() => handleSort("marks")}>
                        <span className="inline-flex items-center gap-1">Marks {sortBy === "marks" && (sortDir === "desc" ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />)}</span>
                      </th>
                      <th className="px-2 py-3 text-left cursor-pointer select-none" onClick={() => handleSort("percent")}>
                        <span className="inline-flex items-center gap-1">Percent {sortBy === "percent" && (sortDir === "desc" ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />)}</span>
                      </th>
                      <th className="px-2 py-3 text-left">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((s) => (
                      <tr key={s.id} onClick={() => toggleRow(s.id)}
                        className={`cursor-pointer border-b border-ink-50 transition last:border-0 hover:bg-violet-50/40 ${selected[s.id] ? "bg-violet-50" : ""}`}>
                        <td className="px-5 py-3">
                          <span className={`flex size-5 items-center justify-center rounded border-2 transition ${selected[s.id] ? "border-violet-600 bg-violet-600" : "border-ink-300 bg-white"}`}>
                            {selected[s.id] && <svg viewBox="0 0 10 8" className="size-3 text-white" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={s.avatar} alt={s.name} className="size-8 rounded-full object-cover ring-2 ring-violet-100" />
                            <span className="font-medium text-ink-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3 font-mono text-xs text-ink-500">{s.studentId}</td>
                        <td className="px-2 py-3 font-semibold text-ink-900">{s.marks}</td>
                        <td className="px-2 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.percent >= 95 ? "bg-emerald-50 text-emerald-700" : s.percent >= 90 ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                            {s.percent}%
                          </span>
                        </td>
                        <td className="px-2 py-3 text-ink-500">{s.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exam Result feed — with action menu */}
            <div className="rounded-2xl border border-ink-200 bg-white shadow-card animate-fade-in-up" style={{ animationDelay: "240ms" }}>
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <h2 className="text-base font-bold text-ink-900">Recent Activity</h2>
                <button type="button" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-50">
                  View All <ArrowUpRight className="size-3" />
                </button>
              </div>
              <ul className="flex flex-col divide-y divide-ink-50">
                {feed.map((f) => (
                  <li key={f.id} className="group relative flex items-center gap-3 px-5 py-3.5 transition hover:bg-ink-50">
                    <FeedIcon iconKey={f.iconKey} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{f.title}</p>
                      <p className="truncate text-xs text-ink-500">{f.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-400 mr-1">{f.timeLabel}</span>
                    <div className="relative">
                      <button onClick={() => setFeedMenu(feedMenu === f.id ? null : f.id)}
                        className="rounded-md p-1 text-ink-400 opacity-0 transition group-hover:opacity-100 hover:bg-ink-200">
                        <MoreHorizontal className="size-3.5" />
                      </button>
                      {feedMenu === f.id && (
                        <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-ink-200 bg-white py-1 shadow-lg animate-scale-in">
                          <button onClick={() => setFeedMenu(null)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50">
                            <Eye className="size-3.5" /> View Details
                          </button>
                          <button onClick={() => setFeedMenu(null)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50">
                            <ExternalLink className="size-3.5" /> Go to Section
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ----------------------------- Stat card tile ----------------------------- */

const TRENDS: Record<string, { value: string; up: boolean }> = {
  students: { value: "+12%", up: true },
  teachers: { value: "+3%", up: true },
  parents: { value: "+8%", up: true },
  earnings: { value: "-2%", up: false },
};

const GRADIENTS: Record<string, string> = {
  students: "from-violet-500 via-purple-500 to-fuchsia-500",
  teachers: "from-cyan-500 via-sky-500 to-blue-500",
  parents:  "from-orange-500 via-amber-500 to-rose-500",
  earnings: "from-emerald-500 via-teal-500 to-cyan-500",
};

function StatCardTile({ card, delay, onClick }: { card: StatCard; delay: number; onClick: () => void }) {
  const trend = TRENDS[card.iconKey];
  const gradient = GRADIENTS[card.iconKey] || "from-violet-500 to-fuchsia-500";
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-left text-white shadow-md ring-1 ring-white/20 transition animate-fade-in-up cursor-pointer hover:shadow-xl hover:scale-[1.03]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative blob */}
      <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/15 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{card.value}</p>
          {trend && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
              {trend.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {trend.value} this month
            </span>
          )}
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition group-hover:scale-110 group-hover:rotate-6">
          <StatIcon iconKey={card.iconKey} />
        </span>
      </div>
    </button>
  );
}

function StatIcon({ iconKey }: { iconKey: "students" | "teachers" | "parents" | "earnings" }) {
  const cls = "size-6";
  switch (iconKey) {
    case "students": return <GraduationCap className={cls} aria-hidden />;
    case "teachers": return <UsersRound className={cls} aria-hidden />;
    case "parents": return <Users className={cls} aria-hidden />;
    case "earnings": return <DollarSign className={cls} aria-hidden />;
  }
}

function FeedIcon({ iconKey }: { iconKey: "teacher" | "fees" | "course" }) {
  const wrapCls = "flex size-10 shrink-0 items-center justify-center rounded-xl";
  switch (iconKey) {
    case "teacher": return <span className={`${wrapCls} bg-violet-100`}><UserPlus className="size-5 text-violet-600" aria-hidden /></span>;
    case "fees": return <span className={`${wrapCls} bg-rose-100`}><DollarSign className="size-5 text-rose-500" aria-hidden /></span>;
    case "course": return <span className={`${wrapCls} bg-emerald-100`}><BookOpen className="size-5 text-emerald-600" aria-hidden /></span>;
  }
}
