import { File, Paths } from 'expo-file-system';
import { isWeb } from './platform';
import { PHOTO_DIRECTORY, fileUriPath, isPhotoFileName } from './photoUri';

export { parsePhotos } from './photoData';

function isAppPhotoUri(uri: string): boolean {
  const path = fileUriPath(uri);
  if (!path) return false;
  const segments = path.split('/');
  if (segments.some(segment => segment === '.' || segment === '..')) return false;
  const name = segments[segments.length - 1] ?? '';
  if (!isPhotoFileName(name)) return false;

  const root = Paths.document.uri.endsWith('/') ? Paths.document.uri : `${Paths.document.uri}/`;
  const rootPath = fileUriPath(root);
  if (!rootPath) return false;
  const rootWithSlash = rootPath.endsWith('/') ? rootPath : `${rootPath}/`;
  return path === `${rootWithSlash}${name}`
    || path === `${rootWithSlash}${PHOTO_DIRECTORY}/${name}`;
}

export async function deletePhotoFile(uri: string): Promise<void> {
  // Photo files are a native-only concern: web photos are data URIs in the DB row, and
  // expo-file-system is not supported on web (constructing a File there warns and throws).
  // Never delete arbitrary file URIs from an imported backup.
  if (isWeb || uri.startsWith('data:') || !isAppPhotoUri(uri)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
