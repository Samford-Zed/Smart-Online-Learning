import { Request, Response } from 'express';
import * as DiscussionService from '../services/discussion.service';

export const addMessage = async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.lessonId as string, 10);
    const { message } = req.body;
    const userId = req.auth?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const discussionMessage = await DiscussionService.addMessage(lessonId, userId, message);
    res.status(201).json(discussionMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.lessonId as string, 10);
    const messages = await DiscussionService.getMessages(lessonId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
