import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFileDelete } = vi.hoisted(() => ({ mockFileDelete: vi.fn() }));

vi.mock('expo-file-system', () => ({
  File: class {
    exists = true;
    delete = mockFileDelete;
  },
}));

import { parsePhotos, deletePhotoFile } from '../../src/utils/photoUtils';

const DATA_URI = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
const DATA_URI_2 = 'data:image/png;base64,iVBORw0KGgo=';
const FILE_URI = 'file:///data/user/0/app/files/photo_1.jpg';

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
});

describe('deletePhotoFile', () => {
  beforeEach(() => {
    mockFileDelete.mockClear();
  });

  it('is a no-op for data URIs (web photos live in the DB)', async () => {
    await expect(deletePhotoFile(DATA_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).not.toHaveBeenCalled();
  });

  it('deletes the physical file for a file URI (native)', async () => {
    await expect(deletePhotoFile(FILE_URI)).resolves.toBeUndefined();
    expect(mockFileDelete).toHaveBeenCalledTimes(1);
  });
});
