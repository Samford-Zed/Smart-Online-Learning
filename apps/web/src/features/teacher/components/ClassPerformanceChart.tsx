import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useT } from "../../../i18n/I18nProvider";

const filterOptions = ["Subject Averages", "Top Quartile", "Bottom Quartile"];

type ClassData = {
  short: string;
  name: string;
  value: number; // 0-100
};

export function ClassPerformanceChart({ data = [] }: { data?: ClassData[] }) {
  const t = useT();
  const [filter, setFilter] = useState(filterOptions[0]);
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<number>(Math.max(0, data.length - 1));

  if (!data || data.length === 0) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
        <header className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            {t("Class Performance by Subject")}
          </h3>
        </header>
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          {t("No class performance data available.")}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          {t("Class Performance by Subject")}
        </h3>
        <label className="relative inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50">
          <span>{t(filter)}</span>
          <ChevronDown className="h-3.5 w-3.5" />
          <select
            aria-label="Chart filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {filterOptions.map((o) => (
              <option key={o} value={o}>
                {t(o)}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="relative mt-6">
        {/* Y axis labels + grid */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between">
          {[100, 75, 50, 25].map((v) => (
            <div key={v} className="flex items-center gap-3">
              <span className="w-9 text-right text-[10px] font-medium text-slate-400">
                {v}%
              </span>
              <div className="flex-1 border-t border-dashed border-slate-200" />
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="relative ml-12 flex h-56 items-end gap-4">
          {data.map((d, i) => {
            const isActive = active === i || hover === i;
            return (
              <div
                key={d.short}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div className="relative flex h-full w-full items-end justify-center">
                  <button
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setActive(i)}
                    aria-label={`${d.name}: ${d.value}%`}
                    className="group relative w-full max-w-[72px]"
                    style={{ height: `${d.value}%` }}
                  >
                    <span
                      className={`block h-full w-full rounded-t-md transition-colors ${
                        isActive
                          ? "bg-indigo-600"
                          : "bg-indigo-200 group-hover:bg-indigo-300"
                      }`}
                    />
                    {hover === i && (
                      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                        {d.value}%
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* X axis labels */}
        <div className="ml-12 mt-2 flex gap-4">
          {data.map((d, i) => (
            <div
              key={d.short}
              className={`flex-1 text-center text-xs font-medium ${
                active === i ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              {d.short}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
