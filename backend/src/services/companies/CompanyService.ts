import { BaseService, PaginationOptions, FilterOptions } from '@/services/base';
import { databaseService } from '@/services/base/DatabaseService';
import { ErrorFactory } from '@/utils/errors';
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from '@/types';

export interface CompanyFilters extends FilterOptions {
  industry?: string;
  size?: string;
  isActive?: boolean;
  website?: string;
  phone?: string;
}

export interface CompanySearchOptions {
  search?: string;
  includeInactive?: boolean;
  includeContacts?: boolean;
  includeDeals?: boolean;
}

export class CompanyService extends BaseService<Company, CreateCompanyRequest, UpdateCompanyRequest> {
  constructor() {
    super('company');
  }

  /**
   * Get companies with advanced filtering and search
   */
  async getCompanies(
    options: PaginationOptions = {},
    filters: CompanyFilters = {},
    searchOptions: CompanySearchOptions = {}
  ) {
    const { search, includeInactive = false, includeContacts = false, includeDeals = false } = searchOptions;

    // Build include object
    const include: any = {};
    if (includeContacts) {
      include.contacts = {
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
          leadStatus: true
        }
      };
    }
    if (includeDeals) {
      include.deals = {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          value: true,
          stage: true,
          expectedCloseDate: true
        }
      };
    }

    // Build filters
    const whereFilters: any = {};

    if (filters.industry) {
      whereFilters.industry = filters.industry;
    }

    if (filters.size) {
      whereFilters.size = filters.size;
    }

    if (filters.isActive !== undefined) {
      whereFilters.isActive = filters.isActive;
    } else if (!includeInactive) {
      whereFilters.isActive = true;
    }

    if (filters.website) {
      whereFilters.website = {
        contains: filters.website,
        mode: 'insensitive'
      };
    }

    if (filters.phone) {
      whereFilters.phone = {
        contains: filters.phone,
        mode: 'insensitive'
      };
    }

    // Add search functionality
    if (search) {
      whereFilters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await this.findAll(options, whereFilters, include);
  }

  /**
   * Get company by ID with optional includes
   */
  async getCompanyById(id: string, includeContacts = false, includeDeals = false) {
    const include: any = {};
    if (includeContacts) {
      include.contacts = {
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
          leadStatus: true,
          phone: true
        }
      };
    }
    if (includeDeals) {
      include.deals = {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          value: true,
          stage: true,
          expectedCloseDate: true,
          probability: true
        }
      };
    }

    const company = await this.findById(id, include);
    if (!company) {
      throw ErrorFactory.notFound('Company');
    }

    return company;
  }

  /**
   * Create a new company with validation
   */
  async createCompany(data: CreateCompanyRequest) {
    // Validate website uniqueness if provided
    if (data.website) {
      const existingCompany = await this.prisma.company.findFirst({
        where: { website: data.website }
      });
      if (existingCompany) {
        throw ErrorFactory.conflict('Company with this website already exists');
      }
    }

    // Add default values
    const companyData = {
      ...data,
      isActive: true,
      revenue: data.revenue || 0,
      employeeCount: data.employeeCount || 0
    };

    return await this.create(companyData, {
      contacts: {
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true
        }
      }
    });
  }

  /**
   * Update company with validation
   */
  async updateCompany(id: string, data: UpdateCompanyRequest) {
    // Check if company exists
    const existingCompany = await this.findById(id);
    if (!existingCompany) {
      throw ErrorFactory.notFound('Company');
    }

    // Validate website uniqueness if being updated
    if (data.website && data.website !== existingCompany.website) {
      const websiteExists = await this.prisma.company.findFirst({
        where: { 
          website: data.website,
          id: { not: id }
        }
      });
      if (websiteExists) {
        throw ErrorFactory.conflict('Company with this website already exists');
      }
    }

    return await this.update(id, data, {
      contacts: {
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true
        }
      }
    });
  }

  /**
   * Delete company with validation
   */
  async deleteCompany(id: string) {
    const company = await this.findById(id);
    if (!company) {
      throw ErrorFactory.notFound('Company');
    }

    // Check if company has active contacts
    const activeContacts = await this.prisma.contact.count({
      where: { companyId: id, isActive: true }
    });

    if (activeContacts > 0) {
      throw ErrorFactory.conflict('Cannot delete company with active contacts');
    }

    // Check if company has active deals
    const activeDeals = await this.prisma.deal.count({
      where: { companyId: id, isActive: true }
    });

    if (activeDeals > 0) {
      throw ErrorFactory.conflict('Cannot delete company with active deals');
    }

    return await this.delete(id);
  }

  /**
   * Soft delete company
   */
  async softDeleteCompany(id: string) {
    const company = await this.findById(id);
    if (!company) {
      throw ErrorFactory.notFound('Company');
    }

    return await this.softDelete(id);
  }

  /**
   * Get companies by industry
   */
  async getCompaniesByIndustry(industry: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { industry, isActive: true }, {
      includeContacts: true,
      includeDeals: true
    });
  }

  /**
   * Get companies by size
   */
  async getCompaniesBySize(size: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { size, isActive: true }, {
      includeContacts: true,
      includeDeals: true
    });
  }

  /**
   * Search companies with advanced search
   */
  async searchCompanies(searchTerm: string, options: PaginationOptions = {}) {
    return await this.getCompanies(options, {}, {
      search: searchTerm,
      includeContacts: true,
      includeDeals: true
    });
  }

  /**
   * Get company statistics
   */
  async getCompanyStats() {
    const [
      totalCompanies,
      activeCompanies,
      companiesThisMonth,
      companiesByIndustry,
      companiesBySize,
      totalRevenue
    ] = await Promise.all([
      this.prisma.company.count({ where: { isActive: true } }),
      this.prisma.company.count({ where: { isActive: true } }),
      this.prisma.company.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      this.prisma.company.groupBy({
        by: ['industry'],
        where: { isActive: true },
        _count: {
          industry: true
        }
      }),
      this.prisma.company.groupBy({
        by: ['size'],
        where: { isActive: true },
        _count: {
          size: true
        }
      }),
      this.prisma.company.aggregate({
        where: { isActive: true },
        _sum: {
          revenue: true
        }
      })
    ]);

    return {
      totalCompanies,
      activeCompanies,
      companiesThisMonth,
      companiesByIndustry: companiesByIndustry.reduce((acc, item) => {
        if (item.industry) {
          acc[item.industry] = item._count.industry;
        }
        return acc;
      }, {} as Record<string, number>),
      companiesBySize: companiesBySize.reduce((acc, item) => {
        if (item.size) {
          acc[item.size] = item._count.size;
        }
        return acc;
      }, {} as Record<string, number>),
      totalRevenue: totalRevenue._sum?.revenue || 0
    };
  }

  /**
   * Get company hierarchy (parent-child relationships)
   */
  async getCompanyHierarchy(companyId: string) {
    const company = await this.findById(companyId);
    if (!company) {
      throw ErrorFactory.notFound('Company');
    }

    const [parent, children] = await Promise.all([
      company.parentCompanyId ? this.findById(company.parentCompanyId) : null,
      this.prisma.company.findMany({
        where: { parentCompanyId: companyId, isActive: true },
        select: {
          id: true,
          name: true,
          industry: true,
          size: true,
          revenue: true
        }
      })
    ]);

    return {
      company,
      parent,
      children
    };
  }

  /**
   * Merge companies (move contacts and deals from source to target)
   */
  async mergeCompanies(sourceId: string, targetId: string) {
    return await databaseService.transaction(async (tx) => {
      // Verify both companies exist
      const [sourceCompany, targetCompany] = await Promise.all([
        tx.company.findUnique({ where: { id: sourceId } }),
        tx.company.findUnique({ where: { id: targetId } })
      ]);

      if (!sourceCompany || !targetCompany) {
        throw ErrorFactory.notFound('Company');
      }

      // Move all contacts from source to target
      await tx.contact.updateMany({
        where: { companyId: sourceId },
        data: { companyId: targetId }
      });

      // Move all deals from source to target
      await tx.deal.updateMany({
        where: { companyId: sourceId },
        data: { companyId: targetId }
      });

      // Soft delete the source company
      await tx.company.update({
        where: { id: sourceId },
        data: { isActive: false }
      });

      // Return the target company with updated data
      return await tx.company.findUnique({
        where: { id: targetId },
        include: {
          contacts: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              jobTitle: true
            }
          },
          deals: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              value: true,
              stage: true
            }
          }
        }
      });
    });
  }
}

// Export singleton instance
export const companyService = new CompanyService();
