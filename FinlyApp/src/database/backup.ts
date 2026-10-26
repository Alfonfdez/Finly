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
import { REPEAT_MAX_INTERVAL, TRANSACTION_TYPES, USER_ID } from '../constants/types';

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

/** Why a backup file was rejected; `newer_version` is also branched on by the UI. */
export const BACKUP_VALIDATION_CODES = {
  invalidJson: 'invalid_json',
  invalidFormat: 'invalid_format',
  newerVersion: 'newer_version',
  /** Valid JSON/schema, but missing data the app needs to work (e.g. no user). */
  incomplete: 'incomplete',
} as const;

export type BackupValidationCode = (typeof BACKUP_VALIDATION_CODES)[keyof typeof BACKUP_VALIDATION_CODES];

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
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.invalidJson, 'Not valid JSON');
  }
  const result = snapshotSchema.safeParse(raw);
  if (!result.success) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, 'Snapshot does not match the backup format');
  }
  return normalizeSnapshotDates(result.data);
}

export function serializeBackup(snapshot: BackupSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Whether a parsed snapshot can replace the app's data without leaving it
 * unusable. A genuine export always satisfies this: the app requires one user
 * (accounts and categories reference it), at least one account, and one category
 * of each type (the UI never allows deleting the last one of a type).
 *
 * Call it before {@link applyBackup}: a rejected file then leaves the current
 * data untouched.
 */
function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

const TRANSACTION_DATE_RE = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;

function isValidTransactionDate(value: string): boolean {
  if (!TRANSACTION_DATE_RE.test(value)) return false;
  return isValidDateOnly(value.slice(0, 10));
}

/** Legacy backups may store the date without a time; the app compares full timestamps. */
function normalizeTransactionDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value} 00:00:00` : value;
}

function normalizeSnapshotDates(snapshot: BackupSnapshot): BackupSnapshot {
  return {
    ...snapshot,
    data: {
      ...snapshot.data,
      transactions: snapshot.data.transactions.map(transaction => ({
        ...transaction,
        date: normalizeTransactionDate(transaction.date),
      })),
    },
  };
}

function assertImportableRecurringRules(rules: RecurringRule[], accountById: Map<number, Account>): void {
  const invalid = (reason: string) => new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, reason);
  for (const rule of rules) {
    if (!Number.isInteger(rule.interval) || rule.interval < 1 || rule.interval > REPEAT_MAX_INTERVAL) {
      throw invalid('Recurring rule interval is out of range');
    }
    const account = accountById.get(rule.account_id);
    if (!account) throw invalid('Recurring rule account is missing');
    if (account.is_total === 1) throw invalid('Recurring rule uses the Total account');
    if (rule.weekday != null && (!Number.isInteger(rule.weekday) || rule.weekday < 0 || rule.weekday > 6)) {
      throw invalid('Recurring rule weekday is out of range');
    }
    if (rule.day_of_month != null && (!Number.isInteger(rule.day_of_month) || rule.day_of_month < 1 || rule.day_of_month > 31)) {
      throw invalid('Recurring rule day is out of range');
    }
    if (rule.month != null && (!Number.isInteger(rule.month) || rule.month < 1 || rule.month > 12)) {
      throw invalid('Recurring rule month is out of range');
    }
    if (rule.active !== 0 && rule.active !== 1) throw invalid('Recurring rule active flag is invalid');
    const dates = [rule.start_date, rule.next_due, rule.end_date, rule.skipped_from];
    if (dates.some(date => date != null && !isValidDateOnly(date))) {
      throw invalid('Recurring rule has an invalid date');
    }
    if (rule.next_due < rule.start_date) throw invalid('Recurring rule next due is before its start');
    if (rule.end_date != null && rule.start_date > rule.end_date) {
      throw invalid('Recurring rule ends before it starts');
    }
  }
}

export function assertImportableBackup(snapshot: BackupSnapshot): void {
  const {
    users, accounts, categories, transactions, tags, transaction_tags: transactionTags,
    recurring_rules: recurringRules, recurring_rule_tags: recurringRuleTags,
  } = snapshot.data;
  const invalid = (reason: string) => new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, reason);
  const hasAppUser = users.length === 1 && users[0].id === USER_ID;
  const userScopedRows = [...accounts, ...categories, ...tags, ...recurringRules];
  const hasWrongUser = userScopedRows.some(row => row.user_id !== USER_ID);
  const hasExpense = categories.some(category => category.type === TRANSACTION_TYPES.expense);
  const hasIncome = categories.some(category => category.type === TRANSACTION_TYPES.income);
  const hasRealAccount = accounts.some(account => (account.is_total ?? 0) === 0);
  // Every repository query is scoped to USER_ID: a snapshot without that user would
  // import "successfully" and then show an empty app (and self-heal cannot add it).
  if (!hasAppUser || hasWrongUser || !hasRealAccount || !hasExpense || !hasIncome) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.incomplete, 'Snapshot is missing required data');
  }

  const accountById = new Map(accounts.map(account => [account.id, account]));
  const categoryById = new Map(categories.map(category => [category.id, category]));
  const tagById = new Map(tags.map(tag => [tag.id, tag]));
  const transactionById = new Map(transactions.map(transaction => [transaction.id, transaction]));
  const ruleById = new Map(recurringRules.map(rule => [rule.id, rule]));

  for (const transaction of transactions) {
    if (!isValidTransactionDate(transaction.date)) throw invalid('Transaction has an invalid date');
    const account = accountById.get(transaction.account_id);
    if (!account) throw invalid('Transaction account is missing');
    if (account.is_total === 1) throw invalid('Transaction uses the Total account');
    const category = categoryById.get(transaction.category_id);
    if (!category || category.type !== transaction.type) throw invalid('Transaction category type mismatch');
    if (transaction.recurring_rule_id != null) {
      if (!ruleById.has(transaction.recurring_rule_id)) throw invalid('Transaction recurring rule is missing');
      if (transaction.recurrence_date == null || !isValidDateOnly(transaction.recurrence_date)) {
        throw invalid('Generated transaction has an invalid recurrence date');
      }
    } else if (transaction.recurrence_date != null && !isValidDateOnly(transaction.recurrence_date)) {
      throw invalid('Transaction has an invalid recurrence date');
    }
  }

  for (const rule of recurringRules) {
    const category = categoryById.get(rule.category_id);
    if (!category || category.type !== rule.type) throw invalid('Recurring rule category type mismatch');
  }
  assertImportableRecurringRules(recurringRules, accountById);

  for (const link of transactionTags) {
    if (!transactionById.has(link.transaction_id) || !tagById.has(link.tag_id)) {
      throw invalid('Transaction tag link references missing data');
    }
  }
  for (const link of recurringRuleTags) {
    if (!ruleById.has(link.rule_id) || !tagById.has(link.tag_id)) {
      throw invalid('Recurring rule tag link references missing data');
    }
  }
}

export async function buildBackup(
  db: DatabaseHandle,
  schemaVersion: number,
): Promise<BackupSnapshot> {
  // One read transaction keeps the nine tables consistent when a catch-up, import
  // or rule edit commits between the queries.
  let snapshot: BackupSnapshot | null = null;
  await db.withTransactionAsync(async () => {
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

    snapshot = {
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
  });
  if (snapshot == null) throw new Error('Backup snapshot was not built');
  return snapshot;
}

export async function applyBackup(db: DatabaseHandle, snapshot: BackupSnapshot): Promise<void> {
  // Defence in depth: callers normally validate before this point, but a direct call
  // must never wipe the current data with an unusable snapshot.
  assertImportableBackup(snapshot);
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
        user.created_at,
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
        account.created_at,
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
        category.created_at,
      );
    }

    for (const tag of snapshot.data.tags) {
      await db.runAsync(
        'INSERT INTO tags (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
        tag.id,
        tag.user_id,
        tag.name,
        tag.created_at,
      );
    }

    for (const rule of snapshot.data.recurring_rules) {
      await db.runAsync(
        'INSERT INTO recurring_rules (id, user_id, name, type, account_id, category_id, amount, description, frequency, interval, weekday, day_of_month, month, start_date, end_date, next_due, skipped_from, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        rule.skipped_from,
        rule.active,
        rule.created_at,
        rule.updated_at,
      );
    }

    for (const link of snapshot.data.recurring_rule_tags) {
      await db.runAsync(
        'INSERT INTO recurring_rule_tags (rule_id, tag_id) VALUES (?, ?)',
        link.rule_id,
        link.tag_id,
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
        normalizeTransactionDate(transaction.date),
        transaction.updated_at,
        transaction.created_at,
        transaction.recurring_rule_id ?? null,
        transaction.recurrence_date ?? null,
      );
    }

    for (const link of snapshot.data.transaction_tags) {
      await db.runAsync(
        'INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)',
        link.transaction_id,
        link.tag_id,
      );
    }

    for (const row of snapshot.data.config) {
      await db.runAsync('INSERT INTO config (key, value) VALUES (?, ?)', row.key, row.value);
    }

    await sanitizeDefaultAccountConfig(db);
  });
}
