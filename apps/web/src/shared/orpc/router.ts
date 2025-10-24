import { RPCHandler } from '@orpc/server/fetch';
import { todos } from '@/todos/rpc';

export const orpcRouter = {
  todos,
};
export type ORPCRouter = typeof orpcRouter;

export const handler = new RPCHandler(orpcRouter);
