import { describe, it, expect, beforeAll, vi } from 'vitest';
import { initSqliteHarness, bootSqliteDb as boot } from './helpers/sqliteHarness';

vi.mock('../../src/database/photoCleanup', () => ({
  collectTransactionPhotos: vi.fn(async () => []),
  collectAllTransactionPhotos: vi.fn(async () => []),
  deletePhotoUris: vi.fn(async () => {}),
}));

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

await import('expo-sqlite');

beforeAll(initSqliteHarness);

function todayDateOnly(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

describe('transactions.created_at', () => {
  it('is the record creation time, not the backdated transaction date', async () => {
    const { transactionRepo } = await boot();

    const created = await transactionRepo.createWithTags(
      {
        account_id: 1,
        category_id: 3,
        type: 'expense',
        amount: 10,
        description: null,
        date: '2026-07-15 00:00:00',
        photo: null,
      },
      [],
    );

    const stored = await transactionRepo.getById(created.id);
    expect(stored?.date).toBe('2026-07-15 00:00:00');
    expect(stored?.created_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(stored?.created_at.slice(0, 10)).toBe(todayDateOnly());
    expect(stored?.updated_at).toBeNull();
  });
});
