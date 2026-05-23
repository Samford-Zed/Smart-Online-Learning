import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = express.Router();

// Universal universal register and login endpoints
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authenticateJWT, AuthController.getMe);
router.put('/me', authenticateJWT, AuthController.updateMe);

export default router;
