import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous, captcha } from 'better-auth/plugins';
import { reactStartCookies } from 'better-auth/react-start';
import { env } from '@/shared/env';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  rateLimit: {
    enabled: false,
    // window: 1,
    // max: 10000,
  },
  plugins: [
    anonymous(),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: env.TURNSTILE_SECRET,
    }),
    reactStartCookies(),
  ],
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.VITE_SERVER_URL,
});

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session']['session'];
export type User = Auth['$Infer']['Session']['user'];
