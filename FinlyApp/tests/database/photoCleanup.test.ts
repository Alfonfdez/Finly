import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  collectTransactionPhotos,
  collectAllTransactionPhotos,
  collectAllTransactionPhotosStrict,
  deletePhotoUris,
  deleteUnreferencedPhotoUris,
} from '../../src/database/photoCleanup';

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

vi.mock('../../src/utils/photoData', () => ({
  parsePhotos: mocks.parsePhotos,
}));

vi.mock('../../src/utils/photoUtils', () => ({
  deletePhotoFile: mocks.deletePhotoFile,
}));

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
      rowsFor([{ photo: 'a' }, { photo: null }, { photo: 'c,d' }]),
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

  it('deletePhotoUris ignores non-string values from malformed photo fields', async () => {
    await expect(deletePhotoUris(['a', 1 as unknown as string, 'b'])).resolves.toBeUndefined();
    expect(mocks.deletePhotoFile).toHaveBeenCalledTimes(2);
  });

  it('collectAllTransactionPhotosStrict propagates read failures', async () => {
    mocks.fakeDb.select.mockImplementation(() => {
      throw new Error('db down');
    });
    await expect(collectAllTransactionPhotosStrict()).rejects.toThrow('db down');
  });

  it('deleteUnreferencedPhotoUris keeps files still referenced by another row', async () => {
    mocks.fakeDb.select.mockImplementation(() => rowsFor([{ photo: 'shared.jpg' }]));
    await deleteUnreferencedPhotoUris(['shared.jpg', 'orphan.jpg']);
    expect(mocks.deletePhotoFile).toHaveBeenCalledTimes(1);
    expect(mocks.deletePhotoFile).toHaveBeenCalledWith('orphan.jpg');
  });

  it('deleteUnreferencedPhotoUris does not delete when the reference read fails', async () => {
    mocks.fakeDb.select.mockImplementation(() => {
      throw new Error('db down');
    });
    await deleteUnreferencedPhotoUris(['a.jpg']);
    expect(mocks.deletePhotoFile).not.toHaveBeenCalled();
  });
});
