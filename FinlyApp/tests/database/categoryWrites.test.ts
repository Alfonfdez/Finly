import { beforeEach, describe, expect, it, vi } from 'vitest';

import { categoryRepo } from '../../src/database/repositories/categoryRepo';

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
      return { where: vi.fn(() => ({ run })) };
    }),
    update: vi.fn(() => {
      calls.push('update');
      return { set: vi.fn(() => ({ where: vi.fn(() => ({ run })) })) };
    }),
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
    deleteUnreferencedPhotoUris: vi.fn(async (uris: string[]) => {
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
  deleteUnreferencedPhotoUris: mocks.deleteUnreferencedPhotoUris,
}));

describe('category mutation ordering', () => {
  beforeEach(() => {
    mocks.calls.length = 0;
    mocks.setCollectResult([]);
    mocks.collectTransactionPhotos.mockClear();
    mocks.deleteUnreferencedPhotoUris.mockClear();
    mocks.withTransaction.mockClear();
    mocks.fakeDb.delete.mockClear();
    mocks.fakeDb.update.mockClear();
  });

  it('delete removes transactions and the category inside the transaction before cleanup', async () => {
    mocks.setCollectResult(['a.jpg']);

    await categoryRepo.delete(7);

    expect(mocks.calls).toEqual([
      'collect:category_id,7',
      'withTransaction',
      'delete',
      'run',
      'delete',
      'run',
      'cleanup:a.jpg',
    ]);
  });

  it('deleteMany handles all ids in one transaction', async () => {
    mocks.setCollectResult(['a.jpg', 'b.jpg']);

    await categoryRepo.deleteMany([1, 2]);

    expect(mocks.calls).toEqual([
      'collect:category_id,1,2',
      'withTransaction',
      'delete',
      'run',
      'delete',
      'run',
      'cleanup:a.jpg,b.jpg',
    ]);
  });

  it('reassignAndDelete updates transactions and recurring rules before deleting the category', async () => {
    await categoryRepo.reassignAndDelete(1, 2);

    expect(mocks.calls).toEqual([
      'withTransaction',
      'update',
      'run',
      'update',
      'run',
      'delete',
      'run',
    ]);
  });

  it('reassignManyAndDelete updates once for the whole batch', async () => {
    await categoryRepo.reassignManyAndDelete([1, 2], 3);

    expect(mocks.calls).toEqual([
      'withTransaction',
      'update',
      'run',
      'update',
      'run',
      'delete',
      'run',
    ]);
  });

  it('bulkDeleteWithTargets collects photos only for categories being deleted', async () => {
    mocks.setCollectResult(['deleted.jpg']);

    await categoryRepo.bulkDeleteWithTargets([
      { id: 1, targetId: 9 },
      { id: 2, targetId: null },
    ]);

    expect(mocks.calls).toEqual([
      'collect:category_id,2',
      'withTransaction',
      'update',
      'run',
      'update',
      'run',
      'delete',
      'run',
      'cleanup:deleted.jpg',
    ]);
  });

  it('bulkDeleteWithTargets skips photo collection when every category is moved', async () => {
    await categoryRepo.bulkDeleteWithTargets([{ id: 1, targetId: 9 }]);

    expect(mocks.calls).toEqual([
      'withTransaction',
      'update',
      'run',
      'update',
      'run',
      'delete',
      'run',
      'cleanup:',
    ]);
    expect(mocks.collectTransactionPhotos).not.toHaveBeenCalled();
  });

  it('skips everything for an empty batch', async () => {
    await categoryRepo.deleteMany([]);

    expect(mocks.calls).toEqual([]);
  });

  it('never cleans photos when the transaction fails', async () => {
    mocks.withTransaction.mockImplementationOnce(async () => {
      mocks.calls.push('withTransaction');
      throw new Error('db boom');
    });

    await expect(categoryRepo.delete(3)).rejects.toThrow('db boom');

    expect(mocks.calls).toEqual(['collect:category_id,3', 'withTransaction']);
    expect(mocks.deleteUnreferencedPhotoUris).not.toHaveBeenCalled();
  });
});
