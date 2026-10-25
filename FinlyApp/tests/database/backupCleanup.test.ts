import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importBackup } from '../../src/database/backupService';

const parseBackup = vi.fn();
const applyBackup = vi.fn(async (_db: unknown, _snapshot: unknown) => {});
const collectAllTransactionPhotos = vi.fn(async () => [] as string[]);
const deletePhotoUris = vi.fn(async (_uris: string[]) => {});

vi.mock('../../src/database/backup', () => ({
  applyBackup: (db: unknown, snapshot: unknown) => applyBackup(db, snapshot),
  assertImportableBackup: vi.fn(),
  buildBackup: vi.fn(),
  parseBackup: (json: string) => parseBackup(json),
  serializeBackup: vi.fn(),
  BackupValidationError: class BackupValidationError extends Error {},
  BACKUP_VALIDATION_CODES: {
    invalidJson: 'invalid_json',
    invalidFormat: 'invalid_format',
    newerVersion: 'newer_version',
    incomplete: 'incomplete',
  },
}));

vi.mock('../../src/database/database', () => ({
  initDatabase: async () => ({}),
  SCHEMA_VERSION: 4,
}));

vi.mock('../../src/database/photoCleanup', () => ({
  collectAllTransactionPhotos: () => collectAllTransactionPhotos(),
  deletePhotoUris: (uris: string[]) => deletePhotoUris(uris),
}));

vi.mock('../../src/utils/photoData', () => ({
  parsePhotos: (photo: string | null) => (photo ? JSON.parse(photo) : []),
}));

describe('importBackup photo cleanup', () => {
  beforeEach(() => {
    parseBackup.mockReset();
    applyBackup.mockClear();
    collectAllTransactionPhotos.mockReset().mockResolvedValue([]);
    deletePhotoUris.mockClear();
  });

  it('deletes old photos that the imported snapshot no longer references', async () => {
    parseBackup.mockReturnValue({
      schema: 4,
      data: { transactions: [{ photo: '["file:///shared.jpg","file:///new.jpg"]' }] },
    });
    collectAllTransactionPhotos.mockResolvedValue([
      'file:///old.jpg',
      'file:///shared.jpg',
    ]);

    await importBackup('{}');

    expect(applyBackup).toHaveBeenCalledTimes(1);
    expect(deletePhotoUris).toHaveBeenCalledWith(['file:///old.jpg']);
  });

  it('keeps old photos when the import fails', async () => {
    parseBackup.mockReturnValue({ schema: 4, data: { transactions: [] } });
    collectAllTransactionPhotos.mockResolvedValue(['file:///old.jpg']);
    applyBackup.mockRejectedValueOnce(new Error('import failed'));

    await expect(importBackup('{}')).rejects.toThrow('import failed');
    expect(deletePhotoUris).not.toHaveBeenCalled();
  });
});
