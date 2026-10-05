const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@tecrese.com' } });
  if (user) {
    const result = await prisma.session.deleteMany({
      where: { userId: user.id }
    });
    console.log(`Revoked ${result.count} active sessions for admin@tecrese.com`);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
