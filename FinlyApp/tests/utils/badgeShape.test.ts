import { describe, it, expect } from 'vitest';
import { badgeShapeFor } from '../../src/utils/badgeShape';
import { BADGE_SHAPES, CONFIG_ICON_SHAPES } from '../../src/constants/types';

describe('badgeShapeFor', () => {
  it('returns the circle badge shape for a circle account icon shape', () => {
    expect(badgeShapeFor({ accountIconShape: CONFIG_ICON_SHAPES.circle, categoryIconShape: CONFIG_ICON_SHAPES.square }, 'account')).toBe(BADGE_SHAPES.circle);
  });

  it('returns the rounded badge shape for a square account icon shape', () => {
    expect(badgeShapeFor({ accountIconShape: CONFIG_ICON_SHAPES.square, categoryIconShape: CONFIG_ICON_SHAPES.circle }, 'account')).toBe(BADGE_SHAPES.rounded);
  });

  it('returns the circle badge shape for a circle category icon shape', () => {
    expect(badgeShapeFor({ accountIconShape: CONFIG_ICON_SHAPES.square, categoryIconShape: CONFIG_ICON_SHAPES.circle }, 'category')).toBe(BADGE_SHAPES.circle);
  });

  it('returns the rounded badge shape for a square category icon shape', () => {
    expect(badgeShapeFor({ accountIconShape: CONFIG_ICON_SHAPES.circle, categoryIconShape: CONFIG_ICON_SHAPES.square }, 'category')).toBe(BADGE_SHAPES.rounded);
  });
});