import { redis } from '@/config/redis';

export interface SessionData {
  userId: string;
  email: string;
  roleId: string;
  permissions: string[];
  lastActivity: Date;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    deviceId?: string;
  };
  metadata?: Record<string, any>;
}

export class SessionService {
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours
  private readonly MAX_SESSIONS_PER_USER = 5; // Maximum sessions per user

  /**
   * Create a new session for a user
   */
  async createSession(userId: string, sessionData: SessionData): Promise<string> {
    const sessionId = this.generateSessionId();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    
    try {
      // Store session data
      await redis.setex(key, this.SESSION_TTL, JSON.stringify(sessionData));
      
      // Add session to user's session list
      await redis.sadd(`${this.USER_SESSIONS_PREFIX}${userId}`, sessionId);
      
      // Set expiration for user sessions set
      await redis.expire(`${this.USER_SESSIONS_PREFIX}${userId}`, this.SESSION_TTL);
      
      // Limit sessions per user
      await this.limitUserSessions(userId);
      
      console.log(`✅ Session created for user ${userId}: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Get session data by session ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    
    try {
      const data = await redis.get(key);
      
      if (!data) {
        return null;
      }
      
      const sessionData = JSON.parse(data) as SessionData;
      
      // Update last activity
      sessionData.lastActivity = new Date();
      await redis.setex(key, this.SESSION_TTL, JSON.stringify(sessionData));
      
      return sessionData;
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await redis.get(key);
      
      if (data) {
        const sessionData = JSON.parse(data) as SessionData;
        
        // Remove session data
        await redis.del(key);
        
        // Remove from user's session list
        await redis.srem(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`, sessionId);
        
        console.log(`✅ Session invalidated: ${sessionId}`);
      }
    } catch (error) {
      console.error('❌ Error invalidating session:', error);
      throw new Error('Failed to invalidate session');
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      const sessionIds = await redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      if (sessionIds.length > 0) {
        const keys = sessionIds.map(id => `${this.SESSION_PREFIX}${id}`);
        
        // Remove all session data
        await redis.del(...keys);
        
        // Remove user sessions set
        await redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
        
        console.log(`✅ All sessions invalidated for user ${userId}: ${sessionIds.length} sessions`);
      }
    } catch (error) {
      console.error('❌ Error invalidating user sessions:', error);
      throw new Error('Failed to invalidate user sessions');
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const sessionIds = await redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      const sessions: SessionData[] = [];
      
      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }
      
      return sessions;
    } catch (error) {
      console.error('❌ Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Update session metadata
   */
  async updateSessionMetadata(sessionId: string, metadata: Record<string, any>): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (session) {
        session.metadata = { ...session.metadata, ...metadata };
        const key = `${this.SESSION_PREFIX}${sessionId}`;
        await redis.setex(key, this.SESSION_TTL, JSON.stringify(session));
      }
    } catch (error) {
      console.error('❌ Error updating session metadata:', error);
      throw new Error('Failed to update session metadata');
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // This would typically be done by Redis automatically with TTL
      // But we can also implement a manual cleanup if needed
      console.log('🧹 Session cleanup completed');
    } catch (error) {
      console.error('❌ Error cleaning up sessions:', error);
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeUsers: number;
    averageSessionsPerUser: number;
  }> {
    try {
      const totalSessions = await redis.dbsize();
      const userKeys = await redis.keys(`${this.USER_SESSIONS_PREFIX}*`);
      const activeUsers = userKeys.length;
      
      let totalUserSessions = 0;
      for (const userKey of userKeys) {
        const sessionCount = await redis.scard(userKey);
        totalUserSessions += sessionCount;
      }
      
      const averageSessionsPerUser = activeUsers > 0 ? totalUserSessions / activeUsers : 0;
      
      return {
        totalSessions,
        activeUsers,
        averageSessionsPerUser
      };
    } catch (error) {
      console.error('❌ Error getting session stats:', error);
      return {
        totalSessions: 0,
        activeUsers: 0,
        averageSessionsPerUser: 0
      };
    }
  }

  /**
   * Limit the number of sessions per user
   */
  private async limitUserSessions(userId: string): Promise<void> {
    try {
      const sessionIds = await redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      if (sessionIds.length > this.MAX_SESSIONS_PER_USER) {
        // Remove oldest sessions (keep the most recent ones)
        const sessionsToRemove = sessionIds.slice(0, sessionIds.length - this.MAX_SESSIONS_PER_USER);
        
        for (const sessionId of sessionsToRemove) {
          await this.invalidateSession(sessionId);
        }
        
        console.log(`🔄 Limited sessions for user ${userId}: removed ${sessionsToRemove.length} old sessions`);
      }
    } catch (error) {
      console.error('❌ Error limiting user sessions:', error);
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `sess_${timestamp}_${random}`;
  }
}

// Export singleton instance
export const sessionService = new SessionService();
