const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all contacts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      leadStatus, 
      leadSource,
      assignedTo 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (leadStatus) {
      where.leadStatus = leadStatus;
    }

    if (leadSource) {
      where.leadSource = leadSource;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    // If user is not admin/manager, only show their assigned contacts
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take,
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true }
          },
          deals: {
            select: { id: true, title: true, value: true, stage: true }
          },
          _count: {
            select: { communications: true, tasks: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.contact.count({ where })
    ]);

    res.json({
      contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        deals: {
          include: {
            assignedTo: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
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

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check permission for sales reps
    if (req.user.role === 'SALES_REP' && contact.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new contact
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      leadSource,
      leadStatus,
      notes,
      assignedToId
    } = req.body;

    // Check if email already exists
    if (email) {
      const existingContact = await prisma.contact.findUnique({
        where: { email }
      });

      if (existingContact) {
        return res.status(400).json({ message: 'Contact with this email already exists' });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        website,
        address,
        city,
        state,
        zipCode,
        country,
        leadSource,
        leadStatus: leadStatus || 'NEW',
        notes,
        assignedToId: assignedToId || req.user.userId,
        lastContactDate: new Date()
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    
    // Check if contact exists and user has permission
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!existingContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (req.user.role === 'SALES_REP' && existingContact.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      leadSource,
      leadStatus,
      notes,
      assignedToId
    } = req.body;

    // Check email uniqueness if changed
    if (email && email !== existingContact.email) {
      const emailExists = await prisma.contact.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Contact with this email already exists' });
      }
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        website,
        address,
        city,
        state,
        zipCode,
        country,
        leadSource,
        leadStatus,
        notes,
        assignedToId,
        lastContactDate: new Date()
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    
    // Check if contact exists and user has permission
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!existingContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (req.user.role === 'SALES_REP' && existingContact.assignedToId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.contact.delete({
      where: { id: contactId }
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get contact statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const where = {};
    
    // If user is sales rep, only show their contacts
    if (req.user.role === 'SALES_REP') {
      where.assignedToId = req.user.userId;
    }

    const [
      totalContacts,
      newLeads,
      qualifiedLeads,
      convertedContacts
    ] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.count({ where: { ...where, leadStatus: 'NEW' } }),
      prisma.contact.count({ where: { ...where, leadStatus: 'QUALIFIED' } }),
      prisma.contact.count({ where: { ...where, leadStatus: 'CONVERTED' } })
    ]);

    res.json({
      totalContacts,
      newLeads,
      qualifiedLeads,
      convertedContacts,
      conversionRate: totalContacts > 0 ? (convertedContacts / totalContacts * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;