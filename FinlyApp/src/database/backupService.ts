import {
  applyBackup,
  assertImportableBackup,
  buildBackup,
  parseBackup,
  serializeBackup,
  BackupValidationError,
  BACKUP_VALIDATION_CODES,
} from './backup';
import { initDatabase, SCHEMA_VERSION } from './database';
import { collectAllTransactionPhotos, deletePhotoUris } from './photoCleanup';
import { parsePhotos } from '../utils/photoData';

export { BackupValidationError, BACKUP_VALIDATION_CODES };

export async function exportBackup(): Promise<string> {
  const db = await initDatabase();
  const snapshot = await buildBackup(db, SCHEMA_VERSION);
  return serializeBackup(snapshot);
}

export async function importBackup(json: string): Promise<void> {
  const snapshot = parseBackup(json);
  if (snapshot.schema > SCHEMA_VERSION) {
    throw new BackupValidationError(BACKUP_VALIDATION_CODES.newerVersion, 'Backup comes from a newer app version');
  }
  // Reject unusable snapshots before touching the DB (the current data is kept).
  assertImportableBackup(snapshot);
  const db = await initDatabase();
  const oldPhotos = await collectAllTransactionPhotos();
  await applyBackup(db, snapshot);
  const importedPhotos = new Set(
    snapshot.data.transactions.flatMap(transaction => parsePhotos(transaction.photo)),
  );
  await deletePhotoUris(oldPhotos.filter(uri => !importedPhotos.has(uri)));
}
