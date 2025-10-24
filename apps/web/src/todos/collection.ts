import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { orpcClient } from '@/shared/orpc/client';
import { todoSchema } from './schema';

export const todosCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    shapeOptions: {
      url: `${import.meta.env.VITE_SERVER_URL}/api/electric/todos`,
      params: {
        table: 'todos',
      },
      onError: (error) => {
        console.error(error);
      },
    },
    schema: todoSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const newItem = transaction.mutations[0].modified;
      const response = await orpcClient.todos.create(newItem);
      return {
        txid: response.txid,
      };
    },
  })
);
