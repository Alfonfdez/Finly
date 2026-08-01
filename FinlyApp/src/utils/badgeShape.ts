import { BADGE_SHAPES, CONFIG_ICON_SHAPES, type BadgeShape, type ConfigIconShape } from '../constants/types';

interface ShapeConfig {
  accountIconShape: ConfigIconShape;
  categoryIconShape: ConfigIconShape;
}

export function badgeShapeFor(config: ShapeConfig, kind: 'account' | 'category'): BadgeShape {
  const shape = kind === 'account' ? config.accountIconShape : config.categoryIconShape;
  return shape === CONFIG_ICON_SHAPES.circle ? BADGE_SHAPES.circle : BADGE_SHAPES.rounded;
}
