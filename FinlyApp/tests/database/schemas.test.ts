import { describe, it, expect } from 'vitest';

import {
  accountSchema,
  categorySchema,
  configSchema,
  tagSchema,
  transactionSchema,
  transactionTagSchema,
  userSchema,
} from '../../src/database/schemas';
import { DEFAULT_CONFIG, sanitizeConfig } from '../../src/database/configDefaults';
import type { Config } from '../../src/database/types';

const validUser = { id: 1, name: 'User', email: null, avatar: null, currency: '€', created_at: '2026-01-01 00:00:00' };
const validAccount = { id: 1, user_id: 1, name: 'My Wallet', initial_balance: 0, icon: 'wallet-outline', color: '#22D3EE', description: '', is_total: 0, created_at: '2026-01-01 00:00:00' };
const validCategory = { id: 1, user_id: 1, name: 'Salary', icon: 'briefcase-outline', color: '#22D3EE', type: 'income', created_at: '2026-01-01 00:00:00' };
const validTransaction = { id: 1, account_id: 1, category_id: 1, type: 'expense', amount: 10, description: null, photo: null, date: '2026-01-01', created_at: '2026-01-01 00:00:00', updated_at: null };
const validTag = { id: 1, user_id: 1, name: 'Work', created_at: '2026-01-01 00:00:00' };
const validTransactionTag = { transaction_id: 1, tag_id: 2 };

describe('database schemas', () => {
  it('accepts valid rows', () => {
    expect(userSchema.parse(validUser)).toEqual(validUser);
    expect(accountSchema.parse(validAccount)).toEqual(validAccount);
    expect(categorySchema.parse(validCategory)).toEqual(validCategory);
    expect(transactionSchema.parse(validTransaction)).toEqual(validTransaction);
    expect(tagSchema.parse(validTag)).toEqual(validTag);
    expect(transactionTagSchema.parse(validTransactionTag)).toEqual(validTransactionTag);
  });

  it('accepts accounts without the optional description/is_total fields', () => {
    const { description: _d, is_total: _i, ...minimal } = validAccount;
    expect(accountSchema.parse(minimal)).toEqual(minimal);
  });

  it('rejects an invalid category type', () => {
    expect(() => categorySchema.parse({ ...validCategory, type: 'other' })).toThrow();
  });

  it('rejects an invalid transaction type', () => {
    expect(() => transactionSchema.parse({ ...validTransaction, type: 'transfer' })).toThrow();
  });

  it('rejects zero or negative transaction amounts', () => {
    expect(() => transactionSchema.parse({ ...validTransaction, amount: 0 })).toThrow();
    expect(() => transactionSchema.parse({ ...validTransaction, amount: -5 })).toThrow();
  });

  it('rejects non-integer ids and foreign keys', () => {
    expect(() => transactionSchema.parse({ ...validTransaction, id: 1.5 })).toThrow();
    expect(() => transactionTagSchema.parse({ ...validTransactionTag, tag_id: 2.5 })).toThrow();
  });

  it('rejects rows missing required fields', () => {
    const { name: _n, ...noName } = validUser;
    expect(() => userSchema.parse(noName)).toThrow();
    const { id: _i, ...noId } = validTag;
    expect(() => tagSchema.parse(noId)).toThrow();
  });
});

describe('config schema + sanitizeConfig', () => {
  it('accepts DEFAULT_CONFIG', () => {
    expect(configSchema.parse(DEFAULT_CONFIG)).toEqual(DEFAULT_CONFIG);
  });

  it('accepts a fully custom config and preserves values', () => {
    const custom = { ...DEFAULT_CONFIG, theme: 'light', language: 'ca', decimalSeparator: '.', homeDefaultAccountId: 3 };
    const parsed = configSchema.parse(custom);
    expect(parsed).toMatchObject({ theme: 'light', language: 'ca', decimalSeparator: '.', homeDefaultAccountId: 3 });
  });

  it('sanitizeConfig passes a valid config through unchanged', () => {
    const custom = { ...DEFAULT_CONFIG, theme: 'light', hideBalances: true } as Config;
    expect(sanitizeConfig(custom)).toEqual(custom);
  });

  it('sanitizeConfig falls back to defaults on corrupt values', () => {
    const corruptTheme = { ...DEFAULT_CONFIG, theme: 'neon' } as unknown as Config;
    expect(sanitizeConfig(corruptTheme)).toEqual(DEFAULT_CONFIG);

    const corruptDay = { ...DEFAULT_CONFIG, firstDayOfWeek: 5 } as unknown as Config;
    expect(sanitizeConfig(corruptDay)).toEqual(DEFAULT_CONFIG);

    const corruptBoolean = { ...DEFAULT_CONFIG, addShowLabels: 'yes' } as unknown as Config;
    expect(sanitizeConfig(corruptBoolean)).toEqual(DEFAULT_CONFIG);

    const corruptAccountId = { ...DEFAULT_CONFIG, homeDefaultAccountId: -3 } as unknown as Config;
    expect(sanitizeConfig(corruptAccountId)).toEqual(DEFAULT_CONFIG);
  });
});
