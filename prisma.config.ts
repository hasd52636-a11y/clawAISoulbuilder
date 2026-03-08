import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasources: {
    db: {
      provider: 'postgresql',
      url: process.env.POSTGRES_URL || 'postgresql://localhost:5432/ai-soul-weaver',
    },
  },
});
