import * as DashboardModel from '../models/dashboard.model';
import * as StudentModel from '../models/student.model';

export const getProgress = async (userId: number) => {
  return await DashboardModel.getProgressSummary(userId);
};

export const getDashboardData = async (userId: number) => {
  const grade = await StudentModel.getStudentGrade(userId);
  const subjects = grade ? await StudentModel.getSubjectsByGrade(grade) : [];
  const progress = await DashboardModel.getProgressSummary(userId);
  const recentActivity = await DashboardModel.getRecentActivity(userId);

  return {
    subjects,
    progress,
    recentActivity
  };
};

export const getNotifications = async (userId: number) => {
  return await DashboardModel.getNotifications(userId);
};

export const markNotificationRead = async (userId: number, notificationId: number) => {
  const notification = await DashboardModel.markNotificationRead(userId, notificationId);
  if (!notification) throw new Error('Notification not found');
  return notification;
};

export const linkParent = async (userId: number, parentEmail: string, parentName: string) => {
  if (!parentEmail || !parentName) {
    throw new Error('parentEmail and parentName are required');
  }
  return await DashboardModel.linkParent(userId, parentEmail, parentName);
};

export const getProfile = async (userId: number) => {
  const profile = await DashboardModel.getProfile(userId);
  if (!profile) throw new Error('Profile not found');
  return profile;
};

export const updateProfile = async (userId: number, studentInfo: any, schoolPreference: any) => {
  // If grade is being updated, we must ensure it doesn't break existing enrollments conceptually, 
  // but for now we just merge JSON
  return await DashboardModel.updateProfile(userId, studentInfo, schoolPreference);
};
