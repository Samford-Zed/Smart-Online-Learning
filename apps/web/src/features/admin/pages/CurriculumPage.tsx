import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit3,
  Layers,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { useT } from "../../../i18n/I18nProvider";
import { api } from "../../../services/api";

interface Subject {
  id: number;
  name: string;
  slug: string;
  description: string;
  instructor: string;
  grade: number;
  module_count: number;
  lesson_count: number;
}

export default function CurriculumPage() {
  const t = useT();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    try {
      const response = await api.getAdminSubjects();
      if (response.success) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error("Failed to load subjects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    
    try {
      await api.deleteAdminSubject(String(id));
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error) {
      console.error("Failed to delete subject:", error);
      alert("Failed to delete subject");
    }
  }

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-surface-50 font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Curriculum Management</h1>
              <p className="text-ink-500 mt-1">Manage subjects, modules, and lessons</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Subject
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              placeholder="Search subjects or instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subjects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-ink-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ink-700">No subjects found</h3>
              <p className="text-ink-500">Create your first subject to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-ink-900">{subject.name}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                          Grade {subject.grade}
                        </span>
                      </div>
                      <p className="text-ink-500 text-sm mb-4">{subject.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-ink-600">
                        <span className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          {subject.module_count} modules
                        </span>
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {subject.lesson_count} lessons
                        </span>
                        <span>Instructor: {subject.instructor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/curriculum/${subject.slug}`}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Edit
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(subject.id)}
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

          {/* Create Subject Modal */}
          {showCreateModal && (
            <CreateSubjectModal
              onClose={() => setShowCreateModal(false)}
              onCreated={() => {
                setShowCreateModal(false);
                loadSubjects();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Create Subject Modal Component
function CreateSubjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    instructor: "",
    grade: 1,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.createAdminSubject(form);
      onCreated();
    } catch (error) {
      console.error("Failed to create subject:", error);
      alert("Failed to create subject");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-ink-900 mb-4">Create New Subject</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({
                  ...form,
                  name,
                  slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                });
              }}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Slug (URL)</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Instructor</label>
              <input
                type="text"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Grade Level</label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
