import { Request, Response } from 'express';
import * as StudentService from '../services/student.service';

export const getClasses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const classes = await StudentService.getClasses(userId);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error });
  }
};

export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const slug = req.params.slug as string;
    const course = await StudentService.getCourseDetails(slug, userId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details', error });
  }
};

export const getSubjectLessons = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const slug = req.params.slug as string;
    const course = await StudentService.getCourseDetails(slug, userId);
    if (!course) return res.status(404).json({ message: 'Subject not found' });

    // Flatten lessons from all modules
    const lessons = course.modules?.flatMap((module: any) =>
      module.lessons?.map((lesson: any) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title
      })) || []
    ) || [];

    res.json({
      subjectId: course.id,
      subjectTitle: course.title,
      lessons
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lessons', error });
  }
};

export const getLesson = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const slug = req.params.slug as string;
    const lessonId = parseInt(req.params.lessonId as string, 10);
    const lesson = await StudentService.getLesson(slug, lessonId, userId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson', error: (error as any).message });
  }
};

export const markLessonComplete = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const lessonId = parseInt(req.params.lessonId as string, 10);
    const { completed } = req.body;
    await StudentService.markLessonComplete(userId, lessonId, completed);
    res.json({ message: 'Lesson status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating lesson status', error });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const assignments = await StudentService.getAssignments(userId);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const id = parseInt(req.params.id as string, 10);
    const assignment = await StudentService.getAssignment(id, userId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment', error });
  }
};

export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const id = parseInt(req.params.id as string, 10);
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
    
    if (!fileUrl) return res.status(400).json({ message: 'File is required' });

    await StudentService.submitAssignment(userId, id, fileUrl);
    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting assignment', error });
  }
};

export const getGrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const grades = await StudentService.getGrades(userId);
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grades', error });
  }
};

// Dashboard Controllers
export const getProgressOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const overview = await StudentService.getProgressOverview(userId);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress overview', error });
  }
};

export const getCurrentCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const courses = await StudentService.getCurrentCourses(userId);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current courses', error });
  }
};

export const getUpcomingTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const tasks = await StudentService.getUpcomingTasks(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming tasks', error });
  }
};

export const getRecentGrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const grades = await StudentService.getRecentGrades(userId);
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent grades', error });
  }
};
