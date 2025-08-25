import { Request, Response } from 'express';
import { z } from 'zod';
import { CollaborativeDocumentService, DocumentOperation } from '../services/collaboration/CollaborativeDocumentService';
import { WebSocketServer } from '../config/websocket';
import { logger } from '../utils/logger';

// Validation schemas
const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().default(''),
  participants: z.array(z.string()).optional()
});

const applyOperationSchema = z.object({
  type: z.enum(['insert', 'delete']),
  position: z.number().min(0),
  text: z.string().optional(),
  length: z.number().min(1).optional()
});

const updateCursorSchema = z.object({
  cursorPosition: z.number().min(0),
  selectionStart: z.number().min(0).optional(),
  selectionEnd: z.number().min(0).optional()
});

export class CollaborativeDocumentController {
  private collaborativeDocumentService: CollaborativeDocumentService;

  constructor(wsServer: WebSocketServer) {
    this.collaborativeDocumentService = new CollaborativeDocumentService(wsServer);
  }

  /**
   * Create a new collaborative document
   */
  async createDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const validatedData = createDocumentSchema.parse(req.body);
      const { title, content, participants = [] } = validatedData;

      // Create document
      const document = await this.collaborativeDocumentService.createDocument(
        title,
        content,
        userId,
        participants
      );

      return res.status(201).json({
        success: true,
        data: {
          document,
          participants: document.participants
        },
        message: 'Collaborative document created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Create document validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Create document error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create collaborative document',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Join a collaborative document session
   */
  async joinDocumentSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { documentId } = req.params;

      // Join document session
      const document = await this.collaborativeDocumentService.joinDocumentSession(documentId, userId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Document not found',
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: {
          document,
          participants: document.participants
        },
        message: 'Joined document session successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Join document session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to join document session',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Apply operation to document
   */
  async applyOperation(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { documentId } = req.params;
      const validatedData = applyOperationSchema.parse(req.body);

      // Apply operation
      const result = await this.collaborativeDocumentService.applyOperation(documentId, {
        ...validatedData,
        userId
      });

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Document not found or user not in session',
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: {
          operation: result.transformedOperation,
          document: result.document
        },
        message: 'Operation applied successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Apply operation validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Apply operation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to apply operation',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update cursor position
   */
  async updateCursorPosition(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { documentId } = req.params;
      const validatedData = updateCursorSchema.parse(req.body);

      // Update cursor position
      await this.collaborativeDocumentService.updateCursorPosition(
        documentId,
        userId,
        validatedData.cursorPosition,
        validatedData.selectionStart,
        validatedData.selectionEnd
      );

      return res.json({
        success: true,
        data: {
          message: 'Cursor position updated successfully'
        },
        message: 'Cursor position updated',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Update cursor validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Update cursor position error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update cursor position',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { documentId } = req.params;

      // Get document
      const document = await this.collaborativeDocumentService.getDocument(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Document not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is a participant
      if (!document.participants.includes(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied to this document',
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: {
          document,
          participants: document.participants
        },
        message: 'Document retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get document error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get document',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user's documents
   */
  async getUserDocuments(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      // Get user's documents
      const documents = await this.collaborativeDocumentService.getUserDocuments(userId);

      return res.json({
        success: true,
        data: {
          documents,
          count: documents.length
        },
        message: `Found ${documents.length} documents`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get user documents error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get user documents',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get document participants
   */
  async getDocumentParticipants(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { documentId } = req.params;

      // Get document participants
      const participants = this.collaborativeDocumentService.getDocumentParticipants(documentId);

      return res.json({
        success: true,
        data: {
          participants,
          count: participants.length
        },
        message: `Found ${participants.length} participants`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get document participants error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get document participants',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Leave document session
   */
  async leaveDocumentSession(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { documentId } = req.params;

      // Leave document session
      await this.collaborativeDocumentService.leaveDocumentSession(documentId, userId);

      return res.json({
        success: true,
        data: {
          message: 'Left document session successfully'
        },
        message: 'Left document session',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Leave document session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to leave document session',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clean up inactive sessions
   */
  async cleanupInactiveSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      // Clean up inactive sessions
      await this.collaborativeDocumentService.cleanupInactiveSessions();

      return res.json({
        success: true,
        data: {
          message: 'Inactive sessions cleaned up successfully'
        },
        message: 'Cleanup completed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Cleanup inactive sessions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to cleanup inactive sessions',
        timestamp: new Date().toISOString()
      });
    }
  }
}
