const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.customFieldValue.deleteMany();
  await prisma.customField.deleteMany();
  await prisma.note.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.task.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.dealStageHistory.deleteMany();
  await prisma.dealProduct.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.leadListMember.deleteMany();
  await prisma.leadList.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.companyResearch.deleteMany();
  await prisma.socialProfile.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.userGroupMember.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.userRole.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create User Roles
  const adminRole = await prisma.userRole.create({
    data: {
      name: 'ADMIN',
      description: 'Full system access and user management',
      permissions: { users: ['create', 'read', 'update', 'delete'], contacts: ['create', 'read', 'update', 'delete'], deals: ['create', 'read', 'update', 'delete'], leads: ['create', 'read', 'update', 'delete'] }
    }
  });

  const salesManagerRole = await prisma.userRole.create({
    data: {
      name: 'SALES_MANAGER',
      description: 'Team oversight, reporting, and sales operations',
      permissions: { users: ['read'], contacts: ['create', 'read', 'update'], companies: ['create', 'read', 'update'], deals: ['create', 'read', 'update', 'delete'] }
    }
  });

  const salesRepRole = await prisma.userRole.create({
    data: {
      name: 'SALES_REP',
      description: 'Individual sales operations and customer management',
      permissions: { users: ['read'], contacts: ['create', 'read', 'update'], companies: ['create', 'read', 'update'], deals: ['create', 'read', 'update'] }
    }
  });

  console.log('👥 Created user roles');

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@saleshub.com',
      username: 'admin',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'User',
      jobTitle: 'System Administrator',
      department: 'IT',
      roleId: adminRole.id
    }
  });

  const salesManager = await prisma.user.create({
    data: {
      email: 'manager@saleshub.com',
      username: 'manager',
      password: await bcrypt.hash('manager123', 12),
      firstName: 'Sarah',
      lastName: 'Johnson',
      jobTitle: 'Sales Manager',
      department: 'Sales',
      roleId: salesManagerRole.id
    }
  });

  const salesRep = await prisma.user.create({
    data: {
      email: 'rep@saleshub.com',
      username: 'rep',
      password: await bcrypt.hash('rep123', 12),
      firstName: 'Mike',
      lastName: 'Chen',
      jobTitle: 'Sales Representative',
      department: 'Sales',
      roleId: salesRepRole.id
    }
  });

  console.log('👤 Created users');

  // Create Companies
  const techCorp = await prisma.company.create({
    data: {
      name: 'TechCorp Solutions',
      website: 'https://techcorp.com',
      phone: '+1-555-0123',
      email: 'info@techcorp.com',
      address: '123 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      industry: 'Technology',
      size: 'MEDIUM_51_200',
      revenue: 25000000,
      employeeCount: 150,
      foundedYear: 2015,
      prospectAssignment: 'HIGH_PRIORITY',
      tags: ['enterprise', 'saas', 'b2b'],
      ownerId: salesManager.id
    }
  });

  const startupInc = await prisma.company.create({
    data: {
      name: 'Startup Inc.',
      website: 'https://startupinc.com',
      phone: '+1-555-0789',
      email: 'hello@startupinc.com',
      address: '789 Startup Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA',
      industry: 'Technology',
      size: 'SMALL_11_50',
      revenue: 2000000,
      employeeCount: 25,
      foundedYear: 2022,
      prospectAssignment: 'GROWTH_POTENTIAL',
      tags: ['startup', 'fintech', 'growth'],
      ownerId: salesRep.id
    }
  });

  console.log('🏢 Created companies');

  // Create Company Research
  await prisma.companyResearch.create({
    data: {
      companyId: techCorp.id,
      title: 'Market Position Analysis',
      content: 'TechCorp Solutions has established a strong position in the enterprise SaaS market with 15% year-over-year growth.',
      source: 'AI Analysis',
      researchType: 'MARKET_ANALYSIS',
      aiGenerated: true,
      confidence: 0.87,
      tags: ['market-analysis', 'competition', 'growth']
    }
  });

  console.log('🔍 Created company research');

  // Create Contacts
  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      preferredName: 'John',
      email: 'john.smith@techcorp.com',
      emailVerified: true,
      phone: '+1-555-0001',
      jobTitle: 'Chief Technology Officer',
      department: 'Technology',
      isDecisionMaker: true,
      gender: 'MALE',
      birthday: new Date('1980-06-15'),
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      leadSource: 'WEBSITE',
      leadStatus: 'QUALIFIED',
      leadScore: 85,
      tags: ['decision-maker', 'cto', 'enterprise'],
      companyId: techCorp.id,
      ownerId: salesManager.id
    }
  });

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'Alex',
      lastName: 'Johnson',
      preferredName: 'Alex',
      email: 'alex@startupinc.com',
      emailVerified: true,
      phone: '+1-555-0005',
      jobTitle: 'Founder & CEO',
      department: 'Executive',
      isDecisionMaker: true,
      gender: 'OTHER',
      birthday: new Date('1990-11-08'),
      address: '789 Innovation Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA',
      leadSource: 'EVENT',
      leadStatus: 'NEW',
      leadScore: 65,
      tags: ['founder', 'ceo', 'startup'],
      companyId: startupInc.id,
      ownerId: salesRep.id
    }
  });

  console.log('👥 Created contacts');

  // Create Social Profiles
  await prisma.socialProfile.create({
    data: {
      contactId: contact1.id,
      platform: 'LINKEDIN',
      username: 'johnsmith-cto',
      profileUrl: 'https://linkedin.com/in/johnsmith-cto',
      profileId: 'linkedin_12345',
      isVerified: true
    }
  });

  console.log('📱 Created social profiles');

  // Create Leads
  const lead1 = await prisma.lead.create({
    data: {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@newcompany.com',
      phone: '+1-555-0006',
      company: 'New Company LLC',
      jobTitle: 'Marketing Director',
      source: 'WEBSITE',
      sourceDetails: 'Contact form submission',
      leadScore: 72,
      status: 'NEW',
      assignedToId: salesRep.id,
      tags: ['website', 'marketing', 'new']
    }
  });

  console.log('🎯 Created leads');

  // Create Deals
  const deal1 = await prisma.deal.create({
    data: {
      title: 'TechCorp CRM Implementation',
      description: 'Enterprise CRM implementation for TechCorp Solutions',
      value: 150000,
      currency: 'USD',
      probability: 75,
      stage: 'PROPOSING',
      expectedCloseDate: new Date('2024-06-30'),
      competitors: ['Salesforce', 'HubSpot'],
      risks: 'Budget approval pending from board',
      tags: ['enterprise', 'crm', 'implementation'],
      companyId: techCorp.id,
      primaryContactId: contact1.id,
      ownerId: salesManager.id
    }
  });

  const deal2 = await prisma.deal.create({
    data: {
      title: 'Startup Inc. Growth Package',
      description: 'Complete sales and marketing solution for startup',
      value: 25000,
      currency: 'USD',
      probability: 90,
      stage: 'FOLLOW_UP',
      expectedCloseDate: new Date('2024-04-30'),
      competitors: ['Mailchimp', 'ConvertKit'],
      risks: 'Limited budget for additional features',
      tags: ['startup', 'growth', 'package'],
      companyId: startupInc.id,
      primaryContactId: contact2.id,
      ownerId: salesRep.id
    }
  });

  console.log('💰 Created deals');

  // Create Content
  const content1 = await prisma.content.create({
    data: {
      title: 'CRM Best Practices Guide',
      description: 'Comprehensive guide to implementing CRM best practices',
      type: 'PDF',
      url: 'https://saleshub.com/content/crm-best-practices.pdf',
      fileSize: 2048000,
      mimeType: 'application/pdf',
      tags: ['crm', 'best-practices', 'guide'],
      isPublished: true,
      publishedAt: new Date('2024-01-15'),
      creatorId: salesManager.id
    }
  });

  console.log('📚 Created content');

  // Create Tasks
  await prisma.task.create({
    data: {
      title: 'Follow up with TechCorp CTO',
      description: 'Schedule follow-up call to discuss proposal feedback',
      type: 'CALL',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date('2024-03-15'),
      estimatedDuration: 30,
      assigneeId: salesManager.id,
      creatorId: salesManager.id,
      contactId: contact1.id,
      dealId: deal1.id
    }
  });

  console.log('✅ Created tasks');

  // Create Communications
  await prisma.communication.create({
    data: {
      type: 'EMAIL',
      subject: 'Welcome to SalesHub CRM',
      content: 'Thank you for your interest in our CRM solution. We look forward to helping you grow your business.',
      direction: 'OUTBOUND',
      status: 'SENT',
      sentAt: new Date('2024-03-01T09:00:00Z'),
      deliveredAt: new Date('2024-03-01T09:01:00Z'),
      openedAt: new Date('2024-03-01T10:30:00Z'),
      creatorId: salesManager.id,
      contactId: contact1.id,
      dealId: deal1.id
    }
  });

  console.log('💬 Created communications');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n🔑 Default Login Credentials:');
  console.log('Admin: admin@saleshub.com / admin123');
  console.log('Manager: manager@saleshub.com / manager123');
  console.log('Sales Rep: rep@saleshub.com / rep123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });