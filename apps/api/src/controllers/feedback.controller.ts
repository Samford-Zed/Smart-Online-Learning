import { Request, Response } from 'express';
import * as FeedbackModel from '../models/feedback.model';

export const getThreads = async (req: Request, res: Response) => {
  try {
    const teacherId = req.auth?.userId;
    if (!teacherId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const threads = await FeedbackModel.getFeedbackThreadsForTeacher(Number(teacherId));
    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch feedback threads', details: error.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const teacherId = req.auth?.userId;
    if (!teacherId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const stats = await FeedbackModel.getFeedbackStatsForTeacher(Number(teacherId));
    res.json({
      totalReceived: Number(stats.totalReceived || 0),
      pending: Number(stats.pending || 0),
      averageRating: Number(stats.averageRating || 0)
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch feedback stats', details: error.message });
  }
};

export const sendReply = async (req: Request, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);
    const teacherId = req.auth?.userId;
    const { body } = req.body;
    
    if (!teacherId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!body) {
      res.status(400).json({ error: 'Body is required' });
      return;
    }
    
    await FeedbackModel.addFeedbackReply(feedbackId, Number(teacherId), body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add reply', details: error.message });
  }
};

export const resolveThread = async (req: Request, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);
    await FeedbackModel.updateFeedbackStatus(feedbackId, 'replied'); // Use replied for resolved
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to resolve thread', details: error.message });
  }
};
