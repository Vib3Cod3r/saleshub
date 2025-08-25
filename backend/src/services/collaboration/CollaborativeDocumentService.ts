import { cacheService } from '../cache';
import { logger } from '../../utils/logger';
import { WebSocketServer } from '../../config/websocket';

export interface DocumentOperation {
  id: string;
  type: 'insert' | 'delete';
  position: number;
  text?: string;
  length?: number;
  userId: string;
  timestamp: number;
  version: number;
}

export interface CollaborativeDocument {
  id: string;
  title: string;
  content: string;
  participants: string[];
  version: number;
  lastModified: Date;
  createdAt: Date;
  createdBy: string;
}

export interface DocumentSession {
  documentId: string;
  participants: Map<string, {
    userId: string;
    cursorPosition: number;
    selectionStart: number;
    selectionEnd: number;
    lastActivity: Date;
  }>;
  operations: DocumentOperation[];
  version: number;
}

export class CollaborativeDocumentService {
  private wsServer: WebSocketServer;
  private activeSessions: Map<string, DocumentSession> = new Map();
  private operationQueue: Map<string, DocumentOperation[]> = new Map();

  constructor(wsServer: WebSocketServer) {
    this.wsServer = wsServer;
  }

  /**
   * Create a new collaborative document
   */
  async createDocument(
    title: string,
    content: string,
    createdBy: string,
    participants: string[] = []
  ): Promise<CollaborativeDocument> {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const document: CollaborativeDocument = {
      id: documentId,
      title,
      content,
      participants: [createdBy, ...participants],
      version: 0,
      lastModified: new Date(),
      createdAt: new Date(),
      createdBy
    };

    // Store document in cache
    await cacheService.set(`document:${documentId}`, document, {
      ttl: 86400 * 7, // 7 days
      tags: ['documents', `user:${createdBy}`]
    });

    // Initialize session
    const session: DocumentSession = {
      documentId,
      participants: new Map(),
      operations: [],
      version: 0
    };

    this.activeSessions.set(documentId, session);

    logger.info(`Collaborative document created: ${documentId} by ${createdBy}`);
    return document;
  }

  /**
   * Join a collaborative document session
   */
  async joinDocumentSession(documentId: string, userId: string): Promise<CollaborativeDocument | null> {
    const document = await this.getDocument(documentId);
    
    if (!document) {
      return null;
    }

    // Check if user is a participant
    if (!document.participants.includes(userId)) {
      document.participants.push(userId);
      document.lastModified = new Date();
      
      // Update document in cache
      await cacheService.set(`document:${documentId}`, document, {
        ttl: 86400 * 7,
        tags: ['documents', `user:${userId}`]
      });
    }

    // Get or create session
    let session = this.activeSessions.get(documentId);
    if (!session) {
      session = {
        documentId,
        participants: new Map(),
        operations: [],
        version: document.version
      };
      this.activeSessions.set(documentId, session);
    }

    // Add user to session
    session.participants.set(userId, {
      userId,
      cursorPosition: 0,
      selectionStart: 0,
      selectionEnd: 0,
      lastActivity: new Date()
    });

    // Notify other participants
    await this.notifyParticipants(documentId, 'user_joined', {
      userId,
      participants: Array.from(session.participants.keys())
    });

    logger.info(`User ${userId} joined document session: ${documentId}`);
    return document;
  }

  /**
   * Apply operation to document with operational transformation
   */
  async applyOperation(
    documentId: string,
    operation: Omit<DocumentOperation, 'id' | 'timestamp' | 'version'>
  ): Promise<{ success: boolean; transformedOperation?: DocumentOperation; document?: CollaborativeDocument }> {
    const document = await this.getDocument(documentId);
    const session = this.activeSessions.get(documentId);
    
    if (!document || !session) {
      return { success: false };
    }

    // Generate operation ID and timestamp
    const fullOperation: DocumentOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      version: session.version + 1
    };

    // Apply operational transformation
    const transformedOperation = this.transformOperation(fullOperation, session.operations);
    
    // Apply operation to document content
    const newContent = this.applyOperationToContent(document.content, transformedOperation);
    
    // Update document
    document.content = newContent;
    document.version = transformedOperation.version;
    document.lastModified = new Date();

    // Store updated document
    await cacheService.set(`document:${documentId}`, document, {
      ttl: 86400 * 7,
      tags: ['documents']
    });

    // Add operation to session
    session.operations.push(transformedOperation);
    session.version = transformedOperation.version;

    // Update user activity
    if (session.participants.has(operation.userId)) {
      const participant = session.participants.get(operation.userId)!;
      participant.lastActivity = new Date();
    }

    // Broadcast operation to all participants
    await this.broadcastOperation(documentId, transformedOperation);

    logger.debug(`Operation applied to document ${documentId}:`, {
      operationId: transformedOperation.id,
      type: transformedOperation.type,
      userId: transformedOperation.userId
    });

    return { success: true, transformedOperation, document };
  }

  /**
   * Update user cursor position
   */
  async updateCursorPosition(
    documentId: string,
    userId: string,
    cursorPosition: number,
    selectionStart?: number,
    selectionEnd?: number
  ): Promise<void> {
    const session = this.activeSessions.get(documentId);
    
    if (!session || !session.participants.has(userId)) {
      return;
    }

    const participant = session.participants.get(userId)!;
    participant.cursorPosition = cursorPosition;
    participant.selectionStart = selectionStart ?? cursorPosition;
    participant.selectionEnd = selectionEnd ?? cursorPosition;
    participant.lastActivity = new Date();

    // Broadcast cursor position to other participants
    await this.broadcastCursorPosition(documentId, userId, {
      cursorPosition,
      selectionStart: participant.selectionStart,
      selectionEnd: participant.selectionEnd
    });
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<CollaborativeDocument | null> {
    return await cacheService.get<CollaborativeDocument>(`document:${documentId}`);
  }

  /**
   * Get user's documents
   */
  async getUserDocuments(userId: string): Promise<CollaborativeDocument[]> {
    // In a real implementation, you'd query by user participation
    // For now, we'll return documents from cache that include the user
    const documents: CollaborativeDocument[] = [];
    
    // This is a simplified implementation
    // In production, you'd use Redis SCAN or a database query
    const documentKeys = await this.getDocumentKeysForUser(userId);
    
    for (const key of documentKeys) {
      const document = await cacheService.get<CollaborativeDocument>(key);
      if (document && document.participants.includes(userId)) {
        documents.push(document);
      }
    }

    return documents.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  /**
   * Get document session participants
   */
  getDocumentParticipants(documentId: string): string[] {
    const session = this.activeSessions.get(documentId);
    return session ? Array.from(session.participants.keys()) : [];
  }

  /**
   * Leave document session
   */
  async leaveDocumentSession(documentId: string, userId: string): Promise<void> {
    const session = this.activeSessions.get(documentId);
    
    if (!session) {
      return;
    }

    session.participants.delete(userId);

    // Notify other participants
    await this.notifyParticipants(documentId, 'user_left', {
      userId,
      participants: Array.from(session.participants.keys())
    });

    // Clean up empty sessions
    if (session.participants.size === 0) {
      this.activeSessions.delete(documentId);
      logger.info(`Document session cleaned up: ${documentId}`);
    }

    logger.info(`User ${userId} left document session: ${documentId}`);
  }

  /**
   * Operational transformation algorithm
   */
  private transformOperation(
    operation: DocumentOperation,
    existingOperations: DocumentOperation[]
  ): DocumentOperation {
    let transformedOperation = { ...operation };

    // Apply transformation against all existing operations
    for (const existingOp of existingOperations) {
      if (existingOp.timestamp < operation.timestamp) {
        transformedOperation = this.transform(transformedOperation, existingOp);
      }
    }

    return transformedOperation;
  }

  /**
   * Transform operation against another operation
   */
  private transform(op1: DocumentOperation, op2: DocumentOperation): DocumentOperation {
    // Simple transformation logic
    // In production, you'd implement proper operational transformation algorithms
    
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position <= op2.position) {
        return op1;
      } else {
        return { ...op1, position: op1.position + (op2.text?.length || 0) };
      }
    }

    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return op1;
      } else {
        return { ...op1, position: op1.position + (op2.text?.length || 0) };
      }
    }

    // Add more transformation rules as needed
    return op1;
  }

  /**
   * Apply operation to document content
   */
  private applyOperationToContent(content: string, operation: DocumentOperation): string {
    switch (operation.type) {
      case 'insert':
        if (operation.text) {
          return content.slice(0, operation.position) + operation.text + content.slice(operation.position);
        }
        break;
      case 'delete':
        if (operation.length) {
          return content.slice(0, operation.position) + content.slice(operation.position + operation.length);
        }
        break;
    }
    return content;
  }

  /**
   * Broadcast operation to all participants
   */
  private async broadcastOperation(documentId: string, operation: DocumentOperation): Promise<void> {
    const session = this.activeSessions.get(documentId);
    if (!session) return;

    const eventData = {
      documentId,
      operation,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all participants except the operation author
    for (const [participantId] of session.participants) {
      if (participantId !== operation.userId) {
        this.wsServer.emitToUser(participantId, 'document_operation', eventData);
      }
    }
  }

  /**
   * Broadcast cursor position to other participants
   */
  private async broadcastCursorPosition(
    documentId: string,
    userId: string,
    cursorData: { cursorPosition: number; selectionStart: number; selectionEnd: number }
  ): Promise<void> {
    const session = this.activeSessions.get(documentId);
    if (!session) return;

    const eventData = {
      documentId,
      userId,
      cursor: cursorData,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all participants except the user
    for (const [participantId] of session.participants) {
      if (participantId !== userId) {
        this.wsServer.emitToUser(participantId, 'cursor_position', eventData);
      }
    }
  }

  /**
   * Notify participants about session events
   */
  private async notifyParticipants(documentId: string, event: string, data: any): Promise<void> {
    const session = this.activeSessions.get(documentId);
    if (!session) return;

    const eventData = {
      documentId,
      event,
      data,
      timestamp: new Date().toISOString()
    };

    // Notify all participants
    for (const [participantId] of session.participants) {
      this.wsServer.emitToUser(participantId, 'document_session_event', eventData);
    }
  }

  /**
   * Get document keys for user (simplified implementation)
   */
  private async getDocumentKeysForUser(userId: string): Promise<string[]> {
    // In a real implementation, you'd use Redis SCAN or database queries
    // For now, return an empty array - this would be implemented based on your data structure
    return [];
  }

  /**
   * Clean up inactive sessions
   */
  async cleanupInactiveSessions(): Promise<void> {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [documentId, session] of this.activeSessions.entries()) {
      const inactiveParticipants: string[] = [];

      for (const [userId, participant] of session.participants.entries()) {
        const timeSinceActivity = now.getTime() - participant.lastActivity.getTime();
        if (timeSinceActivity > inactiveThreshold) {
          inactiveParticipants.push(userId);
        }
      }

      // Remove inactive participants
      for (const userId of inactiveParticipants) {
        session.participants.delete(userId);
      }

      // Clean up empty sessions
      if (session.participants.size === 0) {
        this.activeSessions.delete(documentId);
        logger.info(`Inactive document session cleaned up: ${documentId}`);
      }
    }
  }
}
