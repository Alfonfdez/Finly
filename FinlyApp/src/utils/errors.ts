import { Alert } from 'react-native';
import { t } from '../i18n';
import { isWeb } from './platform';

/** Show a message. `react-native-web`'s `Alert` is a no-op, so on web we fall back
 *  to the browser dialog — otherwise the feedback is completely invisible. */
function showMessage(title: string, message: string) {
  if (isWeb) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${title}\n\n${message}`);
    }
    return;
  }
  Alert.alert(title, message);
}

/** Show an error to the user (and log it). */
export function alertError(title: string, message: string) {
  console.error(`${title}: ${message}`);
  showMessage(title, message);
}

/** Show an informational/success message to the user (no logging). */
export function alertInfo(title: string, message: string) {
  showMessage(title, message);
}

/** One-shot warning when the web database cannot be written back to IndexedDB. */
export function showWebPersistAlert() {
  const l = t();
  alertError(l.web_save_error_title, l.web_save_error_message);
}

/** Log a failed operation with the shared prefix vocabulary (`ERROR_PREFIXES`). */
export function logError(prefix: string, error: unknown, ...extra: unknown[]): void {
  console.error(`${prefix}:`, error, ...extra);
}

export function showErrorAlert(labels?: { error_title: string; error_generic: string }) {
  const l = labels ?? t();
  alertError(l.error_title, l.error_generic);
}

/** Full technical description of an error for logging: the message plus the
 *  underlying `cause` (e.g. drizzle wraps the real SQLite error in `cause`). */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = (err as { cause?: unknown }).cause;
  const causeMessage = cause instanceof Error ? cause.message : cause != null ? String(cause) : '';
  return causeMessage ? `${err.message} → ${causeMessage}` : err.message;
}

export async function runWithErrorAlert<T>(
  fn: () => Promise<T>,
  prefix: string,
  labels?: { error_title: string; error_generic: string },
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    logError(prefix, err);
    showErrorAlert(labels);
    return undefined;
  }
}

export const ERROR_PREFIXES = {
  accountCreate: 'Failed to create account',
  accountUpdate: 'Failed to update account',
  accountDelete: 'Failed to delete account',
  accountsDelete: 'Failed to delete accounts',
  categoryCreate: 'Failed to create category',
  categoryUpdate: 'Failed to update category',
  categoryDelete: 'Failed to delete category',
  categoriesDelete: 'Failed to delete categories',
  tagCreate: 'Failed to create tag',
  tagUpdate: 'Failed to update tag',
  tagDelete: 'Failed to delete tag',
  tagsDelete: 'Failed to delete tags',
  commentUpdate: 'Failed to update comment',
  commentDelete: 'Failed to delete comment',
  commentsDelete: 'Failed to delete comments',
  transactionsDelete: 'Failed to delete transactions',
  recurringDelete: 'Failed to delete recurring rules',
  recurringUpdate: 'Failed to update recurring rule',
  // Data screen (backup + destructive actions).
  backupShare: 'Failed to share backup',
  backupExport: 'Failed to export backup',
  backupRead: 'Failed to read backup file',
  backupImport: 'Failed to import backup',
  transactionsDeleteAll: 'Failed to delete all transactions',
  dataDeleteAll: 'Failed to delete all data',
  factoryReset: 'Failed to reset to factory state',
  // Loads, refreshes and internal lifecycle logs.
  databaseInit: 'Database initialization failed',
  configLoad: 'Failed to load config',
  configSave: 'Failed to save config',
  initialDataLoad: 'Failed to load initial data',
  dataRefresh: 'Failed to refresh data',
  recurringMaterialize: 'Failed to materialize recurring transactions',
  categoriesRefresh: 'Failed to refresh categories',
  accountsRefresh: 'Failed to refresh accounts',
  tagsRefresh: 'Failed to refresh tags',
  dataReset: 'Failed to reset all data',
  commentsLoad: 'Failed to load comments',
  recurringNamesLoad: 'Failed to load recurring rule names',
  tagBreakdownsLoad: 'Failed to load tag breakdowns',
  duplicateCheck: 'Failed to check name duplicate',
  focusLoad: 'useFocusLoad failed',
  deferredRefresh: 'useDeferredRefresh error',
  transactionSubmit: 'Transaction form submit failed',
  photoCollect: 'Failed to collect transaction photos',
  photoCopy: 'Failed to copy photo',
  photoDelete: 'Failed to delete photo',
  webPersist: 'Failed to persist web database',
  errorBoundary: 'ErrorBoundary caught',
} as const;
