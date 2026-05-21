import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Loader2,
  School,
  Mail,
  Calendar,
  ToggleLeft,
  Users,
  AlertTriangle,
} from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

interface SettingsData {
  school_name: string;
  school_email: string;
  academic_year: string;
  semester: string;
  grading_scale: string;
  maintenance_mode: string;
  allow_registration: string;
}

const defaultSettings: SettingsData = {
  school_name: "EduSmart K-12",
  school_email: "admin@edusmart.edu",
  academic_year: "2025-2026",
  semester: "Spring",
  grading_scale: '{"A": 90, "B": 80, "C": 70, "D": 60, "F": 0}',
  maintenance_mode: "false",
  allow_registration: "true",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const response = await api.getAdminSettings();
      if (response.success) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    
    try {
      const promises = Object.entries(settings).map(([key, value]) =>
        api.updateAdminSetting(key, value)
      );
      
      await Promise.all(promises);
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: keyof SettingsData, value: string) {
    setSettings({ ...settings, [key]: value });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-surface-50">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-50 font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-12 pt-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-ink-900">System Settings</h1>
                <p className="text-ink-500">Configure school information and system preferences</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Success Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          <div className="grid gap-6">
            {/* School Information */}
            <section className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <School className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-ink-900">School Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={settings.school_name}
                    onChange={(e) => updateSetting("school_name", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="email"
                      value={settings.school_email}
                      onChange={(e) => updateSetting("school_email", e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Academic Settings */}
            <SettingsSection title="Academic Settings">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-ink-900">Academic Settings</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={settings.academic_year}
                    onChange={(e) => updateSetting("academic_year", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Current Semester
                  </label>
                  <select
                    value={settings.semester}
                    onChange={(e) => updateSetting("semester", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Grading Scale (JSON)
                  </label>
                  <input
                    type="text"
                    value={settings.grading_scale}
                    onChange={(e) => updateSetting("grading_scale", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            </SettingsSection>

            {/* System Configuration */}
            <SettingsSection title="System Configuration" description="Configure system settings">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div>
                      <h3 className="font-medium text-ink-900">Maintenance Mode</h3>
                      <p className="text-sm text-ink-500">Temporarily disable the site for maintenance</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenance_mode === "true"}
                      onChange={(e) => updateSetting("maintenance_mode", String(e.target.checked))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <h3 className="font-medium text-ink-900">Allow Registration</h3>
                      <p className="text-sm text-ink-500">Enable new user registration</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allow_registration === "true"}
                      onChange={(e) => updateSetting("allow_registration", String(e.target.checked))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {description && <p className="text-sm text-ink-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}
