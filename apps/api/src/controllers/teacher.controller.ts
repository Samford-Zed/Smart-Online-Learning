import { Request, Response } from 'express';
import * as TeacherModel from '../models/teacher.model';

export const getTeacherDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const classes = await TeacherModel.getTeacherClasses(userId);
    const statsInfo = await TeacherModel.getTeacherStats(userId);
    const pendingFeedback = await TeacherModel.getDashboardFeedback(userId);
    const students = await TeacherModel.getAllTeacherStudents(userId);

    res.json({
      classes,
      stats: {
        totalStudents: classes.reduce((sum: number, c: any) => sum + parseInt(c.studentCount || "0"), 0),
        activeClasses: classes.length,
        pendingGrades: statsInfo.pendingGrades,
        upcomingClasses: statsInfo.upcomingClasses,
      },
      pendingFeedback,
      students
    });
  } catch (error) {
    console.error("Dashboard error: ", error);
    res.status(500).json({ error: 'Failed to fetch dashboard', details: String(error) });
  }
};

export const getAllTeacherStudents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const students = await TeacherModel.getAllTeacherStudents(userId);
    res.json(students);
  } catch (error) {
    console.error("Fetch students error: ", error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getMyClasses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const classes = await TeacherModel.getTeacherClasses(userId);
    res.json(classes);
  } catch (error) {
    console.error("Fetch classes error: ", error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

export const getClassDetails = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const details = await TeacherModel.getClassDetails(slug);
    if (!details) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(details);
  } catch (error) {
    console.error("Fetch class details error: ", error);
    res.status(500).json({ error: 'Failed to fetch class details' });
  }
};

export const getClassStudents = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const students = await TeacherModel.getClassStudents(slug);
    res.json(students);
  } catch (error) {
    console.error("Fetch class students error: ", error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getClassLessons = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const lessons = await TeacherModel.getClassLessons(slug);
    res.json(lessons);
  } catch (error) {
    console.error("Fetch class lessons error: ", error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

export const getClassAssignments = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const assignments = await TeacherModel.getClassAssignments(slug);
    res.json(assignments);
  } catch (error) {
    console.error("Fetch class assignments error: ", error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const lesson = await TeacherModel.createLesson(slug, req.body);
    res.json(lesson);
  } catch (error) {
    console.error("Create lesson error: ", error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const assignments = await TeacherModel.getTeacherAssignments(userId);
    res.json(assignments);
  } catch (error) {
    console.error("Fetch assignments error: ", error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await TeacherModel.createAssignment(req.body);
    res.json(assignment);
  } catch (error) {
    console.error("Create assignment error: ", error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submissions = await TeacherModel.getSubmissions(id);
    res.json(submissions);
  } catch (error) {
    console.error("Fetch submissions error: ", error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;
    await TeacherModel.gradeSubmission(id, score, feedback);
    res.json({ message: 'Graded successfully' });
  } catch (error) {
    console.error("Grade submission error: ", error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
};

export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const progress = await TeacherModel.getStudentProgress(id);
    res.json(progress);
  } catch (error) {
    console.error("Fetch student progress error: ", error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};
