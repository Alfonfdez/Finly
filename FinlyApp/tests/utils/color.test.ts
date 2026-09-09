import { describe, it, expect } from 'vitest';
import { withAlpha } from '../../src/utils/color';

describe('withAlpha', () => {
  it('appends the alpha channel for a percentage', () => {
    expect(withAlpha('#22D3EE', 50)).toBe('#22D3EE80');
  });

  it('handles 0% and 100%', () => {
    expect(withAlpha('#22D3EE', 0)).toBe('#22D3EE00');
    expect(withAlpha('#22D3EE', 100)).toBe('#22D3EEff');
  });

  it('clamps values above 100 and below 0', () => {
    expect(withAlpha('#22D3EE', 200)).toBe('#22D3EEff');
    expect(withAlpha('#22D3EE', -10)).toBe('#22D3EE00');
  });

  it('rounds fractional percentages to the nearest hex value', () => {
    expect(withAlpha('#FFFFFF', 37.5)).toBe('#FFFFFF60');
  });
});
