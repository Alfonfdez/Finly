import { File } from 'expo-file-system';
import { isWeb } from './platform';

export function parsePhotos(photoField: string | null | undefined): string[] {
  if (!photoField) return [];
  try {
    const parsed = JSON.parse(photoField);
    return Array.isArray(parsed) ? parsed : [photoField];
  } catch {
    return [photoField];
  }
}

export async function deletePhotoFile(uri: string): Promise<void> {
  // Photo files are a native-only concern: web photos are data URIs in the DB row, and
  // expo-file-system is not supported on web (constructing a File there warns and throws).
  if (isWeb || uri.startsWith('data:')) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('Failed to delete photo:', uri, e);
  }
}
