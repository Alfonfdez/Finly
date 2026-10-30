import { describe, it, expect } from 'vitest';
import { runExclusiveDb, serializeTransactions } from '../../src/database/transactionQueue';
import type { DatabaseHandle } from '../../src/database/types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('runExclusiveDb', () => {
  it('runs tasks one at a time, in call order', async () => {
    const events: string[] = [];
    let active = 0;
    let maxActive = 0;

    const task = (label: string, delay: number) => runExclusiveDb(async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      events.push(`${label}:start`);
      await sleep(delay);
      events.push(`${label}:end`);
      active -= 1;
      return label;
    });

    await expect(Promise.all([task('a', 15), task('b', 1), task('c', 5)])).resolves.toEqual(['a', 'b', 'c']);
    expect(maxActive).toBe(1);
    expect(events).toEqual(['a:start', 'a:end', 'b:start', 'b:end', 'c:start', 'c:end']);
  });

  it('keeps the chain alive after a rejection', async () => {
    await expect(runExclusiveDb(async () => {
      throw new Error('boom');
    })).rejects.toThrow('boom');

    await expect(runExclusiveDb(async () => 'next')).resolves.toBe('next');
  });
});

function fakeHandle(overrides: Partial<DatabaseHandle> = {}): DatabaseHandle {
  return {
    execAsync: async () => {},
    runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
    getFirstAsync: async <T = unknown>() => null as T | null,
    getAllAsync: async <T = unknown>() => [] as T[],
    withTransactionAsync: async task => {
      await task();
    },
    ...overrides,
  };
}

describe('serializeTransactions', () => {
  it('delegates reads and writes to the handle', async () => {
    const calls: string[] = [];
    const db = serializeTransactions(fakeHandle({
      execAsync: async source => {
        calls.push(`exec:${source}`);
      },
      runAsync: async source => {
        calls.push(`run:${source}`);
        return { lastInsertRowId: 7, changes: 1 };
      },
      getFirstAsync: async <T = unknown>() => ({ ok: true } as unknown as T),
      getAllAsync: async <T = unknown>() => [1, 2] as unknown as T[],
      withTransactionAsync: async task => {
        calls.push('tx:start');
        await task();
        calls.push('tx:end');
      },
    }));

    await db.execAsync('PRAGMA foreign_keys = ON;');
    await expect(db.runAsync('INSERT')).resolves.toEqual({ lastInsertRowId: 7, changes: 1 });
    await expect(db.getFirstAsync('SELECT 1')).resolves.toEqual({ ok: true });
    await expect(db.getAllAsync('SELECT 1')).resolves.toEqual([1, 2]);
    await db.withTransactionAsync(async () => {});

    expect(calls).toEqual([
      'exec:PRAGMA foreign_keys = ON;',
      'run:INSERT',
      'tx:start',
      'tx:end',
    ]);
  });

  it('never lets two transactions overlap', async () => {
    const events: string[] = [];
    let active = 0;
    let maxActive = 0;

    const db = serializeTransactions(fakeHandle({
      withTransactionAsync: async task => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        events.push('start');
        await sleep(10);
        await task();
        events.push('end');
        active -= 1;
      },
    }));

    await Promise.all([
      db.withTransactionAsync(async () => {}),
      db.withTransactionAsync(async () => {}),
    ]);

    expect(maxActive).toBe(1);
    expect(events).toEqual(['start', 'end', 'start', 'end']);
  });
});
