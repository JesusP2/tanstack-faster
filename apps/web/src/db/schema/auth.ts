import { pgTable } from 'drizzle-orm/pg-core';

export const user = pgTable('user', (t) => ({
  id: t.text('id').primaryKey(),
  name: t.text('name').notNull(),
  email: t.text('email').notNull().unique(),
  emailVerified: t.boolean('email_verified').default(false).notNull(),
  image: t.text('image'),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t
    .timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  isAnonymous: t.boolean('is_anonymous'),
  role: t.text('role'),
  banned: t.boolean('banned').default(false),
  banReason: t.text('ban_reason'),
  banExpires: t.timestamp('ban_expires'),
}));

export const session = pgTable('session', (t) => ({
  id: t.text('id').primaryKey(),
  expiresAt: t.timestamp('expires_at').notNull(),
  token: t.text('token').notNull().unique(),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t
    .timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: t.text('ip_address'),
  userAgent: t.text('user_agent'),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: t.text('impersonated_by'),
}));

export const account = pgTable('account', (t) => ({
  id: t.text('id').primaryKey(),
  accountId: t.text('account_id').notNull(),
  providerId: t.text('provider_id').notNull(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: t.text('access_token'),
  refreshToken: t.text('refresh_token'),
  idToken: t.text('id_token'),
  accessTokenExpiresAt: t.timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at'),
  scope: t.text('scope'),
  password: t.text('password'),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t
    .timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const verification = pgTable('verification', (t) => ({
  id: t.text('id').primaryKey(),
  identifier: t.text('identifier').notNull(),
  value: t.text('value').notNull(),
  expiresAt: t.timestamp('expires_at').notNull(),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t
    .timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const jwks = pgTable('jwks', (t) => ({
  id: t.text('id').primaryKey(),
  publicKey: t.text('public_key').notNull(),
  privateKey: t.text('private_key').notNull(),
  createdAt: t.timestamp('created_at').notNull(),
}));

export const passkey = pgTable('passkey', (t) => ({
  id: t.text('id').primaryKey(),
  name: t.text('name'),
  publicKey: t.text('public_key').notNull(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  credentialID: t.text('credential_id').notNull(),
  counter: t.integer('counter').notNull(),
  deviceType: t.text('device_type').notNull(),
  backedUp: t.boolean('backed_up').notNull(),
  transports: t.text('transports'),
  createdAt: t.timestamp('created_at'),
  aaguid: t.text('aaguid'),
}));

export const todos = pgTable('todos', (t) => ({
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: t.text('title').notNull(),
  description: t.text('description'),
  completed: t.boolean('completed').notNull(),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t
    .timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));
