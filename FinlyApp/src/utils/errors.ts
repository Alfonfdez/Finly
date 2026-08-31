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
