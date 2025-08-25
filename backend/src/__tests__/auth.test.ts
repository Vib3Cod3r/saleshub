import request from 'supertest';
import { app } from '../index';
import { generateToken, hashPassword } from '../utils/auth';

// Mock external dependencies
jest.mock('../config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
  },
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Authentication API Endpoints', () => {
  let validToken: string;
  let expiredToken: string;

  beforeAll(() => {
    // Generate valid token
    validToken = generateToken({ userId: 'test-user', email: 'test@example.com' });
    
    // Generate expired token (you would need to mock this in a real scenario)
    expiredToken = 'expired-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'user',
      };

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      const mockUser = {
        id: 'user-123',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(null), // User doesn't exist
          create: jest.fn().mockResolvedValue(mockUser),
        },
        session: {
          create: jest.fn().mockResolvedValue({ id: 'session-123' }),
        },
      }));

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          },
          token: expect.any(String),
        },
        message: 'User registered successfully',
        timestamp: expect.any(String),
      });
    });

    it('should handle duplicate email registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        role: 'user',
      };

      // Mock Prisma to return existing user
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue({ id: 'existing-user' }),
        },
      }));

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await hashPassword('password123');
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password: hashedPassword,
        name: 'Test User',
        role: 'user',
        isActive: true,
      };

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
        },
        session: {
          create: jest.fn().mockResolvedValue({ id: 'session-123' }),
        },
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should handle invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await hashPassword('correctpassword');
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password: hashedPassword,
        name: 'Test User',
        role: 'user',
        isActive: true,
      };

      // Mock Prisma to return user with different password
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
        },
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should handle non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Mock Prisma to return null (user doesn't exist)
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        session: {
          delete: jest.fn().mockResolvedValue({ id: 'session-123' }),
        },
      }));

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token is required');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
        },
        session: {
          findUnique: jest.fn().mockResolvedValue({ id: 'session-123' }),
          update: jest.fn().mockResolvedValue({ id: 'session-123' }),
        },
      }));

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should handle invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
        },
      }));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(mockUser.id);
      expect(response.body.data.user.email).toBe(mockUser.email);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token is required');
    });
  });

  describe('Authentication Middleware Integration', () => {
    it('should allow access to protected routes with valid token', async () => {
      // Mock search service
      const mockSearchResults = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        metadata: { searchTime: 50, totalResults: 0, entityCounts: {}, query: {} },
      };

      const searchService = require('../services/search').searchService;
      jest.spyOn(searchService, 'search').mockResolvedValue(mockSearchResults);

      const response = await request(app)
        .post('/api/search')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ text: 'test', entities: ['Contact'] })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access to protected routes without token', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({ text: 'test', entities: ['Contact'] })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token is required');
    });

    it('should deny access to protected routes with invalid token', async () => {
      const response = await request(app)
        .post('/api/search')
        .set('Authorization', 'Bearer invalid-token')
        .send({ text: 'test', entities: ['Contact'] })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('Session Management', () => {
    it('should create session on login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await hashPassword('password123');
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password: hashedPassword,
        name: 'Test User',
        role: 'user',
        isActive: true,
      };

      const mockSession = { id: 'session-123', userId: mockUser.id };

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
        },
        session: {
          create: jest.fn().mockResolvedValue(mockSession),
        },
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify session was created
      const mockSessionCreate = mockPrisma().session.create;
      expect(mockSessionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
        }),
      });
    });

    it('should delete session on logout', async () => {
      const mockSession = { id: 'session-123' };

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        session: {
          delete: jest.fn().mockResolvedValue(mockSession),
        },
      }));

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify session was deleted
      const mockSessionDelete = mockPrisma().session.delete;
      expect(mockSessionDelete).toHaveBeenCalled();
    });
  });

  describe('Password Security', () => {
    it('should hash passwords on registration', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'user',
      };

      const mockUser = {
        id: 'user-123',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(mockUser),
        },
        session: {
          create: jest.fn().mockResolvedValue({ id: 'session-123' }),
        },
      }));

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify password was hashed
      const mockUserCreate = mockPrisma().user.create;
      expect(mockUserCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: expect.not.stringMatching(userData.password), // Should be hashed
        }),
      });
    });

    it('should validate password strength', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: '123', // Too short
        name: 'Test User',
        role: 'user',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Mock Prisma to throw error
      const mockPrisma = require('@prisma/client').PrismaClient;
      mockPrisma.mockImplementation(() => ({
        user: {
          findUnique: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        },
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Internal server error');
    });

    it('should handle malformed request bodies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid request body');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }) // Missing password
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on auth endpoints', async () => {
      // Make multiple requests quickly
      const requests = Array(11).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' })
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(res => res.status === 429);

      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse?.body.message).toContain('Too many requests');
    });
  });
});
