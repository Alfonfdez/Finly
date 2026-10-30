import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { shareFileAsync, saveToDownloadsAsync } from '../../modules/finly-share/src/index';
import { ShareResult, type ShareResultValue } from '../constants/shareResult';
import { BACKUP_ERRORS, BACKUP_MIME_TYPE } from '../constants/backup';
import { MAX_BACKUP_BYTES } from '../constants/types';
import { BackupValidationError, BACKUP_VALIDATION_CODES } from './backupValidation';
import { isAndroid } from './platform';
import { backupFileName } from './formatters';
import { t } from '../i18n';

export async function saveBackupFile(json: string): Promise<ShareResultValue> {
  const file = new File(Paths.document, backupFileName());
  await file.write(json);
  if (!(await Sharing.isAvailableAsync())) {
    return ShareResult.SAVED;
  }
  return shareFileAsync(file.uri, BACKUP_MIME_TYPE, t().backup_dialog_title);
}

export async function saveBackupToDownloads(json: string): Promise<boolean> {
  if (!isAndroid) {
    return false;
  }
  return saveToDownloadsAsync(backupFileName(), json);
}

export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: BACKUP_MIME_TYPE,
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  const file = new File(asset.uri);
  const size = asset.size ?? file.size;
  if (size > MAX_BACKUP_BYTES) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, BACKUP_ERRORS.fileTooLarge);
  }
  return file.text();
}
