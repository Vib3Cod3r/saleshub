import { BaseService, PaginationOptions, FilterOptions } from '@/services/base';
import { databaseService } from '@/services/base/DatabaseService';
import { ErrorFactory } from '@/utils/errors';
import type { Deal, CreateDealRequest, UpdateDealRequest } from '@/types';

export interface DealFilters extends FilterOptions {
  stage?: string;
  ownerId?: string;
  companyId?: string;
  primaryContactId?: string;
  minValue?: number;
  maxValue?: number;
  isActive?: boolean;
  expectedCloseDateFrom?: string;
  expectedCloseDateTo?: string;
  probability?: number;
}

export interface DealSearchOptions {
  search?: string;
  includeInactive?: boolean;
  includeCompany?: boolean;
  includeContact?: boolean;
  includeOwner?: boolean;
}

export interface DealStageTransition {
  fromStage: string;
  toStage: string;
  reason?: string;
  notes?: string;
}

export class DealService extends BaseService<Deal, CreateDealRequest, UpdateDealRequest> {
  constructor() {
    super('deal');
  }

  /**
   * Get deals with advanced filtering and search
   */
  async getDeals(
    options: PaginationOptions = {},
    filters: DealFilters = {},
    searchOptions: DealSearchOptions = {}
  ) {
    const { search, includeInactive = false, includeCompany = true, includeContact = true, includeOwner = true } = searchOptions;

    // Build include object
    const include: any = {};
    if (includeCompany) {
      include.company = {
        select: {
          id: true,
          name: true,
          industry: true,
          size: true
        }
      };
    }
    if (includeContact) {
      include.primaryContact = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true
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

    if (filters.stage) {
      whereFilters.stage = filters.stage;
    }

    if (filters.ownerId) {
      whereFilters.ownerId = filters.ownerId;
    }

    if (filters.companyId) {
      whereFilters.companyId = filters.companyId;
    }

    if (filters.primaryContactId) {
      whereFilters.primaryContactId = filters.primaryContactId;
    }

    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      whereFilters.value = {};
      if (filters.minValue !== undefined) {
        whereFilters.value.gte = filters.minValue;
      }
      if (filters.maxValue !== undefined) {
        whereFilters.value.lte = filters.maxValue;
      }
    }

    if (filters.isActive !== undefined) {
      whereFilters.isActive = filters.isActive;
    } else if (!includeInactive) {
      whereFilters.isActive = true;
    }

    if (filters.expectedCloseDateFrom || filters.expectedCloseDateTo) {
      whereFilters.expectedCloseDate = {};
      if (filters.expectedCloseDateFrom) {
        whereFilters.expectedCloseDate.gte = new Date(filters.expectedCloseDateFrom);
      }
      if (filters.expectedCloseDateTo) {
        whereFilters.expectedCloseDate.lte = new Date(filters.expectedCloseDateTo);
      }
    }

    if (filters.probability !== undefined) {
      whereFilters.probability = filters.probability;
    }

    // Add search functionality
    if (search) {
      whereFilters.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { primaryContact: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        } }
      ];
    }

    return await this.findAll(options, whereFilters, include);
  }

  /**
   * Get deal by ID with optional includes
   */
  async getDealById(id: string, includeCompany = true, includeContact = true, includeOwner = true) {
    const include: any = {};
    if (includeCompany) {
      include.company = true;
    }
    if (includeContact) {
      include.primaryContact = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
          phone: true
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

    const deal = await this.findById(id, include);
    if (!deal) {
      throw ErrorFactory.notFound('Deal');
    }

    return deal;
  }

  /**
   * Create a new deal with validation
   */
  async createDeal(data: CreateDealRequest, ownerId: string) {
    // Validate company exists if provided
    if (data.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId }
      });
      if (!company) {
        throw ErrorFactory.notFound('Company');
      }
    }

    // Validate contact exists if provided
    if (data.primaryContactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: data.primaryContactId }
      });
      if (!contact) {
        throw ErrorFactory.notFound('Contact');
      }
    }

    // Add default values
    const dealData = {
      ...data,
      ownerId,
      isActive: true,
      probability: data.probability || 0,
      currency: data.currency || 'USD',
      stage: data.stage || 'PROSPECTING',
      competitors: data.competitors || []
    };

    return await this.create(dealData, {
      company: true,
      primaryContact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true
        }
      },
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
   * Update deal with validation
   */
  async updateDeal(id: string, data: UpdateDealRequest, userId: string) {
    // Check if deal exists and user has permission
    const existingDeal = await this.findById(id);
    if (!existingDeal) {
      throw ErrorFactory.notFound('Deal');
    }

    // Check if user owns the deal or has admin rights
    if (existingDeal.ownerId !== userId) {
      // TODO: Add role-based permission check
      throw ErrorFactory.forbidden('You do not have permission to update this deal');
    }

    // Validate company exists if being updated
    if (data.companyId && data.companyId !== existingDeal.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId }
      });
      if (!company) {
        throw ErrorFactory.notFound('Company');
      }
    }

    // Validate contact exists if being updated
    if (data.primaryContactId && data.primaryContactId !== existingDeal.primaryContactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: data.primaryContactId }
      });
      if (!contact) {
        throw ErrorFactory.notFound('Contact');
      }
    }

    return await this.update(id, data, {
      company: true,
      primaryContact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true
        }
      },
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
   * Update deal stage with transition tracking
   */
  async updateDealStage(id: string, newStage: string, transition: DealStageTransition, userId: string) {
    const deal = await this.findById(id);
    if (!deal) {
      throw ErrorFactory.notFound('Deal');
    }

    if (deal.ownerId !== userId) {
      throw ErrorFactory.forbidden('You do not have permission to update this deal');
    }

    // Validate stage transition
    const validStages = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    if (!validStages.includes(newStage)) {
      throw ErrorFactory.badRequest('Invalid deal stage');
    }

    // Update deal with stage transition
    const updateData: any = {
      stage: newStage,
      ...(transition.reason && { closeReason: transition.reason }),
      ...(transition.notes && { notes: `${deal.notes || ''}\n\nStage Transition: ${transition.fromStage} → ${newStage}\n${transition.notes}` })
    };

    // If closing the deal, set actual close date
    if (newStage === 'CLOSED_WON' || newStage === 'CLOSED_LOST') {
      updateData.actualCloseDate = new Date();
    }

    return await this.update(id, updateData, {
      company: true,
      primaryContact: true,
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
   * Delete deal with permission check
   */
  async deleteDeal(id: string, userId: string) {
    const deal = await this.findById(id);
    if (!deal) {
      throw ErrorFactory.notFound('Deal');
    }

    if (deal.ownerId !== userId) {
      throw ErrorFactory.forbidden('You do not have permission to delete this deal');
    }

    return await this.delete(id);
  }

  /**
   * Get deals by stage
   */
  async getDealsByStage(stage: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { stage, isActive: true }, {
      includeCompany: true,
      includeContact: true,
      includeOwner: true
    });
  }

  /**
   * Get deals by owner
   */
  async getDealsByOwner(ownerId: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { ownerId, isActive: true }, {
      includeCompany: true,
      includeContact: true,
      includeOwner: true
    });
  }

  /**
   * Get deals by company
   */
  async getDealsByCompany(companyId: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { companyId, isActive: true }, {
      includeCompany: true,
      includeContact: true,
      includeOwner: true
    });
  }

  /**
   * Search deals with advanced search
   */
  async searchDeals(searchTerm: string, options: PaginationOptions = {}) {
    return await this.getDeals(options, {}, {
      search: searchTerm,
      includeCompany: true,
      includeContact: true,
      includeOwner: true
    });
  }

  /**
   * Get deals closing soon
   */
  async getDealsClosingSoon(days: number = 30, options: PaginationOptions = {}) {
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + days);

    return await this.findAll(options, {
      isActive: true,
      expectedCloseDate: {
        lte: closeDate,
        gte: new Date()
      }
    }, {
      includeCompany: true,
      includeContact: true,
      includeOwner: true
    });
  }

  /**
   * Get high-value deals
   */
  async getHighValueDeals(minValue: number, options: PaginationOptions = {}) {
    return await this.findAll(options, {
      isActive: true,
      value: {
        gte: minValue
      }
    }, {
      includeCompany: true,
      includeContact: true,
      includeOwner: true
    });
  }

  /**
   * Bulk update deals
   */
  async bulkUpdateDeals(dealIds: string[], updates: Partial<UpdateDealRequest>, userId: string) {
    return await databaseService.transaction(async (tx) => {
      const results = [];
      
      for (const id of dealIds) {
        try {
          const deal = await tx.deal.findUnique({ where: { id } });
          if (!deal) {
            results.push({ id, success: false, error: 'Deal not found' });
            continue;
          }

          if (deal.ownerId !== userId) {
            results.push({ id, success: false, error: 'Permission denied' });
            continue;
          }

          const updated = await tx.deal.update({
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
export const dealService = new DealService();
