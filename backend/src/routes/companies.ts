import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validateBody, validateQuery } from '@/middleware/validation';
import { 
  createCompanySchema, 
  updateCompanySchema, 
  companyFiltersSchema 
} from '@/utils/validation';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  searchCompanies,
  getCompaniesByIndustry,
  getCompaniesBySize,
  getCompanyHierarchy,
  mergeCompanies
} from '@/controllers/companyController';

const router = Router();

// All company routes require authentication
router.use(authenticateToken);

// GET /api/companies - Get all companies with filters
router.get('/', validateQuery(companyFiltersSchema), getCompanies);

// GET /api/companies/stats - Get company statistics
router.get('/stats', getCompanyStats);

// GET /api/companies/search - Search companies
router.get('/search', searchCompanies);

// GET /api/companies/industry/:industry - Get companies by industry
router.get('/industry/:industry', getCompaniesByIndustry);

// GET /api/companies/size/:size - Get companies by size
router.get('/size/:size', getCompaniesBySize);

// GET /api/companies/:id - Get specific company
router.get('/:id', getCompany);

// GET /api/companies/:id/hierarchy - Get company hierarchy
router.get('/:id/hierarchy', getCompanyHierarchy);

// POST /api/companies - Create new company
router.post('/', validateBody(createCompanySchema), createCompany);

// POST /api/companies/merge - Merge companies
router.post('/merge', mergeCompanies);

// PUT /api/companies/:id - Update company
router.put('/:id', validateBody(updateCompanySchema), updateCompany);

// DELETE /api/companies/:id - Delete company
router.delete('/:id', deleteCompany);

export default router;
