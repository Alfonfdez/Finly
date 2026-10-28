import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBackup, assertImportableBackup } from '../../src/database/backup';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(here, '..', '..', 'scripts', 'upgrade', 'fixture-2.1.0.json');
const raw = JSON.parse(readFileSync(fixturePath, 'utf8'));
const fixture = parseBackup(readFileSync(fixturePath, 'utf8'));

const V2_1_0_CONFIG_KEYS = [
  'theme',
  'first_day_of_week',
  'currency',
  'decimal_separator',
  'language',
  'text_size',
  'category_icon_shape',
  'account_icon_shape',
  'home_default_account_id',
  'home_default_period',
  'add_default_account_id',
  'add_show_labels',
  'add_show_comments',
  'add_show_photo',
  'hide_balances',
].sort();

describe('2.1.0 upgrade fixture', () => {
  it('is a schema-3 backup with no recurring data', () => {
    expect(fixture.schema).toBe(3);
    expect(raw.data).not.toHaveProperty('recurring_rules');
    expect(raw.data).not.toHaveProperty('recurring_rule_tags');
    expect(fixture.data.recurring_rules).toEqual([]);
    expect(fixture.data.recurring_rule_tags).toEqual([]);
    for (const transaction of raw.data.transactions) {
      expect(transaction).not.toHaveProperty('recurring_rule_id');
      expect(transaction).not.toHaveProperty('recurrence_date');
    }
  });

  it('uses only 2.1.0 config keys', () => {
    expect(fixture.data.config.map(row => row.key).sort()).toEqual(V2_1_0_CONFIG_KEYS);
  });

  it('is importable and has realistic coverage', () => {
    expect(() => assertImportableBackup(fixture)).not.toThrow();
    expect(fixture.data.accounts.length).toBeGreaterThanOrEqual(2);
    expect(fixture.data.categories.length).toBeGreaterThan(0);
    expect(fixture.data.transactions.length).toBeGreaterThanOrEqual(30);
    expect(fixture.data.tags.length).toBeGreaterThan(0);
    expect(fixture.data.transaction_tags.length).toBeGreaterThan(0);
    expect(fixture.data.transactions.some(transaction => transaction.photo != null)).toBe(true);
    expect(new Set(fixture.data.transactions.map(transaction => transaction.date.slice(0, 7))).size).toBeGreaterThanOrEqual(6);
  });
});
