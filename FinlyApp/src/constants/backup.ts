export const BACKUP_APP_NAME = 'Finly';
export const BACKUP_KIND = 'backup';
export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_MIME_TYPE = 'application/json';
export const BACKUP_FILE_PREFIX = 'finly-backup-';
export const BACKUP_FILE_EXTENSION = '.json';
export const TOTAL_ACCOUNT_COUNT = 1;

/** Internal validation reasons; these are diagnostics, not translated UI copy. */
export const BACKUP_VALIDATION_REASONS = {
  duplicateConfigKey: 'Duplicate config key',
  configValueTooLarge: 'Config value is too large',
  unknownConfigKey: 'Unknown config key',
  invalidFirstDayConfig: 'Invalid first-day config value',
  invalidBooleanConfig: 'Invalid boolean config value',
  invalidAccountIdConfig: 'Invalid account-id config value',
  invalidArrayConfig: 'Invalid array config value',
  invalidConfigValue: 'Invalid config value',
  recurringIntervalOutOfRange: 'Recurring rule interval is out of range',
  recurringAccountMissing: 'Recurring rule account is missing',
  recurringUsesTotalAccount: 'Recurring rule uses the Total account',
  recurringWeekdayOutOfRange: 'Recurring rule weekday is out of range',
  recurringDayOutOfRange: 'Recurring rule day is out of range',
  recurringMonthOutOfRange: 'Recurring rule month is out of range',
  recurringActiveInvalid: 'Recurring rule active flag is invalid',
  recurringInvalidDate: 'Recurring rule has an invalid date',
  recurringNextBeforeStart: 'Recurring rule next due is before its start',
  recurringEndBeforeStart: 'Recurring rule ends before it starts',
  recurringNextOffSchedule: 'Recurring rule next due is off schedule',
  recurringSkippedOffSchedule: 'Recurring rule skipped date is off schedule',
  recurringTooManyDue: 'Recurring rule has too many due occurrences',
  backupTooManyRows: 'Backup has too many rows',
  transactionInvalidDate: 'Transaction has an invalid date',
  transactionInvalidPhoto: 'Transaction has an invalid photo',
  transactionAccountMissing: 'Transaction account is missing',
  transactionUsesTotalAccount: 'Transaction uses the Total account',
  transactionCategoryTypeMismatch: 'Transaction category type mismatch',
  transactionRecurringRuleMissing: 'Transaction recurring rule is missing',
  generatedTransactionInvalidRecurrenceDate: 'Generated transaction has an invalid recurrence date',
  transactionInvalidRecurrenceDate: 'Transaction has an invalid recurrence date',
  recurringCategoryTypeMismatch: 'Recurring rule category type mismatch',
  transactionTagLinkMissing: 'Transaction tag link references missing data',
  recurringTagLinkMissing: 'Recurring rule tag link references missing data',
} as const;

export const BACKUP_ERRORS = {
  fileTooLarge: 'Backup file is too large',
  invalidJson: 'Not valid JSON',
  formatMismatch: 'Snapshot does not match the backup format',
  incomplete: 'Snapshot is missing required data',
  newerVersion: 'Backup comes from a newer app version',
  snapshotNotBuilt: 'Backup snapshot was not built',
  refreshFailed: 'Import applied but the app could not refresh',
} as const;
