import { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { taskService } from '@/services/tasks/TaskService';
import type { CreateTaskRequest, UpdateTaskRequest } from '@/types';

export const getTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    priority,
    status,
    assigneeId,
    creatorId,
    contactId,
    dealId,
    companyId,
    dueDateFrom,
    dueDateTo,
    isOverdue,
    sortBy = 'dueDate',
    sortOrder = 'asc'
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
    type,
    priority,
    status,
    assigneeId,
    creatorId,
    contactId,
    dealId,
    companyId,
    dueDateFrom,
    dueDateTo,
    isOverdue: isOverdue === 'true'
  };

  // Build search options
  const searchOptions = {
    search,
    includeAssignee: true,
    includeCreator: true,
    includeRelated: true
  };

  const result = await taskService.getTasks(paginationOptions, filters, searchOptions);
  sendSuccess(res, result, 'Tasks retrieved successfully');
});

export const getTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { includeAssignee = 'true', includeCreator = 'true', includeRelated = 'true' } = req.query as any;

  const task = await taskService.getTaskById(
    id,
    includeAssignee === 'true',
    includeCreator === 'true',
    includeRelated === 'true'
  );

  sendSuccess(res, task, 'Task retrieved successfully');
});

export const createTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const taskData: CreateTaskRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const task = await taskService.createTask(taskData, userId);
  sendCreated(res, task, 'Task created successfully');
});

export const updateTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: UpdateTaskRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const task = await taskService.updateTask(id, updateData, userId);
  sendSuccess(res, task, 'Task updated successfully');
});

export const completeTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { actualDuration, notes } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const completion = {
    completedAt: new Date(),
    actualDuration,
    notes
  };

  const task = await taskService.completeTask(id, completion, userId);
  sendSuccess(res, task, 'Task completed successfully');
});

export const deleteTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await taskService.deleteTask(id, userId);
  sendSuccess(res, null, 'Task deleted successfully');
});

// Additional enhanced endpoints
export const getTasksByAssignee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { assigneeId } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await taskService.getTasksByAssignee(assigneeId, paginationOptions);
  sendSuccess(res, result, 'Tasks retrieved successfully');
});

export const getTasksByCreator = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { creatorId } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await taskService.getTasksByCreator(creatorId, paginationOptions);
  sendSuccess(res, result, 'Tasks retrieved successfully');
});

export const getTasksByStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await taskService.getTasksByStatus(status, paginationOptions);
  sendSuccess(res, result, 'Tasks retrieved successfully');
});

export const getOverdueTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await taskService.getOverdueTasks(paginationOptions);
  sendSuccess(res, result, 'Overdue tasks retrieved successfully');
});

export const getTasksDueToday = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query as any;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await taskService.getTasksDueToday(paginationOptions);
  sendSuccess(res, result, 'Tasks due today retrieved successfully');
});

export const searchTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q: searchTerm, page = 1, limit = 10 } = req.query as any;

  if (!searchTerm) {
    throw new Error('Search term is required');
  }

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await taskService.searchTasks(searchTerm, paginationOptions);
  sendSuccess(res, result, 'Search completed successfully');
});

export const getTaskStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  const stats = await taskService.getTaskStats(userId);
  sendSuccess(res, stats, 'Task statistics retrieved successfully');
});

export const bulkUpdateTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { taskIds, updates } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw new Error('Task IDs array is required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates object is required');
  }

  const results = await taskService.bulkUpdateTasks(taskIds, updates, userId);
  sendSuccess(res, results, 'Bulk update completed');
});
