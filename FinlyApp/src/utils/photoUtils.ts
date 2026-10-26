import { File, Paths } from 'expo-file-system';
import { isWeb } from './platform';

export { parsePhotos } from './photoData';

function isAppPhotoUri(uri: string): boolean {
  const root = Paths.document.uri.endsWith('/') ? Paths.document.uri : `${Paths.document.uri}/`;
  return uri.startsWith(root) && uri !== root;
}

export async function deletePhotoFile(uri: string): Promise<void> {
  // Photo files are a native-only concern: web photos are data URIs in the DB row, and
  // expo-file-system is not supported on web (constructing a File there warns and throws).
  // Never delete arbitrary file URIs from an imported backup.
  if (isWeb || uri.startsWith('data:') || !isAppPhotoUri(uri)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
