import { sql } from 'drizzle-orm';
import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  avatar: text('avatar'),
  currency: text('currency').notNull().default('€'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull(),
  name: text('name').notNull(),
  initial_balance: real('initial_balance').notNull().default(0),
  icon: text('icon').notNull().default('wallet'),
  color: text('color').notNull().default('#22D3EE'),
  description: text('description').default(''),
  is_total: integer('is_total').notNull().default(0),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('tag'),
  color: text('color').notNull().default('#A78BFA'),
  type: text('type').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  account_id: integer('account_id').notNull(),
  category_id: integer('category_id').notNull(),
  type: text('type').notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  photo: text('photo'),
  date: text('date').notNull(),
  updated_at: text('updated_at'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull(),
  name: text('name').notNull(),
  created_at: text('created_at').default(sql`(datetime('now','localtime'))`),
});

export const transactionTags = sqliteTable(
  'transaction_tags',
  {
    transaction_id: integer('transaction_id').notNull(),
    tag_id: integer('tag_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.transaction_id, table.tag_id] })]
);

export const config = sqliteTable('config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
