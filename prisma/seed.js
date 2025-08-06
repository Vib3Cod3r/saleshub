const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.communication.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = [
    {
      firstName: 'Theodore',
      lastName: 'Tse',
      email: 'ted@vib3cod3r.com',
      username: 'ted',
      password: await bcrypt.hash('password123', 10),
      role: 'SALES_MANAGER'
    },
    {
      firstName: 'Steven',
      lastName: 'Finch',
      email: 's.finch@fanjango.com.hk',
      username: 'steve',
      password: await bcrypt.hash('password123', 10),
      role: 'SALES_REP'
    }
  ];

  console.log('Creating users...');
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    });
    createdUsers.push(user);
    console.log(`Created user: ${user.firstName} ${user.lastName}`);
  }

  // Get user IDs
  const theodoreId = createdUsers.find(u => u.email === 'ted@vib3cod3r.com').id;
  const steveId = createdUsers.find(u => u.email === 's.finch@fanjango.com.hk').id;

  // Create sample contacts
  const contacts = [
    {
      firstName: 'Steve',
      lastName: 'Finch',
      email: 's.finch@fanjango.com.hk',
      phone: '+852 9410 8647',
      company: 'Fanjango Limited',
      leadStatus: 'QUALIFIED',
      leadSource: 'REFERRAL',
      assignedToId: theodoreId,
      notes: 'Key decision maker for enterprise solutions'
    },
    {
      firstName: 'Theodore',
      lastName: 'Tse',
      email: 'ted@vib3cod3r.com',
      phone: '+852 9170 6477',
      company: 'vib3cod3r.com',
      leadStatus: 'CONTACTED',
      leadSource: 'WEBSITE',
      assignedToId: steveId,
      notes: 'Technical lead, interested in API integration'
    },
    {
      firstName: 'Brian',
      lastName: 'Halligan',
      email: 'bh@hubspot.com',
      phone: null,
      company: 'HubSpot',
      leadStatus: 'NEW',
      leadSource: 'EMAIL_CAMPAIGN',
      assignedToId: null,
      notes: 'HubSpot co-founder, potential partnership opportunity'
    },
    {
      firstName: 'Maria',
      lastName: 'Johnson',
      email: 'emailmaria@hubspot.com',
      phone: null,
      company: 'HubSpot',
      leadStatus: 'NEW',
      leadSource: 'EMAIL_CAMPAIGN',
      assignedToId: null,
      notes: 'Marketing manager at HubSpot'
    }
  ];

  console.log('Creating contacts...');
  const createdContacts = [];
  for (const contactData of contacts) {
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        lastContactDate: new Date(),
        createdAt: new Date('2025-07-30T16:20:00'),
        updatedAt: new Date()
      }
    });
    createdContacts.push(contact);
    console.log(`Created contact: ${contact.firstName} ${contact.lastName}`);
  }

  // Create sample deals
  const deals = [
    {
      title: 'Enterprise CRM Implementation',
      value: 50000,
      stage: 'PROPOSAL_NEGOTIATION',
      probability: 75,
      expectedCloseDate: new Date('2025-12-31'),
      assignedToId: theodoreId,
      contactId: createdContacts[0].id
    },
    {
      title: 'API Integration Project',
      value: 25000,
      stage: 'PROPOSAL_NEGOTIATION',
      probability: 60,
      expectedCloseDate: new Date('2025-11-15'),
      assignedToId: steveId,
      contactId: createdContacts[1].id
    }
  ];

  console.log('Creating deals...');
  for (const dealData of deals) {
    const deal = await prisma.deal.create({
      data: dealData
    });
    console.log(`Created deal: ${deal.title}`);
  }

  // Create sample tasks
  const tasks = [
    {
      title: 'Follow up with Steve Finch',
      description: 'Discuss enterprise requirements and timeline',
      dueDate: new Date('2025-08-15'),
      priority: 'HIGH',
      status: 'PENDING',
      userId: theodoreId,
      contactId: createdContacts[0].id
    },
    {
      title: 'Prepare API demo for Theodore',
      description: 'Create technical demonstration of our API capabilities',
      dueDate: new Date('2025-08-10'),
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      userId: steveId,
      contactId: createdContacts[1].id
    }
  ];

  console.log('Creating tasks...');
  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: taskData
    });
    console.log(`Created task: ${task.title}`);
  }

  // Create sample communications
  const communications = [
    {
      type: 'EMAIL',
      subject: 'Enterprise CRM Proposal',
      content: 'Sent initial proposal for enterprise CRM implementation. Steve showed interest in our advanced features.',
      contactId: createdContacts[0].id,
      userId: theodoreId
    },
    {
      type: 'PHONE_CALL',
      subject: 'Technical Discussion',
      content: 'Had technical call with Theodore about API integration requirements. He was impressed with our documentation.',
      contactId: createdContacts[1].id,
      userId: steveId
    }
  ];

  console.log('Creating communications...');
  for (const commData of communications) {
    const communication = await prisma.communication.create({
      data: {
        ...commData,
        id: `${commData.type}_${commData.contactId}_${commData.userId}_${Date.now()}`
      }
    });
    console.log(`Created communication: ${communication.type} - ${communication.subject}`);
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });