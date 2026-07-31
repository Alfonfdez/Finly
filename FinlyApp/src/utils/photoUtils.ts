import { File } from 'expo-file-system';

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
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('Failed to delete photo:', uri, e);
  }
}
