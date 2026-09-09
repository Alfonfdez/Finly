import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useFontSize } from '../../src/hooks/useFontSize';
import { setConfig, resetStub } from '../component/helpers/configStub';

describe('useFontSize', () => {
  afterEach(() => {
    resetStub();
  });

  it('returns the base size for medium text', async () => {
    setConfig({ textSize: 'medium' });
    const { result } = await renderHook(() => useFontSize());
    expect(result.current(16)).toBe(16);
    expect(result.current(13)).toBe(13);
  });

  it('downscales for small text', async () => {
    setConfig({ textSize: 'small' });
    const { result } = await renderHook(() => useFontSize());
    expect(result.current(16)).toBe(14);
    expect(result.current(14)).toBe(12);
  });

  it('upscales for large text', async () => {
    setConfig({ textSize: 'large' });
    const { result } = await renderHook(() => useFontSize());
    expect(result.current(16)).toBe(18);
    expect(result.current(20)).toBe(23);
  });
});
