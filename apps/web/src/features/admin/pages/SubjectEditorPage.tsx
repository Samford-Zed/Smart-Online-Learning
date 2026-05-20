import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  GripVertical,
  Save,
  X,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

interface Module {
  id: number;
  title: string;
  description?: string;
  order_no: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  order_no: number;
  video_count: number;
  pdf_count: number;
}

interface Subject {
  id: number;
  name: string;
  slug: string;
  description: string;
  instructor: string;
  grade: number;
}

export default function SubjectEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (slug) {
      loadSubject();
    }
  }, [slug]);

  async function loadSubject() {
    setLoading(true);
    try {
      // Get all subjects and find the one with matching slug
      const subjectsResponse = await api.getAdminSubjects();
      if (subjectsResponse.success) {
        const found = subjectsResponse.data.find((s: any) => s.slug === slug);
        if (found) {
          setSubject(found);
          // Load modules for this subject
          const modulesResponse = await api.getAdminSubjectModules(String(found.id));
          if (modulesResponse.success) {
            // For each module, load its lessons
            const modulesWithLessons = await Promise.all(
              modulesResponse.data.map(async (mod: any) => {
                const lessonsResponse = await api.getAdminModuleLessons(String(mod.id));
                return {
                  ...mod,
                  lessons: lessonsResponse.success ? lessonsResponse.data : [],
                };
              })
            );
            setModules(modulesWithLessons);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load subject:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateModule(title: string, description: string) {
    if (!subject) return;
    
    try {
      const response = await api.createAdminModule({
        subject_id: subject.id,
        title,
        description,
        order_no: modules.length + 1,
      });
      
      if (response.success) {
        setModules([...modules, { ...response.data, lessons: [] }]);
        setShowModuleModal(false);
      }
    } catch (error) {
      console.error("Failed to create module:", error);
      alert("Failed to create module");
    }
  }

  async function handleDeleteModule(moduleId: number) {
    if (!confirm("Delete this module and all its lessons?")) return;
    
    try {
      await api.deleteAdminModule(String(moduleId));
      setModules(modules.filter(m => m.id !== moduleId));
    } catch (error) {
      console.error("Failed to delete module:", error);
      alert("Failed to delete module");
    }
  }

  async function handleCreateLesson(moduleId: number, title: string, description: string) {
    if (!subject) return;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    try {
      const response = await api.createAdminLesson({
        module_id: moduleId,
        subject_id: subject.id,
        title,
        description,
        order_no: module.lessons.length + 1,
      });
      
      if (response.success) {
        const updatedModules = modules.map(m => {
          if (m.id === moduleId) {
            return { ...m, lessons: [...m.lessons, response.data] };
          }
          return m;
        });
        setModules(updatedModules);
        setShowLessonModal(false);
        setSelectedModuleId(null);
      }
    } catch (error) {
      console.error("Failed to create lesson:", error);
      alert("Failed to create lesson");
    }
  }

  async function handleDeleteLesson(moduleId: number, lessonId: number) {
    if (!confirm("Delete this lesson?")) return;
    
    try {
      await api.deleteAdminLesson(String(lessonId));
      const updatedModules = modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      });
      setModules(updatedModules);
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      alert("Failed to delete lesson");
    }
  }

  function toggleModule(moduleId: number) {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <AdminSidebar />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-surface-50">
        <AdminSidebar />
        <div className="lg:ml-64 p-6">
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-ink-700">Subject not found</h2>
            <Link to="/admin/curriculum" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Curriculum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <AdminSidebar />
      <div className="lg:ml-64">
        <AdminTopbar />
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/admin/curriculum"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-ink-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-ink-900">{subject.name}</h1>
              <p className="text-ink-500">Grade {subject.grade} • {subject.instructor}</p>
            </div>
            <button
              onClick={() => setShowModuleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          {/* Modules List */}
          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <FolderOpen className="w-16 h-16 text-ink-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-ink-700">No modules yet</h3>
                <p className="text-ink-500 mb-4">Create your first module to add lessons</p>
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Module
                </button>
              </div>
            ) : (
              modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl shadow-card overflow-hidden"
                >
                  {/* Module Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-50 transition-colors"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-ink-400" />
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="w-5 h-5 text-ink-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-ink-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-ink-900">
                          Module {index + 1}: {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-ink-500">{module.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink-500">
                        {module.lessons.length} lessons
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModuleId(module.id);
                          setShowLessonModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List */}
                  {expandedModules.has(module.id) && (
                    <div className="border-t border-surface-200">
                      {module.lessons.length === 0 ? (
                        <div className="p-4 text-center text-ink-500">
                          No lessons yet. Click + to add one.
                        </div>
                      ) : (
                        <div className="divide-y divide-surface-200">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-4 hover:bg-surface-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-ink-400 w-6">
                                  {lessonIndex + 1}
                                </span>
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <div>
                                  <h4 className="font-medium text-ink-900">{lesson.title}</h4>
                                  {lesson.description && (
                                    <p className="text-sm text-ink-500">{lesson.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 text-sm text-ink-500">
                                  {lesson.video_count > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Video className="w-4 h-4" />
                                      {lesson.video_count}
                                    </span>
                                  )}
                                  {lesson.pdf_count > 0 && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-4 h-4" />
                                      {lesson.pdf_count}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingLesson(lesson);
                                      setSelectedModuleId(module.id);
                                    }}
                                    className="p-2 text-ink-600 hover:bg-surface-200 rounded-lg transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Create Module Modal */}
          {showModuleModal && (
            <CreateModuleModal
              onClose={() => setShowModuleModal(false)}
              onCreate={handleCreateModule}
            />
          )}

          {/* Create Lesson Modal */}
          {showLessonModal && selectedModuleId && (
            <CreateLessonModal
              moduleId={selectedModuleId}
              onClose={() => {
                setShowLessonModal(false);
                setSelectedModuleId(null);
              }}
              onCreate={handleCreateLesson}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Create Module Modal
function CreateModuleModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), description.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink-900">Create Module</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded-lg">
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Module Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Algebra"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of this module..."
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-600 hover:bg-surface-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Lesson Modal
function CreateLessonModal({
  moduleId,
  onClose,
  onCreate,
}: {
  moduleId: number;
  onClose: () => void;
  onCreate: (moduleId: number, title: string, description: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      onCreate(moduleId, title.trim(), description.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink-900">Create Lesson</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded-lg">
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Lesson Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., What is Algebra?"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of this lesson..."
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-600 hover:bg-surface-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
