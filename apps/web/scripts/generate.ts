import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import dotenv from 'dotenv';
import { eq, isNull } from 'drizzle-orm';
import fs from 'fs';
import OpenAI from 'openai';
import slugify from 'slugify';
import { ulid } from 'ulidx';
import { z } from 'zod';
import { db } from '../src/db';
import {
  categories,
  collections,
  subcategories,
  subcollections,
} from '../src/db/schema';

dotenv.config({
  path: './.env',
});

const openai = new OpenAI();
const client = createOpenAI();

const system = `
You are given the name of a collection for products in an art supply store.
Your task is to generate 20 unique categories for this collection. Make sure the
category names are broad.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
Collection Name: Sketching Pencils

OUTPUT:
{ categories: ["Colored Pencils", "Charcoal Pencils", ...] }

Remember, ONLY RETURN THE JSON of 20 unique categories and nothing else.
  
MAKE SURE THERE ARE 20 CATEGORIES IN THE OUTPUT.`;

const getCollections = async () => await db.select().from(collections);

// generate 20 categories per each collection
const generateCategories = async () => {
  const data = [] as any;
  const c = await getCollections();

  const promises = c.slice(50, 100).map(async (col) => {
    const { object } = await generateObject({
      model: client.languageModel('gpt-4o-mini'),
      providerOptions: {
        openai: {
          structuredOutputs: true,
        },
      },
      schema: z.object({
        categories: z.array(z.string()),
      }),
      system,
      prompt: `Collection Name: ${col.name}`,
    });

    const { categories: cats } = object;
    console.log(`Categories generated: ${cats.length}`);

    const categoriesToAdd = cats.map((category: string) => ({
      name: category,
      collection_id: col.id,
      slug: slugify(category, { lower: true }),
    }));
    data.push(...categoriesToAdd);
  });

  await Promise.all(promises);
  await db.insert(categories).values(data).onConflictDoNothing();
};
// generateCategories();

const getCategories = async () => await db.select().from(categories);

// generate 10 subcollections per each category
const generateSubCollections = async () => {
  const c = await getCategories();

  const step = 50;
  const batch = c.length / step;
  for (let i = 0; i < batch; i++) {
    const data = [] as any;
    const promises = c.slice(i * step, i * step + step).map(async (cat) => {
      const { object } = await generateObject({
        model: client.languageModel('gpt-4o-mini'),
        providerOptions: {
          openai: {
            structuredOutputs: true,
          },
        },
        schema: z.object({
          subcollections: z.array(z.string()),
        }),
        system: `You are given the name of a category for products in an art supply store.
                Your task is to generate 10 unique subcollections for this category. Make sure the
                subcollection names are broad.

                YOU MUST OUTPUT IN ONLY JSON.
                
                EXAMPLE:

                INPUT:
                Category Name: Art Hitory

                OUTPUT:
                { subcollections: ["Art History Books", "Art History CDs", ...] }
                
                Remember, ONLY RETURN THE JSON of 10 unique subcollections and nothing else.
                  
                MAKE SURE THERE ARE 10 SUBCOLLECTIONS IN THE OUTPUT.`,
        prompt: `Category Name: ${cat.name}`,
      });

      const { subcollections: sc } = object;
      console.log(`Subcollections generated: ${sc.length}`);

      const categoriesToAdd = sc.map((subcol: string) => ({
        id: ulid(),
        name: subcol,
        category_slug: cat.slug,
      }));
      data.push(...categoriesToAdd);
    });

    await Promise.all(promises);
    await db.insert(subcollections).values(data).onConflictDoNothing();
  }
};

// generateSubCollections();

const getSubcollections = async () => {
  // only get subcollections that have no subcategories
  const result = await db
    .select()
    .from(subcollections)
    .leftJoin(
      subcategories,
      eq(subcollections.id, subcategories.subcollection_id)
    )
    .where(isNull(subcategories.subcollection_id))
    .offset(7000);
  return result;
};

const generateSubcategories = async () => {
  const subcollections = (await getSubcollections()).map(
    (c) => c.subcollections
  );

  const step = 5;
  const batch = subcollections.length / step;
  console.log(batch, subcollections.length);
  for (let i = 0; i < batch; i++) {
    const data = [] as any;
    console.log(`Generating subcategories for batch ${i + 1} of ${batch}`);
    const promises = subcollections
      .slice(i * step, i * step + step)
      .map(async (subcol) => {
        const { object } = await generateObject({
          model: client.languageModel('gpt-4o-mini'),
          providerOptions: {
            openai: {
              structuredOutputs: true,
            },
          },
          schema: z.object({
            subcategories: z.array(z.string()),
          }),
          system: `You are given the name of a subcollection of products in an art supply store.
                Your task is to generate 10 unique subcategories that belong to this subcollection.
                Make sure the subcategory names are broad.

                YOU MUST OUTPUT IN ONLY JSON.

                EXAMPLE:

                INPUT:
                Subcollection Name: Art Hitory

                OUTPUT:
                { subcategories: ["Art History Books", "Art History CDs", ...] }

                Remember, ONLY RETURN THE JSON of 10 unique subcategories and nothing else.

                MAKE SURE THERE ARE 10 SUBCATEGORIES IN THE OUTPUT.`,
          prompt: `Subcollection Name: ${subcol}`,
        });

        const { subcategories: sc } = object;
        console.log(`Subcategories generated: ${sc.length}`);

        const subcategoriesToAdd = sc.map((subcat: string) => ({
          name: subcat,
          slug: slugify(subcat, { lower: true }),
          subcollection_id: subcol.id,
        }));
        data.push(...subcategoriesToAdd);
      });

    await Promise.all(promises);
    console.log('adding subcategories:', data.length);
    await db.insert(subcategories).values(data).onConflictDoNothing();
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

// getSubcollections();
generateSubcategories();

const productSystemMessage = `
You are given the name of a category of products in an art supply store.
Your task is to generate 25 unique products that belong to this category.
Ensure each product has a name and brief description.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
Category Name: Paint Markers

OUTPUT:
{ products: [{ name: "Expo Paint Marker", description: "..." }, { name: "Paint Marker Set", description:"..." }] }

Remember, ONLY RETURN THE JSON of 30 unique products and nothing else.
MAKE SURE YOUR JSON IS VALID. ALL JSON MUST BE CORRECT.
`;

const generateBatchFile = async () => {
  const arr = await db.select().from(subcategories);

  arr.forEach((subcat) => {
    const custom_id = subcat.slug;
    const method = 'POST';
    const url = '/v1/chat/completions';
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: productSystemMessage },
        { role: 'user', content: `Category name: ${subcat.name}` },
      ],
    };

    const line = `{"custom_id": "${custom_id}", "method": "${method}", "url": "${url}", "body": ${JSON.stringify(body)}}`;

    fs.appendFile('scripts/req.jsonl', line + '\n', (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
};

// generateBatchFile();

const uploadBatchFile = async () => {
  const file = await openai.files.create({
    file: fs.createReadStream('scripts/req.jsonl'),
    purpose: 'batch',
  });

  console.log(file);
};

// uploadBatchFile();

const createBatch = async () => {
  const batch = await openai.batches.create({
    input_file_id: '',
    endpoint: '/v1/chat/completions',
    completion_window: '24h',
  });

  console.log(batch);
};

// createBatch();

const checkBatchStatus = async () => {
  const batch = await openai.batches.retrieve('');
  console.log(batch);
};

// checkBatchStatus();

const downloadBatch = async () => {
  const fileResponse = await openai.files.content('');
  const fileContents = await fileResponse.text();

  fs.appendFile('scripts/out.jsonl', fileContents, (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('File has been saved');
  });
};

// downloadBatch();
