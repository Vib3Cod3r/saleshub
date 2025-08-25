import { PrismaClient } from '@prisma/client';
import { cacheService } from '../cache/CacheService';
import { logger } from '../../utils/logger';

export interface SearchFilters {
  entityType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  score: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchOptions {
  query: string;
  entityType?: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

export class SearchService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async searchEntities(options: SearchOptions): Promise<SearchResult[]> {
    const { query, entityType, filters, limit = 20, offset = 0 } = options;
    
    // Generate cache key
    const cacheKey = this.generateSearchCacheKey(options);
    
    try {
      // Try cache first
      const cached = await cacheService.get<SearchResult[]>(cacheKey);
      if (cached) {
        logger.debug(`Search cache HIT: ${cacheKey}`);
        return cached;
      }

      logger.debug(`Search cache MISS: ${cacheKey}`);

      // Perform search
      const results = await this.performSearch(options);
      
      // Cache results for 10 minutes
      await cacheService.set(cacheKey, results, {
        ttl: 600,
        tags: ['search', entityType || 'all']
      });

      return results;
    } catch (error) {
      logger.error('Search error:', error);
      return [];
    }
  }

  private async performSearch(options: SearchOptions): Promise<SearchResult[]> {
    const { query, entityType, filters, limit = 20, offset = 0 } = options;
    const results: SearchResult[] = [];

    try {
      // Search contacts
      if (!entityType || entityType === 'contacts') {
        const contacts = await this.searchContacts(query, filters, limit, offset);
        results.push(...contacts);
      }

      // Search companies
      if (!entityType || entityType === 'companies') {
        const companies = await this.searchCompanies(query, filters, limit, offset);
        results.push(...companies);
      }

      // Search deals
      if (!entityType || entityType === 'deals') {
        const deals = await this.searchDeals(query, filters, limit, offset);
        results.push(...deals);
      }

      // Search leads
      if (!entityType || entityType === 'leads') {
        const leads = await this.searchLeads(query, filters, limit, offset);
        results.push(...leads);
      }

      // Sort by relevance score
      results.sort((a, b) => b.score - a.score);

      // Apply limit and offset
      return results.slice(offset, offset + limit);
    } catch (error) {
      logger.error('Perform search error:', error);
      return [];
    }
  }

  private async searchContacts(
    query: string,
    filters: SearchFilters = {},
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const where: any = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        company: true
      }
    });

    return contacts.map(contact => ({
      id: contact.id,
      type: 'contact',
      title: `${contact.firstName} ${contact.lastName}`,
      description: contact.email,
      score: this.calculateRelevanceScore(query, [
        contact.firstName,
        contact.lastName,
        contact.email || '',
        contact.phone || ''
      ]),
      metadata: {
        email: contact.email,
        phone: contact.phone,
        company: contact.company?.name
      },
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }));
  }

  private async searchCompanies(
    query: string,
    filters: SearchFilters = {},
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { industry: { contains: query, mode: 'insensitive' } },
        { website: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const companies = await this.prisma.company.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            contacts: true,
            deals: true
          }
        }
      }
    });

    return companies.map(company => ({
      id: company.id,
      type: 'company',
      title: company.name,
      description: company.industry,
      score: this.calculateRelevanceScore(query, [
        company.name,
        company.industry || '',
        company.website || ''
      ]),
      metadata: {
        industry: company.industry,
        website: company.website,
        contactCount: company._count.contacts,
        dealCount: company._count.deals
      },
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    }));
  }

  private async searchDeals(
    query: string,
    filters: SearchFilters = {},
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { stage: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Apply filters
    if (filters.status) {
      where.stage = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const deals = await this.prisma.deal.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        company: true
      }
    });

    return deals.map(deal => ({
      id: deal.id,
      type: 'deal',
      title: deal.title,
      description: deal.description,
      score: this.calculateRelevanceScore(query, [
        deal.title,
        deal.description || '',
        deal.stage
      ]),
      metadata: {
        stage: deal.stage,
        value: deal.value,
        company: deal.company?.name
      },
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString()
    }));
  }

  private async searchLeads(
    query: string,
    filters: SearchFilters = {},
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    const where: any = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const leads = await this.prisma.lead.findMany({
      where,
      take: limit,
      skip: offset
    });

    return leads.map(lead => ({
      id: lead.id,
      type: 'lead',
      title: `${lead.firstName} ${lead.lastName}`,
      description: lead.company,
      score: this.calculateRelevanceScore(query, [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.company || ''
      ]),
      metadata: {
        status: lead.status,
        company: lead.company,
        email: lead.email,
        phone: lead.phone
      },
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString()
    }));
  }

  private calculateRelevanceScore(query: string, fields: string[]): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    for (const field of fields) {
      if (!field) continue;
      
      const fieldLower = field.toLowerCase();
      
      // Exact match gets highest score
      if (fieldLower === queryLower) {
        score += 100;
      }
      // Starts with query
      else if (fieldLower.startsWith(queryLower)) {
        score += 50;
      }
      // Contains query
      else if (fieldLower.includes(queryLower)) {
        score += 25;
      }
      // Partial word match
      else {
        const words = queryLower.split(' ');
        for (const word of words) {
          if (fieldLower.includes(word)) {
            score += 10;
          }
        }
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  private generateSearchCacheKey(options: SearchOptions): string {
    const { query, entityType, filters, limit, offset } = options;
    const filterString = filters ? JSON.stringify(filters) : '';
    
    return `search:${entityType || 'all'}:${query}:${filterString}:${limit}:${offset}`;
  }

  async getSearchSuggestions(query: string, entityType?: string): Promise<string[]> {
    const cacheKey = `search_suggestions:${entityType || 'all'}:${query}`;
    
    try {
      const cached = await cacheService.get<string[]>(cacheKey);
      if (cached) return cached;

      const suggestions: string[] = [];
      
      // Get suggestions from different entity types
      if (!entityType || entityType === 'contacts') {
        const contactSuggestions = await this.getContactSuggestions(query);
        suggestions.push(...contactSuggestions);
      }
      
      if (!entityType || entityType === 'companies') {
        const companySuggestions = await this.getCompanySuggestions(query);
        suggestions.push(...companySuggestions);
      }

      // Cache suggestions for 5 minutes
      await cacheService.set(cacheKey, suggestions, { ttl: 300 });
      
      return suggestions.slice(0, 10); // Limit to 10 suggestions
    } catch (error) {
      logger.error('Get search suggestions error:', error);
      return [];
    }
  }

  private async getContactSuggestions(query: string): Promise<string[]> {
    const contacts = await this.prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    });

    return contacts.map(contact => 
      `${contact.firstName} ${contact.lastName} (${contact.email})`
    );
  }

  private async getCompanySuggestions(query: string): Promise<string[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      take: 5,
      select: {
        name: true,
        industry: true
      }
    });

    return companies.map(company => 
      `${company.name} (${company.industry})`
    );
  }

  async getSearchAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<any> {
    const cacheKey = `search_analytics:${timeRange}`;
    
    try {
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      // This would typically query a search analytics table
      // For now, return mock data
      const analytics = {
        totalSearches: Math.floor(Math.random() * 1000) + 100,
        averageResponseTime: Math.random() * 100 + 50,
        topQueries: [
          { query: 'john', count: 45 },
          { query: 'tech', count: 32 },
          { query: 'deal', count: 28 }
        ],
        searchByEntity: {
          contacts: 45,
          companies: 30,
          deals: 15,
          leads: 10
        }
      };

      await cacheService.set(cacheKey, analytics, { ttl: 300 });
      return analytics;
    } catch (error) {
      logger.error('Get search analytics error:', error);
      return {};
    }
  }
}

// Singleton instance
export const searchService = new SearchService();
