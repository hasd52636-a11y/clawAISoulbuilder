import { defineConfig } from '@prisma/config';

// 直接硬编码数据库连接字符串
export default defineConfig({
  datasources: {
    db: {
      provider: 'postgresql',
      url: 'postgres://ffaaea62d79988250b5703b5864e2b1ecd72d6b950d2b9e664cf5811040cf447:sk_CY4M1Lpu1hlp6ZEjZN64D@db.prisma.io:5432/postgres?sslmode=require',
    },
  },
  client: {
    generate: {
      output: '.prisma/client'
    }
  }
});
