const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.user.deleteMany({
    where: { email: 'admin@tecrese.com' }
  });
  console.log("Deleted admin@tecrese.com");
}
run();
