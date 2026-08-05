import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import IconBadge from '../../src/components/IconBadge';
import { BADGE_SHAPES } from '../../src/constants/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

describe('IconBadge', () => {
  it('renders the icon inside a sized, tinted badge', async () => {
    const result = await render(
      <IconBadge icon="wallet" color="#22D3EE" shape={BADGE_SHAPES.circle} size={40} iconSize={20} />
    );

    const badge = result.root!;
    expect(badge.type).toBe('RCTView');
    const style = flattenStyle(badge.props.style);
    expect(style.width).toBe(40);
    expect(style.height).toBe(40);
    expect(style.borderRadius).toBe(20);
    expect(style.backgroundColor).toBe('#22D3EE30');

    const icon = result.root!.queryAll((i) => i.type === 'RCTText')[0];
    expect(icon.children).toEqual(['wallet']);
    expect(icon.props.size).toBe(20);
    expect(icon.props.color).toBe('#22D3EE');
  });

  it('uses a rounded corner radius for the square shape', async () => {
    const result = await render(
      <IconBadge icon="home" color="#FFFFFF" shape={BADGE_SHAPES.rounded} size={32} iconSize={16} roundedRadius={8} />
    );

    const badge = result.root!;
    expect(flattenStyle(badge.props.style).borderRadius).toBe(8);
  });
});
