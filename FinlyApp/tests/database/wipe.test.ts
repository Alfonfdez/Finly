import { describe, it, expect, vi } from 'vitest';
import { wipeUserData } from '../../src/database/wipe';
import type { DatabaseHandle } from '../../src/database/types';

function fakeHandle() {
  const runAsync = vi.fn(async (_sql: string) => ({ lastInsertRowId: 0, changes: 1 }));
  return {
    handle: { runAsync } as unknown as DatabaseHandle,
    calls: () => runAsync.mock.calls.map(([sql]) => sql),
  };
}

describe('wipeUserData', () => {
  it('deletes children before parents and keeps the seeded user on reset', async () => {
    const { handle, calls } = fakeHandle();
    await wipeUserData(handle, { keepConfig: false, keepUsers: true });

    expect(calls()).toEqual([
      'DELETE FROM transactions',
      'DELETE FROM transaction_tags',
      'DELETE FROM recurring_rule_tags',
      'DELETE FROM recurring_rules',
      'DELETE FROM tags',
      'DELETE FROM categories',
      'DELETE FROM accounts',
      'DELETE FROM config',
    ]);
  });

  it('keeps config and users for delete-all', async () => {
    const { handle, calls } = fakeHandle();
    await wipeUserData(handle, { keepConfig: true, keepUsers: true });

    expect(calls()).not.toContain('DELETE FROM config');
    expect(calls()).not.toContain('DELETE FROM users');
  });

  it('deletes config and users for backup import', async () => {
    const { handle, calls } = fakeHandle();
    await wipeUserData(handle, { keepConfig: false, keepUsers: false });

    expect(calls().slice(-2)).toEqual(['DELETE FROM config', 'DELETE FROM users']);
  });
});
