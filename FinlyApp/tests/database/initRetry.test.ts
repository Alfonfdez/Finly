import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  openEngine: vi.fn(),
}));

vi.mock('../../src/database/engine', () => ({
  openEngine: mocks.openEngine,
}));

function fakeHandle() {
  return {
    execAsync: vi.fn(async () => {}),
    getFirstAsync: vi.fn(async (sql: string) => (
      sql.includes('user_version') ? { user_version: 4 } : { count: 1 }
    )),
    withTransactionAsync: vi.fn(async (task: () => Promise<void>) => { await task(); }),
  };
}

describe('database initialization retry', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.openEngine.mockReset();
  });

  it('retries opening after a rejected engine', async () => {
    const handle = fakeHandle();
    mocks.openEngine
      .mockRejectedValueOnce(new Error('open failed'))
      .mockResolvedValueOnce(handle);

    const { getDatabase } = await import('../../src/database/database');
    await expect(getDatabase()).rejects.toThrow('open failed');
    await expect(getDatabase()).resolves.toBe(handle);
  });

  it('retries full initialization after a failed first attempt', async () => {
    const handle = fakeHandle();
    mocks.openEngine
      .mockRejectedValueOnce(new Error('open failed'))
      .mockResolvedValueOnce(handle);

    const { initDatabase } = await import('../../src/database/database');
    await expect(initDatabase()).rejects.toThrow('open failed');
    await expect(initDatabase()).resolves.toBe(handle);
  });
});
