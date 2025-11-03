import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/auth';
import { env } from '@/shared/env';

const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema })
