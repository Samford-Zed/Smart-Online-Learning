import { useT } from "../../../../i18n/I18nProvider";

type Props = {
  availableSubjects: { id: number; name: string; grade: number }[];
  selectedSubjects: string[];
  onToggleSubject: (s: string) => void;
  selectedGrade: number | null;
  onSelectGrade: (g: number | null) => void;
};

export function ResourceFilters({
  availableSubjects,
  selectedSubjects,
  onToggleSubject,
  selectedGrade,
  onSelectGrade,
}: Props) {
  const t = useT();
  const grades = Array.from(new Set(availableSubjects.map(s => s.grade))).sort();
  
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{t("Subjects")}</h3>
        <ul className="mt-3 space-y-2.5">
          {availableSubjects.map((s) => {
            const checked = selectedSubjects.includes(s.name);
            return (
              <li key={s.name}>
                <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                  <span className="inline-flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSubject(s.name)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={
                        checked ? "font-semibold text-slate-900" : "text-slate-600"
                      }
                    >
                      {s.name}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{t("Grade Level")}</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {grades.map((g) => {
            const active = selectedGrade === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => onSelectGrade(active ? null : g)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t("Grade")} {g}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
