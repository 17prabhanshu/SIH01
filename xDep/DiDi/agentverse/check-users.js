const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("USERS:");
  users.forEach(u => {
    console.log(`- Email: ${u.email}`);
    console.log(`  Hash: ${u.passwordHash}`);
  });
  
  // Test password 'change-this-password'
  const bcrypt = require('bcryptjs');
  if (users.length > 0) {
    const isValid1 = await bcrypt.compare('change-this-password', users[0].passwordHash);
    console.log(`\nMatches 'change-this-password': ${isValid1}`);
    
    // Test if 'admin123' works (maybe they saved admin123?)
    const isValid2 = await bcrypt.compare('admin123', users[0].passwordHash);
    console.log(`Matches 'admin123': ${isValid2}`);
  }
}

check().then(() => process.exit(0));
