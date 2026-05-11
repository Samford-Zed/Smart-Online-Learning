import { Request, Response } from 'express';
import * as InteractionService from '../services/interaction.service';

export const getQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = parseInt(req.params.id as string, 10);
    const quiz = await InteractionService.getQuiz(userId, id);
    res.status(200).json(quiz);
  } catch (error: any) {
    if (error.message === 'Quiz not found' || error.message === 'Grade not found for student' || error.message === 'Lesson not found' || error.message === 'Subject not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Unauthorized access to content from another grade') {
      res.status(403).json({ error: error.message });
      return;
    }
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = parseInt(req.params.id as string, 10);
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      res.status(400).json({ error: 'answers must be an array' });
      return;
    }

    // Convert questionId strings to numbers in answers array
    const parsedAnswers = answers.map((ans: any) => ({
      questionId: parseInt(ans.questionId, 10),
      selectedOption: ans.selectedOption
    }));

    const result = await InteractionService.submitQuiz(userId, id, parsedAnswers);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Quiz not found' || error.message === 'Grade not found for student' || error.message === 'Lesson not found' || error.message === 'Subject not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Unauthorized access to content from another grade') {
      res.status(403).json({ error: error.message });
      return;
    }
    if (error.message === 'Maximum attempts reached for this quiz' || error.message.startsWith('Invalid question ID')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Usually assignments are per lesson
    const lessonId = parseInt(req.query.lessonId as string, 10);
    if (isNaN(lessonId)) {
      res.status(400).json({ error: 'lessonId query parameter is required and must be a number' });
      return;
    }

    const assignments = await InteractionService.getAssignments(userId, lessonId);
    res.status(200).json(assignments);
  } catch (error: any) {
    if (error.message === 'Grade not found for student' || error.message === 'Lesson not found' || error.message === 'Subject not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Unauthorized access to content from another grade') {
      res.status(403).json({ error: error.message });
      return;
    }
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = parseInt(req.params.id as string, 10);
    const { content, fileUrl } = req.body;

    const submission = await InteractionService.submitAssignment(userId, id, content, fileUrl);
    res.status(201).json(submission);
  } catch (error: any) {
    if (error.message === 'Assignment not found' || error.message === 'Grade not found for student' || error.message === 'Lesson not found' || error.message === 'Subject not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Unauthorized access to content from another grade') {
      res.status(403).json({ error: error.message });
      return;
    }
    if (error.message === 'Must provide either content or fileUrl') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVideoProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = parseInt(req.params.id as string, 10);
    const { watchedDuration, isCompleted } = req.body;

    if (typeof watchedDuration !== 'number' || typeof isCompleted !== 'boolean') {
      res.status(400).json({ error: 'watchedDuration (number) and isCompleted (boolean) are required' });
      return;
    }

    const progress = await InteractionService.updateVideoProgress(userId, id, watchedDuration, isCompleted);
    res.status(200).json(progress);
  } catch (error: any) {
    if (error.message === 'Video not found' || error.message === 'Grade not found for student' || error.message === 'Lesson not found' || error.message === 'Subject not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Unauthorized access to content from another grade') {
      res.status(403).json({ error: error.message });
      return;
    }
    console.error('Error updating video progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
