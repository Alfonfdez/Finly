import type { DatabaseHandle } from '../types';
import { DEFAULT_CONFIG, toConfigRows } from '../configDefaults';

export async function seedConfig(db: DatabaseHandle): Promise<void> {
  await db.withTransactionAsync(async () => {
    await seedConfigInner(db);
  });
}

export async function seedConfigInner(db: DatabaseHandle): Promise<void> {
  for (const row of toConfigRows(DEFAULT_CONFIG)) {
    await db.runAsync(
      'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)',
      row.key,
      row.value
    );
  }
}
