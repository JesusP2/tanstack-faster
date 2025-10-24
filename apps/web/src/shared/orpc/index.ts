import { ORPCError, os } from '@orpc/server';
import type { Session, User } from '@/auth/server';
import type { getDb } from '@/db';

export const base = os.$context<{
  session: {
    user: User;
    session: Session;
  } | null;
  db: ReturnType<typeof getDb>;
}>();

const authMiddleware = base.middleware(async ({ next, context }) => {
  if (!context.session) {
    throw new ORPCError('Unauthorized');
  }
  return next();
});
export const authProcedure = base.use(authMiddleware);
