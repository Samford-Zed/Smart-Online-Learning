import { Router } from 'express';
import * as TeacherController from '../controllers/teacher.controller';
import * as FeedbackController from '../controllers/feedback.controller';
import * as ResourceController from '../controllers/resource.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();

// Apply auth middleware to all teacher routes
router.use(authenticateJWT);
router.use(authorizeRoles('teacher'));

router.get('/dashboard', TeacherController.getTeacherDashboard);
router.get('/classes', TeacherController.getMyClasses);
router.get('/students', TeacherController.getAllTeacherStudents);

router.get('/classes/:slug', TeacherController.getClassDetails);
router.get('/classes/:slug/students', TeacherController.getClassStudents);
router.get('/classes/:slug/lessons', TeacherController.getClassLessons);
router.get('/classes/:slug/assignments', TeacherController.getClassAssignments);

router.post('/classes/:slug/lessons', TeacherController.createLesson);

router.get('/assignments', TeacherController.getAssignments);
router.post('/assignments', TeacherController.createAssignment);

router.get('/assignments/:id/submissions', TeacherController.getSubmissions);
router.put('/submissions/:id/grade', TeacherController.gradeSubmission);

router.get('/students/:id/progress', TeacherController.getStudentProgress);

// Feedback routes
router.get('/feedback', FeedbackController.getThreads);
router.get('/feedback/stats', FeedbackController.getStats);
router.post('/feedback/:id/reply', FeedbackController.sendReply);
router.patch('/feedback/:id/resolve', FeedbackController.resolveThread);

// Resource routes
router.get('/resources', ResourceController.getTeacherResources);
router.post('/resources', ResourceController.createTeacherResource);

export default router;
