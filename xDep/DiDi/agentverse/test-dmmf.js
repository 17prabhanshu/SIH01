const { PrismaClient, Prisma } = require('@prisma/client');
const modelSchema = Prisma.dmmf.datamodel.models.find(m => m.name === 'Article');
console.log(modelSchema.fields.filter(f => f.name.includes('categoryId') || f.name.includes('category')));
