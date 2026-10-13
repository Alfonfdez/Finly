import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// `react-native-web`'s Alert is a no-op, so `isWeb` must be true for this file.
const mockAlert = vi.fn();
const mockWindowAlert = vi.fn();

vi.mock('react-native', () => ({
  Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
  Platform: { OS: 'web' },
}));

import { alertError, alertInfo } from '../../src/utils/errors';

describe('errors helpers (web fallback)', () => {
  beforeEach(() => {
    mockAlert.mockClear();
    mockWindowAlert.mockClear();
    vi.stubGlobal('window', { alert: mockWindowAlert });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('alertInfo uses window.alert', () => {
    alertInfo('TITLE', 'MESSAGE');
    expect(mockWindowAlert).toHaveBeenCalledWith('TITLE\n\nMESSAGE');
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('alertError uses window.alert and logs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    alertError('TITLE', 'MESSAGE');
    expect(mockWindowAlert).toHaveBeenCalledWith('TITLE\n\nMESSAGE');
    expect(mockAlert).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('TITLE: MESSAGE');
  });
});
