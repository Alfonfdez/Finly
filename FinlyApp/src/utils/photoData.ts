/** Pure parsing for the JSON photo column; no native filesystem imports. */
export function parsePhotos(photoField: string | null | undefined): string[] {
  if (!photoField) return [];
  try {
    const parsed = JSON.parse(photoField);
    return Array.isArray(parsed) ? parsed : [photoField];
  } catch {
    return [photoField];
  }
}
