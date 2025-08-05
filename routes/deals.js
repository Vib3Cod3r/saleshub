const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all deals with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      stage, 
      assignedTo,
      minValue,
      maxValue 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { contact: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    if (stage) {
      where.stage = stage;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    if (minValue || maxValue) {
      where.value = {};
      if (minValue) where.value.gte = parseFloat(minValue);
      if (maxValue) where.value.lte = parseFloat(maxValue);
    }

    // If user is not admin/manager, only show their assigned deals
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take,
        include: {
          contact: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              email: true, 
              company: true 
            }
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true }
          },
          _count: {
            select: { communications: true, tasks: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.deal.count({ where })
    ]);

    res.json({
      deals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get pipeline view - deals grouped by stage
router.get('/pipeline', async (req, res) => {
  try {
    const where = {};
    
    // If user is sales rep, only show their deals
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const dealStages = [
      'NEW_LEAD',
      'QUALIFIED', 
      'CONTACTED',
      'MEETING_DEMO_SET',
      'PROPOSAL_NEGOTIATION',
      'DECISION_MAKER_BOUGHT_IN',
      'CONTRACT_SENT',
      'CLOSED_WON',
      'CLOSED_LOST'
    ];

    const pipeline = {};
    
    for (const stage of dealStages) {
      const deals = await prisma.deal.findMany({
        where: { ...where, stage },
        include: {
          contact: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              company: true 
            }
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: { expectedCloseDate: 'asc' }
      });

      pipeline[stage] = {
        deals,
        count: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
      };
    }

    res.json(pipeline);
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single deal by ID
router.get('/:id', async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        contact: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        tasks: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          },
          orderBy: { dueDate: 'asc' }
        },
        communications: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check permission for sales reps
    if (req.user.role === 'SALES_REP' && deal.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new deal
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      value,
      probability,
      stage,
      expectedCloseDate,
      contactId,
      assignedToId,
      notes
    } = req.body;

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return res.status(400).json({ message: 'Contact not found' });
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        value: value ? parseFloat(value) : null,
        probability: probability ? parseInt(probability) : 0,
        stage: stage || 'NEW_LEAD',
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        contactId,
        assignedToId: assignedToId || req.user.userId,
        notes
      },
      include: {
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update deal
router.put('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;
    
    // Check if deal exists and user has permission
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId }
    });

    if (!existingDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (req.user.role === 'SALES_REP' && existingDeal.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      value,
      probability,
      stage,
      expectedCloseDate,
      actualCloseDate,
      assignedToId,
      notes
    } = req.body;

    // Set actual close date for closed deals
    const updateData = {
      title,
      description,
      value: value ? parseFloat(value) : null,
      probability: probability ? parseInt(probability) : existingDeal.probability,
      stage,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : existingDeal.expectedCloseDate,
      assignedToId,
      notes
    };

    if (stage === 'CLOSED_WON' || stage === 'CLOSED_LOST') {
      updateData.actualCloseDate = actualCloseDate ? new Date(actualCloseDate) : new Date();
    }

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: updateData,
      include: {
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.json(deal);
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update deal stage (for drag and drop)
router.patch('/:id/stage', async (req, res) => {
  try {
    const dealId = req.params.id;
    const { stage } = req.body;
    
    // Check if deal exists and user has permission
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId }
    });

    if (!existingDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (req.user.role === 'SALES_REP' && existingDeal.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { stage };

    // Set actual close date for closed deals
    if (stage === 'CLOSED_WON' || stage === 'CLOSED_LOST') {
      updateData.actualCloseDate = new Date();
    }

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: updateData,
      include: {
        contact: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            company: true 
          }
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.json(deal);
  } catch (error) {
    console.error('Update deal stage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete deal
router.delete('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;
    
    // Check if deal exists and user has permission
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId }
    });

    if (!existingDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (req.user.role === 'SALES_REP' && existingDeal.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.deal.delete({
      where: { id: dealId }
    });

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get deal statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const where = {};
    
    // If user is sales rep, only show their deals
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const [
      totalDeals,
      totalPipelineValue,
      closedWonDeals,
      closedWonValue,
      avgDealSize
    ] = await Promise.all([
      prisma.deal.count({ where }),
      prisma.deal.aggregate({
        where,
        _sum: { value: true }
      }),
      prisma.deal.count({ where: { ...where, stage: 'CLOSED_WON' } }),
      prisma.deal.aggregate({
        where: { ...where, stage: 'CLOSED_WON' },
        _sum: { value: true }
      }),
      prisma.deal.aggregate({
        where,
        _avg: { value: true }
      })
    ]);

    res.json({
      totalDeals,
      totalPipelineValue: totalPipelineValue._sum.value || 0,
      closedWonDeals,
      closedWonValue: closedWonValue._sum.value || 0,
      avgDealSize: avgDealSize._avg.value || 0,
      winRate: totalDeals > 0 ? (closedWonDeals / totalDeals * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get deal stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;