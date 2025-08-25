import { prisma } from '@/utils/database';
import { hashPassword } from '@/utils/auth';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create user roles
  console.log('Creating user roles...');
  const adminRole = await prisma.userRole.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions: {
        users: ['read', 'write', 'delete'],
        contacts: ['read', 'write', 'delete'],
        companies: ['read', 'write', 'delete'],
        leads: ['read', 'write', 'delete'],
        deals: ['read', 'write', 'delete'],
        tasks: ['read', 'write', 'delete']
      }
    }
  });

  // Create manager and sales roles (not used in this seed but available)
  await prisma.userRole.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Sales manager with team access',
      permissions: {
        users: ['read'],
        contacts: ['read', 'write'],
        companies: ['read', 'write'],
        leads: ['read', 'write'],
        deals: ['read', 'write'],
        tasks: ['read', 'write']
      }
    }
  });

  await prisma.userRole.upsert({
    where: { name: 'SALES' },
    update: {},
    create: {
      name: 'SALES',
      description: 'Sales representative',
      permissions: {
        users: ['read'],
        contacts: ['read', 'write'],
        companies: ['read', 'write'],
        leads: ['read', 'write'],
        deals: ['read', 'write'],
        tasks: ['read', 'write']
      }
    }
  });

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await hashPassword('Admin123!');
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@saleshub.com' },
    update: {},
    create: {
      email: 'admin@saleshub.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      jobTitle: 'System Administrator',
      department: 'IT',
      roleId: adminRole.id
    }
  });

  // Create sample companies
  console.log('Creating sample companies...');
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Acme Corporation',
        website: 'https://acme.com',
        phone: '+1-555-0123',
        email: 'contact@acme.com',
        industry: 'Technology',
        sector: 'Software',
        size: 'MEDIUM_51_200',
        revenue: 50000000,
        employeeCount: 150,
        foundedYear: 2010,
        isPublic: false,
        notes: 'Leading software solutions provider',
        tags: ['enterprise', 'saas', 'technology'],
        ownerId: adminUser.id
      }
    }),
    prisma.company.create({
      data: {
        name: 'Global Industries',
        website: 'https://globalindustries.com',
        phone: '+1-555-0456',
        email: 'info@globalindustries.com',
        industry: 'Manufacturing',
        sector: 'Industrial',
        size: 'LARGE_201_1000',
        revenue: 200000000,
        employeeCount: 500,
        foundedYear: 1995,
        isPublic: true,
        notes: 'International manufacturing company',
        tags: ['manufacturing', 'industrial', 'global'],
        ownerId: adminUser.id
      }
    })
  ]);

  // Create sample contacts
  console.log('Creating sample contacts...');
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@acme.com',
        phone: '+1-555-0001',
        jobTitle: 'CEO',
        department: 'Executive',
        isDecisionMaker: true,
        leadStatus: 'QUALIFIED',
        leadScore: 85,
        notes: 'Primary decision maker for enterprise deals',
        tags: ['decision-maker', 'executive', 'enterprise'],
        companyId: companies[0].id,
        ownerId: adminUser.id
      }
    }),
    prisma.contact.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@globalindustries.com',
        phone: '+1-555-0002',
        jobTitle: 'VP of Operations',
        department: 'Operations',
        isDecisionMaker: true,
        leadStatus: 'INTERESTED',
        leadScore: 75,
        notes: 'Interested in process optimization solutions',
        tags: ['operations', 'decision-maker', 'process'],
        companyId: companies[1].id,
        ownerId: adminUser.id
      }
    })
  ]);

  // Create sample leads
  console.log('Creating sample leads...');
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@startup.com',
        phone: '+1-555-0003',
        company: 'TechStartup Inc',
        jobTitle: 'CTO',
        website: 'https://techstartup.com',
        source: 'WEBSITE',
        sourceDetails: 'Contact form submission',
        leadScore: 60,
        status: 'NEW',
        notes: 'Looking for scalable CRM solution',
        tags: ['startup', 'technology', 'crm']
      }
    })
  ]);

  // Create sample deals
  console.log('Creating sample deals...');
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: 'Acme Enterprise CRM Implementation',
        description: 'Full CRM implementation for Acme Corporation',
        value: 250000,
        currency: 'USD',
        probability: 75,
        stage: 'NEGOTIATING',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        competitors: ['Salesforce', 'HubSpot'],
        risks: 'Budget approval pending',
        notes: 'High priority deal with strong stakeholder support',
        tags: ['enterprise', 'implementation', 'high-value'],
        companyId: companies[0].id,
        primaryContactId: contacts[0].id,
        ownerId: adminUser.id
      }
    })
  ]);

  // Create sample tasks
  console.log('Creating sample tasks...');
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow up with John Doe',
        description: 'Discuss proposal feedback and next steps',
        type: 'CALL',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        estimatedDuration: 30,
        notes: 'Prepare demo for new features',
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assigneeId: adminUser.id,
        creatorId: adminUser.id
      }
    })
  ]);

  // Create additional sample data for development
  console.log('Creating additional sample data...');
  const sampleUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'manager@saleshub.com',
        username: 'manager',
        password: await hashPassword('Manager123!'),
        firstName: 'Sarah',
        lastName: 'Johnson',
        jobTitle: 'Sales Manager',
        department: 'Sales',
        roleId: (await prisma.userRole.findUnique({ where: { name: 'MANAGER' } }))!.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'sales@saleshub.com',
        username: 'sales',
        password: await hashPassword('Sales123!'),
        firstName: 'Mike',
        lastName: 'Chen',
        jobTitle: 'Sales Representative',
        department: 'Sales',
        roleId: (await prisma.userRole.findUnique({ where: { name: 'SALES' } }))!.id
      }
    })
  ]);

  // Create more sample companies
  const additionalCompanies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp Solutions',
        website: 'https://techcorp.com',
        phone: '+1-555-0789',
        email: 'info@techcorp.com',
        industry: 'Technology',
        sector: 'Consulting',
        size: 'SMALL_11_50',
        revenue: 5000000,
        employeeCount: 25,
        foundedYear: 2018,
        isPublic: false,
        notes: 'Boutique technology consulting firm',
        tags: ['consulting', 'technology', 'boutique'],
        ownerId: sampleUsers[0].id
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:
  - ${1 + sampleUsers.length} users (admin + additional)
  - ${companies.length + additionalCompanies.length} companies
  - ${contacts.length} contacts
  - ${leads.length} leads
  - ${deals.length} deals
  - ${tasks.length} tasks
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
