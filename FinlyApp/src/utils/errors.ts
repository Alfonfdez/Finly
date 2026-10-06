import { Alert } from 'react-native';
import { t } from '../i18n';
import { isWeb } from './platform';

/** Show an error to the user. `react-native-web`'s `Alert` is a no-op, so on web we
 *  fall back to the browser dialog — otherwise failures are completely invisible. */
export function alertError(title: string, message: string) {
  console.error(`${title}: ${message}`);
  if (isWeb) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${title}\n\n${message}`);
    }
    return;
  }
  Alert.alert(title, message);
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
  labels?: { error_title: string; error_generic: string }
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    console.error(`${prefix}:`, err);
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
} as const;
