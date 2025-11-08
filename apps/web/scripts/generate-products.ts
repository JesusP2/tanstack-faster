import dotenv from 'dotenv';
import { Effect, Schedule } from 'effect';
import slugify from 'slugify';
import { db } from '@/db';
import {
  products as productsTable,
  subcategories as subcategoriesTable,
} from '@/db/schema';

dotenv.config({
  path: './.env',
});

const main = Effect.gen(function* () {
  const subcategories = yield* Effect.tryPromise(() =>
    db.select().from(subcategoriesTable)
  );

  yield* Effect.all(
    subcategories.map((subcat) =>
      Effect.tryPromise(() =>
        db.transaction(async (tx) => {
          const productsNum = 180 + Math.floor(Math.random() * 40);
          const arr = Array.from({ length: productsNum }, (_, i) => i);
          await Promise.all(
            arr.map(async (i) => {
              const num = i.toString().padStart(3, '0');
              const name = `${subcat.name} - product ${num}`;
              await tx.insert(productsTable).values({
                name,
                slug: slugify(name, { lower: true }),
                description: `${name} description`,
                subcategory_slug: subcat.slug,
                price: Math.floor(Math.random() * 100).toString(),
              });
            })
          );
        })
      ).pipe(
        Effect.andThen(() => console.log(`Inserted ${subcat.name} products`)),
        Effect.catchAll(() => Effect.void)
      )
    ),
    {
      concurrency: 10,
    }
  );
});

const exit = await Effect.runPromiseExit(
  main.pipe(Effect.retry({ schedule: Schedule.spaced('1 seconds') }))
);
console.log(exit.toString());
