import { Request, Response } from 'express';
import * as DashboardService from '../services/dashboard.service';

export const getProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const progress = await DashboardService.getProgress(userId);
    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const dashboard = await DashboardService.getDashboardData(userId);
    res.status(200).json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifications = await DashboardService.getNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    const notification = await DashboardService.markNotificationRead(userId, parseInt(id, 10));
    res.status(200).json(notification);
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const linkParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { parentEmail, parentName } = req.body;
    const profile = await DashboardService.linkParent(userId, parentEmail, parentName);
    res.status(200).json(profile);
  } catch (error: any) {
    if (error.message === 'parentEmail and parentName are required') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error linking parent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await DashboardService.getProfile(userId);
    res.status(200).json(profile);
  } catch (error: any) {
    if (error.message === 'Profile not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { studentInfo, schoolPreference } = req.body;
    const profile = await DashboardService.updateProfile(userId, studentInfo, schoolPreference);
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
