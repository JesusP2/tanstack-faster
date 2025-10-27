import { ORPCError, os } from '@orpc/server';
import type { Context } from './context';

export const base = os.$context<Context>();

const authMiddleware = base.middleware(async ({ next, context }) => {
  if (!context.session) {
    throw new ORPCError('Unauthorized');
  }
  return next();
});
export const authProcedure = base.use(authMiddleware);
