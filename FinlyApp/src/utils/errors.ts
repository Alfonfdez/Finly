import { Alert } from 'react-native';
import { t } from '../i18n';

export function showErrorAlert(labels?: { error_title: string; error_generic: string }) {
  const l = labels ?? t();
  Alert.alert(l.error_title, l.error_generic);
}
