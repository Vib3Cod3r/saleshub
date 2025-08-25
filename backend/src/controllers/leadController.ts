import { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { leadService } from '@/services/leads/LeadService';
import type { CreateLeadRequest, UpdateLeadRequest } from '@/types';

export const getLeads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search,
    source,
    status,
    assignedToId,
    leadScore,
    isConverted,
    createdAtFrom,
    createdAtTo,
    lastActivityDateFrom,
    lastActivityDateTo,
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
    source,
    status,
    assignedToId,
    leadScore: leadScore ? parseInt(leadScore) : undefined,
    isConverted: isConverted !== undefined ? isConverted === 'true' : undefined,
    createdAtFrom,
    createdAtTo,
    lastActivityDateFrom,
    lastActivityDateTo
  };

  // Build search options
  const searchOptions = {
    search,
    includeAssignee: true,
    includeActivities: false
  };

  const result = await leadService.getLeads(paginationOptions, filters, searchOptions);
  sendSuccess(res, result, 'Leads retrieved successfully');
});

export const getLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { includeAssignee = 'true', includeActivities = 'true' } = req.query as any;

  const lead = await leadService.getLeadById(
    id,
    includeAssignee === 'true',
    includeActivities === 'true'
  );

  sendSuccess(res, lead, 'Lead retrieved successfully');
});

export const createLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const leadData: CreateLeadRequest = req.body;
  const userId = req.user?.userId;

  const lead = await leadService.createLead(leadData, userId);
  sendCreated(res, lead, 'Lead created successfully');
});

export const updateLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: UpdateLeadRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const lead = await leadService.updateLead(id, updateData, userId);
  sendSuccess(res, lead, 'Lead updated successfully');
});

export const convertLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const conversionData = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const lead = await leadService.convertLead(id, conversionData, userId);
  sendSuccess(res, lead, 'Lead converted successfully');
});

export const deleteLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await leadService.deleteLead(id, userId);
  sendSuccess(res, null, 'Lead deleted successfully');
});

// Additional enhanced endpoints
export const getLeadsBySource = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { source } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await leadService.getLeadsBySource(source, paginationOptions);
  sendSuccess(res, result, 'Leads retrieved successfully');
});

export const getLeadsByStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await leadService.getLeadsByStatus(status, paginationOptions);
  sendSuccess(res, result, 'Leads retrieved successfully');
});

export const getLeadsByAssignee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { assigneeId } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await leadService.getLeadsByAssignee(assigneeId, paginationOptions);
  sendSuccess(res, result, 'Leads retrieved successfully');
});

export const getHighScoringLeads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { minScore = 80, page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await leadService.getHighScoringLeads(parseInt(minScore), paginationOptions);
  sendSuccess(res, result, 'High scoring leads retrieved successfully');
});

export const searchLeads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query as any;

  if (!searchTerm) {
    throw new Error('Search term is required');
  }

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await leadService.searchLeads(searchTerm, paginationOptions);
  sendSuccess(res, result, 'Search completed successfully');
});

export const getLeadStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  const stats = await leadService.getLeadStats(userId);
  sendSuccess(res, stats, 'Lead statistics retrieved successfully');
});

export const bulkUpdateLeads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { leadIds, updates } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    throw new Error('Lead IDs array is required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates object is required');
  }

  const results = await leadService.bulkUpdateLeads(leadIds, updates, userId);
  sendSuccess(res, results, 'Bulk update completed');
});
