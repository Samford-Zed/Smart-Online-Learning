import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { type TeacherRouteId } from "../routes";
import { getSubmissions, gradeSubmission } from "../services/teacher.api";

type Props = {
  onNavigate: (id: TeacherRouteId, context?: string) => void;
  assignmentId: string;
};

export function GradeSubmissions({ onNavigate, assignmentId }: Props) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [score, setScore] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!assignmentId) return;
    getSubmissions(assignmentId)
      .then(setSubmissions)
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load submissions");
      });
  }, [assignmentId]);

  const filtered = submissions.filter(sub => filter === 'all' || sub.status === filter);

  const handleGrade = async (sub: any) => {
    try {
      await gradeSubmission(sub.id, score[sub.id], feedback[sub.id]);
      setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'graded', score: score[sub.id], feedback: feedback[sub.id] } : s));
      toast.success("Grade submitted successfully");
    } catch (e) {
      console.error("Failed to grade", e);
      toast.error("Failed to submit grade");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <button onClick={() => onNavigate("class-detail")} className="text-sm text-indigo-600 hover:underline mb-2 block">&larr; Back to Class</button>
           <h2 className="text-xl font-semibold text-slate-800">Grade Submissions</h2>
        </div>
        <select 
          className="rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-sm ring-1 ring-slate-200"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="graded">Graded</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map(sub => (
          <div key={sub.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="font-medium text-slate-900">{sub.studentName}</h3>
                 <p className="text-sm text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
               </div>
               <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                 {sub.status.toUpperCase()}
               </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Score</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={score[sub.id] ?? sub.score ?? ''}
                  onChange={(e) => setScore({ ...score, [sub.id]: Number(e.target.value) })}
                  disabled={sub.status === 'graded'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Feedback</label>
                <textarea 
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  rows={2}
                  value={feedback[sub.id] ?? sub.feedback ?? ''}
                  onChange={(e) => setFeedback({ ...feedback, [sub.id]: e.target.value })}
                  disabled={sub.status === 'graded'}
                />
              </div>
            </div>

            {sub.status !== 'graded' && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => handleGrade(sub)}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Submit Grade
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-500">No {filter} submissions found.</div>
        )}
      </div>
    </div>
  );
}
