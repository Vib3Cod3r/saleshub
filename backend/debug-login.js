const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('Debugging login process...');
    
    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@saleshub.com' },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        roleId: true,
        isActive: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('User ID:', user.id);
    console.log('Role ID:', user.roleId);
    console.log('Is Active:', user.isActive);
    
    // Step 2: Verify password
    const isPasswordValid = await bcrypt.compare('Admin123!', user.password);
    console.log('✅ Password verification:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return;
    }
    
    // Step 3: Generate token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
    console.log('JWT Secret length:', JWT_SECRET.length);
    
    const payload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };
    
    console.log('Payload:', payload);
    
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ Tokens generated successfully');
    console.log('Access token length:', accessToken.length);
    console.log('Refresh token length:', refreshToken.length);
    
    // Step 4: Verify token
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      console.log('✅ Token verification successful');
      console.log('Decoded payload:', decoded);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }
    
    // Step 5: Create response
    const { password: _, ...userWithoutPassword } = user;
    const response = {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
    
    console.log('✅ Response created successfully');
    console.log('Response keys:', Object.keys(response));
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
