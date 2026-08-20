import { getDatabase } from './database';
import { parsePhotos, deletePhotoFile } from '../utils/photoUtils';

async function cleanupPhotos(rows: { photo: string | null }[]): Promise<void> {
  for (const row of rows) {
    if (row.photo) {
      for (const uri of parsePhotos(row.photo)) {
        await deletePhotoFile(uri);
      }
    }
  }
}

export async function deleteTransactionPhotos(column: string, ...values: (string | number)[]): Promise<void> {
  if (values.length === 0) return;
  try {
    const db = await getDatabase();
    const placeholders = values.map(() => '?').join(',');
    const rows = await db.getAllAsync<{ photo: string | null }>(
      `SELECT photo FROM transactions WHERE ${column} IN (${placeholders})`,
      ...values
    );
    await cleanupPhotos(rows);
  } catch (error) {
    console.error('Failed to delete transaction photos:', error);
  }
}

export async function deleteAllTransactionPhotos(): Promise<void> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ photo: string | null }>(
      'SELECT photo FROM transactions WHERE photo IS NOT NULL'
    );
    await cleanupPhotos(rows);
  } catch (error) {
    console.error('Failed to delete transaction photos:', error);
  }
}
