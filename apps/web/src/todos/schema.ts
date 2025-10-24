import { z } from 'zod';

export const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Bug title must be at least 5 characters.')
    .max(32, 'Bug title must be at most 32 characters.'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters.')
    .max(100, 'Description must be at most 100 characters.'),
});

export const todoSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    completed: z.boolean(),
  })
  .extend(formSchema.shape);

export type Todo = z.infer<typeof todoSchema>;
