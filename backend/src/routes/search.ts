import { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { authenticateToken } from '../middleware/auth';
import { cacheMiddleware, analyticsCacheMiddleware } from '../middleware/cache';

const router = Router();

// Apply authentication to all search routes
router.use(authenticateToken);

// Search endpoints with caching
router.get('/search', 
  cacheMiddleware({
    ttl: 300, // 5 minutes
    prefix: 'search',
    tags: ['search']
  }),
  searchController.search
);

router.get('/suggestions',
  cacheMiddleware({
    ttl: 180, // 3 minutes for suggestions
    prefix: 'suggestions',
    tags: ['search', 'suggestions']
  }),
  searchController.getSuggestions
);

// Analytics endpoint with longer cache
router.get('/analytics',
  analyticsCacheMiddleware,
  searchController.getAnalytics
);

// Health check endpoint (no caching)
router.get('/health', searchController.getHealth);

export default router;
