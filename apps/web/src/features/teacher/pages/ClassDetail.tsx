import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Calendar, BookOpen, FileText, CheckCircle, Award } from "lucide-react";
import { type TeacherRouteId } from "../routes";
import { 
  getClassStudents, 
  getClassDetails, 
  getClassLessons, 
  getClassAssignments, 
  createLesson, 
  createAssignment 
} from "../services/teacher.api";

type Props = {
  onNavigate: (id: TeacherRouteId, context?: string) => void;
  slug: string;
};

export function ClassDetail({ onNavigate, slug }: Props) {
  const [activeTab, setActiveTab] = useState("Students");
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");

  // Assignment form state
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [newAsgTitle, setNewAsgTitle] = useState("");
  const [newAsgDesc, setNewAsgDesc] = useState("");
  const [newAsgLessonId, setNewAsgLessonId] = useState("");
  const [newAsgDueDate, setNewAsgDueDate] = useState("");

  const fetchData = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const [info, stus, les, asgs] = await Promise.all([
        getClassDetails(slug),
        getClassStudents(slug),
        getClassLessons(slug),
        getClassAssignments(slug)
      ]);
      setClassInfo(info);
      setStudents(stus);
      setLessons(les);
      setAssignments(asgs);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    try {
      await createLesson(slug, { title: newLessonTitle, description: newLessonDesc });
      toast.success("Lesson created successfully!");
      setNewLessonTitle("");
      setNewLessonDesc("");
      setShowLessonForm(false);
      // Refresh data
      const les = await getClassLessons(slug);
      setLessons(les);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create lesson");
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgLessonId) {
      toast.error("Title and Lesson selection are required");
      return;
    }
    try {
      await createAssignment({
        lessonId: Number(newAsgLessonId),
        title: newAsgTitle,
        description: newAsgDesc,
        dueDate: newAsgDueDate ? new Date(newAsgDueDate).toISOString() : null
      });
      toast.success("Assignment created successfully!");
      setNewAsgTitle("");
      setNewAsgDesc("");
      setNewAsgLessonId("");
      setNewAsgDueDate("");
      setShowAssignmentForm(false);
      // Refresh data
      const asgs = await getClassAssignments(slug);
      setAssignments(asgs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create assignment");
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading class details...</div>;
  if (!classInfo) return <div className="py-12 text-center text-slate-500">Class not found.</div>;

  const tabs = ["Students", "Lessons", "Assignments", "Analytics"];

  // Compute Grade distribution for Analytics tab
  const gradeDistribution = students.reduce((acc: Record<string, number>, curr: any) => {
    const grade = curr.overallGrade || "N/A";
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white shadow-md">
        <h2 className="text-3xl font-extrabold">{classInfo.name}</h2>
        <p className="mt-2 text-indigo-100 font-medium">
          {classInfo.grade} &bull; Instructor: {classInfo.instructor || "You"}
        </p>
        {classInfo.description && (
          <p className="mt-4 text-sm text-indigo-50/90 max-w-2xl">{classInfo.description}</p>
        )}
      </div>

      {/* Tabs System */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        
        {/* STUDENTS TAB */}
        {activeTab === "Students" && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Enrolled Students ({students.length})</h3>
            </div>
            {students.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No students enrolled yet.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Last Active</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Course Progress</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {students.map((sys) => (
                    <tr key={sys.id} className="hover:bg-slate-50 transition">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{sys.name}</div>
                        <div className="text-xs text-slate-500">{sys.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {sys.lastActive ? new Date(sys.lastActive).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${sys.progress}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{sys.progress}%</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${
                          sys.overallGrade === 'A' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' :
                          sys.overallGrade === 'B' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' :
                          sys.overallGrade === 'C' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' :
                          sys.overallGrade === 'D' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20' :
                          sys.overallGrade === 'F' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' :
                          'bg-slate-50 text-slate-500'
                        }`}>
                          {sys.overallGrade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* LESSONS TAB */}
        {activeTab === "Lessons" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Class Lessons ({lessons.length})</h3>
              <button 
                onClick={() => setShowLessonForm(!showLessonForm)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                <Plus className="h-4 w-4" />
                New Lesson
              </button>
            </div>

            {showLessonForm && (
              <form onSubmit={handleCreateLesson} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900">Create New Lesson</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Lesson Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Quadratic Equations"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                    <textarea 
                      placeholder="Summary of what is covered in this lesson..."
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newLessonDesc}
                      onChange={(e) => setNewLessonDesc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowLessonForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Create Lesson
                  </button>
                </div>
              </form>
            )}

            <div className="grid gap-4">
              {lessons.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">No lessons created yet.</div>
              ) : (
                lessons.map((les, index) => (
                  <div key={les.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base">{les.title}</h4>
                      {les.moduleTitle && (
                        <span className="inline-flex items-center text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                          {les.moduleTitle}
                        </span>
                      )}
                      <p className="text-sm text-slate-500 pt-1">{les.description || "No description provided."}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === "Assignments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Class Assignments ({assignments.length})</h3>
              <button 
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                <Plus className="h-4 w-4" />
                New Assignment
              </button>
            </div>

            {showAssignmentForm && (
              <form onSubmit={handleCreateAssignment} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900">Create New Assignment</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Associated Lesson</label>
                    <select 
                      required
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newAsgLessonId}
                      onChange={(e) => setNewAsgLessonId(e.target.value)}
                    >
                      <option value="">-- Select a Lesson --</option>
                      {lessons.map((les) => (
                        <option key={les.id} value={les.id}>{les.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Assignment Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Algebra Reflections"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newAsgTitle}
                      onChange={(e) => setNewAsgTitle(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Due Date</label>
                    <input 
                      type="datetime-local" 
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newAsgDueDate}
                      onChange={(e) => setNewAsgDueDate(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Description / Instructions</label>
                    <textarea 
                      placeholder="Enter details, file expectations, and instructions..."
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newAsgDesc}
                      onChange={(e) => setNewAsgDesc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAssignmentForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            )}

            <div className="grid gap-4">
              {assignments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">No assignments created yet.</div>
              ) : (
                assignments.map((asg) => (
                  <div key={asg.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base">{asg.title}</h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Lesson: {asg.lessonTitle || "Algebra"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{asg.description}</p>
                      {asg.due_date && (
                        <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(asg.due_date).toLocaleDateString()} at {new Date(asg.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Submissions</p>
                        <p className="text-base font-bold text-slate-800">
                          {asg.submissionCount || 0}{" "}
                          {asg.pendingCount > 0 && (
                            <span className="text-xs text-rose-500 font-semibold">({asg.pendingCount} pending)</span>
                          )}
                        </p>
                      </div>
                      <button 
                        onClick={() => onNavigate("grade-submissions", String(asg.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 text-sm font-semibold transition"
                      >
                        <Award className="h-4 w-4" />
                        Grade
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "Analytics" && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Grade Distribution</h3>
              
              <div className="space-y-4">
                {["A", "B", "C", "D", "F", "N/A"].map((letter) => {
                  const count = gradeDistribution[letter] || 0;
                  const pct = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                  
                  return (
                    <div key={letter} className="flex items-center gap-4">
                      <span className="w-8 font-bold text-slate-700 text-center">{letter}</span>
                      <div className="flex-1 h-4 overflow-hidden rounded bg-slate-100 relative">
                        <div 
                          className={`h-full rounded transition-all duration-500 ${
                            letter === 'A' ? 'bg-green-500' :
                            letter === 'B' ? 'bg-blue-500' :
                            letter === 'C' ? 'bg-amber-500' :
                            letter === 'D' ? 'bg-orange-500' :
                            letter === 'F' ? 'bg-red-500' :
                            'bg-slate-300'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-bold text-slate-600">{count} ({Math.round(pct)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Key Metrics</h3>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Enrolled Students</span>
                    <span className="font-bold text-slate-800 text-base">{students.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Active Lessons</span>
                    <span className="font-bold text-slate-800 text-base">{lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Assignments</span>
                    <span className="font-bold text-slate-800 text-base">{assignments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Pending Grading</span>
                    <span className="font-bold text-rose-600 text-base">
                      {assignments.reduce((acc, curr) => acc + (curr.pendingCount || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-3">
                <Award className="h-10 w-10 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Class Average</p>
                  <p className="text-lg font-bold text-slate-950">
                    {students.length > 0 
                      ? Math.round(students.reduce((acc, curr) => acc + (curr.progress || 0), 0) / students.length)
                      : 0}% Progress
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
