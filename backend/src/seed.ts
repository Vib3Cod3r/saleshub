import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '@/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@saleshub.com' },
    update: {},
    create: {
      email: 'admin@saleshub.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true
    }
  });

  // Create sales manager
  const managerPassword = await hashPassword('Manager123!');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@saleshub.com' },
    update: {},
    create: {
      email: 'manager@saleshub.com',
      username: 'manager',
      firstName: 'Sales',
      lastName: 'Manager',
      password: managerPassword,
      role: UserRole.SALES_MANAGER,
      isActive: true
    }
  });

  // Create sales rep
  const repPassword = await hashPassword('Rep123!');
  const rep = await prisma.user.upsert({
    where: { email: 'rep@saleshub.com' },
    update: {},
    create: {
      email: 'rep@saleshub.com',
      username: 'rep',
      firstName: 'Sales',
      lastName: 'Rep',
      password: repPassword,
      role: UserRole.SALES_REP,
      isActive: true
    }
  });

  // Create sample companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { name: 'TechCorp Solutions' },
      update: {},
      create: {
        name: 'TechCorp Solutions',
        website: 'https://techcorp.com',
        industry: 'Technology',
        size: '500-1000',
        description: 'Leading technology solutions provider',
        createdById: admin.id
      }
    }),
    prisma.company.upsert({
      where: { name: 'Global Manufacturing Inc' },
      update: {},
      create: {
        name: 'Global Manufacturing Inc',
        website: 'https://globalmanufacturing.com',
        industry: 'Manufacturing',
        size: '1000+',
        description: 'International manufacturing company',
        createdById: admin.id
      }
    }),
    prisma.company.upsert({
      where: { name: 'StartupXYZ' },
      update: {},
      create: {
        name: 'StartupXYZ',
        website: 'https://startupxyz.com',
        industry: 'SaaS',
        size: '10-50',
        description: 'Innovative SaaS startup',
        createdById: admin.id
      }
    })
  ]);

  // Create sample contacts
  const contacts = await Promise.all([
    prisma.contact.upsert({
      where: { email: 'john.doe@techcorp.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@techcorp.com',
        phone: '+1-555-0101',
        jobTitle: 'CTO',
        department: 'Technology',
        companyId: companies[0].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    }),
    prisma.contact.upsert({
      where: { email: 'jane.smith@globalmanufacturing.com' },
      update: {},
      create: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@globalmanufacturing.com',
        phone: '+1-555-0102',
        jobTitle: 'Procurement Manager',
        department: 'Procurement',
        companyId: companies[1].id,
        assignedToId: manager.id,
        createdById: admin.id
      }
    }),
    prisma.contact.upsert({
      where: { email: 'mike.johnson@startupxyz.com' },
      update: {},
      create: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@startupxyz.com',
        phone: '+1-555-0103',
        jobTitle: 'CEO',
        department: 'Executive',
        companyId: companies[2].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    })
  ]);

  // Create sample deals
  const deals = await Promise.all([
    prisma.deal.upsert({
      where: { title: 'Enterprise Software License' },
      update: {},
      create: {
        title: 'Enterprise Software License',
        description: 'Annual software license for TechCorp Solutions',
        value: 50000,
        currency: 'USD',
        stage: 'NEGOTIATION',
        probability: 75,
        expectedCloseDate: new Date('2024-12-31'),
        contactId: contacts[0].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    }),
    prisma.deal.upsert({
      where: { title: 'Manufacturing Equipment' },
      update: {},
      create: {
        title: 'Manufacturing Equipment',
        description: 'New production line equipment for Global Manufacturing',
        value: 250000,
        currency: 'USD',
        stage: 'PROPOSAL_SENT',
        probability: 60,
        expectedCloseDate: new Date('2024-11-30'),
        contactId: contacts[1].id,
        assignedToId: manager.id,
        createdById: admin.id
      }
    }),
    prisma.deal.upsert({
      where: { title: 'SaaS Subscription' },
      update: {},
      create: {
        title: 'SaaS Subscription',
        description: 'Annual SaaS subscription for StartupXYZ',
        value: 12000,
        currency: 'USD',
        stage: 'CLOSED_WON',
        probability: 100,
        expectedCloseDate: new Date('2024-10-15'),
        actualCloseDate: new Date('2024-10-15'),
        contactId: contacts[2].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    })
  ]);

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { title: 'Follow up with TechCorp' },
      update: {},
      create: {
        title: 'Follow up with TechCorp',
        description: 'Call John Doe to discuss proposal feedback',
        type: 'CALL',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date('2024-12-20'),
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    }),
    prisma.task.upsert({
      where: { title: 'Prepare proposal for Global Manufacturing' },
      update: {},
      create: {
        title: 'Prepare proposal for Global Manufacturing',
        description: 'Create detailed proposal for manufacturing equipment',
        type: 'PROPOSAL',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        dueDate: new Date('2024-12-25'),
        contactId: contacts[1].id,
        dealId: deals[1].id,
        assignedToId: manager.id,
        createdById: admin.id
      }
    })
  ]);

  // Create sample calls
  const calls = await Promise.all([
    prisma.call.upsert({
      where: { subject: 'Initial contact with TechCorp' },
      update: {},
      create: {
        subject: 'Initial contact with TechCorp',
        description: 'Initial discovery call with John Doe',
        duration: 1800, // 30 minutes
        outcome: 'Positive response, interested in proposal',
        completedAt: new Date('2024-12-10'),
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    })
  ]);

  // Create sample notes
  const notes = await Promise.all([
    prisma.note.upsert({
      where: { content: 'TechCorp is looking for enterprise solution' },
      update: {},
      create: {
        title: 'TechCorp Discovery Notes',
        content: 'TechCorp is looking for enterprise solution with 24/7 support and custom integrations.',
        type: 'CALL_SUMMARY',
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    })
  ]);

  // Create sample messages
  const messages = await Promise.all([
    prisma.message.upsert({
      where: { subject: 'Welcome to SalesHub' },
      update: {},
      create: {
        subject: 'Welcome to SalesHub',
        content: 'Thank you for your interest in our solutions. We look forward to working with you.',
        type: 'EMAIL',
        direction: 'OUTBOUND',
        status: 'SENT',
        sentAt: new Date('2024-12-10'),
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assignedToId: rep.id,
        createdById: admin.id
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.company.count()} companies`);
  console.log(`   - ${await prisma.contact.count()} contacts`);
  console.log(`   - ${await prisma.deal.count()} deals`);
  console.log(`   - ${await prisma.task.count()} tasks`);
  console.log(`   - ${await prisma.call.count()} calls`);
  console.log(`   - ${await prisma.note.count()} notes`);
  console.log(`   - ${await prisma.message.count()} messages`);

  console.log('\n🔑 Default login credentials:');
  console.log('   Admin: admin@saleshub.com / Admin123!');
  console.log('   Manager: manager@saleshub.com / Manager123!');
  console.log('   Rep: rep@saleshub.com / Rep123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 