import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  CloudUpload,
  Filter,
  History,
  FileText,
  PlayCircle,
  FileType,
  FileArchive,
  MoreVertical,
  Download,
  Play,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { api } from "../../../services/api";
import {
  subjects as MOCK_SUBJECTS,
  recentlyViewed as MOCK_RECENT,
  allMaterials as MOCK_MATERIALS,
  type Material,
  type RecentItem,
  type ResourceKind,
  type Subject,
} from "../data/resourcesData";

/**
 * Resources Library — student page for browsing and downloading materials.
 * Layout: page header → filter bar → Recently Viewed → All Materials grid →
 * Load More.
 * Data comes from `resourcesData.ts` fetchers; swap with real API later.
 */
type ViewerItem = { title: string; kind: ResourceKind };

const PAGE_SIZE = 8;

export default function ResourcesPage() {
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [recent, setRecent] = useState<RecentItem[]>(MOCK_RECENT);
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All Types");
  const [filterDate, setFilterDate] = useState<string>("Any Time");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewer, setViewer] = useState<ViewerItem | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  // Sync URL ?q= into the local search state on first render.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  /** Triggers a real text-blob download named after the material. */
  function downloadMaterial(title: string) {
    const safe = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const blob = new Blob(
      [`Resource: ${title}\n(downloaded from SOLS Library)`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safe}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleRequestMaterial() {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 2400);
  }

  useEffect(() => {
    let active = true;

    // Fetch API resources and append to mock data
    api.getStudentResources()
      .then((data: any[]) => {
        if (!active) return;
        // Transform API data to Material format
        const apiMaterials: Material[] = data.map((m, i) => ({
          id: `api-${m.id || i}`,
          title: m.title || m.name || "Untitled",
          kind: (m.kind || m.type || "pdf") as ResourceKind,
          subject: m.subject || m.course || "General",
          subjectClass: m.subjectClass || "bg-ink-100 text-ink-700",
          size: m.size || "Unknown size",
          date: m.date || m.createdAt || new Date().toISOString(),
          duration: m.duration,
          primaryAction: (m.primaryAction || "view") as Material["primaryAction"],
          hasView: m.hasView,
        }));
        setMaterials((prev) => [...prev, ...apiMaterials]);
        setLoading(false);
      })
      .catch(() => {
        // Silently fail - keep showing mock data
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Apply all filters: subject chip, type dropdown, date dropdown, search query.
  const filteredMaterials = materials
    .filter((m) => {
      if (!activeSubject) return true;
      return m.subject.toLowerCase() === activeSubject.toLowerCase();
    })
    .filter((m) => {
      if (filterType === "All Types") return true;
      const map: Record<string, ResourceKind> = {
        PDF: "pdf",
        Video: "video",
        Document: "doc",
        Archive: "archive",
      };
      return m.kind === map[filterType];
    })
    .filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    });

  // Filter applied (date is mock-only) — take only `visibleCount` items.
  const visibleMaterials = filteredMaterials.slice(0, visibleCount);

  // Reset pagination whenever a filter changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeSubject, filterType, filterDate]);

  return (
    <div className="flex min-h-screen bg-surface-page font-sans text-ink-900">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 pb-12 pt-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-ink-500"
          >
            <Link to="/student/dashboard" className="hover:text-ink-700">
              Home
            </Link>
            <ChevronRight className="size-4" aria-hidden />
            <span className="text-ink-900">Resources Library</span>
          </nav>

          {/* Header */}
          <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Resources Library
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Access, organize, and download your learning materials.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestMaterial}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
            >
              {requestSent ? (
                <>
                  <Check className="size-4" aria-hidden />
                  Request Sent
                </>
              ) : (
                <>
                  <CloudUpload className="size-4" aria-hidden />
                  Request Material
                </>
              )}
            </button>
          </header>

          {/* Subject chips */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Your Subjects:
            </span>
            <SubjectChip
              label="All"
              active={activeSubject === null}
              onClick={() => setActiveSubject(null)}
            />
            {subjects.map((s) => (
              <SubjectChip
                key={s.id}
                label={s.name}
                dotClass={s.dotClass}
                active={activeSubject === s.name}
                onClick={() =>
                  setActiveSubject(activeSubject === s.name ? null : s.name)
                }
              />
            ))}
          </div>

          {/* Filter bar */}
          <FilterBar
            type={filterType}
            date={filterDate}
            search={searchQuery}
            onTypeChange={setFilterType}
            onDateChange={setFilterDate}
            onSearchChange={setSearchQuery}
            onClear={() => {
              setActiveSubject(null);
              setFilterType("All Types");
              setFilterDate("Any Time");
              setSearchQuery("");
            }}
          />

          {/* Recently Viewed */}
          <section className="mt-7">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <History className="size-4 text-brand" aria-hidden />
              Recently Viewed
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setViewer({ title: r.title, kind: r.kind })}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="text-left animate-fade-in-up"
                >
                  <RecentCard item={r} />
                </button>
              ))}
            </div>
          </section>

          {/* All Materials */}
          <section className="mt-7">
            <header className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900">All Materials</h2>
              <span className="text-xs text-ink-500">
                {filteredMaterials.length === 0
                  ? "—"
                  : `${filteredMaterials.length} of ${materials.length} items`}
              </span>
            </header>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleMaterials.map((m, i) => (
                <div
                  key={m.id}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-fade-in-up"
                >
                  <MaterialCard
                    material={m}
                    onView={() =>
                      setViewer({ title: m.title, kind: m.kind })
                    }
                    onDownload={() => downloadMaterial(m.title)}
                  />
                </div>
              ))}
            </div>
            {filteredMaterials.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
                No materials match your filters.
              </div>
            )}
          </section>

          {/* Load More */}
          {visibleCount < filteredMaterials.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((c) => c + PAGE_SIZE)
                }
                className="rounded-full border border-ink-200 bg-white px-6 py-2.5 text-sm font-semibold text-ink-700 shadow-card transition hover:bg-ink-50"
              >
                Load More Resources
              </button>
            </div>
          )}

          {viewer && (
            <ResourceViewerModal
              item={viewer}
              onClose={() => setViewer(null)}
              onDownload={() => downloadMaterial(viewer.title)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ----------------------------- Subject chip ---------------------------- */

function SubjectChip({
  label,
  dotClass,
  active,
  onClick,
}: {
  label: string;
  dotClass?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-brand bg-brand text-white shadow-card"
          : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
      }`}
    >
      {dotClass && (
        <span className={`size-2 rounded-full ${dotClass}`} aria-hidden />
      )}
      {label}
    </button>
  );
}

/* ------------------------------- Filter bar ------------------------------ */

function FilterBar({
  type,
  date,
  search,
  onTypeChange,
  onDateChange,
  onSearchChange,
  onClear,
}: {
  type: string;
  date: string;
  search: string;
  onTypeChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-card md:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">SEARCH</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search materials…"
          className="h-10 rounded-xl border border-ink-200 bg-ink-50 px-3 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <FilterSelect
        label="RESOURCE TYPE"
        value={type}
        onChange={onTypeChange}
        options={["All Types", "PDF", "Video", "Document", "Archive"]}
      />
      <FilterSelect
        label="DATE ADDED"
        value={date}
        onChange={onDateChange}
        options={["Any Time", "Last 7 days", "Last 30 days", "This semester"]}
      />
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center justify-center gap-2 self-end rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 shadow-card transition hover:bg-ink-50"
      >
        <Filter className="size-4 text-ink-500" aria-hidden />
        Clear
      </button>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-ink-200 bg-white pl-3 pr-9 text-sm text-ink-900 outline-none transition hover:bg-ink-50 focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-500"
          aria-hidden
        />
      </div>
    </label>
  );
}

/* ----------------------------- Viewer modal ---------------------------- */

function ResourceViewerModal({
  item,
  onClose,
  onDownload,
}: {
  item: ViewerItem;
  onClose: () => void;
  onDownload: () => void;
}) {
  const isVideo = item.kind === "video";
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card animate-scale-in"
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <h2 className="text-sm font-bold text-ink-900">{item.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex h-72 items-center justify-center bg-ink-900 text-white">
          {isVideo ? (
            <div className="text-center">
              <PlayCircle
                className="mx-auto size-16 text-white/80"
                aria-hidden
              />
              <p className="mt-2 text-sm text-white/70">
                Video preview placeholder
              </p>
            </div>
          ) : (
            <div className="text-center">
              <FileText
                className="mx-auto size-16 text-white/70"
                aria-hidden
              />
              <p className="mt-2 text-sm text-white/70">
                Document preview placeholder
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
          >
            <Download className="size-3.5" aria-hidden />
            Download
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ----------------------------- Resource icon ----------------------------- */

function ResourceIcon({ kind, large }: { kind: ResourceKind; large?: boolean }) {
  const wrap = large ? "size-14 rounded-xl" : "size-10 rounded-lg";
  const inner = large ? "size-7" : "size-5";
  switch (kind) {
    case "pdf":
      return (
        <span
          className={`flex ${wrap} items-center justify-center bg-rose-50 text-rose-500`}
        >
          <FileText className={inner} aria-hidden />
        </span>
      );
    case "video":
      return (
        <span
          className={`flex ${wrap} items-center justify-center bg-brand/10 text-brand`}
        >
          <PlayCircle className={inner} aria-hidden />
        </span>
      );
    case "doc":
      return (
        <span
          className={`flex ${wrap} items-center justify-center bg-emerald-50 text-emerald-600`}
        >
          <FileType className={inner} aria-hidden />
        </span>
      );
    case "archive":
      return (
        <span
          className={`flex ${wrap} items-center justify-center bg-amber-100 text-amber-600`}
        >
          <FileArchive className={inner} aria-hidden />
        </span>
      );
  }
}

/* ----------------------------- Recent card ----------------------------- */

function RecentCard({ item }: { item: RecentItem }) {
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <ResourceIcon kind={item.kind} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink-900">
            {item.title}
          </h3>
          <p className="mt-0.5 text-xs text-ink-500">{item.meta}</p>
        </div>
      </div>
      {item.progress !== null && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className={`h-full rounded-full ${item.progressClass ?? "bg-brand"} transition-[width] duration-700 ease-out`}
            style={{ width: `${Math.round(item.progress * 100)}%` }}
          />
        </div>
      )}
    </article>
  );
}

/* ----------------------------- Material card ----------------------------- */

function MaterialCard({
  material,
  onView,
  onDownload,
}: {
  material: Material;
  onView: () => void;
  onDownload: () => void;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      {/* Top: icon tile + kebab */}
      <div className="flex items-start justify-between">
        <ResourceIcon kind={material.kind} large />
        <button
          type="button"
          aria-label="More"
          onClick={onDownload}
          title="Download"
          className="rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
        >
          <MoreVertical className="size-4" aria-hidden />
        </button>
      </div>

      {/* Subject pill */}
      <span
        className={`mt-3 inline-flex w-max items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${material.subjectClass}`}
      >
        {material.subject}
      </span>

      {/* Title */}
      <h3 className="mt-3 line-clamp-2 min-h-[40px] text-sm font-semibold text-ink-900">
        {material.title}
      </h3>

      {/* Meta */}
      <p className="mt-2 text-xs text-ink-500">
        {material.size} <span className="mx-1">·</span> {material.date}
      </p>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {material.hasView && (
          <button
            type="button"
            onClick={onView}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-ink-200 bg-white text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            View
          </button>
        )}
        <PrimaryActionButton
          action={material.primaryAction}
          onView={onView}
          onDownload={onDownload}
        />
      </div>
    </article>
  );
}

function PrimaryActionButton({
  action,
  onView,
  onDownload,
}: {
  action: Material["primaryAction"];
  onView: () => void;
  onDownload: () => void;
}) {
  const base =
    "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand text-xs font-semibold text-white transition hover:bg-brand-600";
  switch (action) {
    case "view":
      return (
        <button type="button" onClick={onView} className={base}>
          View
        </button>
      );
    case "watch":
      return (
        <button type="button" onClick={onView} className={base}>
          <Play className="size-3.5 fill-white" aria-hidden />
          Watch Video
        </button>
      );
    case "download":
      return (
        <button type="button" onClick={onDownload} className={base}>
          <Download className="size-3.5" aria-hidden />
          Download
        </button>
      );
    case "downloadAll":
      return (
        <button type="button" onClick={onDownload} className={base}>
          <Download className="size-3.5" aria-hidden />
          Download All
        </button>
      );
  }
}
