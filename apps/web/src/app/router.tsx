import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import StudentDashboardPage from "@/features/student/pages/StudentDashboardPage";
import MyClassesPage from "@/features/student/pages/MyClassesPage";
import AssignmentsPage from "@/features/student/pages/AssignmentsPage";
import SchedulePage from "@/features/student/pages/SchedulePage";
import GradesPage from "@/features/student/pages/GradesPage";
import ResourcesPage from "@/features/student/pages/ResourcesPage";
import AssessmentsPage from "@/features/student/pages/AssessmentsPage";
import CourseDetailPage from "@/features/student/pages/CourseDetailPage";
import AssignmentDetailPage from "@/features/student/pages/AssignmentDetailPage";
import AssessmentDetailPage from "@/features/student/pages/AssessmentDetailPage";
import LessonPlayerPage from "@/features/student/pages/LessonPlayerPage";
import SettingsLayout from "@/features/student/settings/SettingsLayout";
import SettingsSecurityPage from "@/features/student/pages/SettingsSecurityPage";
import SettingsPreferencesPage from "@/features/student/pages/SettingsPreferencesPage";
import SettingsAcademicPage from "@/features/student/pages/SettingsAcademicPage";
import LandingPage from "@/features/landing/pages/LandingPage";
import CompleteProfilePage from "@/features/auth/pages/CompleteProfilePage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import AdminStudentsPage from "@/features/admin/pages/AdminStudentsPage";
import AdminTeachersPage from "@/features/admin/pages/AdminTeachersPage";
import AdminParentsPage from "@/features/admin/pages/AdminParentsPage";
import AdminCoursesPage from "@/features/admin/pages/AdminCoursesPage";
import AdminCalendarPage from "@/features/admin/pages/AdminCalendarPage";
import AdminTasksPage from "@/features/admin/pages/AdminTasksPage";
import AdminReportsPage from "@/features/admin/pages/AdminReportsPage";
import AdminUserManagementPage from "@/features/admin/pages/AdminUserManagementPage";
import AdminAnalyticsPage from "@/features/admin/pages/AdminAnalyticsPage";
import AdminAccountPage from "@/features/admin/pages/AdminAccountPage";
import AdminAttendancePage from "@/features/admin/pages/AdminAttendancePage";
import AdminExamsPage from "@/features/admin/pages/AdminExamsPage";
import AdminMessagesPage from "@/features/admin/pages/AdminMessagesPage";
import AdminAnnouncementsPage from "@/features/admin/pages/AdminAnnouncementsPage";
import AdminEnrollmentsPage from "@/features/admin/pages/AdminEnrollmentsPage";
import AdminManagePagesPage from "@/features/admin/pages/AdminManagePagesPage";
import CurriculumPage from "@/features/admin/pages/CurriculumPage";
import SubjectEditorPage from "@/features/admin/pages/SubjectEditorPage";
import AdminSettingsPage from "@/features/admin/pages/AdminSettingsPage";
import { ParentPortalRoot } from "@/features/parent/ParentPortalRoot";
import { TeacherPortal } from "@/features/teacher/TeacherPortal";

// When Clerk isn't configured, auth routes still render so the pages can be
// previewed without a backend setup. Set VITE_AUTH_PREVIEW=false to disable.
const CLERK_ENABLED =
  Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) ||
  import.meta.env.VITE_AUTH_PREVIEW !== "false";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/student/dashboard" element={<StudentDashboardPage />} />
      <Route path="/student/classes" element={<MyClassesPage />} />
      <Route path="/student/classes/:slug" element={<CourseDetailPage />} />
      <Route
        path="/student/classes/:slug/lesson/:lessonId"
        element={<LessonPlayerPage />}
      />
      <Route path="/student/assignments" element={<AssignmentsPage />} />
      <Route
        path="/student/assignments/:id"
        element={<AssignmentDetailPage />}
      />
      <Route path="/student/schedule" element={<SchedulePage />} />
      <Route path="/student/grades" element={<GradesPage />} />
      <Route path="/student/resources" element={<ResourcesPage />} />
      <Route path="/student/assessments" element={<AssessmentsPage />} />
      <Route
        path="/student/assessments/:id"
        element={<AssessmentDetailPage />}
      />
      <Route path="/student/settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="security" replace />} />
        <Route path="security" element={<SettingsSecurityPage />} />
        <Route path="preferences" element={<SettingsPreferencesPage />} />
        <Route path="academic" element={<SettingsAcademicPage />} />
      </Route>
      <Route
        path="/forgot-password"
        element={
          <div className="flex min-h-screen items-center justify-center p-8 text-center text-ink-700">
            Forgot password page — coming soon.
          </div>
        }
      />
      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/teachers" element={<AdminTeachersPage />} />
      <Route path="/admin/parents" element={<AdminParentsPage />} />
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route path="/admin/calendar" element={<AdminCalendarPage />} />
      <Route path="/admin/tasks" element={<AdminTasksPage />} />
      <Route path="/admin/students" element={<AdminStudentsPage />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
      <Route path="/admin/users" element={<AdminUserManagementPage />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route path="/admin/account" element={<AdminAccountPage />} />
      <Route path="/admin/attendance" element={<AdminAttendancePage />} />
      <Route path="/admin/exams" element={<AdminExamsPage />} />
      <Route path="/admin/messages" element={<AdminMessagesPage />} />
      <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
      <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
      <Route path="/admin/manage-pages" element={<AdminManagePagesPage />} />
      <Route path="/admin/curriculum" element={<CurriculumPage />} />
      <Route path="/admin/curriculum/:slug" element={<SubjectEditorPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />

      {/* Parent portal — state-based nav inside the component */}
      <Route path="/parent/*" element={<ParentPortalRoot />} />

      {/* Teacher portal — self-contained */}
      <Route path="/teacher/*" element={<TeacherPortal />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
