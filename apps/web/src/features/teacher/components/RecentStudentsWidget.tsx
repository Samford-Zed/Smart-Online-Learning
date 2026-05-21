import { useT } from "../../../i18n/I18nProvider";

type Props = {
  students: any[];
};

export function RecentStudentsWidget({ students }: Props) {
  const t = useT();
  
  if (!students || students.length === 0) {
    return null;
  }

  // Show only top 5 recently active students
  const recentStudents = [...students]
    .sort((a, b) => {
      if (!a.lastActive) return 1;
      if (!b.lastActive) return -1;
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    })
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{t("Recent Students Activity")}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-y border-slate-100">
            <tr>
              <th className="py-3 px-4">{t("Student")}</th>
              <th className="py-3 px-4">{t("Subject")}</th>
              <th className="py-3 px-4">{t("Progress")}</th>
              <th className="py-3 px-4">{t("Grade")}</th>
              <th className="py-3 px-4">{t("Last Active")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentStudents.map((student) => (
              <tr key={`${student.id}-${student.subjectName}`} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.email}</p>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{student.subjectName}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${student.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{student.progress}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-bold text-xs ${
                    student.overallGrade === 'A' ? 'bg-green-50 text-green-700' :
                    student.overallGrade === 'B' ? 'bg-blue-50 text-blue-700' :
                    student.overallGrade === 'C' ? 'bg-amber-50 text-amber-700' :
                    student.overallGrade === 'D' ? 'bg-orange-50 text-orange-700' :
                    student.overallGrade === 'F' ? 'bg-red-50 text-red-700' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {student.overallGrade}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 text-xs">
                  {student.lastActive ? new Date(student.lastActive).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
