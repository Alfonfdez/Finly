import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseRowOrNull, parseRows } from '../../src/database/validate';

const rowSchema = z.object({ id: z.number().int(), name: z.string() });

describe('parseRows', () => {
  it('returns the parsed rows', () => {
    const rows = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    expect(parseRows(rowSchema, 'widgets', rows)).toEqual(rows);
  });

  it('accepts an empty list', () => {
    expect(parseRows(rowSchema, 'widgets', [])).toEqual([]);
  });

  it('throws with the table name and the validation reason', () => {
    expect(() => parseRows(rowSchema, 'widgets', [{ id: 'nope', name: 'A' }]))
      .toThrow(/^Data validation failed for widgets: /);
  });
});

describe('parseRowOrNull', () => {
  it('returns null for null and undefined', () => {
    expect(parseRowOrNull(rowSchema, 'widgets', null)).toBeNull();
    expect(parseRowOrNull(rowSchema, 'widgets', undefined)).toBeNull();
  });

  it('parses a valid row', () => {
    expect(parseRowOrNull(rowSchema, 'widgets', { id: 1, name: 'A' })).toEqual({ id: 1, name: 'A' });
  });

  it('throws instead of returning an invalid row', () => {
    expect(() => parseRowOrNull(rowSchema, 'widgets', { id: 1 })).toThrow(/Data validation failed for widgets/);
  });
});
