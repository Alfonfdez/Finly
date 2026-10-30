/** Pure parsing for the JSON photo column; no native filesystem imports. */
interface ParsedPhotoField {
  values: string[];
  valid: boolean;
}

function parsePhotoValue(photoField: string | null | undefined): ParsedPhotoField {
  if (!photoField) return { values: [], valid: true };
  try {
    const parsed = JSON.parse(photoField);
    if (Array.isArray(parsed)) {
      const values = parsed.filter((value): value is string => typeof value === 'string');
      return { values, valid: values.length === parsed.length };
    }
    if (typeof parsed === 'string') return { values: [parsed], valid: true };
    return { values: [], valid: false };
  } catch {
    // A bare legacy URI is not JSON; keep it as a single value.
    return { values: [photoField], valid: true };
  }
}

/** Display parser: keep valid strings and drop malformed elements. */
export function parsePhotos(photoField: string | null | undefined): string[] {
  return parsePhotoValue(photoField).values;
}

/** Import parser: null means the stored photo value is malformed. */
export function parsePhotoFieldStrict(photoField: string | null | undefined): string[] | null {
  const parsed = parsePhotoValue(photoField);
  return parsed.valid ? parsed.values : null;
}
