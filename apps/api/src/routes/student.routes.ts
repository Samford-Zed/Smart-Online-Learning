import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import * as StudentController from '../controllers/student.controller';
import * as DashboardController from '../controllers/dashboard.controller';
import { upload } from '../lib/upload';

const router = Router();

// Protect all routes and allow only students
router.use(authenticateJWT, authorizeRoles('student'));

// PROFILE & PROGRESS
router.get('/profile', DashboardController.getProfile);
router.get('/progress', DashboardController.getProgress);

// 1. COURSES MODULE
router.get('/classes', StudentController.getClasses);
router.get('/subjects', StudentController.getClasses); // Alias for subjects
router.get('/classes/:slug', StudentController.getCourseDetails);
router.get('/subjects/:slug', StudentController.getCourseDetails); // Alias for course details
router.get('/classes/:slug/lessons', StudentController.getSubjectLessons);
router.get('/subjects/:slug/lessons', StudentController.getSubjectLessons); // List all lessons for subject

// 2. DASHBOARD
router.get('/progress/overview', StudentController.getProgressOverview);
router.get('/courses/current', StudentController.getCurrentCourses);
router.get('/tasks/upcoming', StudentController.getUpcomingTasks);
router.get('/grades/recent', StudentController.getRecentGrades);

// 3. LESSON PLAYER API
import * as DiscussionController from '../controllers/discussion.controller';
router.get('/classes/:slug/lessons/:lessonId', StudentController.getLesson);
router.get('/subjects/:slug/lessons/:lessonId', StudentController.getLesson); // Alias
router.patch('/classes/:slug/lessons/:lessonId/complete', StudentController.markLessonComplete);
router.patch('/subjects/:slug/lessons/:lessonId/complete', StudentController.markLessonComplete); // Alias
router.get('/classes/:slug/lessons/:lessonId/discussion', DiscussionController.getMessages);
router.get('/subjects/:slug/lessons/:lessonId/discussion', DiscussionController.getMessages); // Alias
router.post('/classes/:slug/lessons/:lessonId/discussion', DiscussionController.addMessage);
router.post('/subjects/:slug/lessons/:lessonId/discussion', DiscussionController.addMessage); // Alias

// 4. ASSIGNMENTS UPGRADE
router.get('/assignments', StudentController.getAssignments);
router.get('/assignments/:id', StudentController.getAssignment);
router.post('/assignments/:id/submit', upload.single('file'), StudentController.submitAssignment);

// QUIZZES & INTERACTIONS
import * as InteractionController from '../controllers/interaction.controller';
router.get('/quizzes/:id', InteractionController.getQuiz);
router.post('/quizzes/:id/submit', InteractionController.submitQuiz);

// LESSON MATERIALS - PDFs
router.get('/lessons/:lessonId/pdfs', async (req, res) => {
  try {
    const { pool } = await import('../db/index');
    const lessonId = parseInt(req.params.lessonId as string, 10);
    if (isNaN(lessonId)) {
      return res.status(400).json({ message: 'Invalid lessonId' });
    }
    const result = await pool.query(
      'SELECT id, title, url as "downloadUrl" FROM pdfs WHERE lesson_id = $1',
      [lessonId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PDFs', error });
  }
});

// LESSON MATERIALS - Videos
router.get('/lessons/:lessonId/videos', async (req, res) => {
  try {
    const { pool } = await import('../db/index');
    const lessonId = parseInt(req.params.lessonId as string, 10);
    if (isNaN(lessonId)) {
      return res.status(400).json({ message: 'Invalid lessonId' });
    }
    const result = await pool.query(
      'SELECT id, title, url FROM videos WHERE lesson_id = $1',
      [lessonId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error });
  }
});

// 5. BASIC GRADES MODULE
router.get('/grades', StudentController.getGrades);

// --- PHASE 2 MODULES ---

// 6. ASSESSMENTS SYSTEM
import * as AssessmentController from '../controllers/assessment.controller';
router.get('/assessments', AssessmentController.getAssessments);
router.get('/assessments/:id', AssessmentController.getAssessment);
router.post('/assessments/:id/submit', AssessmentController.submitAssessment);

// 7. SCHEDULE / CALENDAR SYSTEM
import * as ScheduleController from '../controllers/schedule.controller';
router.get('/schedule/events', ScheduleController.getEvents);
router.get('/schedule/upcoming', ScheduleController.getUpcomingEvents);
router.get('/schedule/export.ics', ScheduleController.exportIcs);

// 8. RESOURCES LIBRARY
import * as ResourceController from '../controllers/resource.controller';
router.get('/resources', ResourceController.getResources);
router.get('/resources/recent', ResourceController.getRecentResources);
router.get('/resources/subjects', ResourceController.getResourceSubjects);
router.post('/resources/request', ResourceController.requestResource);

// --- PHASE 3 MODULES ---

// 9. SETTINGS MODULE
import * as SettingsController from '../controllers/settings.controller';
router.put('/settings/password', SettingsController.updatePassword);
router.get('/settings/preferences', SettingsController.getPreferences);
router.put('/settings/preferences', SettingsController.updatePreferences);
router.get('/settings/academic', SettingsController.getAcademic);
router.put('/settings/academic', SettingsController.updateAcademic);
router.get('/settings/sessions', SettingsController.getSessions);
router.delete('/settings/sessions/:sessionId', SettingsController.deleteSession);
router.post('/settings/2fa/enable', SettingsController.enable2FA);
router.post('/settings/2fa/disable', SettingsController.disable2FA);

// 10. MESSAGING SYSTEM
import * as MessageController from '../controllers/message.controller';
router.post('/messages', MessageController.sendMessage);
router.get('/messages', MessageController.getMessages);

// 11. NOTIFICATIONS
import * as NotificationController from '../controllers/notification.controller';
router.get('/notifications', NotificationController.getNotifications);
router.patch('/notifications/:notificationId/read', NotificationController.markAsRead);

export default router;
