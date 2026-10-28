import { describe, it, expect, vi, beforeEach } from 'vitest';

import { parsePhotos, deletePhotoFile } from '../../src/utils/photoUtils';
import { parsePhotoFieldStrict } from '../../src/utils/photoData';

const { mockFileDelete, mockFileCtor, platform } = vi.hoisted(() => ({
  mockFileDelete: vi.fn(),
  mockFileCtor: vi.fn(),
  platform: { isWeb: false, isNative: true, isAndroid: false },
}));

vi.mock('../../src/utils/platform', () => platform);

vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///data/user/0/app/files/' } },
  File: class {
    exists = true;
    delete = mockFileDelete;
    constructor(uri: string) {
      mockFileCtor(uri);
    }
  },
}));

const DATA_URI = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
const DATA_URI_2 = 'data:image/png;base64,iVBORw0KGgo=';
const FILE_URI = 'file:///data/user/0/app/files/photo_1_0.jpg';
const NEW_FILE_URI = 'file:///data/user/0/app/files/photos/photo_1_0.jpg';
const OUTSIDE_URI = 'file:///data/user/0/other-app/photo_1_0.jpg';
const PREFIX_SIMILAR_URI = 'file:///data/user/0/app/files2/photo_1_0.jpg';
const DB_URI = 'file:///data/user/0/app/files/SQLite/Finly.db';
const BACKUP_URI = 'file:///data/user/0/app/files/finly-backup-2026-10-28.json';
const TRAVERSAL_URI = 'file:///data/user/0/app/files/photos/../SQLite/Finly.db';

describe('parsePhotos', () => {
  it('returns an empty array for null, undefined, and empty string', () => {
    expect(parsePhotos(null)).toEqual([]);
    expect(parsePhotos(undefined)).toEqual([]);
    expect(parsePhotos('')).toEqual([]);
  });

  it('parses a JSON array of data URIs (web)', () => {
    expect(parsePhotos(JSON.stringify([DATA_URI, DATA_URI_2]))).toEqual([DATA_URI, DATA_URI_2]);
  });

  it('falls back to a single URI for a bare data URI', () => {
    expect(parsePhotos(DATA_URI)).toEqual([DATA_URI]);
  });

  it('parses a JSON array of native file URIs', () => {
    const uris = [FILE_URI, 'file:///data/user/0/app/files/photo_2.jpg'];
    expect(parsePhotos(JSON.stringify(uris))).toEqual(uris);
  });

  it('falls back to a single file URI for a bare file URI', () => {
    expect(parsePhotos(FILE_URI)).toEqual([FILE_URI]);
  });

  it('drops non-string elements from a malformed array', () => {
    expect(parsePhotos(JSON.stringify([1, null, DATA_URI]))).toEqual([DATA_URI]);
    expect(parsePhotos(JSON.stringify([1]))).toEqual([]);
  });

  it('strict import parsing rejects non-string arrays', () => {
    expect(parsePhotoFieldStrict(JSON.stringify([DATA_URI]))).toEqual([DATA_URI]);
    expect(parsePhotoFieldStrict(JSON.stringify([1]))).toBeNull();
    expect(parsePhotoFieldStrict(JSON.stringify({ uri: DATA_URI }))).toBeNull();
  });
});

describe('deletePhotoFile', () => {
  beforeEach(() => {
    platform.isWeb = false;
    mockFileDelete.mockClear();
    mockFileCtor.mockClear();
  });

  it('is a no-op for data URIs (web photos live in the DB)', async () => {
    await expect(deletePhotoFile(DATA_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).not.toHaveBeenCalled();
  });

  it('deletes a legacy root photo file (native)', async () => {
    await expect(deletePhotoFile(FILE_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).toHaveBeenCalledTimes(1);
  });

  it('deletes a new photos/ directory file (native)', async () => {
    await expect(deletePhotoFile(NEW_FILE_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).toHaveBeenCalledTimes(1);
  });

  it('does not delete a file outside the app photo directory', async () => {
    await expect(deletePhotoFile(OUTSIDE_URI)).resolves.toBeUndefined();
    expect(mockFileCtor).not.toHaveBeenCalled();
    expect(mockFileDelete).not.toHaveBeenCalled();
  });

  it('does not delete a prefix-similar directory', async () => {
    await expect(deletePhotoFile(PREFIX_SIMILAR_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).not.toHaveBeenCalled();
  });

  it('does not delete the database or a backup JSON', async () => {
    await expect(deletePhotoFile(DB_URI)).resolves.toBeUndefined();
    await expect(deletePhotoFile(BACKUP_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).not.toHaveBeenCalled();
  });

  it('does not delete a traversal path', async () => {
    await expect(deletePhotoFile(TRAVERSAL_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).not.toHaveBeenCalled();
  });

  it('propagates deletion failures so callers can log them', async () => {
    mockFileDelete.mockImplementationOnce(() => { throw new Error('delete failed'); });
    await expect(deletePhotoFile(FILE_URI)).rejects.toThrow('delete failed');
  });

  it('does not touch the file system on web, even for a native file URI', async () => {
    platform.isWeb = true;
    await expect(deletePhotoFile(FILE_URI)).resolves.toBeUndefined();
    expect(mockFileCtor).not.toHaveBeenCalled();
    expect(mockFileDelete).not.toHaveBeenCalled();
  });
});
