import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/middleware/validation';
import { 
  createContactSchema, 
  updateContactSchema, 
  contactFiltersSchema 
} from '@/utils/validation';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats,
  searchContacts,
  bulkUpdateContacts
} from '@/controllers/contactController';
import { 
  contactCacheMiddleware, 
  cacheInvalidationMiddleware, 
  CACHE_PATTERNS 
} from '@/middleware/cache';

const router = Router();

// All contact routes require authentication
router.use(authenticateToken);

// GET /api/contacts - Get all contacts with filters
router.get('/', 
  contactCacheMiddleware,
  validateQuery(contactFiltersSchema), 
  getContacts
);

// GET /api/contacts/:id - Get specific contact
router.get('/:id', 
  contactCacheMiddleware,
  getContact
);

// POST /api/contacts - Create new contact
router.post('/', 
  validateBody(createContactSchema), 
  cacheInvalidationMiddleware([CACHE_PATTERNS.CONTACTS]),
  createContact
);

// PUT /api/contacts/:id - Update contact
router.put('/:id', 
  validateBody(updateContactSchema), 
  cacheInvalidationMiddleware([CACHE_PATTERNS.CONTACTS]),
  updateContact
);

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', 
  cacheInvalidationMiddleware([CACHE_PATTERNS.CONTACTS]),
  deleteContact
);

// GET /api/contacts/stats - Get contact statistics
router.get('/stats', 
  contactCacheMiddleware,
  getContactStats
);

// GET /api/contacts/search - Search contacts
router.get('/search', 
  contactCacheMiddleware,
  searchContacts
);

// POST /api/contacts/bulk-update - Bulk update contacts
router.post('/bulk-update', 
  cacheInvalidationMiddleware([CACHE_PATTERNS.CONTACTS]),
  bulkUpdateContacts
);

export default router;
