import { describe, it, expect, vi, afterEach } from 'vitest';

async function loadPlatform(os: string) {
  vi.resetModules();
  vi.doMock('react-native', () => ({
    Platform: {
      OS: os,
      select: (obj: Record<string, unknown>) => obj[os],
    },
  }));
  return import('../../src/utils/platform');
}

describe('platform helpers', () => {
  afterEach(() => {
    vi.doUnmock('react-native');
    vi.resetModules();
  });

  it('detects web as the web platform', async () => {
    const { isWeb, isNative } = await loadPlatform('web');
    expect(isWeb).toBe(true);
    expect(isNative).toBe(false);
  });

  it('detects ios as native', async () => {
    const { isWeb, isNative } = await loadPlatform('ios');
    expect(isWeb).toBe(false);
    expect(isNative).toBe(true);
  });

  it('detects android as native', async () => {
    const { isWeb, isNative } = await loadPlatform('android');
    expect(isWeb).toBe(false);
    expect(isNative).toBe(true);
  });
});