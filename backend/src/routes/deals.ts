import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validateBody, validateQuery } from '@/middleware/validation';
import { 
  createDealSchema, 
  updateDealSchema, 
  dealFiltersSchema 
} from '@/utils/validation';
import {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
  getDealsByStage,
  getDealsByOwner,
  getDealsByCompany,
  searchDeals,
  getDealsClosingSoon,
  getHighValueDeals,
  bulkUpdateDeals
} from '@/controllers/dealController';

const router = Router();

// All deal routes require authentication
router.use(authenticateToken);

// GET /api/deals - Get all deals with filters
router.get('/', validateQuery(dealFiltersSchema), getDeals);

// GET /api/deals/search - Search deals
router.get('/search', searchDeals);

// GET /api/deals/closing-soon - Get deals closing soon
router.get('/closing-soon', getDealsClosingSoon);

// GET /api/deals/high-value - Get high value deals
router.get('/high-value', getHighValueDeals);

// GET /api/deals/stage/:stage - Get deals by stage
router.get('/stage/:stage', getDealsByStage);

// GET /api/deals/owner/:ownerId - Get deals by owner
router.get('/owner/:ownerId', getDealsByOwner);

// GET /api/deals/company/:companyId - Get deals by company
router.get('/company/:companyId', getDealsByCompany);

// GET /api/deals/:id - Get specific deal
router.get('/:id', getDeal);

// POST /api/deals - Create new deal
router.post('/', validateBody(createDealSchema), createDeal);

// POST /api/deals/:id/stage - Update deal stage
router.post('/:id/stage', updateDealStage);

// POST /api/deals/bulk-update - Bulk update deals
router.post('/bulk-update', bulkUpdateDeals);

// PUT /api/deals/:id - Update deal
router.put('/:id', validateBody(updateDealSchema), updateDeal);

// DELETE /api/deals/:id - Delete deal
router.delete('/:id', deleteDeal);

export default router;
