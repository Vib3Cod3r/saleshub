import { BaseService, PaginationOptions, FilterOptions } from '@/services/base';
import { databaseService } from '@/services/base/DatabaseService';
import { ErrorFactory } from '@/utils/errors';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types';

export interface TaskFilters extends FilterOptions {
  type?: string;
  priority?: string;
  status?: string;
  assigneeId?: string;
  creatorId?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  isOverdue?: boolean;
}

export interface TaskSearchOptions {
  search?: string;
  includeCompleted?: boolean;
  includeAssignee?: boolean;
  includeCreator?: boolean;
  includeRelated?: boolean;
}

export interface TaskCompletion {
  completedAt: Date;
  actualDuration?: number;
  notes?: string;
}

export class TaskService extends BaseService<Task, CreateTaskRequest, UpdateTaskRequest> {
  constructor() {
    super('task');
  }

  /**
   * Get tasks with advanced filtering and search
   */
  async getTasks(
    options: PaginationOptions = {},
    filters: TaskFilters = {},
    searchOptions: TaskSearchOptions = {}
  ) {
    const { search, includeCompleted = false, includeAssignee = true, includeCreator = true, includeRelated = true } = searchOptions;

    // Build include object
    const include: any = {};
    if (includeAssignee) {
      include.assignee = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }
    if (includeCreator) {
      include.creator = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }
    if (includeRelated) {
      include.contact = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
      include.deal = {
        select: {
          id: true,
          title: true,
          value: true,
          stage: true
        }
      };
      include.company = {
        select: {
          id: true,
          name: true,
          industry: true
        }
      };
    }

    // Build filters
    const whereFilters: any = {};

    if (filters.type) {
      whereFilters.type = filters.type;
    }

    if (filters.priority) {
      whereFilters.priority = filters.priority;
    }

    if (filters.status) {
      whereFilters.status = filters.status;
    }

    if (filters.assigneeId) {
      whereFilters.assigneeId = filters.assigneeId;
    }

    if (filters.creatorId) {
      whereFilters.creatorId = filters.creatorId;
    }

    if (filters.contactId) {
      whereFilters.contactId = filters.contactId;
    }

    if (filters.dealId) {
      whereFilters.dealId = filters.dealId;
    }

    if (filters.companyId) {
      whereFilters.companyId = filters.companyId;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      whereFilters.dueDate = {};
      if (filters.dueDateFrom) {
        whereFilters.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        whereFilters.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    // Handle overdue tasks
    if (filters.isOverdue) {
      whereFilters.dueDate = {
        lt: new Date()
      };
      whereFilters.status = {
        not: 'COMPLETED'
      };
    }

    // Filter out completed tasks unless specifically requested
    if (!includeCompleted) {
      whereFilters.status = {
        not: 'COMPLETED'
      };
    }

    // Add search functionality
    if (search) {
      whereFilters.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { contact: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        } },
        { deal: { title: { contains: search, mode: 'insensitive' } } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    return await this.findAll(options, whereFilters, include);
  }

  /**
   * Get task by ID with optional includes
   */
  async getTaskById(id: string, includeAssignee = true, includeCreator = true, includeRelated = true) {
    const include: any = {};
    if (includeAssignee) {
      include.assignee = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }
    if (includeCreator) {
      include.creator = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      };
    }
    if (includeRelated) {
      include.contact = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      };
      include.deal = {
        select: {
          id: true,
          title: true,
          value: true,
          stage: true
        }
      };
      include.company = {
        select: {
          id: true,
          name: true,
          industry: true
        }
      };
    }

    const task = await this.findById(id, include);
    if (!task) {
      throw ErrorFactory.notFound('Task');
    }

    return task;
  }

  /**
   * Create a new task with validation
   */
  async createTask(data: CreateTaskRequest, creatorId: string) {
    // Validate assignee exists if provided
    if (data.assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw ErrorFactory.notFound('Assignee');
      }
    }

    // Validate related entities exist if provided
    if (data.contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: data.contactId }
      });
      if (!contact) {
        throw ErrorFactory.notFound('Contact');
      }
    }

    if (data.dealId) {
      const deal = await this.prisma.deal.findUnique({
        where: { id: data.dealId }
      });
      if (!deal) {
        throw ErrorFactory.notFound('Deal');
      }
    }

    if (data.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId }
      });
      if (!company) {
        throw ErrorFactory.notFound('Company');
      }
    }

    // Add default values
    const taskData = {
      ...data,
      creatorId,
      status: data.status || 'PENDING',
      priority: data.priority || 'MEDIUM',
      estimatedDuration: data.estimatedDuration || 60 // Default 1 hour
    };

    return await this.create(taskData, {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      deal: {
        select: {
          id: true,
          title: true,
          value: true,
          stage: true
        }
      },
      company: {
        select: {
          id: true,
          name: true,
          industry: true
        }
      }
    });
  }

  /**
   * Update task with validation
   */
  async updateTask(id: string, data: UpdateTaskRequest, userId: string) {
    // Check if task exists and user has permission
    const existingTask = await this.findById(id);
    if (!existingTask) {
      throw ErrorFactory.notFound('Task');
    }

    // Check if user is the creator, assignee, or has admin rights
    if (existingTask.creatorId !== userId && existingTask.assigneeId !== userId) {
      // TODO: Add role-based permission check
      throw ErrorFactory.forbidden('You do not have permission to update this task');
    }

    // Validate assignee exists if being updated
    if (data.assigneeId && data.assigneeId !== existingTask.assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw ErrorFactory.notFound('Assignee');
      }
    }

    return await this.update(id, data, {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      deal: {
        select: {
          id: true,
          title: true,
          value: true,
          stage: true
        }
      },
      company: {
        select: {
          id: true,
          name: true,
          industry: true
        }
      }
    });
  }

  /**
   * Complete a task
   */
  async completeTask(id: string, completion: TaskCompletion, userId: string) {
    const task = await this.findById(id);
    if (!task) {
      throw ErrorFactory.notFound('Task');
    }

    if (task.creatorId !== userId && task.assigneeId !== userId) {
      throw ErrorFactory.forbidden('You do not have permission to complete this task');
    }

    const updateData: any = {
      status: 'COMPLETED',
      completedAt: completion.completedAt,
      ...(completion.actualDuration && { actualDuration: completion.actualDuration }),
      ...(completion.notes && { notes: `${task.notes || ''}\n\nTask Completed: ${completion.notes}` })
    };

    return await this.update(id, updateData, {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      creator: {
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
   * Delete task with permission check
   */
  async deleteTask(id: string, userId: string) {
    const task = await this.findById(id);
    if (!task) {
      throw ErrorFactory.notFound('Task');
    }

    if (task.creatorId !== userId) {
      throw ErrorFactory.forbidden('You do not have permission to delete this task');
    }

    return await this.delete(id);
  }

  /**
   * Get tasks by assignee
   */
  async getTasksByAssignee(assigneeId: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { assigneeId, status: { not: 'COMPLETED' } }, {
      includeAssignee: true,
      includeCreator: true,
      includeRelated: true
    });
  }

  /**
   * Get tasks by creator
   */
  async getTasksByCreator(creatorId: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { creatorId }, {
      includeAssignee: true,
      includeCreator: true,
      includeRelated: true
    });
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: string, options: PaginationOptions = {}) {
    return await this.findAll(options, { status }, {
      includeAssignee: true,
      includeCreator: true,
      includeRelated: true
    });
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(options: PaginationOptions = {}) {
    return await this.findAll(options, {
      dueDate: {
        lt: new Date()
      },
      status: {
        not: 'COMPLETED'
      }
    }, {
      includeAssignee: true,
      includeCreator: true,
      includeRelated: true
    });
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday(options: PaginationOptions = {}) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.findAll(options, {
      dueDate: {
        gte: today,
        lt: tomorrow
      },
      status: {
        not: 'COMPLETED'
      }
    }, {
      includeAssignee: true,
      includeCreator: true,
      includeRelated: true
    });
  }

  /**
   * Search tasks with advanced search
   */
  async searchTasks(searchTerm: string, options: PaginationOptions = {}) {
    return await this.getTasks(options, {}, {
      search: searchTerm,
      includeAssignee: true,
      includeCreator: true,
      includeRelated: true
    });
  }

  /**
   * Get task statistics
   */
  async getTaskStats(userId?: string) {
    const where: any = {};
    if (userId) {
      where.OR = [
        { assigneeId: userId },
        { creatorId: userId }
      ];
    }

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority
    ] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true
        }
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: {
          priority: true
        }
      })
    ]);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdateTasks(taskIds: string[], updates: Partial<UpdateTaskRequest>, userId: string) {
    return await databaseService.transaction(async (tx) => {
      const results = [];
      
      for (const id of taskIds) {
        try {
          const task = await tx.task.findUnique({ where: { id } });
          if (!task) {
            results.push({ id, success: false, error: 'Task not found' });
            continue;
          }

          if (task.creatorId !== userId && task.assigneeId !== userId) {
            results.push({ id, success: false, error: 'Permission denied' });
            continue;
          }

          const updated = await tx.task.update({
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
export const taskService = new TaskService();
