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

  // Admin endpoints
  getAdminDashboard: () => request<{ success: boolean; data: any }>("/api/admin/dashboard"),
  getAdminUsers: (filters?: { role?: string; grade?: number; search?: string; isActive?: boolean; limit?: number; offset?: number }) => 
    request<{ success: boolean; data: { users: any[]; total: number } }>(`/api/admin/users?${new URLSearchParams(filters as any).toString()}`),
  getAdminUser: (id: string) => request<{ success: boolean; data: any }>(`/api/admin/users/${id}`),
  createAdminUser: (data: { name: string; email: string; password: string; role: string; grade_level?: number }) => 
    request<{ success: boolean; data: any }>("/api/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateAdminUser: (id: string, data: any) => 
    request<{ success: boolean; data: any }>(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminUser: (id: string) => 
    request<{ success: boolean; message: string }>(`/api/admin/users/${id}`, { method: "DELETE" }),
  resetUserPassword: (id: string, newPassword: string) => 
    request<{ success: boolean; message: string }>(`/api/admin/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ newPassword }) }),
  
  // Admin - Subjects
  getAdminSubjects: () => request<{ success: boolean; data: any[] }>("/api/admin/subjects"),
  createAdminSubject: (data: { name: string; slug: string; description: string; instructor: string; grade: number }) => 
    request<{ success: boolean; data: any }>("/api/admin/subjects", { method: "POST", body: JSON.stringify(data) }),
  deleteAdminSubject: (id: string) => 
    request<{ success: boolean; message: string }>(`/api/admin/subjects/${id}`, { method: "DELETE" }),
  
  // Admin - Logs
  getAdminLogs: (limit?: number, offset?: number) => 
    request<{ success: boolean; data: any[] }>(`/api/admin/logs?limit=${limit || 100}&offset=${offset || 0}`),
  
  // Admin - Modules
  getAdminSubjectModules: (subjectId: string) => 
    request<{ success: boolean; data: any[] }>(`/api/admin/subjects/${subjectId}/modules`),
  createAdminModule: (data: { subject_id: number; title: string; order_no: number; description?: string }) => 
    request<{ success: boolean; data: any }>("/api/admin/modules", { method: "POST", body: JSON.stringify(data) }),
  updateAdminModule: (id: string, data: any) => 
    request<{ success: boolean; data: any }>(`/api/admin/modules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminModule: (id: string) => 
    request<{ success: boolean; message: string }>(`/api/admin/modules/${id}`, { method: "DELETE" }),
  
  // Admin - Subjects
  getSubjects: () => request<{ success: boolean; data: any[] }>("/api/admin/subjects"),
  
  // Admin - Lessons
  getAdminModuleLessons: (moduleId: string) => 
    request<{ success: boolean; data: any[] }>(`/api/admin/modules/${moduleId}/lessons`),
  createAdminLesson: (data: { module_id: number; subject_id: number; title: string; description?: string; order_no: number }) => 
    request<{ success: boolean; data: any }>("/api/admin/lessons", { method: "POST", body: JSON.stringify(data) }),
  updateAdminLesson: (id: string, data: any) => 
    request<{ success: boolean; data: any }>(`/api/admin/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminLesson: (id: string) => 
    request<{ success: boolean; message: string }>(`/api/admin/lessons/${id}`, { method: "DELETE" }),
  
  // Admin - Content Upload
  addAdminLessonVideo: (lessonId: string, data: { title: string; url: string }) => 
    request<{ success: boolean; data: any }>(`/api/admin/lessons/${lessonId}/videos`, { method: "POST", body: JSON.stringify(data) }),
  addAdminLessonPdf: (lessonId: string, data: { title: string; url: string }) => 
    request<{ success: boolean; data: any }>(`/api/admin/lessons/${lessonId}/pdfs`, { method: "POST", body: JSON.stringify(data) }),
  
  // Admin - Analytics
  getAdminEnrollmentTrends: (months?: number) => 
    request<{ success: boolean; data: any[] }>(`/api/admin/analytics/enrollment-trends?months=${months || 6}`),
  getAdminGradeDistribution: () => 
    request<{ success: boolean; data: any[] }>("/api/admin/analytics/grade-distribution"),
  getAdminSubjectEnrollment: () => 
    request<{ success: boolean; data: any[] }>("/api/admin/analytics/subject-enrollment"),
  
  // Admin - Settings
  getAdminSettings: () => request<{ success: boolean; data: Record<string, string> }>("/api/admin/settings"),
  updateAdminSetting: (key: string, value: string) => 
    request<{ success: boolean; message: string }>(`/api/admin/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
  
  // Admin - Students
  searchAdminStudents: (q: string, limit?: number) => 
    request<{ success: boolean; data: any[] }>(`/api/admin/students/search?q=${encodeURIComponent(q)}&limit=${limit || 20}`),
  
  // Admin - Enrollments
  getAdminEnrollments: (filters?: { status?: string; studentId?: number; subjectId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.studentId) params.append("studentId", String(filters.studentId));
    if (filters?.subjectId) params.append("subjectId", String(filters.subjectId));
    return request<{ success: boolean; data: any[] }>(`/api/admin/enrollments?${params.toString()}`);
  },
  createAdminEnrollment: (data: { student_id: number; subject_id: number; notes?: string }) => 
    request<{ success: boolean; data: any }>("/api/admin/enrollments", { method: "POST", body: JSON.stringify(data) }),
  updateAdminEnrollmentStatus: (id: number, status: string) => 
    request<{ success: boolean; data: any }>(`/api/admin/enrollments/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  deleteAdminEnrollment: (id: number) => 
    request<{ success: boolean; message: string }>(`/api/admin/enrollments/${id}`, { method: "DELETE" }),

  // Admin - Parents
  getAdminParents: (filters?: { search?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    return request<{ success: boolean; data: any[] }>(`/api/admin/parents?${params.toString()}`);
  },
  createAdminParent: (data: { full_name: string; email: string; phone?: string; occupation?: string; address?: string; status?: string; avatar?: string; studentIds?: number[] }) => 
    request<{ success: boolean; data: any }>("/api/admin/parents", { method: "POST", body: JSON.stringify(data) }),
  updateAdminParent: (id: number, data: Partial<{ full_name: string; email: string; phone: string; occupation: string; address: string; status: string; studentIds: number[] }>) => 
    request<{ success: boolean; data: any }>(`/api/admin/parents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminParent: (id: number) => 
    request<{ success: boolean; message: string }>(`/api/admin/parents/${id}`, { method: "DELETE" }),

  // Admin - Exams
  getAdminExams: (filters?: { status?: string; grade?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.search) params.append("search", filters.search);
    return request<{ success: boolean; data: any[] }>(`/api/admin/exams?${params.toString()}`);
  },
  createAdminExam: (data: any) =>
    request<{ success: boolean; data: any }>("/api/admin/exams", { method: "POST", body: JSON.stringify(data) }),
  updateAdminExam: (id: string, data: any) =>
    request<{ success: boolean; data: any }>(`/api/admin/exams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminExam: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/exams/${id}`, { method: "DELETE" }),

  // Admin - Attendance
  getAdminAttendance: (filters?: { grade?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.search) params.append("search", filters.search);
    return request<{ success: boolean; data: { students: any[]; summary: any } }>(`/api/admin/attendance?${params.toString()}`);
  },
  saveAttendance: (data: { student_id: number; date: string; status: string; note?: string }) =>
    request<{ success: boolean; data: any }>("/api/admin/attendance", { method: "POST", body: JSON.stringify(data) }),

  // Admin - Announcements
  getAdminAnnouncements: (filters?: { audience?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.audience) params.append("audience", filters.audience);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    return request<{ success: boolean; data: any[] }>(`/api/admin/announcements?${params.toString()}`);
  },
  createAdminAnnouncement: (data: any) =>
    request<{ success: boolean; data: any }>("/api/admin/announcements", { method: "POST", body: JSON.stringify(data) }),
  updateAdminAnnouncement: (id: string, data: any) =>
    request<{ success: boolean; data: any }>(`/api/admin/announcements/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminAnnouncement: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/announcements/${id}`, { method: "DELETE" }),

  // Admin - Calendar
  getAdminCalendar: (filters?: { type?: string; month?: number; year?: number }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.month !== undefined) params.append("month", String(filters.month));
    if (filters?.year !== undefined) params.append("year", String(filters.year));
    return request<{ success: boolean; data: any[] }>(`/api/admin/calendar?${params.toString()}`);
  },
  createAdminCalendarEvent: (data: any) =>
    request<{ success: boolean; data: any }>("/api/admin/calendar", { method: "POST", body: JSON.stringify(data) }),
  updateAdminCalendarEvent: (id: string, data: any) =>
    request<{ success: boolean; data: any }>(`/api/admin/calendar/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminCalendarEvent: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/calendar/${id}`, { method: "DELETE" }),

  // Admin - Tasks
  getAdminTasks: (filters?: { status?: string; priority?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.search) params.append("search", filters.search);
    return request<{ success: boolean; data: any[] }>(`/api/admin/tasks?${params.toString()}`);
  },
  createAdminTask: (data: any) =>
    request<{ success: boolean; data: any }>("/api/admin/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateAdminTask: (id: string, data: any) =>
    request<{ success: boolean; data: any }>(`/api/admin/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminTask: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/tasks/${id}`, { method: "DELETE" }),

  // Admin - Messages
  getAdminConversations: () =>
    request<{ success: boolean; data: any[] }>("/api/admin/messages/conversations"),
  getAdminMessages: (userId: string) =>
    request<{ success: boolean; data: any[] }>(`/api/admin/messages/${userId}`),
  sendAdminMessage: (data: { recipient_id: number; recipient_name: string; text: string; sender_name?: string }) =>
    request<{ success: boolean; data: any }>("/api/admin/messages", { method: "POST", body: JSON.stringify(data) }),
};
