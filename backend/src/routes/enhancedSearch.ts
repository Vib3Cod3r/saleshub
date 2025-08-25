import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { EnhancedSearchController } from '../controllers/enhancedSearchController';
import { SearchService } from '../services/search/SearchService';
import { WebSocketServer } from '../config/websocket';
import rateLimit from 'express-rate-limit';

const router = Router();

// Initialize services
const searchService = new SearchService();
const wsServer = new WebSocketServer(null as any); // Will be properly initialized in index.ts
const enhancedSearchController = new EnhancedSearchController(searchService, wsServer);

// Rate limiting for search endpoints
const searchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many search requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply rate limiting to search endpoints
router.use(searchRateLimit);

// Live search endpoint
router.post('/live-search', async (req, res) => {
  await enhancedSearchController.performLiveSearch(req, res);
});

// Search session management
router.post('/sessions', async (req, res) => {
  await enhancedSearchController.createSearchSession(req, res);
});

router.post('/sessions/join', async (req, res) => {
  await enhancedSearchController.joinSearchSession(req, res);
});

router.get('/sessions', async (req, res) => {
  await enhancedSearchController.getUserSearchSessions(req, res);
});

router.get('/sessions/:sessionId', async (req, res) => {
  await enhancedSearchController.getSearchSession(req, res);
});

// Search analytics
router.get('/analytics', async (req, res) => {
  await enhancedSearchController.getSearchAnalytics(req, res);
});

// Maintenance endpoints
router.post('/cleanup', async (req, res) => {
  await enhancedSearchController.cleanupExpiredSessions(req, res);
});

export default router;
