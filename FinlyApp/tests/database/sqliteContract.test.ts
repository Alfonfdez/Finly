import { describe, beforeAll, vi } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import { initSqlJsOnce, resetMockDatabase, openDatabaseSync } from './sqliteMock';
import type { ContractBackend } from './contractTypes';
import { runContractSuite } from './contractSuite';

vi.mock('../../src/database/photoCleanup', () => ({
  deleteTransactionPhotos: vi.fn(async () => {}),
}));

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

// Evaluate the expo-sqlite mock factory now (registry intact) so its dynamic
// import of sqliteMock resolves to the same module instance the test file uses,
// even after vi.resetModules() clears the registry per test.
await import('expo-sqlite');

describe('sqlite contract', () => {
  beforeAll(async () => {
    await initSqlJsOnce();
  });

  runContractSuite('sqlite', async (): Promise<ContractBackend> => {
    vi.resetModules();
    resetMockDatabase();

    const db = openDatabaseSync('Finly.db') as DatabaseHandle;
    await db.execAsync('PRAGMA foreign_keys = ON;');

    const { createSchema } = await import('../../src/database/migrations/001_initial');
    const { seedDataInner } = await import('../../src/database/migrations/002_seed');
    const { seedConfigInner } = await import('../../src/database/migrations/003_config');
    await createSchema(db);
    await seedDataInner(db);
    await seedConfigInner(db);

    const { accountRepo } = await import('../../src/database/repositories/accountRepo');
    const { categoryRepo } = await import('../../src/database/repositories/categoryRepo');
    const { tagRepo } = await import('../../src/database/repositories/tagRepo');
    const { transactionRepo } = await import('../../src/database/repositories/transactionRepo');
    const { configRepo } = await import('../../src/database/repositories/configRepo');

    return {
      account: accountRepo,
      category: categoryRepo,
      tag: tagRepo,
      transaction: transactionRepo,
      config: configRepo,
    };
  });
});
