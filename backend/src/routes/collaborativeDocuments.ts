import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { CollaborativeDocumentController } from '../controllers/collaborativeDocumentController';
import { WebSocketServer } from '../config/websocket';
import rateLimit from 'express-rate-limit';

const router = Router();

// Initialize controller
const wsServer = new WebSocketServer(null as any); // Will be properly initialized in index.ts
const collaborativeDocumentController = new CollaborativeDocumentController(wsServer);

// Rate limiting for document operations
const documentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    error: 'Too many document operations, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply rate limiting to document endpoints
router.use(documentRateLimit);

// Document management
router.post('/', async (req, res) => {
  await collaborativeDocumentController.createDocument(req, res);
});

router.get('/', async (req, res) => {
  await collaborativeDocumentController.getUserDocuments(req, res);
});

router.get('/:documentId', async (req, res) => {
  await collaborativeDocumentController.getDocument(req, res);
});

// Document session management
router.post('/:documentId/join', async (req, res) => {
  await collaborativeDocumentController.joinDocumentSession(req, res);
});

router.post('/:documentId/leave', async (req, res) => {
  await collaborativeDocumentController.leaveDocumentSession(req, res);
});

router.get('/:documentId/participants', async (req, res) => {
  await collaborativeDocumentController.getDocumentParticipants(req, res);
});

// Document operations
router.post('/:documentId/operations', async (req, res) => {
  await collaborativeDocumentController.applyOperation(req, res);
});

router.post('/:documentId/cursor', async (req, res) => {
  await collaborativeDocumentController.updateCursorPosition(req, res);
});

// Maintenance endpoints
router.post('/cleanup', async (req, res) => {
  await collaborativeDocumentController.cleanupInactiveSessions(req, res);
});

export default router;
