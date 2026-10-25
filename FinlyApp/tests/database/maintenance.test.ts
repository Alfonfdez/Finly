import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  clearDataKeepSettingsWithCleanup,
  resetDatabaseWithCleanup,
} from '../../src/database/maintenance';

const resetDatabase = vi.fn(async () => {});
const clearDataKeepSettings = vi.fn(async () => {});
const collectAllTransactionPhotos = vi.fn(async () => [] as string[]);
const deletePhotoUris = vi.fn(async (_uris: string[]) => {});

vi.mock('../../src/database/database', () => ({
  resetDatabase: () => resetDatabase(),
  clearDataKeepSettings: () => clearDataKeepSettings(),
}));

vi.mock('../../src/database/photoCleanup', () => ({
  collectAllTransactionPhotos: () => collectAllTransactionPhotos(),
  deletePhotoUris: (uris: string[]) => deletePhotoUris(uris),
}));

describe('data maintenance photo cleanup', () => {
  beforeEach(() => {
    resetDatabase.mockClear();
    clearDataKeepSettings.mockClear();
    collectAllTransactionPhotos.mockReset().mockResolvedValue([]);
    deletePhotoUris.mockClear();
  });

  it('collects photos before a factory reset and deletes them after it commits', async () => {
    const events: string[] = [];
    collectAllTransactionPhotos.mockImplementation(async () => {
      events.push('collect');
      return ['file:///photo-a.jpg'];
    });
    resetDatabase.mockImplementation(async () => { events.push('reset'); });
    deletePhotoUris.mockImplementation(async () => { events.push('delete'); });

    await resetDatabaseWithCleanup();

    expect(events).toEqual(['collect', 'reset', 'delete']);
    expect(deletePhotoUris).toHaveBeenCalledWith(['file:///photo-a.jpg']);
  });

  it('keeps photos when the factory reset fails', async () => {
    collectAllTransactionPhotos.mockResolvedValue(['file:///photo-a.jpg']);
    resetDatabase.mockRejectedValueOnce(new Error('reset failed'));

    await expect(resetDatabaseWithCleanup()).rejects.toThrow('reset failed');
    expect(deletePhotoUris).not.toHaveBeenCalled();
  });

  it('cleans photos for delete-all-data after the wipe commits', async () => {
    collectAllTransactionPhotos.mockResolvedValue(['file:///photo-b.jpg']);

    await clearDataKeepSettingsWithCleanup();

    expect(clearDataKeepSettings).toHaveBeenCalledTimes(1);
    expect(deletePhotoUris).toHaveBeenCalledWith(['file:///photo-b.jpg']);
  });
});
