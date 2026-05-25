import { useState, useEffect } from "react";
import { Eye, EyeOff, Edit2, ToggleLeft, ToggleRight, Globe, Lock, LayoutGrid, FolderOpen } from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { Link } from "react-router-dom";
import { api } from "../../../services/api";

type PageVisibility = "Public" | "Private" | "Role-Based";

type ManagedPage = {
  id: string;
  name: string;
  route: string;
  section: string;
  visible: boolean;
  visibility: PageVisibility;
  roles: string[];
  description: string;
};

const VISIBILITY_COLORS: Record<PageVisibility, string> = {
  "Public":     "bg-emerald-50 text-emerald-700",
  "Private":    "bg-red-50 text-red-600",
  "Role-Based": "bg-violet-50 text-violet-700",
};

const INITIAL_PAGES: ManagedPage[] = [
  { id: "p1",  name: "Dashboard",          route: "/admin/dashboard",      section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Main admin overview with stats and charts." },
  { id: "p2",  name: "Students",           route: "/admin/students",       section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Manage student records and profiles." },
  { id: "p3",  name: "Teachers",           route: "/admin/teachers",       section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Manage teaching staff." },
  { id: "p4",  name: "Parents",            route: "/admin/parents",        section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "View and manage parent/guardian contacts." },
  { id: "p5",  name: "Courses",            route: "/admin/courses",        section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin","Teacher"],             description: "Manage course catalogue." },
  { id: "p6",  name: "Enrollments",        route: "/admin/enrollments",    section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Handle student course enrollments." },
  { id: "p7",  name: "Attendance",         route: "/admin/attendance",     section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin","Teacher"],             description: "Track daily attendance records." },
  { id: "p8",  name: "Exams",              route: "/admin/exams",          section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin","Teacher"],             description: "Schedule and manage assessments." },
  { id: "p9",  name: "Reports",            route: "/admin/reports",        section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Academic performance reports and downloads." },
  { id: "p10", name: "Announcements",      route: "/admin/announcements",  section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Broadcast announcements to users." },
  { id: "p11", name: "Messages",           route: "/admin/messages",       section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin","Teacher"],             description: "Internal messaging between staff and parents." },
  { id: "p12", name: "User Management",    route: "/admin/users",          section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Manage system users and roles." },
  { id: "p13", name: "Analytics & Usage",  route: "/admin/analytics",      section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Platform usage statistics." },
  { id: "p14", name: "Calendar",           route: "/admin/calendar",       section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin","Teacher"],             description: "School event calendar." },
  { id: "p15", name: "Tasks",              route: "/admin/tasks",          section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Task management board." },
  { id: "p16", name: "Account",            route: "/admin/account",        section: "Admin",   visible: true,  visibility: "Role-Based", roles: ["Admin"],                       description: "Admin profile and settings." },
  { id: "p17", name: "Student Dashboard",  route: "/student/dashboard",    section: "Student", visible: true,  visibility: "Role-Based", roles: ["Student"],                     description: "Student home page." },
  { id: "p18", name: "My Classes",         route: "/student/classes",      section: "Student", visible: true,  visibility: "Role-Based", roles: ["Student"],                     description: "Student class list." },
  { id: "p19", name: "Assignments",        route: "/student/assignments",  section: "Student", visible: true,  visibility: "Role-Based", roles: ["Student"],                     description: "Student assignment page." },
  { id: "p20", name: "Landing Page",       route: "/",                     section: "Public",  visible: true,  visibility: "Public",     roles: ["All"],                         description: "Public-facing landing page." },
];

const SECTIONS = ["All", "Admin", "Student", "Public"];

export default function AdminManagePagesPage() {
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [section, setSection] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ManagedPage | null>(null);

  useEffect(() => {
    api.getAdminPageSettings().then(res => {
      if (res.success && res.data.length > 0) {
        const dbMap: Record<string, any> = {};
        res.data.forEach((s: any) => { dbMap[s.route] = s; });
        setPages(ps => ps.map(p => dbMap[p.route]
          ? { ...p, visible: dbMap[p.route].visible, visibility: dbMap[p.route].visibility as PageVisibility, description: dbMap[p.route].description || p.description }
          : p
        ));
      }
    }).catch(() => {});
  }, []);

  const filtered = pages.filter(p => {
    const matchSection = section === "All" || p.section === section;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.route.toLowerCase().includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  function toggleVisible(id: string) {
    setPages(ps => {
      const updated = ps.map(p => p.id === id ? { ...p, visible: !p.visible } : p);
      const page = updated.find(p => p.id === id);
      if (page) api.updateAdminPageSetting(page.route, { visible: page.visible }).catch(() => {});
      return updated;
    });
  }

  function saveEdit(updated: ManagedPage) {
    setPages(ps => ps.map(p => p.id === updated.id ? updated : p));
    api.updateAdminPageSetting(updated.route, { visible: updated.visible, visibility: updated.visibility, description: updated.description }).catch(() => {});
    setEditing(null);
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6">

          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-ink-900">Manage Pages</h1>
            <p className="text-sm text-ink-500">Control visibility and access for all application pages</p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            {[
              { label: "Total Pages", value: pages.length,                                  icon: LayoutGrid, gradient: "from-violet-500 to-fuchsia-500" },
              { label: "Visible",     value: pages.filter(p => p.visible).length,           icon: Eye,        gradient: "from-emerald-500 to-green-500" },
              { label: "Hidden",      value: pages.filter(p => !p.visible).length,          icon: EyeOff,     gradient: "from-red-500 to-rose-500" },
              { label: "Sections",    value: new Set(pages.map(p => p.section)).size,       icon: FolderOpen, gradient: "from-amber-500 to-orange-500" },
            ].map((s, i) => (
              <div key={s.label} className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition hover:shadow-md hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}>
                <div>
                  <p className="text-xs font-semibold text-ink-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-ink-900">{s.value}</p>
                </div>
                <span className={`flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white transition group-hover:scale-110`}>
                  <s.icon className="size-5" aria-hidden />
                </span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <label className="relative flex items-center">
              <LayoutGrid className="pointer-events-none absolute left-3 size-4 text-ink-400" />
              <input type="search" placeholder="Search pages..." value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 w-64 rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </label>
            <div className="flex gap-2">
              {SECTIONS.map(s => (
                <button key={s} onClick={() => setSection(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${section === s ? "bg-violet-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-violet-50"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 text-left">Page</th>
                    <th className="px-4 py-3 text-left">Route</th>
                    <th className="px-4 py-3 text-left">Section</th>
                    <th className="px-4 py-3 text-left">Visibility</th>
                    <th className="px-4 py-3 text-left">Roles</th>
                    <th className="px-4 py-3 text-center">Visible</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-ink-50 last:border-0 hover:bg-violet-50/20 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-400 truncate max-w-xs">{p.description}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={p.route} className="font-mono text-xs text-violet-600 hover:underline">{p.route}</Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-600">{p.section}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${VISIBILITY_COLORS[p.visibility]}`}>
                          {p.visibility === "Public" ? <Globe className="size-3" /> : <Lock className="size-3" />}
                          {p.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {p.roles.map(r => (
                            <span key={r} className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => toggleVisible(p.id)} title={p.visible ? "Hide page" : "Show page"}
                          className={`transition ${p.visible ? "text-emerald-500 hover:text-emerald-700" : "text-ink-300 hover:text-ink-500"}`}>
                          {p.visible
                            ? <ToggleRight className="size-6" />
                            : <ToggleLeft className="size-6" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => setEditing({ ...p })}
                          className="rounded-md p-1.5 text-ink-400 hover:bg-violet-50 hover:text-violet-700">
                          <Edit2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Page: {editing.name}</h2>
              <button onClick={() => setEditing(null)} className="rounded-full p-1.5 hover:bg-ink-100">
                <EyeOff className="size-4 text-ink-500" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-700">Page Name</span>
                <input value={editing.name} onChange={e => setEditing(ed => ed ? { ...ed, name: e.target.value } : ed)}
                  className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-700">Description</span>
                <textarea value={editing.description} rows={2}
                  onChange={e => setEditing(ed => ed ? { ...ed, description: e.target.value } : ed)}
                  className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-violet-400 resize-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-700">Visibility</span>
                <select value={editing.visibility}
                  onChange={e => setEditing(ed => ed ? { ...ed, visibility: e.target.value as PageVisibility } : ed)}
                  className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400">
                  <option>Public</option><option>Private</option><option>Role-Based</option>
                </select>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-ink-700">Visible</span>
                <button onClick={() => setEditing(ed => ed ? { ...ed, visible: !ed.visible } : ed)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${editing.visible ? "bg-violet-600" : "bg-ink-200"}`}>
                  <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${editing.visible ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-xs font-semibold ${editing.visible ? "text-emerald-600" : "text-ink-400"}`}>{editing.visible ? "Visible" : "Hidden"}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button onClick={() => saveEdit(editing)} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
