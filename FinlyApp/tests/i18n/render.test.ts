import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { en, type Language } from '../../src/i18n/en';
import { es } from '../../src/i18n/es';
import { ca } from '../../src/i18n/ca';
import { gl } from '../../src/i18n/gl';
import { eu } from '../../src/i18n/eu';
import { fr } from '../../src/i18n/fr';
import { de } from '../../src/i18n/de';
import { pt } from '../../src/i18n/pt';
import { it as itLocale } from '../../src/i18n/it';

const ALL: Record<string, Language> = { en, es, ca, gl, eu, fr, de, pt, it: itLocale };
const EN = en as Record<string, unknown>;

/** Parameter names per function key, read from the English source (the template). */
function functionParams(): Map<string, string[]> {
  // vitest runs with cwd = FinlyApp/ (see package.json scripts).
  const source = readFileSync(path.join(process.cwd(), 'src', 'i18n', 'en.ts'), 'utf8');
  const params = new Map<string, string[]>();
  const re = /^\s{2}([A-Za-z0-9_]+):\s*\(([^)]*)\)\s*=>/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    params.set(match[1], match[2].split(',').map(p => p.trim().split(':')[0].trim()).filter(Boolean));
  }
  return params;
}

/** A plausible value for a parameter, by its name. */
function argFor(param: string): string | number {
  if (param.includes('date') || param === 'from') return '2026-10-19';
  if (param === 'name') return 'Test';
  if (param === 'month') return 'October';
  if (param === 'months') return 'Jan, Feb';
  if (param === 'weekday') return 'Monday';
  return 3;
}

const PARAMS = functionParams();

describe('i18n function keys render', () => {
  it('covers every function key of the template', () => {
    const functionKeys = Object.entries(EN).filter(([, value]) => typeof value === 'function').map(([key]) => key);
    expect(functionKeys.length).toBeGreaterThan(0);
    expect(functionKeys.filter(key => !PARAMS.has(key))).toEqual([]);
  });

  it.each(Object.entries(ALL))(
    '"%s" renders every function key without leftover placeholders',
    (_code, translations) => {
      const dict = translations as unknown as Record<string, unknown>;

      for (const [key, params] of PARAMS) {
        const fn = dict[key];
        expect(typeof fn, `${key} should be a function`).toBe('function');

        const rendered = (fn as (...args: (string | number)[]) => string)(...params.map(argFor));

        expect(typeof rendered, `${key} should render a string`).toBe('string');
        expect(rendered.trim().length, `${key} should not be empty`).toBeGreaterThan(0);
        expect(rendered, `${key} left a placeholder`).not.toMatch(/[{}]/);
        expect(rendered, `${key} rendered a missing value`).not.toMatch(/undefined|NaN|\[object/);
      }
    },
  );
});
