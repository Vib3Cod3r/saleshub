import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validateBody, validateQuery } from '@/middleware/validation';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  taskFiltersSchema 
} from '@/utils/validation';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getTasksByAssignee,
  getTasksByCreator,
  getTasksByStatus,
  getOverdueTasks,
  getTasksDueToday,
  searchTasks,
  getTaskStats,
  bulkUpdateTasks
} from '@/controllers/taskController';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// GET /api/tasks - Get all tasks with filters
router.get('/', validateQuery(taskFiltersSchema), getTasks);

// GET /api/tasks/search - Search tasks
router.get('/search', searchTasks);

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', getOverdueTasks);

// GET /api/tasks/due-today - Get tasks due today
router.get('/due-today', getTasksDueToday);

// GET /api/tasks/stats - Get task statistics
router.get('/stats', getTaskStats);

// GET /api/tasks/assignee/:assigneeId - Get tasks by assignee
router.get('/assignee/:assigneeId', getTasksByAssignee);

// GET /api/tasks/creator/:creatorId - Get tasks by creator
router.get('/creator/:creatorId', getTasksByCreator);

// GET /api/tasks/status/:status - Get tasks by status
router.get('/status/:status', getTasksByStatus);

// GET /api/tasks/:id - Get specific task
router.get('/:id', getTask);

// POST /api/tasks - Create new task
router.post('/', validateBody(createTaskSchema), createTask);

// POST /api/tasks/:id/complete - Complete task
router.post('/:id/complete', completeTask);

// POST /api/tasks/bulk-update - Bulk update tasks
router.post('/bulk-update', bulkUpdateTasks);

// PUT /api/tasks/:id - Update task
router.put('/:id', validateBody(updateTaskSchema), updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

export default router;
