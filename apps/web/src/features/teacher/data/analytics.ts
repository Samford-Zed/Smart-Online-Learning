export type TrendRange = "4w" | "6w";

export type TrendPoint = { label: string; value: number };

export const analyticsKpis = {
  avgGrade: 84.5,
  avgGradeDelta: 2.4,
  attendance: 96.2,
  attendanceDelta: 0,
  completion: 89.1,
  completionDelta: -1.2,
};

export const performanceTrend: Record<TrendRange, TrendPoint[]> = {
  "4w": [
    { label: "W1", value: 78 },
    { label: "W2", value: 82 },
    { label: "W3", value: 80 },
    { label: "W4", value: 85 },
  ],
  "6w": [
    { label: "W1", value: 76 },
    { label: "W2", value: 79 },
    { label: "W3", value: 82 },
    { label: "W4", value: 81 },
    { label: "W5", value: 86 },
    { label: "W6", value: 88 },
  ],
};

export const gradeDistribution = [
  { letter: "A", percent: 35, cls: "bg-indigo-500" },
  { letter: "B", percent: 40, cls: "bg-indigo-400" },
  { letter: "C", percent: 15, cls: "bg-indigo-300" },
  { letter: "D/F", percent: 10, cls: "bg-rose-400" },
];

export type RosterStatus = "on_track" | "at_risk" | "excelling";

export type RosterStudent = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  grade: number;
  attendance: number;
  completion: number;
  status: RosterStatus;
};

export const rosterStudents: RosterStudent[] = [
  {
    id: "rs1",
    name: "Emma Watson",
    email: "emma.w@school.edu",
    avatar: "",
    grade: 94,
    attendance: 98,
    completion: 96,
    status: "excelling",
  },
  {
    id: "rs2",
    name: "Liam Johnson",
    email: "l.johnson@school.edu",
    avatar: "",
    grade: 81,
    attendance: 92,
    completion: 88,
    status: "on_track",
  },
  {
    id: "rs3",
    name: "Olivia Brown",
    email: "o.brown@school.edu",
    avatar: "",
    grade: 73,
    attendance: 84,
    completion: 71,
    status: "at_risk",
  },
  {
    id: "rs4",
    name: "Noah Davis",
    email: "n.davis@school.edu",
    avatar: "",
    grade: 88,
    attendance: 95,
    completion: 90,
    status: "on_track",
  },
  {
    id: "rs5",
    name: "Sophia Rodriguez",
    email: "s.rodriguez@school.edu",
    avatar: "",
    grade: 91,
    attendance: 97,
    completion: 93,
    status: "excelling",
  },
  {
    id: "rs6",
    name: "David Chen",
    email: "d.chen@school.edu",
    avatar: "",
    grade: 58,
    attendance: 72,
    completion: 60,
    status: "at_risk",
  },
];
