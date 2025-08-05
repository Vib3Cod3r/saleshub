const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const managerPassword = await bcrypt.hash('manager123', 12);
  const repPassword = await bcrypt.hash('rep123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@salescrm.com' },
    update: {},
    create: {
      email: 'admin@salescrm.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN'
    }
  });

  const salesManager = await prisma.user.upsert({
    where: { email: 'manager@salescrm.com' },
    update: {},
    create: {
      email: 'manager@salescrm.com',
      username: 'salesmanager',
      password: managerPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'SALES_MANAGER'
    }
  });

  const salesRep = await prisma.user.upsert({
    where: { email: 'rep@salescrm.com' },
    update: {},
    create: {
      email: 'rep@salescrm.com',
      username: 'salesrep',
      password: repPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'SALES_REP'
    }
  });

  console.log('✅ Users created');

  // Create contacts
  const contacts = [
    {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@acme.com',
      phone: '+1-555-0101',
      company: 'Acme Inc.',
      jobTitle: 'CEO',
      leadSource: 'WEBSITE',
      leadStatus: 'NEW',
      assignedToId: salesRep.id
    },
    {
      firstName: 'Mike',
      lastName: 'Roberts',
      email: 'mike.roberts@startupxyz.com',
      phone: '+1-555-0102',
      company: 'StartupXYZ',
      jobTitle: 'CTO',
      leadSource: 'REFERRAL',
      leadStatus: 'QUALIFIED',
      assignedToId: salesRep.id
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1-555-0103',
      company: 'TechCorp Inc.',
      jobTitle: 'VP of Sales',
      leadSource: 'COLD_CALL',
      leadStatus: 'CONTACTED',
      assignedToId: salesRep.id
    },
    {
      firstName: 'Alex',
      lastName: 'Lee',
      email: 'alex.lee@globalsolutions.com',
      phone: '+1-555-0104',
      company: 'Global Solutions',
      jobTitle: 'Director of Operations',
      leadSource: 'EMAIL_CAMPAIGN',
      leadStatus: 'INTERESTED',
      assignedToId: salesRep.id
    },
    {
      firstName: 'Emily',
      lastName: 'Martinez',
      email: 'emily.martinez@retailchain.com',
      phone: '+1-555-0105',
      company: 'Retail Chain Co.',
      jobTitle: 'Head of IT',
      leadSource: 'TRADE_SHOW',
      leadStatus: 'CONVERTED',
      assignedToId: salesRep.id
    }
  ];

  const createdContacts = [];
  for (const contactData of contacts) {
    const contact = await prisma.contact.create({
      data: contactData
    });
    createdContacts.push(contact);
  }

  console.log('✅ Contacts created');

  // Create deals
  const deals = [
    {
      title: 'Enterprise Software License',
      description: 'Annual software licensing deal for enterprise platform',
      value: 15000,
      probability: 90,
      stage: 'CONTRACT_SENT',
      expectedCloseDate: new Date('2024-02-15'),
      contactId: createdContacts[0].id,
      assignedToId: salesRep.id
    },
    {
      title: 'Cloud Migration Service',
      description: 'Complete cloud infrastructure migration project',
      value: 12500,
      probability: 75,
      stage: 'PROPOSAL_NEGOTIATION',
      expectedCloseDate: new Date('2024-02-28'),
      contactId: createdContacts[1].id,
      assignedToId: salesRep.id
    },
    {
      title: 'Sales Training Program',
      description: 'Comprehensive sales team training and development',
      value: 25000,
      probability: 60,
      stage: 'MEETING_DEMO_SET',
      expectedCloseDate: new Date('2024-03-15'),
      contactId: createdContacts[2].id,
      assignedToId: salesRep.id
    },
    {
      title: 'System Integration',
      description: 'Integration of multiple business systems',
      value: 8500,
      probability: 40,
      stage: 'QUALIFIED',
      expectedCloseDate: new Date('2024-03-30'),
      contactId: createdContacts[3].id,
      assignedToId: salesRep.id
    },
    {
      title: 'IT Consulting Services',
      description: 'Ongoing IT consulting and support services',
      value: 25000,
      probability: 100,
      stage: 'CLOSED_WON',
      expectedCloseDate: new Date('2024-01-15'),
      actualCloseDate: new Date('2024-01-15'),
      contactId: createdContacts[4].id,
      assignedToId: salesRep.id
    }
  ];

  const createdDeals = [];
  for (const dealData of deals) {
    const deal = await prisma.deal.create({
      data: dealData
    });
    createdDeals.push(deal);
  }

  console.log('✅ Deals created');

  // Create tasks
  const tasks = [
    {
      title: 'Follow up on proposal',
      description: 'Call client to discuss proposal feedback',
      type: 'CALL',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date('2024-02-10'),
      userId: salesRep.id,
      contactId: createdContacts[0].id,
      dealId: createdDeals[0].id
    },
    {
      title: 'Send product demo',
      description: 'Prepare and send product demonstration video',
      type: 'EMAIL',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: new Date('2024-02-12'),
      userId: salesRep.id,
      contactId: createdContacts[1].id,
      dealId: createdDeals[1].id
    },
    {
      title: 'Schedule meeting',
      description: 'Set up meeting with decision makers',
      type: 'MEETING',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date('2024-02-08'),
      userId: salesRep.id,
      contactId: createdContacts[2].id,
      dealId: createdDeals[2].id
    },
    {
      title: 'Research company background',
      description: 'Gather information about client company and industry',
      type: 'OTHER',
      priority: 'LOW',
      status: 'COMPLETED',
      dueDate: new Date('2024-02-05'),
      completedAt: new Date('2024-02-05'),
      userId: salesRep.id,
      contactId: createdContacts[3].id,
      dealId: createdDeals[3].id
    }
  ];

  const createdTasks = [];
  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: taskData
    });
    createdTasks.push(task);
  }

  console.log('✅ Tasks created');

  // Create communications
  const communications = [
    {
      type: 'EMAIL',
      subject: 'Welcome to our service',
      content: 'Thank you for your interest in our enterprise solution.',
      direction: 'OUTBOUND',
      completedAt: new Date('2024-01-20'),
      userId: salesRep.id,
      contactId: createdContacts[0].id,
      dealId: createdDeals[0].id
    },
    {
      type: 'PHONE_CALL',
      subject: 'Discovery call',
      content: 'Initial discovery call to understand requirements',
      direction: 'OUTBOUND',
      duration: 45,
      outcome: 'Positive response, interested in demo',
      completedAt: new Date('2024-01-22'),
      userId: salesRep.id,
      contactId: createdContacts[1].id,
      dealId: createdDeals[1].id
    },
    {
      type: 'MEETING',
      subject: 'Product demonstration',
      content: 'Live product demo and Q&A session',
      direction: 'OUTBOUND',
      duration: 60,
      outcome: 'Very interested, requested proposal',
      completedAt: new Date('2024-01-25'),
      userId: salesRep.id,
      contactId: createdContacts[2].id,
      dealId: createdDeals[2].id
    },
    {
      type: 'EMAIL',
      subject: 'Follow up on demo',
      content: 'Following up on yesterday\'s demonstration',
      direction: 'OUTBOUND',
      scheduled: true,
      scheduledFor: new Date('2024-02-10'),
      userId: salesRep.id,
      contactId: createdContacts[3].id,
      dealId: createdDeals[3].id
    }
  ];

  for (const commData of communications) {
    await prisma.communication.create({
      data: commData
    });
  }

  console.log('✅ Communications created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📧 Test accounts:');
  console.log('Admin: admin@salescrm.com / admin123');
  console.log('Sales Manager: manager@salescrm.com / manager123');
  console.log('Sales Rep: rep@salescrm.com / rep123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });