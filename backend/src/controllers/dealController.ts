import { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { dealService } from '@/services/deals/DealService';
import type { CreateDealRequest, UpdateDealRequest } from '@/types';

export const getDeals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search,
    stage,
    ownerId,
    companyId,
    primaryContactId,
    minValue,
    maxValue,
    isActive,
    expectedCloseDateFrom,
    expectedCloseDateTo,
    probability,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query as any;

  // Build pagination options
  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc'
  };

  // Build filters
  const filters = {
    stage,
    ownerId,
    companyId,
    primaryContactId,
    minValue: minValue ? parseFloat(minValue) : undefined,
    maxValue: maxValue ? parseFloat(maxValue) : undefined,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    expectedCloseDateFrom,
    expectedCloseDateTo,
    probability: probability ? parseInt(probability) : undefined
  };

  // Build search options
  const searchOptions = {
    search,
    includeCompany: true,
    includeContact: true,
    includeOwner: true
  };

  const result = await dealService.getDeals(paginationOptions, filters, searchOptions);
  sendSuccess(res, result, 'Deals retrieved successfully');
});

export const getDeal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { includeCompany = 'true', includeContact = 'true', includeOwner = 'true' } = req.query as any;

  const deal = await dealService.getDealById(
    id,
    includeCompany === 'true',
    includeContact === 'true',
    includeOwner === 'true'
  );

  sendSuccess(res, deal, 'Deal retrieved successfully');
});

export const createDeal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dealData: CreateDealRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const deal = await dealService.createDeal(dealData, userId);
  sendCreated(res, deal, 'Deal created successfully');
});

export const updateDeal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: UpdateDealRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const deal = await dealService.updateDeal(id, updateData, userId);
  sendSuccess(res, deal, 'Deal updated successfully');
});

export const updateDealStage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { newStage, fromStage, reason, notes } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!newStage) {
    throw new Error('New stage is required');
  }

  const transition = {
    fromStage: fromStage || 'UNKNOWN',
    toStage: newStage,
    reason,
    notes
  };

  const deal = await dealService.updateDealStage(id, newStage, transition, userId);
  sendSuccess(res, deal, 'Deal stage updated successfully');
});

export const deleteDeal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await dealService.deleteDeal(id, userId);
  sendSuccess(res, null, 'Deal deleted successfully');
});

// Additional enhanced endpoints
export const getDealsByStage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { stage } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await dealService.getDealsByStage(stage, paginationOptions);
  sendSuccess(res, result, 'Deals retrieved successfully');
});

export const getDealsByOwner = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { ownerId } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await dealService.getDealsByOwner(ownerId, paginationOptions);
  sendSuccess(res, result, 'Deals retrieved successfully');
});

export const getDealsByCompany = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await dealService.getDealsByCompany(companyId, paginationOptions);
  sendSuccess(res, result, 'Deals retrieved successfully');
});

export const searchDeals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query as any;

  if (!searchTerm) {
    throw new Error('Search term is required');
  }

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await dealService.searchDeals(searchTerm, paginationOptions);
  sendSuccess(res, result, 'Search completed successfully');
});

export const getDealsClosingSoon = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { days = 30, page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await dealService.getDealsClosingSoon(parseInt(days), paginationOptions);
  sendSuccess(res, result, 'Deals closing soon retrieved successfully');
});

export const getHighValueDeals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { minValue = 10000, page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await dealService.getHighValueDeals(parseFloat(minValue), paginationOptions);
  sendSuccess(res, result, 'High value deals retrieved successfully');
});

export const bulkUpdateDeals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { dealIds, updates } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
    throw new Error('Deal IDs array is required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates object is required');
  }

  const results = await dealService.bulkUpdateDeals(dealIds, updates, userId);
  sendSuccess(res, results, 'Bulk update completed');
});
