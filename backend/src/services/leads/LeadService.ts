import { BaseService, PaginationOptions, FilterOptions } from '@/services/base';
import { databaseService } from '@/services/base/DatabaseService';
import { ErrorFactory } from '@/utils/errors';
import type { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/types';

export interface LeadFilters extends FilterOptions {
  source?: string;
  status?: string;
  assignedToId?: string;
  leadScore?: number;
  isConverted?: boolean;
  createdAtFrom?: string;
  createdAtTo?: string;
  lastActivityDateFrom?: string;
  lastActivityDateTo?: string;
}

export interface LeadSearchOptions {
  search?: string;
  includeConverted?: boolean;
  includeAssignee?: boolean;
  includeActivities?: boolean;
}

export interface LeadScoringCriteria {
  email?: boolean;
  phone?: boolean;
  company?: boolean;
  jobTitle?: boolean;
  website?: boolean;
  source?: string;
  activityLevel?: number;
}

export interface LeadConversion {
  convertedToContactId?: string;
  convertedToCompanyId?: string;
  convertedToDealId?: string;
  conversionNotes?: string;
  conversionValue?: number;
}

export class LeadService extends BaseService<Lead, CreateLeadRequest, UpdateLeadRequest> {
  constructor() {
    super('lead');
  }

  /**
   * Get leads with advanced filtering and search
   */
  async getLeads(
    options: PaginationOptions = {},
    filters: LeadFilters = {},
    searchOptions: LeadSearchOptions = {}
  ) {
    const { search, includeConverted = false, includeAssignee = true, includeActivities = false } = searchOptions;

    // Build include object
    const include: any = {};
    if (includeAssignee) {
      include.assignedTo = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }
    if (includeActivities) {
      include.activities = {
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      };
    }

    // Build filters
    const whereFilters: any = {};

    if (filters.source) {
      whereFilters.source = filters.source;
    }

    if (filters.status) {
      whereFilters.status = filters.status;
    }

    if (filters.assignedToId) {
      whereFilters.assignedToId = filters.assignedToId;
    }

    if (filters.leadScore !== undefined) {
      whereFilters.leadScore = {
        gte: filters.leadScore
      };
    }

    if (filters.isConverted !== undefined) {
      whereFilters.isConverted = filters.isConverted;
    } else if (!includeConverted) {
      whereFilters.isConverted = false;
    }

    if (filters.createdAtFrom || filters.createdAtTo) {
      whereFilters.createdAt = {};
      if (filters.createdAtFrom) {
        whereFilters.createdAt.gte = new Date(filters.createdAtFrom);
      }
      if (filters.createdAtTo) {
        whereFilters.createdAt.lte = new Date(filters.createdAtTo);
      }
    }

    if (filters.lastActivityDateFrom || filters.lastActivityDateTo) {
      whereFilters.lastActivityDate = {};
      if (filters.lastActivityDateFrom) {
        whereFilters.lastActivityDate.gte = new Date(filters.lastActivityDateFrom);
      }
      if (filters.lastActivityDateTo) {
        whereFilters.lastActivityDate.lte = new Date(filters.lastActivityDateTo);
      }
    }

    // Add search functionality
    if (search) {
      whereFilters.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await this.findAll(options, whereFilters, include);
  }

  /**
   * Get lead by ID with optional includes
   */
  async getLeadById(id: string, includeAssignee = true, includeActivities = true) {
    const include: any = {};
    if (includeAssignee) {
      include.assignedTo = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }
    if (includeActivities) {
      include.activities = {
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true,
          duration: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      };
    }

    const lead = await this.findById(id, include);
    if (!lead) {
      throw ErrorFactory.notFound('Lead');
    }

    return lead;
  }

  /**
   * Create a new lead with automatic scoring
   */
  async createLead(data: CreateLeadRequest, creatorId?: string) {
    // Calculate initial lead score
    const leadScore = this.calculateLeadScore(data);

    // Add default values
    const leadData = {
      ...data,
      leadScore,
      status: 'NEW',
      isConverted: false,
      tags: data.tags || []
    };

    const lead = await this.create(leadData, {
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    });

    // Auto-assign lead if not assigned
    if (!lead.assignedToId) {
      await this.autoAssignLead(lead.id);
    }

    return lead;
  }

  /**
   * Update lead with validation
   */
  async updateLead(id: string, data: UpdateLeadRequest, userId: string) {
    // Check if lead exists
    const existingLead = await this.findById(id);
    if (!existingLead) {
      throw ErrorFactory.notFound('Lead');
    }

    // Check if user has permission to update
    if (existingLead.assignedToId !== userId) {
      // TODO: Add role-based permission check
      throw ErrorFactory.forbidden('You do not have permission to update this lead');
    }

    // Recalculate lead score if relevant fields changed
    if (data.email || data.phone || data.company || data.jobTitle || data.website) {
      const updatedData = { ...existingLead, ...data };
      data.leadScore = this.calculateLeadScore(updatedData);
    }

    return await this.update(id, data, {
      assignedTo: {
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
   * Convert lead to contact/deal
   */
  async convertLead(id: string, conversion: LeadConversion, userId: string) {
    const lead = await this.findById(id);
    if (!lead) {
      throw ErrorFactory.notFound('Lead');
    }

    if (lead.isConverted) {
      throw ErrorFactory.badRequest('Lead is already converted');
    }

    // Validate conversion data
    if (!conversion.convertedToContactId && !conversion.convertedToCompanyId) {
      throw ErrorFactory.badRequest('Lead must be converted to at least a contact or company');
    }

    return await databaseService.transaction(async (tx) => {
      // Create contact if not provided
      let contactId = conversion.convertedToContactId;
      if (!contactId) {
        const contact = await tx.contact.create({
          data: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            jobTitle: lead.jobTitle,
            company: lead.company,
            address: lead.address,
            city: lead.city,
            state: lead.state,
            zipCode: lead.zipCode,
            country: lead.country,
            source: lead.source,
            ownerId: userId,
            isActive: true
          }
        });
        contactId = contact.id;
      }

      // Create company if not provided
      let companyId = conversion.convertedToCompanyId;
      if (!companyId && lead.company) {
        const company = await tx.company.create({
          data: {
            name: lead.company,
            website: lead.website,
            industry: 'Unknown',
            size: 'Unknown',
            isActive: true
          }
        });
        companyId = company.id;
      }

      // Create deal if value is provided
      let dealId = conversion.convertedToDealId;
      if (!dealId && conversion.conversionValue) {
        const deal = await tx.deal.create({
          data: {
            title: `Deal from ${lead.firstName} ${lead.lastName}`,
            value: conversion.conversionValue,
            stage: 'PROSPECTING',
            companyId: companyId!,
            primaryContactId: contactId,
            ownerId: userId,
            isActive: true
          }
        });
        dealId = deal.id;
      }

      // Update lead as converted
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          isConverted: true,
          convertedToContactId: contactId,
          convertedToCompanyId: companyId,
          convertedToDealId: dealId,
          convertedAt: new Date(),
          notes: conversion.conversionNotes ? 
            `${lead.notes || ''}\n\nLead Converted: ${conversion.conversionNotes}` : 
            lead.notes
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return updatedLead;
    });
  }

  /**
   * Delete lead with permission check
   */
  async deleteLead(id: string, userId: string) {
    const lead = await this.findById(id);
    if (!lead) {
      throw ErrorFactory.notFound('Lead');
    }

    if (lead.assignedToId !== userId) {
      throw ErrorFactory.forbidden('You do not have permission to delete this lead');
    }

    return await this.delete(id);
  }

  /**
   * Get leads by source
   */
  async getLeadsBySource(source: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { source, isConverted: false }, {
      includeAssignee: true,
      includeActivities: false
    });
  }

  /**
   * Get leads by status
   */
  async getLeadsByStatus(status: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { status, isConverted: false }, {
      includeAssignee: true,
      includeActivities: false
    });
  }

  /**
   * Get leads by assignee
   */
  async getLeadsByAssignee(assigneeId: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { assignedToId: assigneeId, isConverted: false }, {
      includeAssignee: true,
      includeActivities: false
    });
  }

  /**
   * Get high-scoring leads
   */
  async getHighScoringLeads(minScore: number = 80, options: PaginationOptions = {}) {
    return await this.findAll(options, { 
      leadScore: { gte: minScore },
      isConverted: false 
    }, {
      includeAssignee: true,
      includeActivities: false
    });
  }

  /**
   * Search leads with advanced search
   */
  async searchLeads(searchTerm: string, options: PaginationOptions = {}) {
    return await this.getLeads(options, {}, {
      search: searchTerm,
      includeAssignee: true,
      includeActivities: false
    });
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(userId?: string) {
    const where: any = {};
    if (userId) {
      where.assignedToId = userId;
    }

    const [
      totalLeads,
      convertedLeads,
      newLeads,
      leadsBySource,
      leadsByStatus,
      averageScore
    ] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, isConverted: true } }),
      this.prisma.lead.count({ where: { ...where, status: 'NEW' } }),
      this.prisma.lead.groupBy({
        by: ['source'],
        where,
        _count: {
          source: true
        }
      }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true
        }
      }),
      this.prisma.lead.aggregate({
        where,
        _avg: {
          leadScore: true
        }
      })
    ]);

    return {
      totalLeads,
      convertedLeads,
      newLeads,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      averageScore: averageScore._avg.leadScore || 0,
      leadsBySource: leadsBySource.reduce((acc, item) => {
        acc[item.source] = item._count.source;
        return acc;
      }, {} as Record<string, number>),
      leadsByStatus: leadsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Bulk update leads
   */
  async bulkUpdateLeads(leadIds: string[], updates: Partial<UpdateLeadRequest>, userId: string) {
    return await databaseService.transaction(async (tx) => {
      const results = [];
      
      for (const id of leadIds) {
        try {
          const lead = await tx.lead.findUnique({ where: { id } });
          if (!lead) {
            results.push({ id, success: false, error: 'Lead not found' });
            continue;
          }

          if (lead.assignedToId !== userId) {
            results.push({ id, success: false, error: 'Permission denied' });
            continue;
          }

          const updated = await tx.lead.update({
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

  /**
   * Calculate lead score based on criteria
   */
  private calculateLeadScore(data: CreateLeadRequest | any): number {
    let score = 0;

    // Basic information scoring
    if (data.email) score += 20;
    if (data.phone) score += 15;
    if (data.company) score += 10;
    if (data.jobTitle) score += 10;
    if (data.website) score += 5;

    // Source-based scoring
    switch (data.source?.toLowerCase()) {
      case 'website':
        score += 25;
        break;
      case 'referral':
        score += 30;
        break;
      case 'social_media':
        score += 15;
        break;
      case 'cold_call':
        score += 5;
        break;
      case 'email_campaign':
        score += 10;
        break;
      default:
        score += 5;
    }

    // Cap score at 100
    return Math.min(score, 100);
  }

  /**
   * Auto-assign lead to available team member
   */
  private async autoAssignLead(leadId: string): Promise<void> {
    // Find first available team member
    const teamMember = await this.prisma.user.findFirst({
      where: {
        isActive: true
      }
    });

    if (teamMember) {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { assignedToId: teamMember.id }
      });
    }
  }
}

// Export singleton instance
export const leadService = new LeadService();
