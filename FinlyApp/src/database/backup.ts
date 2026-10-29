import { z } from 'zod';

import {
  accountSchema,
  categorySchema,
  configSchema,
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
import { CONFIG_NULL_SENTINEL, parseBooleanConfigValue, sanitizeDefaultAccountConfig } from './configDefaults';
import { CONFIG_CODECS, CONFIG_METADATA, DB_KEY_MAP } from './configMetadata';
import { wipeUserData } from './wipe';
import { parsePhotoFieldStrict } from '../utils/photoData';
import { isImportablePhotoUri } from '../utils/photoUri';
import {
  FIRST_DAYS,
  MAX_BACKUP_BYTES,
  MAX_BACKUP_ROWS,
  MAX_CONFIG_VALUE_LENGTH,
  MAX_PHOTOS,
  MAX_PHOTO_URI_LENGTH,
  REPEAT_MAX_INTERVAL,
  RULE_ACTIVE,
  RULE_INACTIVE,
  TRANSACTION_TYPES,
  USER_ID,
  isTotalAccount,
} from '../constants/types';
import {
  BACKUP_APP_NAME,
  BACKUP_ERRORS,
  BACKUP_FORMAT_VERSION,
  BACKUP_KIND,
  BACKUP_VALIDATION_REASONS,
  TOTAL_ACCOUNT_COUNT,
} from '../constants/backup';
import {
  MAX_CATCH_UP_OCCURRENCES,
  buildRecurrenceSchedule,
  fromDateOnly,
  isLastDayAnchor,
  listDueOccurrences,
  nextDueOnOrAfter,
  todayDateOnly,
} from '../utils/recurrence';
import { BACKUP_VALIDATION_CODES, BackupValidationError } from '../utils/backupValidation';

interface ConfigRow {
  key: string;
  value: string;
}

export { BACKUP_FORMAT_VERSION } from '../constants/backup';

const configRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const snapshotSchema = z.object({
  app: z.literal(BACKUP_APP_NAME),
  kind: z.literal(BACKUP_KIND),
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

export { BACKUP_VALIDATION_CODES, BackupValidationError, type BackupValidationCode } from '../utils/backupValidation';

export function parseBackup(json: string): BackupSnapshot {
  if (json.length > MAX_BACKUP_BYTES) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, BACKUP_ERRORS.fileTooLarge);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.invalidJson, BACKUP_ERRORS.invalidJson);
  }
  const result = snapshotSchema.safeParse(raw);
  if (!result.success) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, BACKUP_ERRORS.formatMismatch);
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

const TRANSACTION_DATE_RE = /^(\d{4}-\d{2}-\d{2})(?: (\d{2}):(\d{2}):(\d{2}))?$/;

function isValidTransactionDate(value: string): boolean {
  const match = TRANSACTION_DATE_RE.exec(value);
  if (!match || !isValidDateOnly(match[1])) return false;
  if (match[2] == null) return true;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  const seconds = Number(match[4]);
  return hours <= 23 && minutes <= 59 && seconds <= 59;
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

function assertUnique<T>(values: T[], reason: string): void {
  const seen = new Set<T>();
  for (const value of values) {
    if (seen.has(value)) throw new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, reason);
    seen.add(value);
  }
}

function assertImportableConfig(rows: ConfigRow[]): void {
  const invalid = (reason: string) => new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, reason);
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.key)) throw invalid(BACKUP_VALIDATION_REASONS.duplicateConfigKey);
    seen.add(row.key);
    if (row.value.length > MAX_CONFIG_VALUE_LENGTH) throw invalid(BACKUP_VALIDATION_REASONS.configValueTooLarge);

    const key = DB_KEY_MAP[row.key];
    if (!key) throw invalid(BACKUP_VALIDATION_REASONS.unknownConfigKey);
    const meta = CONFIG_METADATA[key];
    switch (meta.codec) {
      case CONFIG_CODECS.firstDay:
        if (row.value !== String(FIRST_DAYS.sunday) && row.value !== String(FIRST_DAYS.monday)) {
          throw invalid(BACKUP_VALIDATION_REASONS.invalidFirstDayConfig);
        }
        break;
      case CONFIG_CODECS.boolean:
        if (parseBooleanConfigValue(row.value) === null) throw invalid(BACKUP_VALIDATION_REASONS.invalidBooleanConfig);
        break;
      case CONFIG_CODECS.intOrNull: {
        if (row.value === CONFIG_NULL_SENTINEL) break;
        const value = Number(row.value);
        if (!/^\d+$/.test(row.value) || !Number.isSafeInteger(value) || value <= 0) {
          throw invalid(BACKUP_VALIDATION_REASONS.invalidAccountIdConfig);
        }
        break;
      }
      case CONFIG_CODECS.array: {
        let parsed: unknown;
        try {
          parsed = JSON.parse(row.value);
        } catch {
          throw invalid(BACKUP_VALIDATION_REASONS.invalidArrayConfig);
        }
        if (!configSchema.shape[key].safeParse(parsed).success) throw invalid(BACKUP_VALIDATION_REASONS.invalidArrayConfig);
        break;
      }
      default:
        if (!configSchema.shape[key].safeParse(row.value).success) throw invalid(BACKUP_VALIDATION_REASONS.invalidConfigValue);
    }
  }
}

function assertImportableRecurringRules(rules: RecurringRule[], accountById: Map<number, Account>): void {
  const invalid = (reason: string) => new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, reason);
  for (const rule of rules) {
    if (!Number.isInteger(rule.interval) || rule.interval < 1 || rule.interval > REPEAT_MAX_INTERVAL) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringIntervalOutOfRange);
    }
    const account = accountById.get(rule.account_id);
    if (!account) throw invalid(BACKUP_VALIDATION_REASONS.recurringAccountMissing);
    if (isTotalAccount(account)) throw invalid(BACKUP_VALIDATION_REASONS.recurringUsesTotalAccount);
    if (rule.weekday != null && (!Number.isInteger(rule.weekday) || rule.weekday < 0 || rule.weekday > 6)) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringWeekdayOutOfRange);
    }
    if (rule.day_of_month != null && (!Number.isInteger(rule.day_of_month) || rule.day_of_month < 1 || rule.day_of_month > 31)) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringDayOutOfRange);
    }
    if (rule.month != null && (!Number.isInteger(rule.month) || rule.month < 1 || rule.month > 12)) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringMonthOutOfRange);
    }
    if (rule.active !== RULE_INACTIVE && rule.active !== RULE_ACTIVE) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringActiveInvalid);
    }
    const dates = [rule.start_date, rule.next_due, rule.end_date, rule.skipped_from];
    if (dates.some(date => date != null && !isValidDateOnly(date))) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringInvalidDate);
    }
    if (rule.next_due < rule.start_date) throw invalid(BACKUP_VALIDATION_REASONS.recurringNextBeforeStart);
    if (rule.end_date != null && rule.start_date > rule.end_date) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringEndBeforeStart);
    }

    const schedule = buildRecurrenceSchedule(
      fromDateOnly(rule.start_date),
      rule.frequency,
      rule.interval,
      rule.end_date,
      isLastDayAnchor(rule.day_of_month),
    );
    const cursorOnSchedule = nextDueOnOrAfter(schedule, rule.next_due) === rule.next_due;
    const endedCursor = rule.end_date != null && rule.next_due > rule.end_date;
    if (!cursorOnSchedule && !endedCursor) throw invalid(BACKUP_VALIDATION_REASONS.recurringNextOffSchedule);
    if (rule.skipped_from != null && nextDueOnOrAfter(schedule, rule.skipped_from) !== rule.skipped_from) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringSkippedOffSchedule);
    }
    if (rule.active === RULE_ACTIVE && rule.next_due <= todayDateOnly()) {
      const { truncated } = listDueOccurrences(
        rule,
        rule.next_due,
        todayDateOnly(),
        MAX_CATCH_UP_OCCURRENCES,
      );
      if (truncated) throw invalid(BACKUP_VALIDATION_REASONS.recurringTooManyDue);
    }
  }
}

export function assertImportableBackup(snapshot: BackupSnapshot): void {
  const {
    users, accounts, categories, transactions, tags, transaction_tags: transactionTags,
    recurring_rules: recurringRules, recurring_rule_tags: recurringRuleTags,
  } = snapshot.data;
  const invalid = (reason: string) => new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, reason);
  const totalRows = Object.values(snapshot.data).reduce((sum, rows) => sum + rows.length, 0);
  if (totalRows > MAX_BACKUP_ROWS) throw invalid(BACKUP_VALIDATION_REASONS.backupTooManyRows);

  const hasAppUser = users.length === 1 && users[0].id === USER_ID;
  const userScopedRows = [...accounts, ...categories, ...tags, ...recurringRules];
  const hasWrongUser = userScopedRows.some(row => row.user_id !== USER_ID);
  const hasExpense = categories.some(category => category.type === TRANSACTION_TYPES.expense);
  const hasIncome = categories.some(category => category.type === TRANSACTION_TYPES.income);
  const hasRealAccount = accounts.some(account => !isTotalAccount(account));
  const totalAccounts = accounts.filter(isTotalAccount).length;
  // Every repository query is scoped to USER_ID: a snapshot without that user would
  // import "successfully" and then show an empty app (and self-heal cannot add it).
  if (
    !hasAppUser
    || hasWrongUser
    || !hasRealAccount
    || !hasExpense
    || !hasIncome
    || totalAccounts !== TOTAL_ACCOUNT_COUNT
  ) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.incomplete, BACKUP_ERRORS.incomplete);
  }

  assertUnique(users.map(user => user.id), 'Duplicate user id');
  assertUnique(accounts.map(account => account.id), 'Duplicate account id');
  assertUnique(categories.map(category => category.id), 'Duplicate category id');
  assertUnique(transactions.map(transaction => transaction.id), 'Duplicate transaction id');
  assertUnique(tags.map(tag => tag.id), 'Duplicate tag id');
  assertUnique(recurringRules.map(rule => rule.id), 'Duplicate recurring rule id');
  assertUnique(transactionTags.map(link => `${link.transaction_id}:${link.tag_id}`), 'Duplicate transaction tag link');
  assertUnique(recurringRuleTags.map(link => `${link.rule_id}:${link.tag_id}`), 'Duplicate recurring rule tag link');
  assertImportableConfig(snapshot.data.config);

  const accountById = new Map(accounts.map(account => [account.id, account]));
  const categoryById = new Map(categories.map(category => [category.id, category]));
  const tagById = new Map(tags.map(tag => [tag.id, tag]));
  const transactionById = new Map(transactions.map(transaction => [transaction.id, transaction]));
  const ruleById = new Map(recurringRules.map(rule => [rule.id, rule]));

  for (const transaction of transactions) {
    if (!isValidTransactionDate(transaction.date)) throw invalid(BACKUP_VALIDATION_REASONS.transactionInvalidDate);
    const photos = parsePhotoFieldStrict(transaction.photo);
    if (
      photos === null
      || photos.length > MAX_PHOTOS
      || photos.some(photo => photo.length > MAX_PHOTO_URI_LENGTH || !isImportablePhotoUri(photo))
    ) {
      throw invalid(BACKUP_VALIDATION_REASONS.transactionInvalidPhoto);
    }
    const account = accountById.get(transaction.account_id);
    if (!account) throw invalid(BACKUP_VALIDATION_REASONS.transactionAccountMissing);
    if (isTotalAccount(account)) throw invalid(BACKUP_VALIDATION_REASONS.transactionUsesTotalAccount);
    const category = categoryById.get(transaction.category_id);
    if (!category || category.type !== transaction.type) throw invalid(BACKUP_VALIDATION_REASONS.transactionCategoryTypeMismatch);
    if (transaction.recurring_rule_id != null) {
      if (!ruleById.has(transaction.recurring_rule_id)) throw invalid(BACKUP_VALIDATION_REASONS.transactionRecurringRuleMissing);
      if (transaction.recurrence_date == null || !isValidDateOnly(transaction.recurrence_date)) {
        throw invalid(BACKUP_VALIDATION_REASONS.generatedTransactionInvalidRecurrenceDate);
      }
    } else if (transaction.recurrence_date != null && !isValidDateOnly(transaction.recurrence_date)) {
      throw invalid(BACKUP_VALIDATION_REASONS.transactionInvalidRecurrenceDate);
    }
  }

  for (const rule of recurringRules) {
    const category = categoryById.get(rule.category_id);
    if (!category || category.type !== rule.type) throw invalid(BACKUP_VALIDATION_REASONS.recurringCategoryTypeMismatch);
  }
  assertImportableRecurringRules(recurringRules, accountById);

  for (const link of transactionTags) {
    if (!transactionById.has(link.transaction_id) || !tagById.has(link.tag_id)) {
      throw invalid(BACKUP_VALIDATION_REASONS.transactionTagLinkMissing);
    }
  }
  for (const link of recurringRuleTags) {
    if (!ruleById.has(link.rule_id) || !tagById.has(link.tag_id)) {
      throw invalid(BACKUP_VALIDATION_REASONS.recurringTagLinkMissing);
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
      app: BACKUP_APP_NAME,
      kind: BACKUP_KIND,
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
  if (snapshot == null) throw new Error(BACKUP_ERRORS.snapshotNotBuilt);
  return snapshot;
}

export async function applyBackup(db: DatabaseHandle, snapshot: BackupSnapshot): Promise<void> {
  // Defence in depth: callers normally validate before this point, but a direct call
  // must never wipe the current data with an unusable snapshot.
  assertImportableBackup(snapshot);
  await db.withTransactionAsync(async () => {
    await wipeUserData(db, { keepConfig: false, keepUsers: false });

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
