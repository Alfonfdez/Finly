import { sql, type Column } from 'drizzle-orm';
import { getDrizzle } from './drizzle/engine';
import { transactions } from './drizzle/schema';
import { parsePhotos, deletePhotoFile } from '../utils/photoUtils';

const COLUMN_MAP: Record<string, Column> = {
  id: transactions.id,
  account_id: transactions.account_id,
  category_id: transactions.category_id,
};

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
    const db = await getDrizzle();
    const col = COLUMN_MAP[column];
    if (!col) throw new Error(`Unknown column: ${column}`);
    const rows = await db
      .select({ photo: transactions.photo })
      .from(transactions)
      .where(sql`${col} IN (${sql.join(values.map(v => sql`${v}`), sql`, `)})`)
      .all();
    await cleanupPhotos(rows);
  } catch (error) {
    console.error('Failed to delete transaction photos:', error);
  }
}

export async function deleteAllTransactionPhotos(): Promise<void> {
  try {
    const db = await getDrizzle();
    const rows = await db
      .select({ photo: transactions.photo })
      .from(transactions)
      .where(sql`${transactions.photo} IS NOT NULL`)
      .all();
    await cleanupPhotos(rows);
  } catch (error) {
    console.error('Failed to delete transaction photos:', error);
  }
}
