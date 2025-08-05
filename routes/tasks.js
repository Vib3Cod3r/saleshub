const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all tasks with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      type,
      priority,
      userId,
      dueDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (userId) {
      where.userId = userId;
    } else if (req.user.role === 'SALES_REP') {
      // Sales reps only see their own tasks
      where.userId = req.user.userId;
    }

    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true }
          },
          contact: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              email: true, 
              company: true 
            }
          },
          deal: {
            select: { 
              id: true, 
              title: true, 
              value: true, 
              stage: true 
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' }
        ]
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tasks by date (for calendar view)
router.get('/calendar', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const where = {
      dueDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    // Sales reps only see their own tasks
    if (req.user.role === 'SALES_REP') {
      where.userId = req.user.userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        },
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        deal: {
          select: { 
            id: true, 
            title: true, 
            stage: true 
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get calendar tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get overdue tasks
router.get('/overdue', async (req, res) => {
  try {
    const where = {
      dueDate: {
        lt: new Date()
      },
      status: {
        not: 'COMPLETED'
      }
    };

    // Sales reps only see their own tasks
    if (req.user.role === 'SALES_REP') {
      where.userId = req.user.userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        },
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        deal: {
          select: { 
            id: true, 
            title: true, 
            stage: true 
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        contact: true,
        deal: {
          include: {
            contact: {
              select: { 
                id: true, 
                firstName: true, 
                lastName: true, 
                company: true 
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permission for sales reps
    if (req.user.role === 'SALES_REP' && task.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      status,
      dueDate,
      contactId,
      dealId,
      userId,
      notes
    } = req.body;

    // Verify contact exists if provided
    if (contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId }
      });

      if (!contact) {
        return res.status(400).json({ message: 'Contact not found' });
      }
    }

    // Verify deal exists if provided
    if (dealId) {
      const deal = await prisma.deal.findUnique({
        where: { id: dealId }
      });

      if (!deal) {
        return res.status(400).json({ message: 'Deal not found' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        type: type || 'FOLLOW_UP',
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        contactId,
        dealId,
        userId: userId || req.user.userId,
        notes
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        },
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        deal: {
          select: { 
            id: true, 
            title: true, 
            stage: true 
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Check if task exists and user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'SALES_REP' && existingTask.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      type,
      priority,
      status,
      dueDate,
      contactId,
      dealId,
      notes
    } = req.body;

    const updateData = {
      title,
      description,
      type,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      contactId,
      dealId,
      notes
    };

    // Set completed date if status is COMPLETED
    if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status !== 'COMPLETED') {
      updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        },
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        deal: {
          select: { 
            id: true, 
            title: true, 
            stage: true 
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark task as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Check if task exists and user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'SALES_REP' && existingTask.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        },
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        deal: {
          select: { 
            id: true, 
            title: true, 
            stage: true 
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Check if task exists and user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'SALES_REP' && existingTask.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get task statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const where = {};
    
    // If user is sales rep, only show their tasks
    if (req.user.role === 'SALES_REP') {
      where.userId = req.user.userId;
    }

    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks
    ] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'PENDING' } }),
      prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.task.count({ 
        where: { 
          ...where, 
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        } 
      })
    ]);

    res.json({
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;