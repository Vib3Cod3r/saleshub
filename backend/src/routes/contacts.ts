import { Router } from 'express';
import { prisma } from '@/utils/database';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';
import { validateRequest, createContactSchema, updateContactSchema, paginationSchema, idParamSchema } from '@/middleware/validation';
import { CreateContactRequest, UpdateContactRequest, ContactFilters, PaginatedResponse } from '@/types';

const router = Router();

// Get all contacts with pagination and filtering
router.get('/', authenticateToken, validateRequest(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query as any;
    const { leadStatus, leadSource, assignedTo, companyId } = req.query as any;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    
    if (companyId) {
      where.companyId = companyId;
    }
    
    // Get total count
    const total = await prisma.contact.count({ where });
    
    // Get contacts with relations
    const contacts = await prisma.contact.findMany({
      where,
      skip,
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            deals: true,
            tasks: true,
            calls: true,
            notes: true,
            messages: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });
    
    const totalPages = Math.ceil(total / limit);
    
    const response: PaginatedResponse<any> = {
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single contact by ID
router.get('/:id', authenticateToken, validateRequest(idParamSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            website: true,
            industry: true,
            size: true,
            description: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        deals: {
          select: {
            id: true,
            title: true,
            value: true,
            currency: true,
            stage: true,
            probability: true,
            expectedCloseDate: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        tasks: {
          select: {
            id: true,
            title: true,
            type: true,
            priority: true,
            status: true,
            dueDate: true,
            createdAt: true
          },
          orderBy: { dueDate: 'asc' },
          take: 5
        },
        calls: {
          select: {
            id: true,
            subject: true,
            duration: true,
            outcome: true,
            scheduledAt: true,
            completedAt: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        notes: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        messages: {
          select: {
            id: true,
            subject: true,
            type: true,
            direction: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            deals: true,
            tasks: true,
            calls: true,
            notes: true,
            messages: true
          }
        }
      }
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new contact
router.post('/', authenticateToken, validateRequest(createContactSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const contactData: CreateContactRequest = req.body;
    
    // Check if company exists if provided
    if (contactData.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: contactData.companyId }
      });
      
      if (!company) {
        return res.status(400).json({
          success: false,
          error: 'Company not found'
        });
      }
    }
    
    // Check if assigned user exists if provided
    if (contactData.assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: contactData.assignedToId }
      });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
    }
    
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        createdById: req.user!.userId
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact created successfully'
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update contact
router.put('/:id', authenticateToken, validateRequest(updateContactSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateContactRequest = req.body;
    
    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id }
    });
    
    if (!existingContact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    // Check if company exists if provided
    if (updateData.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: updateData.companyId }
      });
      
      if (!company) {
        return res.status(400).json({
          success: false,
          error: 'Company not found'
        });
      }
    }
    
    // Check if assigned user exists if provided
    if (updateData.assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: updateData.assignedToId }
      });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
    }
    
    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: contact,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, validateRequest(idParamSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            deals: true,
            tasks: true,
            calls: true,
            notes: true,
            messages: true
          }
        }
      }
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    // Check if contact has related data
    const totalRelated = contact._count.deals + contact._count.tasks + contact._count.calls + contact._count.notes + contact._count.messages;
    
    if (totalRelated > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete contact with ${totalRelated} related items. Please delete related items first.`
      });
    }
    
    await prisma.contact.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get contact statistics
router.get('/:id/stats', authenticateToken, validateRequest(idParamSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const stats = await prisma.contact.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            deals: true,
            tasks: true,
            calls: true,
            notes: true,
            messages: true
          }
        },
        deals: {
          select: {
            value: true,
            stage: true
          }
        },
        tasks: {
          select: {
            status: true,
            priority: true
          }
        }
      }
    });
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    // Calculate additional statistics
    const totalDealValue = stats.deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const wonDeals = stats.deals.filter(deal => deal.stage === 'CLOSED_WON').length;
    const pendingTasks = stats.tasks.filter(task => task.status === 'PENDING').length;
    const urgentTasks = stats.tasks.filter(task => task.priority === 'URGENT').length;
    
    const response = {
      counts: stats._count,
      dealValue: totalDealValue,
      wonDeals,
      pendingTasks,
      urgentTasks
    };
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 