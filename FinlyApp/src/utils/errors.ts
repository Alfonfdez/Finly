import { Alert } from 'react-native';
import { t } from '../i18n';

export function showErrorAlert(labels?: { error_title: string; error_generic: string }) {
  const l = labels ?? t();
  Alert.alert(l.error_title, l.error_generic);
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
