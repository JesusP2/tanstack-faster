import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/auth';

export function getDb() {
  const client = postgres(env.DATABASE_URL);
  return drizzle(client, { schema });
}
