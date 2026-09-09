import { sql, type Column } from 'drizzle-orm';
import { getDrizzle } from './drizzle/engine';
import { transactions } from './drizzle/schema';
import { parsePhotos, deletePhotoFile } from '../utils/photoUtils';

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
    console.error('Failed to collect transaction photos:', error);
    return [];
  }
}

export async function collectAllTransactionPhotos(): Promise<string[]> {
  try {
    const db = await getDrizzle();
    const rows = await db
      .select({ photo: transactions.photo })
      .from(transactions)
      .where(sql`${transactions.photo} IS NOT NULL`)
      .all();
    return photoUrisOf(rows);
  } catch (error) {
    console.error('Failed to collect transaction photos:', error);
    return [];
  }
}

export async function deletePhotoUris(uris: string[]): Promise<void> {
  for (const uri of uris) {
    try {
      await deletePhotoFile(uri);
    } catch (error) {
      console.error('Failed to delete transaction photo:', error);
    }
  }
}