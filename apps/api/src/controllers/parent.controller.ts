import { Request, Response } from 'express';
import * as ParentService from '../services/parent.service';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const data = await ParentService.getDashboardData(parentId);
    if (!data) return res.status(404).json({ error: 'No linked student found' });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    const { period } = req.query;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const data = await ParentService.getStudentProgress(parentId, period as string || 'semester');
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    const { period } = req.query;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const data = await ParentService.getReport(parentId, period as string || 'semester');
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const activities = await ParentService.getStudentActivities(parentId, req.query);
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const profile = await ParentService.getProfile(parentId);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await ParentService.getNotifications(parentId);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import * as SettingsService from '../services/settings.service';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    const { fullName, email } = req.body;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    await ParentService.updateProfile(parentId, { fullName, email });
    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    const { currentPassword, newPassword } = req.body;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    await SettingsService.updatePassword(parentId, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const updated = await SettingsService.updatePreferences(parentId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const linkStudent = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    const { studentEmail } = req.body;
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });
    if (!studentEmail) return res.status(400).json({ error: 'studentEmail is required' });

    await ParentService.linkStudentByEmail(parentId, studentEmail);
    res.json({ message: 'Student linked successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const parentId = req.auth?.userId;
    const id = parseInt(req.params.id as string, 10);
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    await ParentService.markNotificationRead(parentId, id);
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
