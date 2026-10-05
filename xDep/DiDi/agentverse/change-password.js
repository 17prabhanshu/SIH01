const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await prisma.user.update({
    where: { email: 'admin@tecrese.com' },
    data: { passwordHash: hashedPassword }
  });
  
  console.log("Password updated successfully.");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
