import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const chain = (rows: { photo: string | null }[]) => ({
    from: () => ({
      where: () => ({
        all: async (): Promise<{ photo: string | null }[]> => rows,
      }),
    }),
  });
  const fakeDb = {
    select: vi.fn((): ReturnType<typeof chain> => chain([])),
  };
  return {
    fakeDb,
    getDrizzle: vi.fn(async () => fakeDb),
    parsePhotos: vi.fn((photo: string | null): string[] => (photo ? [photo] : [])),
    deletePhotoFile: vi.fn(async (_uri: string) => {}),
  };
});

vi.mock('../../src/database/drizzle/engine', () => ({
  getDrizzle: mocks.getDrizzle,
}));

vi.mock('../../src/utils/photoUtils', () => ({
  parsePhotos: mocks.parsePhotos,
  deletePhotoFile: mocks.deletePhotoFile,
}));

import {
  collectTransactionPhotos,
  collectAllTransactionPhotos,
  deletePhotoUris,
} from '../../src/database/photoCleanup';

type SelectChain = ReturnType<typeof mocks.fakeDb.select>;

const rowsFor = (rows: { photo: string | null }[]): SelectChain => ({
  from: () => ({
    where: () => ({
      all: async (): Promise<{ photo: string | null }[]> => rows,
    }),
  }),
});

describe('photoCleanup', () => {
  beforeEach(() => {
    mocks.fakeDb.select.mockClear();
    mocks.parsePhotos.mockClear();
    mocks.deletePhotoFile.mockClear();
  });

  it('collects parsed photo uris from all matching rows without throwing for null photos', async () => {
    mocks.fakeDb.select.mockImplementation(() =>
      rowsFor([{ photo: 'a' }, { photo: null }, { photo: 'c,d' }])
    );
    mocks.parsePhotos.mockImplementation((photo) => (photo ? photo.split(',') : []));
    await expect(collectTransactionPhotos('id', 1, 2)).resolves.toEqual(['a', 'c', 'd']);
  });

  it('skips the DB query when no values are given', async () => {
    await expect(collectTransactionPhotos('id')).resolves.toEqual([]);
    expect(mocks.fakeDb.select).not.toHaveBeenCalled();
  });

  it('collectAll returns uris of every row that has a photo', async () => {
    mocks.fakeDb.select.mockImplementation(() => rowsFor([{ photo: 'x' }, { photo: null }]));
    await expect(collectAllTransactionPhotos()).resolves.toEqual(['x']);
  });

  it('is best-effort: a failing DB read yields no uris instead of throwing', async () => {
    mocks.fakeDb.select.mockImplementation(() => {
      throw new Error('db down');
    });
    await expect(collectTransactionPhotos('id', 1)).resolves.toEqual([]);
  });

  it('deletePhotoUris deletes every uri and swallows per-file errors', async () => {
    mocks.deletePhotoFile.mockImplementation(async (uri) => {
      if (uri === 'b') throw new Error('unlink failed');
    });
    await expect(deletePhotoUris(['a', 'b', 'c'])).resolves.toBeUndefined();
    expect(mocks.deletePhotoFile).toHaveBeenCalledTimes(3);
  });
});