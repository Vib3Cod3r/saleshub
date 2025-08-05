const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// Get dashboard overview metrics
router.get('/overview', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const where = {};
    
    // If user is sales rep, only show their data
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    // Get current period metrics
    const [
      totalContacts,
      totalDeals,
      totalPipelineValue,
      closedWonDeals,
      closedWonValue,
      newContactsThisPeriod,
      newDealsThisPeriod
    ] = await Promise.all([
      // Total contacts
      prisma.contact.count({ where }),
      
      // Total active deals
      prisma.deal.count({ 
        where: { 
          ...where, 
          stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
        } 
      }),
      
      // Total pipeline value
      prisma.deal.aggregate({
        where: { 
          ...where, 
          stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
        },
        _sum: { value: true }
      }),
      
      // Closed won deals
      prisma.deal.count({ 
        where: { 
          ...where, 
          stage: 'CLOSED_WON',
          actualCloseDate: { gte: startDate }
        } 
      }),
      
      // Closed won value
      prisma.deal.aggregate({
        where: { 
          ...where, 
          stage: 'CLOSED_WON',
          actualCloseDate: { gte: startDate }
        },
        _sum: { value: true }
      }),
      
      // New contacts this period
      prisma.contact.count({ 
        where: { 
          ...where, 
          createdAt: { gte: startDate }
        } 
      }),
      
      // New deals this period
      prisma.deal.count({ 
        where: { 
          ...where, 
          createdAt: { gte: startDate }
        } 
      })
    ]);

    // Calculate previous period for comparison
    const prevStartDate = new Date();
    prevStartDate.setDate(prevStartDate.getDate() - (periodDays * 2));
    const prevEndDate = new Date();
    prevEndDate.setDate(prevEndDate.getDate() - periodDays);

    const [
      prevClosedWonDeals,
      prevClosedWonValue,
      prevNewContacts,
      prevNewDeals
    ] = await Promise.all([
      prisma.deal.count({ 
        where: { 
          ...where, 
          stage: 'CLOSED_WON',
          actualCloseDate: { gte: prevStartDate, lt: prevEndDate }
        } 
      }),
      
      prisma.deal.aggregate({
        where: { 
          ...where, 
          stage: 'CLOSED_WON',
          actualCloseDate: { gte: prevStartDate, lt: prevEndDate }
        },
        _sum: { value: true }
      }),
      
      prisma.contact.count({ 
        where: { 
          ...where, 
          createdAt: { gte: prevStartDate, lt: prevEndDate }
        } 
      }),
      
      prisma.deal.count({ 
        where: { 
          ...where, 
          createdAt: { gte: prevStartDate, lt: prevEndDate }
        } 
      })
    ]);

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    res.json({
      totalContacts,
      totalDeals,
      totalPipelineValue: totalPipelineValue._sum.value || 0,
      monthlyRevenue: closedWonValue._sum.value || 0,
      newDealsThisPeriod,
      conversionRate: totalDeals > 0 ? (closedWonDeals / totalDeals * 100).toFixed(1) : 0,
      
      // Period comparisons
      changes: {
        revenue: calculateChange(closedWonValue._sum.value || 0, prevClosedWonValue._sum.value || 0),
        newDeals: calculateChange(newDealsThisPeriod, prevNewDeals),
        newContacts: calculateChange(newContactsThisPeriod, prevNewContacts),
        closedDeals: calculateChange(closedWonDeals, prevClosedWonDeals)
      },
      
      period: {
        days: periodDays,
        startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get revenue chart data
router.get('/revenue-chart', async (req, res) => {
  try {
    const { period = '12' } = req.query; // months
    const months = parseInt(period);
    
    const where = {};
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const revenueData = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthRevenue = await prisma.deal.aggregate({
        where: {
          ...where,
          stage: 'CLOSED_WON',
          actualCloseDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { value: true },
        _count: true
      });

      revenueData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue._sum.value || 0,
        deals: monthRevenue._count || 0
      });
    }

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get pipeline metrics by stage
router.get('/pipeline-metrics', async (req, res) => {
  try {
    const where = {};
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
      'CONTRACT_SENT'
    ];

    const pipelineMetrics = {};
    
    for (const stage of dealStages) {
      const stageData = await prisma.deal.aggregate({
        where: { ...where, stage },
        _count: true,
        _sum: { value: true },
        _avg: { value: true }
      });

      pipelineMetrics[stage] = {
        count: stageData._count || 0,
        totalValue: stageData._sum.value || 0,
        avgValue: stageData._avg.value || 0
      };
    }

    res.json(pipelineMetrics);
  } catch (error) {
    console.error('Get pipeline metrics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get recent sales/activities
router.get('/recent-sales', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const where = { stage: 'CLOSED_WON' };
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const recentSales = await prisma.deal.findMany({
      where,
      take: parseInt(limit),
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
      orderBy: { actualCloseDate: 'desc' }
    });

    res.json(recentSales);
  } catch (error) {
    console.error('Get recent sales error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get top performers (for managers/admins)
router.get('/top-performers', async (req, res) => {
  try {
    // Only allow managers and admins to see this data
    if (req.user.role === 'SALES_REP') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const topPerformers = await prisma.user.findMany({
      where: { 
        role: { in: ['SALES_REP', 'SALES_MANAGER'] },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedDeals: {
          where: {
            stage: 'CLOSED_WON',
            actualCloseDate: { gte: startDate }
          },
          select: {
            value: true
          }
        },
        _count: {
          select: {
            assignedDeals: {
              where: {
                stage: 'CLOSED_WON',
                actualCloseDate: { gte: startDate }
              }
            }
          }
        }
      }
    });

    const performersWithMetrics = topPerformers.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      dealsWon: user._count.assignedDeals,
      totalRevenue: user.assignedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json(performersWithMetrics.slice(0, 10)); // Top 10
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get lead sources breakdown
router.get('/lead-sources', async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const leadSources = await prisma.contact.groupBy({
      by: ['leadSource'],
      where,
      _count: true,
      orderBy: { _count: { leadSource: 'desc' } }
    });

    const formattedSources = leadSources.map(source => ({
      source: source.leadSource || 'Unknown',
      count: source._count
    }));

    res.json(formattedSources);
  } catch (error) {
    console.error('Get lead sources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get upcoming tasks and events
router.get('/upcoming-tasks', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const where = {
      dueDate: {
        gte: new Date(),
        lte: endDate
      },
      status: { not: 'COMPLETED' }
    };

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
      orderBy: { dueDate: 'asc' },
      take: 10
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get deals forecast
router.get('/forecast', async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const forecastMonths = parseInt(months);
    
    const where = {
      stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
    };
    
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const forecastData = [];
    const currentDate = new Date();

    for (let i = 0; i < forecastMonths; i++) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 0);
      
      const monthDeals = await prisma.deal.findMany({
        where: {
          ...where,
          expectedCloseDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          value: true,
          probability: true,
          stage: true
        }
      });

      const totalValue = monthDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const weightedValue = monthDeals.reduce((sum, deal) => {
        const probability = (deal.probability || 0) / 100;
        return sum + ((deal.value || 0) * probability);
      }, 0);

      forecastData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalValue,
        weightedValue,
        dealCount: monthDeals.length
      });
    }

    res.json(forecastData);
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;