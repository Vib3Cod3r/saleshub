import { PrismaClient } from '@prisma/client';
import { prisma } from '@/utils/database';
import { ErrorFactory } from '@/utils/errors';

export interface DashboardMetrics {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalLeads: number;
  totalTasks: number;
  activeDeals: number;
  pipelineValue: number;
  conversionRate: number;
  averageDealValue: number;
  tasksCompleted: number;
  leadsConverted: number;
  revenueForecast: number;
}

export interface SalesAnalytics {
  dealsByStage: Record<string, number>;
  dealsByOwner: Record<string, number>;
  dealsByCompany: Record<string, number>;
  revenueByMonth: Record<string, number>;
  conversionRates: Record<string, number>;
  averageDealCycle: number;
  winRate: number;
  lossRate: number;
}

export interface ActivityAnalytics {
  tasksByStatus: Record<string, number>;
  tasksByAssignee: Record<string, number>;
  tasksByPriority: Record<string, number>;
  completionRate: number;
  averageTaskDuration: number;
  overdueTasks: number;
  tasksDueToday: number;
}

export interface LeadAnalytics {
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  leadsByAssignee: Record<string, number>;
  conversionRate: number;
  averageScore: number;
  highScoringLeads: number;
  leadsThisMonth: number;
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  companyId?: string;
  stage?: string;
  source?: string;
  status?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeaders: boolean;
  filters?: ReportFilters;
}

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(userId?: string): Promise<DashboardMetrics> {
    const where: any = {};
    if (userId) {
      where.OR = [
        { ownerId: userId },
        { assignedToId: userId }
      ];
    }

    const [
      totalContacts,
      totalCompanies,
      totalDeals,
      totalLeads,
      totalTasks,
      activeDeals,
      pipelineValue,
      tasksCompleted,
      leadsConverted,
      averageDealValue,
      conversionRate,
      revenueForecast
    ] = await Promise.all([
      this.prisma.contact.count({ where: { isActive: true } }),
      this.prisma.company.count({ where: { isActive: true } }),
      this.prisma.deal.count({ where: { isActive: true } }),
      this.prisma.lead.count({ where: { isConverted: false } }),
      this.prisma.task.count({ where: { status: { not: 'COMPLETED' } } }),
      this.prisma.deal.count({ where: { isActive: true, stage: { not: 'CLOSED_WON' } } }),
      this.prisma.deal.aggregate({
        where: { isActive: true, stage: { not: 'CLOSED_WON' } },
        _sum: { value: true }
      }),
      this.prisma.task.count({ where: { status: 'COMPLETED' } }),
      this.prisma.lead.count({ where: { isConverted: true } }),
      this.prisma.deal.aggregate({
        where: { isActive: true },
        _avg: { value: true }
      }),
      this.prisma.lead.count({ where: { isConverted: true } }),
      this.prisma.deal.aggregate({
        where: { 
          isActive: true, 
          stage: { not: 'CLOSED_LOST' },
          expectedCloseDate: {
            gte: new Date(),
            lte: new Date(new Date().setMonth(new Date().getMonth() + 3))
          }
        },
        _sum: { value: true }
      })
    ]);

    const totalLeadsCount = await this.prisma.lead.count();
    const conversionRateValue = totalLeadsCount > 0 ? (leadsConverted / totalLeadsCount) * 100 : 0;

    return {
      totalContacts,
      totalCompanies,
      totalDeals,
      totalLeads,
      totalTasks,
      activeDeals,
      pipelineValue: pipelineValue._sum.value || 0,
      conversionRate: conversionRateValue,
      averageDealValue: averageDealValue._avg.value || 0,
      tasksCompleted,
      leadsConverted,
      revenueForecast: revenueForecast._sum.value || 0
    };
  }

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(filters: ReportFilters = {}): Promise<SalesAnalytics> {
    const where: any = { isActive: true };
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    if (filters.userId) {
      where.ownerId = filters.userId;
    }

    if (filters.stage) {
      where.stage = filters.stage;
    }

    const [
      dealsByStage,
      dealsByOwner,
      dealsByCompany,
      revenueByMonth,
      averageDealCycle,
      winRate,
      lossRate
    ] = await Promise.all([
      this.prisma.deal.groupBy({
        by: ['stage'],
        where,
        _count: { stage: true },
        _sum: { value: true }
      }),
      this.prisma.deal.groupBy({
        by: ['ownerId'],
        where,
        _count: { ownerId: true },
        _sum: { value: true }
      }),
      this.prisma.deal.groupBy({
        by: ['companyId'],
        where,
        _count: { companyId: true },
        _sum: { value: true }
      }),
      this.prisma.deal.groupBy({
        by: ['createdAt'],
        where,
        _sum: { value: true }
      }),
      this.prisma.deal.count({ where: { isActive: true, actualCloseDate: { not: null } } }),
      this.prisma.deal.count({ where: { stage: 'CLOSED_WON' } }),
      this.prisma.deal.count({ where: { stage: 'CLOSED_LOST' } })
    ]);

    const totalDeals = await this.prisma.deal.count({ where });
    const winRateValue = totalDeals > 0 ? (winRate / totalDeals) * 100 : 0;
    const lossRateValue = totalDeals > 0 ? (lossRate / totalDeals) * 100 : 0;

    return {
      dealsByStage: dealsByStage.reduce((acc, item) => {
        acc[item.stage] = item._count.stage;
        return acc;
      }, {} as Record<string, number>),
      dealsByOwner: dealsByOwner.reduce((acc, item) => {
        acc[item.ownerId] = item._count.ownerId;
        return acc;
      }, {} as Record<string, number>),
      dealsByCompany: dealsByCompany.reduce((acc, item) => {
        acc[item.companyId] = item._count.companyId;
        return acc;
      }, {} as Record<string, number>),
      revenueByMonth: revenueByMonth.reduce((acc, item) => {
        const month = item.createdAt.toISOString().substring(0, 7);
        acc[month] = item._sum.value || 0;
        return acc;
      }, {} as Record<string, number>),
      conversionRates: {},
      averageDealCycle: 0, // TODO: Calculate actual deal cycle
      winRate: winRateValue,
      lossRate: lossRateValue
    };
  }

  /**
   * Get activity analytics
   */
  async getActivityAnalytics(filters: ReportFilters = {}): Promise<ActivityAnalytics> {
    const where: any = {};
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    if (filters.userId) {
      where.OR = [
        { assigneeId: filters.userId },
        { creatorId: filters.userId }
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [
      tasksByStatus,
      tasksByAssignee,
      tasksByPriority,
      completedTasks,
      totalTasks,
      overdueTasks,
      tasksDueToday,
      averageTaskDuration
    ] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      this.prisma.task.groupBy({
        by: ['assigneeId'],
        where,
        _count: { assigneeId: true }
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true }
      }),
      this.prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.task.count({ where }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: {
            gte: new Date(),
            lt: new Date(new Date().setDate(new Date().getDate() + 1))
          },
          status: { not: 'COMPLETED' }
        }
      }),
      this.prisma.task.aggregate({
        where: { ...where, actualDuration: { not: null } },
        _avg: { actualDuration: true }
      })
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      tasksByAssignee: tasksByAssignee.reduce((acc, item) => {
        acc[item.assigneeId || 'unassigned'] = item._count.assigneeId;
        return acc;
      }, {} as Record<string, number>),
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<string, number>),
      completionRate,
      averageTaskDuration: averageTaskDuration._avg.actualDuration || 0,
      overdueTasks,
      tasksDueToday
    };
  }

  /**
   * Get lead analytics
   */
  async getLeadAnalytics(filters: ReportFilters = {}): Promise<LeadAnalytics> {
    const where: any = {};
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    if (filters.userId) {
      where.assignedToId = filters.userId;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [
      leadsBySource,
      leadsByStatus,
      leadsByAssignee,
      convertedLeads,
      totalLeads,
      averageScore,
      highScoringLeads,
      leadsThisMonth
    ] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['source'],
        where,
        _count: { source: true }
      }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      this.prisma.lead.groupBy({
        by: ['assignedToId'],
        where,
        _count: { assignedToId: true }
      }),
      this.prisma.lead.count({ where: { ...where, isConverted: true } }),
      this.prisma.lead.count({ where }),
      this.prisma.lead.aggregate({
        where,
        _avg: { leadScore: true }
      }),
      this.prisma.lead.count({ where: { ...where, leadScore: { gte: 80 } } }),
      this.prisma.lead.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      leadsBySource: leadsBySource.reduce((acc, item) => {
        acc[item.source] = item._count.source;
        return acc;
      }, {} as Record<string, number>),
      leadsByStatus: leadsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      leadsByAssignee: leadsByAssignee.reduce((acc, item) => {
        acc[item.assignedToId || 'unassigned'] = item._count.assignedToId;
        return acc;
      }, {} as Record<string, number>),
      conversionRate,
      averageScore: averageScore._avg.leadScore || 0,
      highScoringLeads,
      leadsThisMonth
    };
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(reportType: string, filters: ReportFilters = {}): Promise<any> {
    switch (reportType) {
      case 'sales':
        return await this.getSalesAnalytics(filters);
      case 'activity':
        return await this.getActivityAnalytics(filters);
      case 'leads':
        return await this.getLeadAnalytics(filters);
      case 'dashboard':
        return await this.getDashboardMetrics(filters.userId);
      default:
        throw ErrorFactory.badRequest('Invalid report type');
    }
  }

  /**
   * Export data
   */
  async exportData(entityType: string, options: ExportOptions): Promise<string> {
    const where: any = {};
    
    if (options.filters) {
      if (options.filters.dateFrom || options.filters.dateTo) {
        where.createdAt = {};
        if (options.filters.dateFrom) where.createdAt.gte = new Date(options.filters.dateFrom);
        if (options.filters.dateTo) where.createdAt.lte = new Date(options.filters.dateTo);
      }

      if (options.filters.userId) {
        where.ownerId = options.filters.userId;
      }
    }

    let data: any[] = [];

    switch (entityType) {
      case 'contacts':
        data = await this.prisma.contact.findMany({ where });
        break;
      case 'companies':
        data = await this.prisma.company.findMany({ where });
        break;
      case 'deals':
        data = await this.prisma.deal.findMany({ where });
        break;
      case 'leads':
        data = await this.prisma.lead.findMany({ where });
        break;
      case 'tasks':
        data = await this.prisma.task.findMany({ where });
        break;
      default:
        throw ErrorFactory.badRequest('Invalid entity type');
    }

    // Convert to CSV format (simplified)
    if (options.format === 'csv') {
      return this.convertToCSV(data);
    }

    // For now, return JSON string
    return JSON.stringify(data, null, 2);
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Get performance metrics for a user
   */
  async getUserPerformanceMetrics(userId: string): Promise<any> {
    const [
      dealsCreated,
      dealsWon,
      dealsLost,
      totalDealValue,
      tasksCompleted,
      tasksOverdue,
      leadsConverted,
      totalLeads
    ] = await Promise.all([
      this.prisma.deal.count({ where: { ownerId: userId } }),
      this.prisma.deal.count({ where: { ownerId: userId, stage: 'CLOSED_WON' } }),
      this.prisma.deal.count({ where: { ownerId: userId, stage: 'CLOSED_LOST' } }),
      this.prisma.deal.aggregate({
        where: { ownerId: userId, stage: 'CLOSED_WON' },
        _sum: { value: true }
      }),
      this.prisma.task.count({ where: { assigneeId: userId, status: 'COMPLETED' } }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      this.prisma.lead.count({ where: { assignedToId: userId, isConverted: true } }),
      this.prisma.lead.count({ where: { assignedToId: userId } })
    ]);

    const winRate = dealsCreated > 0 ? (dealsWon / dealsCreated) * 100 : 0;
    const conversionRate = totalLeads > 0 ? (leadsConverted / totalLeads) * 100 : 0;

    return {
      dealsCreated,
      dealsWon,
      dealsLost,
      totalDealValue: totalDealValue._sum.value || 0,
      winRate,
      tasksCompleted,
      tasksOverdue,
      leadsConverted,
      totalLeads,
      conversionRate
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
