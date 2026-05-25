export type FeedbackStatus = "new" | "in_progress" | "replied";

export type FeedbackMessage = {
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  body: string;
};

export type FeedbackItem = {
  id: string;
  studentName: string;
  studentAvatar: string;
  studentClass: string;
  course?: string;
  subjectTag?: string;
  title: string;
  preview: string;
  time: string;
  status: FeedbackStatus;
  thread: FeedbackMessage[];
};

export const feedbackStats = {
  totalReceived: 342,
  pending: 18,
  averageRating: 4.8,
};

export const feedbackList: FeedbackItem[] = [
  {
    id: "fb1",
    studentName: "Emma Watson",
    studentAvatar: "",
    studentClass: "Grade 10 - Section A",
    course: "Physics 101",
    title: "Question about the Physics assignment",
    preview:
      "Hi Mr. Smith, I was wondering if we need to include the lab safety protocols in the...",
    time: "10 mins ago",
    status: "new",
    thread: [
      {
        authorName: "Emma Watson",
        authorAvatar: "",
        timestamp: "Today, 09:42 AM",
        body: "Hi Mr. Smith,\n\nI was working on the kinematics assignment over the weekend and got stuck on question #4. I was wondering if we need to include the lab safety protocols in the introduction or methodology section of the report?",
      },
    ],
  },
  {
    id: "fb2",
    studentName: "Liam Johnson",
    studentAvatar: "",
    studentClass: "Grade 11 - Section C",
    course: "Mathematics",
    title: "Feedback on Chapter 4 Quiz",
    preview:
      "The last two questions seemed to cover material we haven't discussed yet. Could we review thos...",
    time: "2 hours ago",
    status: "in_progress",
    thread: [
      {
        authorName: "Liam Johnson",
        authorAvatar: "",
        timestamp: "Today, 08:10 AM",
        body: "The last two questions seemed to cover material we haven't discussed yet. Could we review those topics in the next session?",
      },
    ],
  },
  {
    id: "fb3",
    studentName: "Noah Davis",
    studentAvatar: "",
    studentClass: "Grade 9 - Section B",
    course: "History",
    title: "Extension request",
    preview:
      "I have been out sick for three days, is it possible to get an extension on the history essay?",
    time: "Yesterday",
    status: "replied",
    thread: [
      {
        authorName: "Noah Davis",
        authorAvatar: "",
        timestamp: "Yesterday, 03:24 PM",
        body: "I have been out sick for three days, is it possible to get an extension on the history essay?",
      },
      {
        authorName: "Ms. Sarah",
        authorAvatar: "",
        timestamp: "Yesterday, 04:01 PM",
        body: "Hi Noah, hope you feel better soon. You can submit by Friday \u2014 I've extended the deadline.",
      },
    ],
  },
];
