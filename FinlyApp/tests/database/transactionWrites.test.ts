import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const calls: string[] = [];
  let collectResult: string[] = [];
  const run = () => {
    calls.push('run');
    return Promise.resolve({});
  };
  const fakeDb = {
    delete: vi.fn(() => {
      calls.push('delete');
      return { where: vi.fn(() => ({ run })), run };
    }),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ run })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ run })) })) })),
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ all: vi.fn(async () => []) })) })) })),
  };
  return {
    calls,
    fakeDb,
    setCollectResult: (uris: string[]) => {
      collectResult = uris;
    },
    collectTransactionPhotos: vi.fn(async (...values: (string | number)[]) => {
      calls.push(`collect:${values.join(',')}`);
      return collectResult;
    }),
    collectAllTransactionPhotos: vi.fn(async () => {
      calls.push('collectAll');
      return collectResult;
    }),
    deletePhotoUris: vi.fn(async (uris: string[]) => {
      calls.push(`cleanup:${uris.join(',')}`);
    }),
    withTransaction: vi.fn(async (task: (db: unknown) => Promise<unknown>) => {
      calls.push('withTransaction');
      return task(fakeDb);
    }),
  };
});

vi.mock('../../src/database/drizzle/engine', () => ({
  getDrizzle: vi.fn(async () => mocks.fakeDb),
  withTransaction: mocks.withTransaction,
}));

vi.mock('../../src/database/photoCleanup', () => ({
  collectTransactionPhotos: mocks.collectTransactionPhotos,
  collectAllTransactionPhotos: mocks.collectAllTransactionPhotos,
  deletePhotoUris: mocks.deletePhotoUris,
}));

import { transactionWrites } from '../../src/database/repositories/transactionRepo.writes';

describe('transaction photo cleanup ordering', () => {
  beforeEach(() => {
    mocks.calls.length = 0;
    mocks.setCollectResult([]);
    mocks.collectTransactionPhotos.mockClear();
    mocks.collectAllTransactionPhotos.mockClear();
    mocks.deletePhotoUris.mockClear();
    mocks.withTransaction.mockClear();
  });

  it('delete removes the DB row inside a transaction before cleaning photos', async () => {
    mocks.setCollectResult(['a', 'b']);
    await transactionWrites.delete(7);
    expect(mocks.calls).toEqual(['collect:id,7', 'withTransaction', 'delete', 'run', 'cleanup:a,b']);
  });

  it('deleteMany captures photos up front and cleans them after the rows are gone', async () => {
    await transactionWrites.deleteMany([1, 2]);
    expect(mocks.calls).toEqual(['collect:id,1,2', 'withTransaction', 'delete', 'run', 'cleanup:']);
  });

  it('deleteAllTransactions collects every photo and cleans after the full clear', async () => {
    mocks.setCollectResult(['x', 'y']);
    await transactionWrites.deleteAllTransactions();
    expect(mocks.calls).toEqual(['collectAll', 'withTransaction', 'delete', 'run', 'cleanup:x,y']);
  });

  it('never deletes photos when the DB transaction fails', async () => {
    mocks.withTransaction.mockImplementationOnce(async () => {
      mocks.calls.push('withTransaction');
      throw new Error('db boom');
    });
    await expect(transactionWrites.delete(3)).rejects.toThrow('db boom');
    expect(mocks.calls).toEqual(['collect:id,3', 'withTransaction']);
    expect(mocks.deletePhotoUris).not.toHaveBeenCalled();
  });

  it('skips photo bookkeeping entirely when there are no rows to delete', async () => {
    await transactionWrites.deleteMany([]);
    expect(mocks.calls).toEqual([]);
    expect(mocks.deletePhotoUris).not.toHaveBeenCalled();
  });
});