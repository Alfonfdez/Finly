import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAlert = vi.fn();

vi.mock('react-native', () => ({
  Alert: {
    alert: (...args: unknown[]) => mockAlert(...args),
  },
  Platform: { OS: 'ios' },
}));

import { alertError, describeError, showErrorAlert, runWithErrorAlert, ERROR_PREFIXES } from '../../src/utils/errors';
import { t } from '../../src/i18n';

describe('errors helpers', () => {
  beforeEach(() => {
    mockAlert.mockClear();
  });

  describe('showErrorAlert', () => {
    it('shows the alert with the default labels from the active language', () => {
      showErrorAlert();
      expect(mockAlert).toHaveBeenCalledWith(t().error_title, t().error_generic);
    });

    it('shows the alert with the provided labels', () => {
      showErrorAlert({ error_title: 'TITLE', error_generic: 'GENERIC' });
      expect(mockAlert).toHaveBeenCalledWith('TITLE', 'GENERIC');
    });
  });

  describe('alertError', () => {
    it('shows the alert with the given title and message', () => {
      alertError('TITLE', 'MESSAGE');
      expect(mockAlert).toHaveBeenCalledWith('TITLE', 'MESSAGE');
    });

    it('logs the error to the console', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      alertError('TITLE', 'MESSAGE');
      expect(spy).toHaveBeenCalledWith('TITLE: MESSAGE');
      spy.mockRestore();
    });
  });

  describe('describeError', () => {
    it('returns the message for a plain Error', () => {
      expect(describeError(new Error('boom'))).toBe('boom');
    });

    it('appends the underlying cause message', () => {
      const err = new Error('Failed query', { cause: new Error('no such column: name') });
      expect(describeError(err)).toBe('Failed query → no such column: name');
    });

    it('stringifies a non-Error value', () => {
      expect(describeError('nope')).toBe('nope');
    });
  });

  describe('runWithErrorAlert', () => {
    it('returns the resolved value on success', async () => {
      const result = await runWithErrorAlert(async () => 42, 'prefix');
      expect(result).toBe(42);
      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('logs the error with the prefix, shows the alert and returns undefined on failure', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('boom');
      const result = await runWithErrorAlert(async () => { throw err; }, 'prefix', { error_title: 'T', error_generic: 'G' });
      expect(result).toBeUndefined();
      expect(spy).toHaveBeenCalledWith('prefix:', err);
      expect(mockAlert).toHaveBeenCalledWith('T', 'G');
      spy.mockRestore();
    });
  });

  describe('ERROR_PREFIXES', () => {
    it('defines a prefix for every destructive write action', () => {
      expect(Object.keys(ERROR_PREFIXES)).toEqual([
        'accountCreate',
        'accountUpdate',
        'accountDelete',
        'accountsDelete',
        'categoryCreate',
        'categoryUpdate',
        'categoryDelete',
        'categoriesDelete',
        'tagCreate',
        'tagUpdate',
        'tagDelete',
        'tagsDelete',
        'commentUpdate',
        'commentDelete',
        'commentsDelete',
        'transactionsDelete',
        'recurringDelete',
      ]);
    });
  });
});