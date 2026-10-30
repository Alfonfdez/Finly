import { File, Paths } from 'expo-file-system';
import { isWeb } from './platform';
import { PHOTO_DIRECTORY, fileUriPath, parsePhotoFilePath } from './photoUri';

export { parsePhotos } from './photoData';

function isAppPhotoUri(uri: string): boolean {
  const parsed = parsePhotoFilePath(uri);
  if (!parsed) return false;

  const root = Paths.document.uri.endsWith('/') ? Paths.document.uri : `${Paths.document.uri}/`;
  const rootPath = fileUriPath(root);
  if (!rootPath) return false;
  const rootWithSlash = rootPath.endsWith('/') ? rootPath : `${rootPath}/`;
  return parsed.path === `${rootWithSlash}${parsed.name}`
    || parsed.path === `${rootWithSlash}${PHOTO_DIRECTORY}/${parsed.name}`;
}

export async function deletePhotoFile(uri: string): Promise<void> {
  // Photo files are a native-only concern: web photos are data URIs in the DB row, and
  // expo-file-system is not supported on web (constructing a File there warns and throws).
  // Never delete arbitrary file URIs from an imported backup.
  if (isWeb || uri.startsWith('data:') || !isAppPhotoUri(uri)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
