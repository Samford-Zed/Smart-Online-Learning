import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/teacher';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTeacherDashboard = async () => {
  const res = await api.get('/dashboard');
  return res.data;
};

export const getMyClasses = async () => {
  const res = await api.get('/classes');
  return res.data;
};

export const getClassDetails = async (slug: string) => {
  const res = await api.get(`/classes/${slug}`);
  return res.data;
};

export const getClassStudents = async (slug: string) => {
  const res = await api.get(`/classes/${slug}/students`);
  return res.data;
};

export const getClassLessons = async (slug: string) => {
  const res = await api.get(`/classes/${slug}/lessons`);
  return res.data;
};

export const getClassAssignments = async (slug: string) => {
  const res = await api.get(`/classes/${slug}/assignments`);
  return res.data;
};

export const createLesson = async (slug: string, data: any) => {
  const res = await api.post(`/classes/${slug}/lessons`, data);
  return res.data;
};

export const getAssignments = async () => {
  const res = await api.get('/assignments');
  return res.data;
};

export const createAssignment = async (data: any) => {
  const res = await api.post('/assignments', data);
  return res.data;
};

export const getSubmissions = async (assignmentId: string) => {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
};

export const gradeSubmission = async (submissionId: string, score: number, feedback: string) => {
  const res = await api.put(`/submissions/${submissionId}/grade`, { score, feedback });
  return res.data;
};

export const getStudentProgress = async (studentId: string) => {
  const res = await api.get(`/students/${studentId}/progress`);
  return res.data;
};

export const getFeedback = async () => {
  const res = await api.get('/feedback');
  return res.data;
};

export const getFeedbackStats = async () => {
  const res = await api.get('/feedback/stats');
  return res.data;
};

export const replyFeedback = async (id: string, body: string) => {
  const res = await api.post(`/feedback/${id}/reply`, { body });
  return res.data;
};

export const resolveFeedback = async (id: string) => {
  const res = await api.patch(`/feedback/${id}/resolve`);
  return res.data;
};

export const getResources = async () => {
  const res = await api.get('/resources');
  return res.data;
};

export const addResource = async (data: any) => {
  const res = await api.post('/resources', data);
  return res.data;
};

export const getTeacherStudents = async () => {
  const res = await api.get('/students');
  return res.data;
};
