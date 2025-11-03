import { RPCHandler } from '@orpc/server/fetch';

export const orpcRouter = {
};
export type ORPCRouter = typeof orpcRouter;
export const handler = new RPCHandler(orpcRouter);
