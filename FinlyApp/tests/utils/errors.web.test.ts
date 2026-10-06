import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAlert = vi.fn();
const mockWindowAlert = vi.fn();

vi.mock('react-native', () => ({
  Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
  Platform: { OS: 'web' },
}));

vi.stubGlobal('window', { alert: (...args: unknown[]) => mockWindowAlert(...args) });

import { alertError } from '../../src/utils/errors';

describe('alertError (web)', () => {
  beforeEach(() => {
    mockAlert.mockClear();
    mockWindowAlert.mockClear();
  });

  it('uses window.alert on web (react-native-web Alert is a no-op)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    alertError('TITLE', 'MESSAGE');
    expect(mockWindowAlert).toHaveBeenCalledWith('TITLE\n\nMESSAGE');
    expect(mockAlert).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
