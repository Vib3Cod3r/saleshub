import { Request, Response } from 'express';
import { sendSuccess, sendCreated, sendNotFound } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { contactService } from '@/services/contacts/ContactService';
import type { CreateContactRequest, UpdateContactRequest } from '@/types';

export const getContacts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search,
    companyId,
    ownerId,
    leadStatus,
    tags,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query as any;

  const userId = req.user?.userId;

  // Build pagination options
  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc'
  };

  // Build filters
  const filters = {
    companyId,
    ownerId: ownerId || userId,
    leadStatus,
    tags: tags && Array.isArray(tags) ? tags : undefined,
    isActive: isActive !== undefined ? isActive === 'true' : undefined
  };

  // Build search options
  const searchOptions = {
    search,
    includeCompany: true,
    includeOwner: true
  };

  const result = await contactService.getContacts(paginationOptions, filters, searchOptions);
  sendSuccess(res, result, 'Contacts retrieved successfully');
});

export const getContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const contact = await contactService.getContactById(id, true, true);
  
  // Check if user has permission to view this contact
  if (contact.ownerId !== userId) {
    // TODO: Add role-based permission check
    throw new Error('You do not have permission to view this contact');
  }

  sendSuccess(res, contact, 'Contact retrieved successfully');
});

export const createContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactData: CreateContactRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const contact = await contactService.createContact(contactData, userId);
  sendCreated(res, contact, 'Contact created successfully');
});

export const updateContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: UpdateContactRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const updatedContact = await contactService.updateContact(id, updateData, userId);
  sendSuccess(res, updatedContact, 'Contact updated successfully');
});

export const deleteContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await contactService.deleteContact(id, userId);
  sendSuccess(res, null, 'Contact deleted successfully');
});

// Additional enhanced endpoints
export const getContactStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const stats = await contactService.getContactStats(userId);
  sendSuccess(res, stats, 'Contact statistics retrieved successfully');
});

export const searchContacts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query as any;
  const userId = req.user?.userId;

  if (!searchTerm) {
    throw new Error('Search term is required');
  }

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await contactService.searchContacts(searchTerm, paginationOptions);
  sendSuccess(res, result, 'Search completed successfully');
});

export const bulkUpdateContacts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { contactIds, updates } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    throw new Error('Contact IDs array is required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates object is required');
  }

  const results = await contactService.bulkUpdateContacts(contactIds, updates, userId);
  sendSuccess(res, results, 'Bulk update completed');
});
