import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { TAB_LOCK_STATUS, useWebTabLock } from '../../src/hooks/useWebTabLock';

vi.mock('../../src/utils/platform', () => ({
  isWeb: true,
  isNative: false,
  isIOS: false,
  isAndroid: false,
  isAndroidPlatform: () => false,
}));

type LockCallback = (lock: unknown) => Promise<void>;

const request = vi.fn((_name: string, _options: unknown, callback: LockCallback) => {
  void callback({});
  return Promise.resolve();
});

describe('useWebTabLock', () => {
  beforeEach(() => {
    request.mockClear();
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('acquires the single-writer lock', async () => {
    const { result, unmount } = await renderHook(() => useWebTabLock());
    await waitFor(() => expect(result.current.status).toBe(TAB_LOCK_STATUS.acquired));

    expect(request).toHaveBeenCalledWith('finly-db', { ifAvailable: true }, expect.any(Function));
    unmount();
  });

  it('blocks a second tab when the lock is unavailable', async () => {
    request.mockImplementationOnce(async (_name, _options, callback) => {
      await callback(null);
    });
    const { result } = await renderHook(() => useWebTabLock());

    await waitFor(() => expect(result.current.status).toBe(TAB_LOCK_STATUS.blocked));
  });

  it('reports a failed lock request and can retry', async () => {
    request
      .mockImplementationOnce(() => Promise.reject(new Error('denied')))
      .mockImplementationOnce((_name, _options, callback) => {
        void callback({});
        return Promise.resolve();
      });
    const { result, unmount } = await renderHook(() => useWebTabLock());
    await waitFor(() => expect(result.current.status).toBe(TAB_LOCK_STATUS.failed));

    await act(async () => { await result.current.retry(); });
    await waitFor(() => expect(result.current.status).toBe(TAB_LOCK_STATUS.acquired));
    unmount();
  });

  it('can retry after the other tab releases the lock', async () => {
    request
      .mockImplementationOnce(async (_name, _options, callback) => {
        await callback(null);
      })
      .mockImplementationOnce((_name, _options, callback) => {
        void callback({});
        return Promise.resolve();
      });
    const { result, unmount } = await renderHook(() => useWebTabLock());
    await waitFor(() => expect(result.current.status).toBe(TAB_LOCK_STATUS.blocked));

    await act(async () => { await result.current.retry(); });
    await waitFor(() => expect(result.current.status).toBe(TAB_LOCK_STATUS.acquired));
    unmount();
  });
});
