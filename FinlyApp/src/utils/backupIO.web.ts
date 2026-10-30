import { ShareResult, type ShareResultValue } from '../constants/shareResult';
import { BACKUP_ERRORS, BACKUP_MIME_TYPE } from '../constants/backup';
import { MAX_BACKUP_BYTES } from '../constants/types';
import { BackupValidationError, BACKUP_VALIDATION_CODES } from './backupValidation';
import { backupFileName } from './formatters';

/** Wait after the file dialog regains focus before treating it as cancelled. */
const PICK_FALLBACK_DELAY_MS = 400;
const PICK_TIMEOUT_MS = 30_000;

export async function saveBackupToDownloads(json: string): Promise<boolean> {
  await saveBackupFile(json);
  return true;
}

export async function saveBackupFile(json: string): Promise<ShareResultValue> {
  if (typeof document === 'undefined') return ShareResult.SAVED;
  const blob = new Blob([json], { type: BACKUP_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = backupFileName();
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Let the browser start the download before releasing the blob URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return ShareResult.SAVED;
}

export async function pickBackupFile(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = BACKUP_MIME_TYPE;
    input.style.display = 'none';

    let settled = false;
    let focusTimer: number | undefined;
    const overallTimer = window.setTimeout(() => finish(null), PICK_TIMEOUT_MS);
    const cleanup = () => {
      window.clearTimeout(overallTimer);
      if (focusTimer !== undefined) window.clearTimeout(focusTimer);
      input.remove();
      window.removeEventListener('focus', onFocus);
    };
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const onFocus = () => {
      if (focusTimer !== undefined) window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => finish(null), PICK_FALLBACK_DELAY_MS);
    };

    input.oncancel = () => finish(null);
    input.onchange = () => {
      // The dialog returned focus before the change event in some browsers; a
      // pending fallback must not beat the actual file read.
      if (focusTimer !== undefined) {
        window.clearTimeout(focusTimer);
        focusTimer = undefined;
      }
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      if (file.size > MAX_BACKUP_BYTES) {
        fail(new BackupValidationError(BACKUP_VALIDATION_CODES.invalidFormat, BACKUP_ERRORS.fileTooLarge));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => finish(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => fail(reader.error ?? new Error('Failed to read backup file'));
      reader.readAsText(file);
    };

    window.addEventListener('focus', onFocus, { once: true });
    document.body.appendChild(input);
    input.click();
  });
}
