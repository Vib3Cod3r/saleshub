import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
        });
      }
    }
  };
}

// Common validation schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    search: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

// Auth validation schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'SALES_MANAGER', 'SALES_REP']).optional(),
  }),
});

// Contact validation schemas
export const createContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    companyId: z.string().optional(),
    assignedToId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    companyId: z.string().optional(),
    assignedToId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Deal validation schemas
export const createDealSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    value: z.number().positive('Value must be positive').optional(),
    currency: z.string().default('USD'),
    stage: z.enum(['LEAD', 'CONTACT_MADE', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
    probability: z.number().min(0).max(100).optional(),
    expectedCloseDate: z.string().datetime().optional(),
    contactId: z.string().min(1, 'Contact ID is required'),
    assignedToId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateDealSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    value: z.number().positive('Value must be positive').optional(),
    currency: z.string().optional(),
    stage: z.enum(['LEAD', 'CONTACT_MADE', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
    probability: z.number().min(0).max(100).optional(),
    expectedCloseDate: z.string().datetime().optional(),
    actualCloseDate: z.string().datetime().optional(),
    assignedToId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Task validation schemas
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    type: z.enum(['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'PROPOSAL', 'CONTRACT', 'OTHER']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    dueDate: z.string().datetime().optional(),
    contactId: z.string().optional(),
    dealId: z.string().optional(),
    assignedToId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    type: z.enum(['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'PROPOSAL', 'CONTRACT', 'OTHER']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    dueDate: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    contactId: z.string().optional(),
    dealId: z.string().optional(),
    assignedToId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
}); 