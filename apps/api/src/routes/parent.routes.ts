import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import * as ParentController from '../controllers/parent.controller';

const router = Router();

// Protect all routes and allow only parents
router.use(authenticateJWT, authorizeRoles('parent'));

// Dashboard & Profile
router.get('/dashboard', ParentController.getDashboard);
router.get('/profile', ParentController.getProfile);
router.put('/profile', ParentController.updateProfile);

// Security & Preferences
router.patch('/change-password', ParentController.changePassword);
router.patch('/preferences', ParentController.updatePreferences);

// Student Monitoring
router.get('/student/progress', ParentController.getStudentProgress);
router.get('/student/report', ParentController.getReport);
router.get('/student/activities', ParentController.getActivities);

// Link student
router.post('/link-student', ParentController.linkStudent);

// Notifications
router.get('/notifications', ParentController.getNotifications);
router.patch('/notifications/:id', ParentController.markNotificationRead);

export default router;
