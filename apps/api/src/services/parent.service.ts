import * as ParentModel from '../models/parent.model';
import { pool } from '../db/index';

export const getDashboardData = async (parentId: number) => {
  const child = await ParentModel.getLinkedStudent(parentId);
  if (!child) return null;

  const parentName = await ParentModel.getParentName(parentId);
  const summary = await ParentModel.getChildSummary(child.id);
  const currentSubjects = await ParentModel.getChildSubjects(child.id);
  const recentActivity = await ParentModel.getRecentActivity(child.id);

  // Generate a quick progress overview sentence
  const overallProgress = currentSubjects.length > 0 
    ? Math.round(currentSubjects.reduce((acc, s) => acc + s.progress, 0) / currentSubjects.length) 
    : 0;
  const progressSummary = `${child.fullName} is performing well with an overall progress of ${overallProgress}% across all subjects.`;

  return {
    parentName,
    child,
    summary: {
      ...summary,
      progressSummary
    },
    currentSubjects,
    recentActivity
  };
};

export const getStudentProgress = async (parentId: number, period: string) => {
  const child = await ParentModel.getLinkedStudent(parentId);
  if (!child) return null;

  return await ParentModel.getStudentProgress(child.id, period);
};

export const getStudentActivities = async (parentId: number, filters: any) => {
  const child = await ParentModel.getLinkedStudent(parentId);
  if (!child) return [];

  // Implement filtering based on filters object
  const activities = await ParentModel.getRecentActivity(child.id);
  return activities;
};

export const getReport = async (parentId: number, semester: string) => {
  const child = await ParentModel.getLinkedStudent(parentId);
  if (!child) return null;

  return await ParentModel.getReportCard(child.id, semester);
};

export const getProfile = async (parentId: number) => {
  const result = await pool.query(
    'SELECT id, full_name as "fullName", email, role FROM users WHERE id = $1',
    [parentId]
  );
  return result.rows[0];
};

export const getNotifications = async (parentId: number) => {
  const result = await pool.query(
    'SELECT id, message, type, is_read as "isRead", created_at as "timestamp" FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [parentId]
  );
  return result.rows;
};

export const linkStudentByEmail = async (parentId: number, studentEmail: string) => {
  const studentResult = await pool.query(
    "SELECT id FROM users WHERE email = $1 AND role = 'student'",
    [studentEmail]
  );
  const studentId = studentResult.rows.length > 0 ? studentResult.rows[0].id : null;

  // Check if link already exists
  const existing = await pool.query(
    'SELECT id FROM parent_student_links WHERE parent_id = $1',
    [parentId]
  );
  if (existing.rows.length > 0) {
    // Update existing link
    await pool.query(
      'UPDATE parent_student_links SET student_email = $1, student_id = $2 WHERE parent_id = $3',
      [studentEmail, studentId, parentId]
    );
  } else {
    await pool.query(
      'INSERT INTO parent_student_links (parent_id, student_email, student_id) VALUES ($1, $2, $3)',
      [parentId, studentEmail, studentId]
    );
  }
};

export const markNotificationRead = async (parentId: number, notificationId: number) => {
  await pool.query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
    [notificationId, parentId]
  );
};

export const updateProfile = async (parentId: number, data: { fullName?: string; email?: string }) => {
  if (data.fullName && data.email) {
    await pool.query(
      'UPDATE users SET full_name = $1, email = $2 WHERE id = $3',
      [data.fullName, data.email, parentId]
    );
  } else if (data.fullName) {
    await pool.query(
      'UPDATE users SET full_name = $1 WHERE id = $2',
      [data.fullName, parentId]
    );
  } else if (data.email) {
    await pool.query(
      'UPDATE users SET email = $1 WHERE id = $2',
      [data.email, parentId]
    );
  }
};
