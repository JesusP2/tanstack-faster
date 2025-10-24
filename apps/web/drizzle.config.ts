import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: './.dev.vars',
});

export default defineConfig({
  schema: './src/db/schema/auth.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
