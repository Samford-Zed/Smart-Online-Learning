import * as ResourceModel from '../models/resource.model';

export const getResources = async (subject?: string, type?: string, page: number = 1, limit: number = 8) => {
  return await ResourceModel.getResources(subject, type, page, limit);
};

export const getRecentResources = async (userId: string) => {
  return await ResourceModel.getRecentResources(userId);
};

export const getResourceSubjects = async () => {
  return await ResourceModel.getResourceSubjects();
};

export const requestResource = async (userId: string, title: string, subject: string, description: string) => {
  return await ResourceModel.requestResource(userId, title, subject, description);
};

export const getTeacherResources = async (teacherId: number) => {
  return await ResourceModel.getTeacherResources(teacherId);
};

export const createTeacherResource = async (teacherId: number, data: any) => {
  return await ResourceModel.createTeacherResource(teacherId, data);
};
