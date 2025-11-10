import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  isAnonymous: boolean('is_anonymous'),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const collections = pgTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
});

export type Collection = typeof collections.$inferSelect;

export const categories = pgTable(
  'categories',
  {
    slug: text('slug').notNull().primaryKey(),
    name: text('name').notNull(),
    collection_id: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    image_url: text('image_url'),
  },
  (table) => [index('categories_collection_id_idx').on(table.collection_id)]
);

export type Category = typeof categories.$inferSelect;

export const subcollections = pgTable(
  'subcollections',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    category_slug: text('category_slug')
      .notNull()
      .references(() => categories.slug, { onDelete: 'cascade' }),
  },
  (table) => [index('subcollections_category_slug_idx').on(table.category_slug)]
);

export type Subcollection = typeof subcollections.$inferSelect;

export const subcategories = pgTable(
  'subcategories',
  {
    slug: text('slug').notNull().primaryKey(),
    name: text('name').notNull(),
    subcollection_id: text('subcollection_id')
      .notNull()
      .references(() => subcollections.id, { onDelete: 'cascade' }),
    image_url: text('image_url'),
  },
  (table) => [
    index('subcategories_subcollection_id_idx').on(table.subcollection_id),
  ]
);

export type Subcategory = typeof subcategories.$inferSelect;

export const products = pgTable(
  'products',
  {
    slug: text('slug').notNull().primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: numeric('price').notNull(),
    subcategory_slug: text('subcategory_slug')
      .notNull()
      .references(() => subcategories.slug, { onDelete: 'cascade' }),
    image_url: text('image_url'),
  },
  (table) => [
    index('name_search_index').using(
      'gin',
      sql`to_tsvector('english', ${table.name})`
    ),
    index('name_trgm_index').using('gin', sql`${table.name} gin_trgm_ops`),
    index('products_subcategory_slug_idx').on(table.subcategory_slug),
  ]
);

export type Product = typeof products.$inferSelect;

export const collectionsRelations = relations(collections, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  collection: one(collections, {
    fields: [categories.collection_id],
    references: [collections.id],
  }),
  subcollections: many(subcollections),
}));

export const subcollectionRelations = relations(
  subcollections,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subcollections.category_slug],
      references: [categories.slug],
    }),
    subcategories: many(subcategories),
  })
);

export const subcategoriesRelations = relations(
  subcategories,
  ({ one, many }) => ({
    subcollection: one(subcollections, {
      fields: [subcategories.subcollection_id],
      references: [subcollections.id],
    }),
    products: many(products),
  })
);

export const productsRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategory_slug],
    references: [subcategories.slug],
  }),
}));
