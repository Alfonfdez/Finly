import {
  applyBackup,
  buildBackup,
  parseBackup,
  serializeBackup,
  BackupValidationError,
  BACKUP_VALIDATION_CODES,
} from './backup';
import { getDatabase, SCHEMA_VERSION } from './database';

export { BackupValidationError, BACKUP_VALIDATION_CODES };

export async function exportBackup(): Promise<string> {
  const db = await getDatabase();
  const snapshot = await buildBackup(db, SCHEMA_VERSION);
  return serializeBackup(snapshot);
}

export async function importBackup(json: string): Promise<void> {
  const snapshot = parseBackup(json);
  if (snapshot.schema > SCHEMA_VERSION) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.newerVersion, 'Backup comes from a newer app version');
  }
  const db = await getDatabase();
  await applyBackup(db, snapshot);
}
