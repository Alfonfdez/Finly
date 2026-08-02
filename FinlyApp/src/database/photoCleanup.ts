import { getDatabase } from './database';
import { parsePhotos, deletePhotoFile } from '../utils/photoUtils';

export async function deleteTransactionPhotos(whereClause: string, ...params: (string | number)[]): Promise<void> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ photo: string | null }>(
      `SELECT photo FROM transactions WHERE ${whereClause}`,
      ...params
    );
    for (const row of rows) {
      if (row.photo) {
        for (const uri of parsePhotos(row.photo)) {
          await deletePhotoFile(uri);
        }
      }
    }
  } catch {}
}
