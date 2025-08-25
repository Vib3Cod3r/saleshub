import { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { companyService } from '@/services/companies/CompanyService';
import type { CreateCompanyRequest, UpdateCompanyRequest } from '@/types';

export const getCompanies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search,
    industry,
    size,
    isActive,
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
    industry,
    size,
    isActive: isActive !== undefined ? isActive === 'true' : undefined
  };

  // Build search options
  const searchOptions = {
    search,
    includeContacts: true,
    includeDeals: true
  };

  const result = await companyService.getCompanies(paginationOptions, filters, searchOptions);
  sendSuccess(res, result, 'Companies retrieved successfully');
});

export const getCompany = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { includeContacts = 'true', includeDeals = 'true' } = req.query as any;

  const company = await companyService.getCompanyById(
    id,
    includeContacts === 'true',
    includeDeals === 'true'
  );

  sendSuccess(res, company, 'Company retrieved successfully');
});

export const createCompany = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const companyData: CreateCompanyRequest = req.body;

  const company = await companyService.createCompany(companyData);
  sendCreated(res, company, 'Company created successfully');
});

export const updateCompany = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: UpdateCompanyRequest = req.body;

  const company = await companyService.updateCompany(id, updateData);
  sendSuccess(res, company, 'Company updated successfully');
});

export const deleteCompany = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await companyService.deleteCompany(id);
  sendSuccess(res, null, 'Company deleted successfully');
});

// Additional enhanced endpoints
export const getCompanyStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stats = await companyService.getCompanyStats();
  sendSuccess(res, stats, 'Company statistics retrieved successfully');
});

export const searchCompanies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query as any;

  if (!searchTerm) {
    throw new Error('Search term is required');
  }

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await companyService.searchCompanies(searchTerm, paginationOptions);
  sendSuccess(res, result, 'Search completed successfully');
});

export const getCompaniesByIndustry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { industry } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await companyService.getCompaniesByIndustry(industry, paginationOptions);
  sendSuccess(res, result, 'Companies retrieved successfully');
});

export const getCompaniesBySize = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { size } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await companyService.getCompaniesBySize(size, paginationOptions);
  sendSuccess(res, result, 'Companies retrieved successfully');
});

export const getCompanyHierarchy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const hierarchy = await companyService.getCompanyHierarchy(id);
  sendSuccess(res, hierarchy, 'Company hierarchy retrieved successfully');
});

export const mergeCompanies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { sourceId, targetId } = req.body;

  if (!sourceId || !targetId) {
    throw new Error('Source and target company IDs are required');
  }

  if (sourceId === targetId) {
    throw new Error('Source and target companies must be different');
  }

  const result = await companyService.mergeCompanies(sourceId, targetId);
  sendSuccess(res, result, 'Companies merged successfully');
});
