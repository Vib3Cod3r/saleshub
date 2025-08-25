import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validateBody } from '@/middleware/validation';
import { 
  loginSchema, 
  createUserSchema, 
  updateProfileSchema, 
  changePasswordSchema 
} from '@/utils/validation';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout
} from '@/controllers/authController';

const router = Router();

// Public routes
router.post('/register', validateBody(createUserSchema), register);
router.post('/login', validateBody(loginSchema), login);

// Protected routes
router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), updateProfile);
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), changePassword);
router.post('/refresh', authenticateToken, refreshToken);

// Session management routes
router.post('/logout', authenticateToken, logout);
// Session management routes removed - using JWT-based auth

export default router;
