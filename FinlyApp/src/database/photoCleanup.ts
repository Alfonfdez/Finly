import { sql, type Column } from 'drizzle-orm';
import { getDrizzle } from './drizzle/engine';
import { transactions } from './drizzle/schema';
import { parsePhotos } from '../utils/photoData';
import { ERROR_PREFIXES, logError } from '../utils/errors';

const COLUMN_MAP: Record<string, Column> = {
  id: transactions.id,
  account_id: transactions.account_id,
  category_id: transactions.category_id,
};

function photoUrisOf(rows: { photo: string | null }[]): string[] {
  const uris: string[] = [];
  for (const row of rows) {
    if (row.photo) {
      uris.push(...parsePhotos(row.photo));
    }
  }
  return uris;
}

async function selectPhotoRows(column: string, values: (string | number)[]): Promise<string[]> {
  const db = await getDrizzle();
  const col = COLUMN_MAP[column];
  if (!col) throw new Error(`Unknown column: ${column}`);
  const rows = await db
    .select({ photo: transactions.photo })
    .from(transactions)
    .where(sql`${col} IN (${sql.join(values.map(v => sql`${v}`), sql`, `)})`)
    .all();
  return photoUrisOf(rows);
}

export async function collectTransactionPhotos(column: string, ...values: (string | number)[]): Promise<string[]> {
  if (values.length === 0) return [];
  try {
    return await selectPhotoRows(column, values);
  } catch (error) {
    logError(ERROR_PREFIXES.photoCollect, error);
    return [];
  }
}

export async function collectAllTransactionPhotosStrict(): Promise<string[]> {
  const db = await getDrizzle();
  const rows = await db
    .select({ photo: transactions.photo })
    .from(transactions)
    .where(sql`${transactions.photo} IS NOT NULL`)
    .all();
  return photoUrisOf(rows);
}

export async function collectAllTransactionPhotos(): Promise<string[]> {
  try {
    return await collectAllTransactionPhotosStrict();
  } catch (error) {
    logError(ERROR_PREFIXES.photoCollect, error);
    return [];
  }
}

export async function deletePhotoUris(uris: string[]): Promise<void> {
  const fileUris = uris.filter(uri => typeof uri === 'string' && !uri.startsWith('data:'));
  if (fileUris.length === 0) return;
  // Keep expo-file-system out of modules that only parse/collect photos (e.g. tests
  // and the web bundle) until there is an actual native file to delete.
  const { deletePhotoFile } = await import('../utils/photoUtils');
  for (const uri of fileUris) {
    try {
      await deletePhotoFile(uri);
    } catch (error) {
      logError(ERROR_PREFIXES.photoDelete, error);
    }
  }
}

/** Delete files only when no remaining transaction still references them. */
export async function deleteUnreferencedPhotoUris(uris: string[]): Promise<void> {
  if (uris.length === 0) return;
  let referenced: Set<string>;
  try {
    referenced = new Set(await collectAllTransactionPhotosStrict());
  } catch (error) {
    // Fail safe: leaving an orphaned file is better than deleting a referenced one.
    logError(ERROR_PREFIXES.photoCollect, error);
    return;
  }
  await deletePhotoUris([...new Set(uris)].filter(uri => !referenced.has(uri)));
}
