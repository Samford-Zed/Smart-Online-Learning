/**
 * Thin fetch wrapper around the SOLS REST API.
 * Base URL is driven by VITE_API_BASE_URL (see apps/web/.env.example).
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),

  // Auth endpoints
  register: (data: { fullName: string; email: string; password: string; role: string; gradeLevel?: string }) =>
    request<{ message: string; user: { id: number; fullName: string; email: string; role: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: { id: number; fullName: string; email: string; role: string; gradeLevel?: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  completeProfile: (data: Record<string, string>) =>
    request<{ message: string; profile: unknown }>("/auth/complete-profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Current user
  getMe: () => request<{ id: number; fullName: string; email: string; role: string }>("/auth/me"),

  // Student - Dashboard
  getStudentProfile: () => request<unknown>("/api/student/profile"),
  getStudentProgress: () => request<unknown>("/api/student/progress"),
  getStudentOverview: () => request<{ currentCourses: unknown[]; upcomingTasks: unknown[]; recentGrades: unknown[] }>("/api/student/progress/overview"),

  // Student - Courses/Classes
  getStudentClasses: () => request<unknown[]>("/api/student/classes"),
  getStudentClassDetails: (slug: string) => request<unknown>(`/api/student/classes/${slug}`),
  getStudentClassLessons: (slug: string) => request<unknown[]>(`/api/student/classes/${slug}/lessons`),

  // Student - Lessons
  getStudentLesson: (slug: string, lessonId: string) => request<unknown>(`/api/student/classes/${slug}/lessons/${lessonId}`),
  markLessonComplete: (slug: string, lessonId: string) => request<unknown>(`/api/student/classes/${slug}/lessons/${lessonId}/complete`, { method: "PATCH" }),

  // Student - Assignments
  getStudentAssignments: () => request<unknown[]>("/api/student/assignments"),
  getStudentAssignment: (id: string) => request<unknown>(`/api/student/assignments/${id}`),
  submitAssignment: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<unknown>(`/api/student/assignments/${id}/submit`, {
      method: "POST",
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  },

  // Student - Grades
  getStudentGrades: () => request<unknown[]>("/api/student/grades"),
  getRecentGrades: () => request<unknown[]>("/api/student/grades/recent"),

  // Student - Assessments
  getStudentAssessments: () => request<unknown[]>("/api/student/assessments"),
  getStudentAssessment: (id: string) => request<unknown>(`/api/student/assessments/${id}`),
  submitAssessment: (id: string, answers: unknown) => request<unknown>(`/api/student/assessments/${id}/submit`, { method: "POST", body: JSON.stringify({ answers }) }),

  // Student - Schedule
  getStudentSchedule: () => request<unknown[]>("/api/student/schedule/events"),
  getStudentUpcomingEvents: () => request<unknown[]>("/api/student/schedule/upcoming"),

  // Student - Resources
  getStudentResources: () => request<unknown[]>("/api/student/resources"),
  getRecentResources: () => request<unknown[]>("/api/student/resources/recent"),
  requestResource: (data: { subject: string; description: string }) => request<unknown>("/api/student/resources/request", { method: "POST", body: JSON.stringify(data) }),

  // Student - Messages
  getStudentMessages: () => request<unknown[]>("/api/student/messages"),
  sendStudentMessage: (data: { recipientId: number; subject: string; content: string }) => request<unknown>("/api/student/messages", { method: "POST", body: JSON.stringify(data) }),

  // Student - Notifications
  getStudentNotifications: () => request<unknown[]>("/api/student/notifications"),
  markNotificationRead: (id: string) => request<unknown>(`/api/student/notifications/${id}/read`, { method: "PATCH" }),

  // Student - Settings
  getStudentPreferences: () => request<unknown>("/api/student/settings/preferences"),
  updateStudentPreferences: (data: unknown) => request<unknown>("/api/student/settings/preferences", { method: "PUT", body: JSON.stringify(data) }),
  getStudentAcademic: () => request<unknown>("/api/student/settings/academic"),
  updateStudentAcademic: (data: unknown) => request<unknown>("/api/student/settings/academic", { method: "PUT", body: JSON.stringify(data) }),
  updateStudentPassword: (data: { currentPassword: string; newPassword: string }) => request<unknown>("/api/student/settings/password", { method: "PUT", body: JSON.stringify(data) }),

  // Student - Quizzes
  getStudentQuiz: (id: string) => request<unknown>(`/api/student/quizzes/${id}`),
  submitQuiz: (id: string, answers: unknown) => request<unknown>(`/api/student/quizzes/${id}/submit`, { method: "POST", body: JSON.stringify({ answers }) }),

  // Student - Discussion
  getLessonDiscussions: (slug: string, lessonId: string) => request<unknown[]>(`/api/student/classes/${slug}/lessons/${lessonId}/discussion`),
  addLessonDiscussion: (slug: string, lessonId: string, message: string) => request<unknown>(`/api/student/classes/${slug}/lessons/${lessonId}/discussion`, { method: "POST", body: JSON.stringify({ message }) }),

  // Parent endpoints
  getParentDashboard: () => request<{ children: unknown[]; progress: unknown; notifications: unknown[] }>("/api/parent/dashboard"),
  getParentProfile: () => request<unknown>("/api/parent/profile"),
};
