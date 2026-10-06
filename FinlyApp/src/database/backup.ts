import { z } from 'zod';

import {
  accountSchema,
  categorySchema,
  recurringRuleSchema,
  recurringRuleTagSchema,
  tagSchema,
  transactionSchema,
  transactionTagSchema,
  userSchema,
} from './schemas';
import type {
  Account,
  Category,
  DatabaseHandle,
  RecurringRule,
  RecurringRuleTag,
  Tag,
  Transaction,
  TransactionTag,
  User,
} from './types';
import { sanitizeDefaultAccountConfig } from './configDefaults';

interface ConfigRow {
  key: string;
  value: string;
}

export const BACKUP_FORMAT_VERSION = 1;

const configRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const snapshotSchema = z.object({
  app: z.literal('Finly'),
  kind: z.literal('backup'),
  formatVersion: z.literal(BACKUP_FORMAT_VERSION),
  exportedAt: z.string(),
  schema: z.number().int(),
  data: z.object({
    users: z.array(userSchema),
    accounts: z.array(accountSchema),
    categories: z.array(categorySchema),
    transactions: z.array(transactionSchema),
    tags: z.array(tagSchema),
    transaction_tags: z.array(transactionTagSchema),
    // Added in schema 4; optional + default keeps pre-028 backups importable.
    recurring_rules: z.array(recurringRuleSchema).optional().default([]),
    recurring_rule_tags: z.array(recurringRuleTagSchema).optional().default([]),
    config: z.array(configRowSchema),
  }),
});

type BackupSnapshot = z.infer<typeof snapshotSchema>;

export type BackupValidationCode = 'invalid_json' | 'invalid_format' | 'newer_version';

export class BackupValidationError extends Error {
  readonly code: BackupValidationCode;

  constructor(code: BackupValidationCode, message: string) {
    super(message);
    this.name = 'BackupValidationError';
    this.code = code;
  }
}

export function parseBackup(json: string): BackupSnapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new BackupValidationError('invalid_json', 'Not valid JSON');
  }
  const result = snapshotSchema.safeParse(raw);
  if (!result.success) {
    throw new BackupValidationError('invalid_format', 'Snapshot does not match the backup format');
  }
  return result.data;
}

export function serializeBackup(snapshot: BackupSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export async function buildBackup(
  db: DatabaseHandle,
  schemaVersion: number
): Promise<BackupSnapshot> {
  const [users, accounts, categories, transactions, tags, transactionTags, recurringRules, recurringRuleTags, config] =
    await Promise.all([
      db.getAllAsync<User>('SELECT * FROM users'),
      db.getAllAsync<Account>('SELECT * FROM accounts'),
      db.getAllAsync<Category>('SELECT * FROM categories'),
      db.getAllAsync<Transaction>('SELECT * FROM transactions'),
      db.getAllAsync<Tag>('SELECT * FROM tags'),
      db.getAllAsync<TransactionTag>('SELECT * FROM transaction_tags'),
      db.getAllAsync<RecurringRule>('SELECT * FROM recurring_rules'),
      db.getAllAsync<RecurringRuleTag>('SELECT * FROM recurring_rule_tags'),
      db.getAllAsync<ConfigRow>('SELECT key, value FROM config'),
    ]);

  return {
    app: 'Finly',
    kind: 'backup',
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    schema: schemaVersion,
    data: {
      users,
      accounts,
      categories,
      transactions,
      tags,
      transaction_tags: transactionTags,
      recurring_rules: recurringRules,
      recurring_rule_tags: recurringRuleTags,
      config,
    },
  };
}

export async function applyBackup(db: DatabaseHandle, snapshot: BackupSnapshot): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM transaction_tags');
    await db.runAsync('DELETE FROM recurring_rule_tags');
    await db.runAsync('DELETE FROM recurring_rules');
    await db.runAsync('DELETE FROM tags');
    await db.runAsync('DELETE FROM categories');
    await db.runAsync('DELETE FROM accounts');
    await db.runAsync('DELETE FROM config');
    await db.runAsync('DELETE FROM users');

    for (const user of snapshot.data.users) {
      await db.runAsync(
        'INSERT INTO users (id, name, email, avatar, currency, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        user.id,
        user.name,
        user.email,
        user.avatar,
        user.currency,
        user.created_at
      );
    }

    for (const account of snapshot.data.accounts) {
      await db.runAsync(
        'INSERT INTO accounts (id, user_id, name, initial_balance, icon, color, description, is_total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        account.id,
        account.user_id,
        account.name,
        account.initial_balance,
        account.icon,
        account.color,
        account.description ?? '',
        account.is_total ?? 0,
        account.created_at
      );
    }

    for (const category of snapshot.data.categories) {
      await db.runAsync(
        'INSERT INTO categories (id, user_id, name, icon, color, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        category.id,
        category.user_id,
        category.name,
        category.icon,
        category.color,
        category.type,
        category.created_at
      );
    }

    for (const tag of snapshot.data.tags) {
      await db.runAsync(
        'INSERT INTO tags (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
        tag.id,
        tag.user_id,
        tag.name,
        tag.created_at
      );
    }

    for (const rule of snapshot.data.recurring_rules) {
      await db.runAsync(
        'INSERT INTO recurring_rules (id, user_id, name, type, account_id, category_id, amount, description, frequency, interval, weekday, day_of_month, month, start_date, end_date, next_due, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        rule.id,
        rule.user_id,
        rule.name,
        rule.type,
        rule.account_id,
        rule.category_id,
        rule.amount,
        rule.description,
        rule.frequency,
        rule.interval,
        rule.weekday,
        rule.day_of_month,
        rule.month,
        rule.start_date,
        rule.end_date,
        rule.next_due,
        rule.active,
        rule.created_at,
        rule.updated_at
      );
    }

    for (const link of snapshot.data.recurring_rule_tags) {
      await db.runAsync(
        'INSERT INTO recurring_rule_tags (rule_id, tag_id) VALUES (?, ?)',
        link.rule_id,
        link.tag_id
      );
    }

    for (const transaction of snapshot.data.transactions) {
      await db.runAsync(
        'INSERT INTO transactions (id, account_id, category_id, type, amount, description, photo, date, updated_at, created_at, recurring_rule_id, recurrence_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        transaction.id,
        transaction.account_id,
        transaction.category_id,
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.photo,
        transaction.date,
        transaction.updated_at,
        transaction.created_at,
        transaction.recurring_rule_id ?? null,
        transaction.recurrence_date ?? null
      );
    }

    for (const link of snapshot.data.transaction_tags) {
      await db.runAsync(
        'INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)',
        link.transaction_id,
        link.tag_id
      );
    }

    for (const row of snapshot.data.config) {
      await db.runAsync('INSERT INTO config (key, value) VALUES (?, ?)', row.key, row.value);
    }

    await sanitizeDefaultAccountConfig(db);
  });
}
