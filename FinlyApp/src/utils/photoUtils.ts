import { File } from 'expo-file-system';
import { isWeb } from './platform';

export { parsePhotos } from './photoData';

export async function deletePhotoFile(uri: string): Promise<void> {
  // Photo files are a native-only concern: web photos are data URIs in the DB row, and
  // expo-file-system is not supported on web (constructing a File there warns and throws).
  if (isWeb || uri.startsWith('data:')) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
