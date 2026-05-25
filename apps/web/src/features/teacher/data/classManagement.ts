export type AttendanceStatus = "present" | "late" | "absent";

export type Student = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  studentId: string;
  grade: string;
  gradePct: number;
  status: AttendanceStatus;
};

export const classInfo = {
  department: "Biology Department",
  title: "Grade 10 - Biology Section A",
  meta: "Fall Semester 2024 \u2022 Room 302",
  totalStudents: 32,
  attendanceRate: 94,
  avgPerformance: 82,
  avgGrade: "B-",
  date: "Oct 24",
};

export const attendanceCounts: Record<AttendanceStatus, number> = {
  present: 28,
  late: 2,
  absent: 2,
};

export const students: Student[] = [
  {
    id: "s1",
    name: "Emma Thompson",
    email: "emma.t@school.edu",
    avatarUrl: "",
    studentId: "#ST-2024-01",
    grade: "A",
    gradePct: 94,
    status: "present",
  },
  {
    id: "s2",
    name: "Michael Johnson",
    email: "m.johnson@school.edu",
    avatarUrl: "",
    studentId: "#ST-2024-08",
    grade: "B-",
    gradePct: 81,
    status: "late",
  },
  {
    id: "s3",
    name: "David Chen",
    email: "d.chen@school.edu",
    avatarUrl: "",
    studentId: "#ST-2024-12",
    grade: "C",
    gradePct: 74,
    status: "absent",
  },
  {
    id: "s4",
    name: "Sophia Rodriguez",
    email: "s.rodriguez@school.edu",
    avatarUrl: "",
    studentId: "#ST-2024-04",
    grade: "A-",
    gradePct: 90,
    status: "present",
  },
  {
    id: "s5",
    name: "Liam Patel",
    email: "l.patel@school.edu",
    avatarUrl: "",
    studentId: "#ST-2024-15",
    grade: "B+",
    gradePct: 87,
    status: "present",
  },
  {
    id: "s6",
    name: "Olivia Brown",
    email: "o.brown@school.edu",
    avatarUrl: "",
    studentId: "#ST-2024-19",
    grade: "B",
    gradePct: 83,
    status: "present",
  },
];

export const gradeDistribution = [
  { letter: "A", count: 8 },
  { letter: "B", count: 14 },
  { letter: "C", count: 7 },
  { letter: "D", count: 2 },
  { letter: "F", count: 1 },
];
