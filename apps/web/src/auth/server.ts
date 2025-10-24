import { env } from 'cloudflare:workers';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, anonymous, jwt, magicLink } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { reactStartCookies } from 'better-auth/react-start';
import { Resend } from 'resend';
import { getDb } from '../db';
import * as schema from '../db/schema/auth';
import { forgotPasswordTemplate } from './emails/forgot-password';
import { magicLinkTemplate } from './emails/magic-link';

const resend = new Resend(env.RESEND_API_KEY);
export function getAuth() {
  const db = getDb();
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    plugins: [
      jwt(),
      anonymous(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await resend.emails.send({
            from: 'no-reply@template.com',
            to: email,
            subject: 'Magic link',
            react: magicLinkTemplate(url, env.VITE_SERVER_URL),
          });
        },
      }),
      admin(),
      passkey(),
      reactStartCookies(),
    ],
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        await resend.emails.send({
          from: 'no-reply@template.com',
          to: user.email,
          subject: 'Reset password',
          react: forgotPasswordTemplate(url, env.VITE_SERVER_URL),
        });
      },
    },
    socialProviders: {
      google: {
        enabled: true,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.VITE_SERVER_URL,
  });
  return auth;
}

export type Auth = ReturnType<typeof getAuth>;
export type Session = Auth['$Infer']['Session']['session'];
export type User = Auth['$Infer']['Session']['user'];
