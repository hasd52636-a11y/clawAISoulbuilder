// db/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function getDatabase() {
  return prisma;
}

export function closeDatabase() {
  return prisma.$disconnect();
}
