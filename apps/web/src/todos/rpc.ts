import { todos as todosTable } from '@/db/schema/auth';
import { generateTxId } from '@/shared/generate-txid';
import { authProcedure } from '@/shared/orpc';
import { todoSchema } from './schema';

const create = authProcedure
  .input(todoSchema)
  .handler(async ({ input, context }) => {
    const result = await context.db.transaction(async (tx) => {
      const txid = await generateTxId(tx);
      const [item] = await tx.insert(todosTable).values(input).returning();
      return {
        item,
        txid,
      };
    });
    return result;
  });

export const todos = {
  create,
};
