import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  PenSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type TeacherRouteId =
  | "dashboard"
  | "classes"
  | "class-detail"
  | "grade-submissions"
  | "authoring"
  | "resources"
  | "feedback"
  | "analytics"
  | "settings";

export const TEACHER_ROUTES: {
  id: TeacherRouteId;
  label: string;
  title: string;
  icon: LucideIcon;
  hidden?: boolean;
}[] = [
  { id: "dashboard", label: "Dashboard", title: "Teacher Dashboard", icon: LayoutGrid },
  { id: "classes", label: "Class Management", title: "Class Management", icon: BookOpen },
  { id: "class-detail", label: "Class Detail", title: "Class Details", icon: BookOpen, hidden: true },
  { id: "grade-submissions", label: "Grade Submissions", title: "Grade Submissions", icon: MessageSquare, hidden: true },
  { id: "authoring", label: "Create Content", title: "Course & Content Authoring", icon: PenSquare },
  { id: "resources", label: "Subject Resources", title: "Subject Resources", icon: GraduationCap },
  { id: "feedback", label: "Student Feedback", title: "Student Feedback", icon: MessageSquare },
  { id: "analytics", label: "Performance Analytics", title: "Performance Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", title: "Settings", icon: Settings },
];
