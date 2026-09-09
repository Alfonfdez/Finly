import { describe, it, expect, beforeAll, vi } from 'vitest';
import { getTableColumns, type Column, type Table } from 'drizzle-orm';
import type { DatabaseHandle } from '../../src/database/types';
import { initSqlJsOnce, resetMockDatabase } from './sqliteMock';
import {
  accounts,
  categories,
  config,
  tags,
  transactionTags,
  transactions,
  users,
} from '../../src/database/drizzle/schema';

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

// Evaluate the expo-sqlite mock factory now (registry intact) so its dynamic
// import of sqliteMock resolves to the same module instance the test file uses,
// even after vi.resetModules() clears the registry per test.
await import('expo-sqlite');

beforeAll(async () => {
  await initSqlJsOnce();
});

async function freshDb(): Promise<DatabaseHandle> {
  vi.resetModules();
  resetMockDatabase();
  const { initDatabase } = await import('../../src/database/database');
  return initDatabase();
}

const DRIZZLE_TABLES: Record<string, Table> = {
  users,
  accounts,
  categories,
  transactions,
  tags,
  transaction_tags: transactionTags,
  config,
};

interface InfoCol {
  name: string;
  type: string;
  notnull: number;
  pk: number;
}

describe('Drizzle schema drift', () => {
  it('drizzle table columns exactly match the migrated schema', async () => {
    const db = await freshDb();
    for (const [tableName, table] of Object.entries(DRIZZLE_TABLES)) {
      const info = await db.getAllAsync<InfoCol>(`PRAGMA table_info(${tableName})`);
      const drizzleCols = getTableColumns(DRIZZLE_TABLES[tableName]);
      const colList = Object.values(drizzleCols as Record<string, Column>);

      expect(info.map(c => c.name), `${tableName} column names`).toEqual(colList.map(c => c.name));

      for (let i = 0; i < info.length; i++) {
        const dbCol = info[i];
        const dzCol = colList[i];
        expect(dzCol.getSQLType().toUpperCase(), `${tableName}.${dzCol.name} type`).toBe(dbCol.type);
        // PRAGMA reports notnull=0 for primary key columns (e.g. INTEGER PRIMARY KEY)
        if (dbCol.pk === 0) {
          expect(dzCol.notNull, `${tableName}.${dzCol.name} NOT NULL`).toBe(dbCol.notnull === 1);
        }
      }
    }
  });
});
