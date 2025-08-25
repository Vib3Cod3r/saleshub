import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler } from '@/middleware/errorHandler';
import { sendSuccess, sendCreated, sendBadRequest, sendNotFound, sendInternalError } from '@/utils/response';
import { generateToken, verifyPassword, hashPassword, validatePassword } from '@/utils/auth';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8)
});

// Types
interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  mobile?: string;
  timezone?: string;
  locale?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });

  if (existingUser) {
    sendBadRequest(res, 'User with this email already exists');
    return;
  }

  // Validate password
  const passwordValidation = validatePassword(validatedData.password);
  if (!passwordValidation.isValid) {
    sendBadRequest(res, `Password validation failed: ${passwordValidation.errors.join(', ')}`);
    return;
  }

  // Get default role (SALES role)
  const defaultRole = await prisma.userRole.findFirst({
    where: { name: 'SALES' }
  });

  if (!defaultRole) {
    sendInternalError(res, 'Default role not found');
    return;
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      username: validatedData.username,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      middleName: validatedData.middleName,
      jobTitle: validatedData.jobTitle,
      department: validatedData.department,
      phone: validatedData.phone,
      mobile: validatedData.mobile,
      timezone: validatedData.timezone,
      locale: validatedData.locale,
      roleId: defaultRole.id
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      middleName: true,
      jobTitle: true,
      department: true,
      phone: true,
      mobile: true,
      avatar: true,
      timezone: true,
      locale: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      roleId: true
    }
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateToken(user);

  const response: LoginResponse = {
    user: user as any,
    accessToken,
    refreshToken
  };

  sendCreated(res, response, 'User registered successfully');
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      firstName: true,
      lastName: true,
      middleName: true,
      jobTitle: true,
      department: true,
      phone: true,
      mobile: true,
      avatar: true,
      timezone: true,
      locale: true,
      isActive: true,
      lastLoginAt: true,
      passwordChangedAt: true,
      createdAt: true,
      updatedAt: true,
      roleId: true
    }
  });

  if (!user) {
    sendBadRequest(res, 'Invalid email or password');
    return;
  }

  if (!user.isActive) {
    sendBadRequest(res, 'Account is deactivated');
    return;
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    sendBadRequest(res, 'Invalid email or password');
    return;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateToken(user);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  const response: LoginResponse = {
    user: userWithoutPassword as any,
    accessToken,
    refreshToken
  };

  sendSuccess(res, response, 'Login successful');
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    sendBadRequest(res, 'User ID not found');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      middleName: true,
      jobTitle: true,
      department: true,
      phone: true,
      mobile: true,
      avatar: true,
      timezone: true,
      locale: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      roleId: true
    }
  });

  if (!user) {
    sendNotFound(res, 'User not found');
    return;
  }

  sendSuccess(res, user, 'Profile retrieved successfully');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const validatedData = updateProfileSchema.parse(req.body);

  if (!userId) {
    sendBadRequest(res, 'User ID not found');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    sendNotFound(res, 'User not found');
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: validatedData,
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      middleName: true,
      jobTitle: true,
      department: true,
      phone: true,
      mobile: true,
      avatar: true,
      timezone: true,
      locale: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      roleId: true
    }
  });

  sendSuccess(res, updatedUser, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  if (!userId) {
    sendBadRequest(res, 'User ID not found');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true }
  });

  if (!user) {
    sendNotFound(res, 'User not found');
    return;
  }

  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    sendBadRequest(res, 'Current password is incorrect');
    return;
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    sendBadRequest(res, `Password validation failed: ${passwordValidation.errors.join(', ')}`);
    return;
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
      passwordChangedAt: new Date()
    }
  });

  // Generate new tokens
  const { accessToken, refreshToken } = await generateToken({
    id: user.id,
    email: '', // We don't have email in this context, but it's not used in generateToken
    roleId: 'default-role'
  });

  const response = {
    accessToken,
    refreshToken,
    message: 'Password changed successfully'
  };

  sendSuccess(res, response, 'Password changed successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage
  // However, you could implement a token blacklist here if needed
  
  sendSuccess(res, { message: 'Logged out successfully' }, 'Logged out successfully');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    sendBadRequest(res, 'Refresh token is required');
    return;
  }

  try {
    // This would need to be implemented in auth utils
    // For now, we'll return an error
    sendBadRequest(res, 'Token refresh not implemented yet');
  } catch (error) {
    logger.error('Token refresh error:', error);
    sendBadRequest(res, 'Invalid refresh token');
  }
});
