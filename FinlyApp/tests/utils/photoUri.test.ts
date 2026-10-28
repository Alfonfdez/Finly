import { describe, expect, it } from 'vitest';
import {
  isDataPhotoUri,
  isFilePhotoUri,
  isImportablePhotoUri,
  isPhotoFileName,
} from '../../src/utils/photoUri';

describe('photoUri', () => {
  it('accepts app photo filenames only', () => {
    expect(isPhotoFileName('photo_123_0.jpg')).toBe(true);
    expect(isPhotoFileName('photo_123_0.PNG')).toBe(true);
    expect(isPhotoFileName('photo_123.jpg')).toBe(false);
    expect(isPhotoFileName('Finly.db')).toBe(false);
    expect(isPhotoFileName('finly-backup-2026-10-28.json')).toBe(false);
  });

  it('accepts base64 image data URIs broadly', () => {
    expect(isDataPhotoUri('data:image/jpeg;base64,AAAA')).toBe(true);
    expect(isDataPhotoUri('data:image/png;base64,BBBB')).toBe(true);
    expect(isDataPhotoUri('data:image/heic;base64,CCCC')).toBe(true);
    expect(isDataPhotoUri('data:image/svg+xml;base64,DDDD')).toBe(true);
  });

  it('rejects non-image or non-base64 data URIs', () => {
    expect(isDataPhotoUri('data:text/plain;base64,AAAA')).toBe(false);
    expect(isDataPhotoUri('data:image/svg+xml,<svg/>')).toBe(false);
    expect(isDataPhotoUri('https://example.com/photo.jpg')).toBe(false);
  });

  it('accepts legacy root and new photos/ file URIs', () => {
    expect(isFilePhotoUri('file:///data/user/0/app/files/photo_1_0.jpg')).toBe(true);
    expect(isFilePhotoUri('file:///data/user/0/app/files/photos/photo_1_0.jpg')).toBe(true);
  });

  it('rejects DB, backup, traversal, and non-photo file URIs', () => {
    expect(isFilePhotoUri('file:///data/user/0/app/files/SQLite/Finly.db')).toBe(false);
    expect(isFilePhotoUri('file:///data/user/0/app/files/finly-backup-2026-10-28.json')).toBe(false);
    expect(isFilePhotoUri('file:///data/user/0/app/files/photos/../SQLite/Finly.db')).toBe(false);
    expect(isFilePhotoUri('file:///data/user/0/app/files/secret.jpg')).toBe(false);
    expect(isFilePhotoUri('https://example.com/photo_1_0.jpg')).toBe(false);
  });

  it('combines both importable photo forms', () => {
    expect(isImportablePhotoUri('data:image/heic;base64,CCCC')).toBe(true);
    expect(isImportablePhotoUri('file:///data/user/0/app/files/photo_1_0.jpg')).toBe(true);
    expect(isImportablePhotoUri('https://example.com/photo.jpg')).toBe(false);
    expect(isImportablePhotoUri('file:///data/user/0/app/files/SQLite/Finly.db')).toBe(false);
  });
});
