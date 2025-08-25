const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // First, let's check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@saleshub.com' }
    });
    
    if (adminUser) {
      console.log('Admin user found:', adminUser.email);
      
      // Test password verification
      const isValid = await bcrypt.compare('Admin123!', adminUser.password);
      console.log('Password verification:', isValid);
      
      if (isValid) {
        console.log('✅ Login should work with admin@saleshub.com / Admin123!');
      } else {
        console.log('❌ Password verification failed');
      }
    } else {
      console.log('Admin user not found, creating one...');
      
      // Get the ADMIN role
      const adminRole = await prisma.userRole.findFirst({
        where: { name: 'ADMIN' }
      });
      
      if (!adminRole) {
        console.log('❌ ADMIN role not found');
        return;
      }
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const newAdmin = await prisma.user.create({
        data: {
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
      
      console.log('✅ Admin user created:', newAdmin.email);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
