import { z } from 'zod';
export const env = z.object({
  DATABASE_URL: z.string(),
  VITE_SERVER_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  TURNSTILE_SECRET: z.string(),
}).parse(process.env)
