import { useEffect, useState } from "react";
import { type TeacherRouteId } from "../routes";
import { getMyClasses } from "../services/teacher.api";

type Props = {
  onNavigate: (id: TeacherRouteId, context?: string) => void;
};

export function MyClasses({ onNavigate }: Props) {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyClasses()
      .then(setClasses)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading classes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">My Classes</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500">
            No classes assigned yet.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-indigo-100"
              onClick={() => onNavigate("class-detail", cls.slug)}
            >
              <div className="h-32 bg-indigo-50 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600">
                    {cls.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{cls.grade}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Students</span>
                  <span className="font-semibold text-slate-900">{cls.studentCount || 0}</span>
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Class Progress</span>
                    <span className="font-semibold text-indigo-600">{cls.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${cls.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
