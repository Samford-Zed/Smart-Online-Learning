import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useT } from "../../../i18n/I18nProvider";
import { AddResourceModal } from "../components/resources/AddResourceModal";
import { ResourceCard } from "../components/resources/ResourceCard";
import { ResourceFilters } from "../components/resources/ResourceFilters";
import { ResourcePager } from "../components/resources/ResourcePager";
import {
  resourceTypes,
  type Resource,
  type ResourceSubject,
  type ResourceType,
} from "../data/resources";
import { getMyClasses } from "../services/teacher.api";
import { getResources } from "../services/teacher.api";

export function SubjectResources() {
  const t = useT();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<"All" | ResourceType>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Resource[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [resData, classData] = await Promise.all([getResources(), getMyClasses()]);
      setItems(resData);
      setClasses(classData);
      if (classData.length > 0 && selectedSubjects.length === 0) {
        setSelectedSubjects([classData[0].name]);
        setSelectedGrade(classData[0].grade ? parseInt(classData[0].grade.replace(/\D/g, ""), 10) : null);
      }
    } catch (err) {
      console.error("Error fetching resources", err);
    }
  };

  useMemo(() => {
    fetchAll();
  }, []);

  const availableSubjects = useMemo(() => {
    const map = new Map<string, { id: number; name: string; grade: number }>();
    classes.forEach(c => {
      const g = parseInt(c.grade.replace(/\D/g, ""), 10) || 9;
      if (!map.has(c.name)) {
        map.set(c.name, { id: c.id, name: c.name, grade: g });
      }
    });
    return Array.from(map.values());
  }, [classes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (
        selectedSubjects.length > 0 &&
        !selectedSubjects.includes(r.subject)
      )
        return false;
      if (selectedGrade != null && r.grade !== selectedGrade) return false;
      if (activeType !== "All" && r.type !== activeType) return false;
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !(r.description || "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [items, selectedSubjects, selectedGrade, activeType, query]);

  const toggleSubject = (s: string) => {
    setPage(1);
    setSelectedSubjects((arr) =>
      arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {t("Subject Resources")}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("Search resources...")}
              className="w-72 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            {t("Add Resource")}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <ResourceFilters
            availableSubjects={availableSubjects}
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            selectedGrade={selectedGrade}
            onSelectGrade={(g) => {
              setSelectedGrade(g);
              setPage(1);
            }}
          />
        </aside>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {resourceTypes.map((rt) => {
              const active = activeType === rt;
              return (
                <button
                  key={rt}
                  type="button"
                  onClick={() => {
                    setActiveType(rt);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {rt === "All" ? t("All Resources") : rt}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-500">
                {t("No resources match the selected filters.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <ResourcePager page={page} totalPages={12} onChange={setPage} />
          </div>
        </section>
      </div>

      {addOpen && (
        <AddResourceModal
          availableSubjects={availableSubjects}
          onClose={() => setAddOpen(false)}
          onAdd={() => {
            fetchAll();
            setAddOpen(false);
            setToast(t("Resource added."));
            window.setTimeout(() => setToast(null), 2500);
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
