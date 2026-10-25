import { clearDataKeepSettings, resetDatabase } from './database';
import { collectAllTransactionPhotos, deletePhotoUris } from './photoCleanup';

/**
 * Destructive data actions delete transaction rows directly, so the photo files
 * must be collected before the wipe and removed only after it commits.
 */
export async function resetDatabaseWithCleanup(): Promise<void> {
  const photos = await collectAllTransactionPhotos();
  await resetDatabase();
  await deletePhotoUris(photos);
}

export async function clearDataKeepSettingsWithCleanup(): Promise<void> {
  const photos = await collectAllTransactionPhotos();
  await clearDataKeepSettings();
  await deletePhotoUris(photos);
}
