import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PerformanceController } from '../controllers/performanceController';
import rateLimit from 'express-rate-limit';

const router = Router();

// Initialize controller
const performanceController = new PerformanceController();

// Rate limiting for performance endpoints
const performanceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many performance monitoring requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply rate limiting to performance endpoints
router.use(performanceRateLimit);

// System metrics
router.get('/system', async (req, res) => {
  await performanceController.getSystemMetrics(req, res);
});

// API metrics
router.get('/api', async (req, res) => {
  await performanceController.getAPIMetrics(req, res);
});

// Performance summary
router.get('/summary', async (req, res) => {
  await performanceController.getPerformanceSummary(req, res);
});

// Specific metrics by name
router.get('/metrics/:metricName', async (req, res) => {
  await performanceController.getMetrics(req, res);
});

// Aggregated metrics
router.get('/metrics/:metricName/aggregated', async (req, res) => {
  await performanceController.getAggregatedMetrics(req, res);
});

// Queue statistics
router.get('/queues', async (req, res) => {
  await performanceController.getQueueStats(req, res);
});

router.get('/queues/:queueName', async (req, res) => {
  await performanceController.getQueueStats(req, res);
});

// Queue size
router.get('/queues/:queueName/size', async (req, res) => {
  await performanceController.getQueueSize(req, res);
});

// Clear completed messages
router.delete('/queues/:queueName/completed', async (req, res) => {
  await performanceController.clearCompletedMessages(req, res);
});

// Export metrics
router.get('/export', async (req, res) => {
  await performanceController.exportMetrics(req, res);
});

// Enhanced health check
router.get('/health', async (req, res) => {
  await performanceController.healthCheck(req, res);
});

export default router;
