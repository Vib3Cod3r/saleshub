import { BaseService, PaginationOptions, FilterOptions } from '@/services/base';
import { databaseService } from '@/services/base/DatabaseService';
import { ErrorFactory } from '@/utils/errors';
import type { Contact, CreateContactRequest, UpdateContactRequest } from '@/types';

export interface ContactFilters extends FilterOptions {
  companyId?: string;
  ownerId?: string;
  leadStatus?: string;
  tags?: string[];
  isActive?: boolean;
  email?: string;
  jobTitle?: string;
}

export interface ContactSearchOptions {
  search?: string;
  includeInactive?: boolean;
  includeCompany?: boolean;
  includeOwner?: boolean;
}

export class ContactService extends BaseService<Contact, CreateContactRequest, UpdateContactRequest> {
  constructor() {
    super('contact');
  }

  /**
   * Get contacts with advanced filtering and search
   */
  async getContacts(
    options: PaginationOptions = {},
    filters: ContactFilters = {},
    searchOptions: ContactSearchOptions = {}
  ) {
    const { search, includeInactive = false, includeCompany = true, includeOwner = true } = searchOptions;

    // Build include object
    const include: any = {};
    if (includeCompany) {
      include.company = {
        select: {
          id: true,
          name: true,
          industry: true,
          website: true
        }
      };
    }
    if (includeOwner) {
      include.owner = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }

    // Build filters
    const whereFilters: any = {};

    if (filters.companyId) {
      whereFilters.companyId = filters.companyId;
    }

    if (filters.ownerId) {
      whereFilters.ownerId = filters.ownerId;
    }

    if (filters.leadStatus) {
      whereFilters.leadStatus = filters.leadStatus;
    }

    if (filters.tags && filters.tags.length > 0) {
      whereFilters.tags = {
        hasSome: filters.tags
      };
    }

    if (filters.isActive !== undefined) {
      whereFilters.isActive = filters.isActive;
    } else if (!includeInactive) {
      whereFilters.isActive = true;
    }

    if (filters.email) {
      whereFilters.email = {
        contains: filters.email,
        mode: 'insensitive'
      };
    }

    if (filters.jobTitle) {
      whereFilters.jobTitle = {
        contains: filters.jobTitle,
        mode: 'insensitive'
      };
    }

    // Add search functionality
    if (search) {
      whereFilters.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    return await this.findAll(options, whereFilters, include);
  }

  /**
   * Get contact by ID with optional includes
   */
  async getContactById(id: string, includeCompany = true, includeOwner = true) {
    const include: any = {};
    if (includeCompany) {
      include.company = true;
    }
    if (includeOwner) {
      include.owner = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }

    const contact = await this.findById(id, include);
    if (!contact) {
      throw ErrorFactory.notFound('Contact');
    }

    return contact;
  }

  /**
   * Create a new contact with validation
   */
  async createContact(data: CreateContactRequest, ownerId: string) {
    // Validate email uniqueness if provided
    if (data.email) {
      const existingContact = await this.prisma.contact.findFirst({
        where: { email: data.email }
      });
      if (existingContact) {
        throw ErrorFactory.conflict('Contact with this email already exists');
      }
    }

    // Add owner ID to contact data
    const contactData = {
      ...data,
      ownerId,
      isActive: true
    };

    return await this.create(contactData, {
      company: true,
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    });
  }

  /**
   * Update contact with validation
   */
  async updateContact(id: string, data: UpdateContactRequest, userId: string) {
    // Check if contact exists and user has permission
    const existingContact = await this.findById(id);
    if (!existingContact) {
      throw ErrorFactory.notFound('Contact');
    }

    // Check if user owns the contact or has admin rights
    if (existingContact.ownerId !== userId) {
      // TODO: Add role-based permission check
      throw ErrorFactory.forbidden('You do not have permission to update this contact');
    }

    // Validate email uniqueness if being updated
    if (data.email && data.email !== existingContact.email) {
      const emailExists = await this.prisma.contact.findFirst({
        where: { 
          email: data.email,
          id: { not: id }
        }
      });
      if (emailExists) {
        throw ErrorFactory.conflict('Contact with this email already exists');
      }
    }

    return await this.update(id, data, {
      company: true,
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    });
  }

  /**
   * Delete contact with permission check
   */
  async deleteContact(id: string, userId: string) {
    const contact = await this.findById(id);
    if (!contact) {
      throw ErrorFactory.notFound('Contact');
    }

    // Check if user owns the contact or has admin rights
    if (contact.ownerId !== userId) {
      // TODO: Add role-based permission check
      throw ErrorFactory.forbidden('You do not have permission to delete this contact');
    }

    return await this.delete(id);
  }

  /**
   * Soft delete contact
   */
  async softDeleteContact(id: string, userId: string) {
    const contact = await this.findById(id);
    if (!contact) {
      throw ErrorFactory.notFound('Contact');
    }

    // Check if user owns the contact or has admin rights
    if (contact.ownerId !== userId) {
      // TODO: Add role-based permission check
      throw ErrorFactory.forbidden('You do not have permission to delete this contact');
    }

    return await this.softDelete(id);
  }

  /**
   * Get contacts by company
   */
  async getContactsByCompany(companyId: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { companyId, isActive: true }, {
      includeCompany: true,
      includeOwner: true
    });
  }

  /**
   * Get contacts by owner
   */
  async getContactsByOwner(ownerId: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { ownerId, isActive: true }, {
      includeCompany: true,
      includeOwner: true
    });
  }

  /**
   * Search contacts with advanced search
   */
  async searchContacts(searchTerm: string, options: PaginationOptions = {}) {
    return await this.getContacts(options, {}, {
      search: searchTerm,
      includeCompany: true,
      includeOwner: true
    });
  }

  /**
   * Get contact statistics
   */
  async getContactStats(ownerId?: string) {
    const where: any = { isActive: true };
    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [
      totalContacts,
      activeContacts,
      contactsThisMonth,
      contactsByStatus
    ] = await Promise.all([
      this.prisma.contact.count({ where }),
      this.prisma.contact.count({ where: { ...where, leadStatus: 'QUALIFIED' } }),
      this.prisma.contact.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      this.prisma.contact.groupBy({
        by: ['leadStatus'],
        where,
        _count: {
          leadStatus: true
        }
      })
    ]);

    return {
      totalContacts,
      activeContacts,
      contactsThisMonth,
      contactsByStatus: contactsByStatus.reduce((acc, item) => {
        acc[item.leadStatus] = item._count.leadStatus;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Bulk update contacts
   */
  async bulkUpdateContacts(contactIds: string[], updates: Partial<UpdateContactRequest>, userId: string) {
    return await databaseService.transaction(async (tx) => {
      const results = [];
      
      for (const id of contactIds) {
        try {
          const contact = await tx.contact.findUnique({ where: { id } });
          if (!contact) {
            results.push({ id, success: false, error: 'Contact not found' });
            continue;
          }

          if (contact.ownerId !== userId) {
            results.push({ id, success: false, error: 'Permission denied' });
            continue;
          }

          const updated = await tx.contact.update({
            where: { id },
            data: updates
          });
          results.push({ id, success: true, data: updated });
        } catch (error) {
          results.push({ id, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      return results;
    });
  }
}

// Export singleton instance
export const contactService = new ContactService();
