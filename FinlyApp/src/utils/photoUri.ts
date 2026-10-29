import { MAX_PHOTO_URI_LENGTH } from '../constants/types';
import { PHOTO_FILE_PREFIX } from '../constants/photo';

export { PHOTO_DIRECTORY } from '../constants/photo';

/** Files created by the app: photo_<timestamp>_<counter>.<ext>. */
const PHOTO_FILE_RE = new RegExp(`^${PHOTO_FILE_PREFIX}\\d+_\\d+\\.(?:jpe?g|png|webp)$`, 'i');

/**
 * Web photos are embedded as base64 data URIs. Keep the check broad for image
 * subtypes so old backups with HEIC/GIF/etc. remain importable.
 */
const DATA_PHOTO_RE = /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i;

export function isPhotoFileName(name: string): boolean {
  return PHOTO_FILE_RE.test(name);
}

/** Decoded pathname of a file:// URI, or null for any other URI/scheme. */
export function fileUriPath(uri: string): string | null {
  if (!uri.startsWith('file://')) return null;
  const raw = uri.slice('file://'.length);
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  try {
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export function isDataPhotoUri(uri: string): boolean {
  return DATA_PHOTO_RE.test(uri);
}

/** File URI whose basename is an app-created photo name. */
export function isFilePhotoUri(uri: string): boolean {
  const path = fileUriPath(uri);
  if (!path || path.includes('\0')) return false;
  const segments = path.split('/');
  if (segments.some(segment => segment === '.' || segment === '..')) return false;
  const name = segments[segments.length - 1] ?? '';
  return isPhotoFileName(name);
}

/** Whether a photo value from a backup is safe to accept. */
export function isImportablePhotoUri(uri: string): boolean {
  return uri.length <= MAX_PHOTO_URI_LENGTH && (isDataPhotoUri(uri) || isFilePhotoUri(uri));
}
