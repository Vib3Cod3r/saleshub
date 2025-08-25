import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { extractTokenFromHeader, verifyToken } from '@/utils/auth';
import { sendUnauthorized } from '@/utils/response';
import { JWTPayload } from '@/types';

// Simple session data interface
interface SessionData {
  id: string;
  userId: string;
  lastActivity: string;
  createdAt: string;
}

// Extend Request interface to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { session?: SessionData };
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      sendUnauthorized(res, 'Access token is required');
      return;
    }

    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendUnauthorized(res, 'Invalid or expired token');
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = await verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.roleId)) {
      sendUnauthorized(res, 'Insufficient permissions');
      return;
    }

    next();
  };
}

export function requireOwnership(field: string = 'ownerId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    const resourceOwnerId = req.params[field] || req.body[field];
    
    if (resourceOwnerId && resourceOwnerId !== req.user.userId) {
      sendUnauthorized(res, 'Access denied to this resource');
      return;
    }

    next();
  };
}
