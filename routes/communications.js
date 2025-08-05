const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all communications with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      direction,
      contactId,
      dealId,
      userId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { outcome: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (direction) {
      where.direction = direction;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    if (userId) {
      where.userId = userId;
    } else if (req.user.role === 'SALES_REP') {
      // Sales reps only see their own communications
      where.userId = req.user.userId;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
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
        orderBy: { createdAt: 'desc' }
      }),
      prisma.communication.count({ where })
    ]);

    res.json({
      communications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get communications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get communications timeline for a contact
router.get('/contact/:contactId/timeline', async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // Verify contact exists and user has access
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (req.user.role === 'SALES_REP' && contact.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const communications = await prisma.communication.findMany({
      where: { contactId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        },
        deal: {
          select: { 
            id: true, 
            title: true, 
            stage: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(communications);
  } catch (error) {
    console.error('Get contact timeline error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get communications for a deal
router.get('/deal/:dealId', async (req, res) => {
  try {
    const { dealId } = req.params;
    
    // Verify deal exists and user has access
    const deal = await prisma.deal.findUnique({
      where: { id: dealId }
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (req.user.role === 'SALES_REP' && deal.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const communications = await prisma.communication.findMany({
      where: { dealId },
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(communications);
  } catch (error) {
    console.error('Get deal communications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single communication by ID
router.get('/:id', async (req, res) => {
  try {
    const communication = await prisma.communication.findUnique({
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

    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    // Check permission for sales reps
    if (req.user.role === 'SALES_REP' && communication.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(communication);
  } catch (error) {
    console.error('Get communication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new communication
router.post('/', async (req, res) => {
  try {
    const {
      type,
      subject,
      content,
      direction,
      duration,
      outcome,
      scheduled,
      scheduledFor,
      contactId,
      dealId
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

    const communication = await prisma.communication.create({
      data: {
        type,
        subject,
        content,
        direction: direction || 'OUTBOUND',
        duration: duration ? parseInt(duration) : null,
        outcome,
        scheduled: scheduled || false,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        completedAt: scheduled ? null : new Date(),
        contactId,
        dealId,
        userId: req.user.userId
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

    // Update contact's last contact date if communication is with a contact
    if (contactId && !scheduled) {
      await prisma.contact.update({
        where: { id: contactId },
        data: { lastContactDate: new Date() }
      });
    }

    res.status(201).json(communication);
  } catch (error) {
    console.error('Create communication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update communication
router.put('/:id', async (req, res) => {
  try {
    const communicationId = req.params.id;
    
    // Check if communication exists and user has permission
    const existingCommunication = await prisma.communication.findUnique({
      where: { id: communicationId }
    });

    if (!existingCommunication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    if (req.user.role === 'SALES_REP' && existingCommunication.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      type,
      subject,
      content,
      direction,
      duration,
      outcome,
      scheduled,
      scheduledFor,
      completed
    } = req.body;

    const updateData = {
      type,
      subject,
      content,
      direction,
      duration: duration ? parseInt(duration) : null,
      outcome,
      scheduled,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null
    };

    // Handle completion
    if (completed && !existingCommunication.completedAt) {
      updateData.completedAt = new Date();
    } else if (!completed) {
      updateData.completedAt = null;
    }

    const communication = await prisma.communication.update({
      where: { id: communicationId },
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

    res.json(communication);
  } catch (error) {
    console.error('Update communication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark communication as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const communicationId = req.params.id;
    
    // Check if communication exists and user has permission
    const existingCommunication = await prisma.communication.findUnique({
      where: { id: communicationId },
      include: { contact: true }
    });

    if (!existingCommunication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    if (req.user.role === 'SALES_REP' && existingCommunication.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { outcome } = req.body;

    const communication = await prisma.communication.update({
      where: { id: communicationId },
      data: {
        completedAt: new Date(),
        outcome
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

    // Update contact's last contact date
    if (existingCommunication.contactId) {
      await prisma.contact.update({
        where: { id: existingCommunication.contactId },
        data: { lastContactDate: new Date() }
      });
    }

    res.json(communication);
  } catch (error) {
    console.error('Complete communication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete communication
router.delete('/:id', async (req, res) => {
  try {
    const communicationId = req.params.id;
    
    // Check if communication exists and user has permission
    const existingCommunication = await prisma.communication.findUnique({
      where: { id: communicationId }
    });

    if (!existingCommunication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    if (req.user.role === 'SALES_REP' && existingCommunication.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.communication.delete({
      where: { id: communicationId }
    });

    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    console.error('Delete communication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get communication statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const where = {};
    
    // If user is sales rep, only show their communications
    if (req.user.role === 'SALES_REP') {
      where.userId = req.user.userId;
    }

    const [
      totalCommunications,
      emailCount,
      callCount,
      meetingCount,
      scheduledCount
    ] = await Promise.all([
      prisma.communication.count({ where }),
      prisma.communication.count({ where: { ...where, type: 'EMAIL' } }),
      prisma.communication.count({ where: { ...where, type: 'PHONE_CALL' } }),
      prisma.communication.count({ where: { ...where, type: 'MEETING' } }),
      prisma.communication.count({ where: { ...where, scheduled: true, completedAt: null } })
    ]);

    res.json({
      totalCommunications,
      emailCount,
      callCount,
      meetingCount,
      scheduledCount
    });
  } catch (error) {
    console.error('Get communication stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;