// db/database.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 创建 PostgreSQL 连接池
const connectionString = 'postgres://ffaaea62d79988250b5703b5864e2b1ecd72d6b950d2b9e664cf5811040cf447:sk_CY4M1Lpu1hlp6ZEjZN64D@db.prisma.io:5432/postgres?sslmode=require';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 创建 Prisma Client 实例
const prisma = new PrismaClient({ adapter });

export function getDatabase() {
  return prisma;
}

export function closeDatabase() {
  return prisma.$disconnect();
}
