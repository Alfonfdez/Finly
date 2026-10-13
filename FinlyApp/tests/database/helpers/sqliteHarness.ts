import { vi } from 'vitest';
import type { DatabaseHandle } from '../../../src/database/types';
import { initSqlJsOnce, resetMockDatabase, openDatabaseSync } from '../sqliteMock';

/** Initialize the sql.js WASM engine once per test file (`beforeAll(initSqliteHarness)`). */
export function initSqliteHarness(): Promise<unknown> {
  return initSqlJsOnce();
}

/**
 * A fresh sql.js database with the full schema (migrations 001-004) and seed data,
 * plus the repositories and the recurring service. Shared by the database tests so
 * the boot/migration setup lives in one place.
 *
 * Note: the `expo-sqlite` / `photoCleanup` `vi.mock` blocks stay in each test file
 * (mock hoisting is per-file).
 */
export async function bootSqliteDb() {
  vi.resetModules();
  resetMockDatabase();
  const db = openDatabaseSync('Finly.db') as DatabaseHandle;
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const { createSchema } = await import('../../../src/database/migrations/001_initial');
  const { seedDataInner } = await import('../../../src/database/migrations/002_seed');
  const { seedConfigInner } = await import('../../../src/database/migrations/003_config');
  const { createRecurringSchema } = await import('../../../src/database/migrations/004_recurring');
  await createSchema(db);
  await seedDataInner(db);
  await seedConfigInner(db);
  await createRecurringSchema(db);

  const { recurringRepo } = await import('../../../src/database/repositories/recurringRepo');
  const { transactionRepo } = await import('../../../src/database/repositories/transactionRepo');
  const { tagRepo } = await import('../../../src/database/repositories/tagRepo');
  const {
    createRecurringRule,
    materializeDueRecurring,
    resumeRecurringRule,
    saveRecurringRuleEdit,
  } = await import('../../../src/database/recurringService');

  return {
    db,
    recurringRepo,
    transactionRepo,
    tagRepo,
    createRecurringRule,
    materializeDueRecurring,
    resumeRecurringRule,
    saveRecurringRuleEdit,
  };
}
