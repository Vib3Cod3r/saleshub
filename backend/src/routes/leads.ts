import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validateBody, validateQuery } from '@/middleware/validation';
import { 
  createLeadSchema, 
  updateLeadSchema, 
  leadFiltersSchema 
} from '@/utils/validation';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  convertLead,
  deleteLead,
  getLeadsBySource,
  getLeadsByStatus,
  getLeadsByAssignee,
  getHighScoringLeads,
  searchLeads,
  getLeadStats,
  bulkUpdateLeads
} from '@/controllers/leadController';

const router = Router();

// All lead routes require authentication
router.use(authenticateToken);

// GET /api/leads - Get all leads with filters
router.get('/', validateQuery(leadFiltersSchema), getLeads);

// GET /api/leads/search - Search leads
router.get('/search', searchLeads);

// GET /api/leads/high-scoring - Get high scoring leads
router.get('/high-scoring', getHighScoringLeads);

// GET /api/leads/stats - Get lead statistics
router.get('/stats', getLeadStats);

// GET /api/leads/source/:source - Get leads by source
router.get('/source/:source', getLeadsBySource);

// GET /api/leads/status/:status - Get leads by status
router.get('/status/:status', getLeadsByStatus);

// GET /api/leads/assignee/:assigneeId - Get leads by assignee
router.get('/assignee/:assigneeId', getLeadsByAssignee);

// GET /api/leads/:id - Get specific lead
router.get('/:id', getLead);

// POST /api/leads - Create new lead
router.post('/', validateBody(createLeadSchema), createLead);

// POST /api/leads/:id/convert - Convert lead
router.post('/:id/convert', convertLead);

// POST /api/leads/bulk-update - Bulk update leads
router.post('/bulk-update', bulkUpdateLeads);

// PUT /api/leads/:id - Update lead
router.put('/:id', validateBody(updateLeadSchema), updateLead);

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', deleteLead);

export default router;
