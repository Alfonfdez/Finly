import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useColorSelection } from '../../src/hooks/useColorSelection';
import { PRIMARY } from '../../src/constants/colors';

const CUSTOM = '#FF8800';

describe('useColorSelection', () => {
  it('starts with no color when no initial color is given', async () => {
    const { result } = await renderHook(() => useColorSelection());
    expect(result.current.selectedColor).toBeNull();
    expect(result.current.customColor).toBeNull();
  });

  it('starts with the initial quick color selected and no custom color', async () => {
    const { result } = await renderHook(() => useColorSelection(PRIMARY));
    expect(result.current.selectedColor).toBe(PRIMARY);
    expect(result.current.customColor).toBeNull();
  });

  it('treats a non-quick initial color as custom', async () => {
    const { result } = await renderHook(() => useColorSelection(CUSTOM));
    expect(result.current.selectedColor).toBe(CUSTOM);
    expect(result.current.customColor).toBe(CUSTOM);
  });

  it('selecting a quick color sets it and leaves the custom color untouched', async () => {
    const { result } = await renderHook(() => useColorSelection(CUSTOM));
    await act(() => result.current.handleColorSelect(PRIMARY));
    expect(result.current.selectedColor).toBe(PRIMARY);
    expect(result.current.customColor).toBe(CUSTOM);
  });

  it('selecting a custom color sets both selected and custom', async () => {
    const { result } = await renderHook(() => useColorSelection());
    await act(() => result.current.handleColorSelect(CUSTOM));
    expect(result.current.selectedColor).toBe(CUSTOM);
    expect(result.current.customColor).toBe(CUSTOM);
  });

  it('exposes setters for selected and custom color', async () => {
    const { result } = await renderHook(() => useColorSelection());
    await act(() => result.current.setSelectedColor(PRIMARY));
    await act(() => result.current.setCustomColor(CUSTOM));
    expect(result.current.selectedColor).toBe(PRIMARY);
    expect(result.current.customColor).toBe(CUSTOM);
  });
});
