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

function dbTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

describe('transactions.created_at', () => {
  it('is the record creation time, not the backdated transaction date', async () => {
    const { transactionRepo } = await boot();

    const before = new Date();
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

    const after = new Date();
    const stored = await transactionRepo.getById(created.id);
    expect(stored?.date).toBe('2026-07-15 00:00:00');
    expect(stored?.created_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    // A range, not "today": the insert may cross midnight between the two reads.
    expect(stored!.created_at >= dbTimestamp(before)).toBe(true);
    expect(stored!.created_at <= dbTimestamp(after)).toBe(true);
    expect(stored?.updated_at).toBeNull();
  });
});
