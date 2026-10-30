import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryTile from '../../src/components/CategoryTile';
import { BADGE_SHAPES } from '../../src/constants/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.assign(out, value);
  };
  walk(style);
  return out;
}

describe('CategoryTile', () => {
  it('exposes the tile as a button with its selected state', async () => {
    const view = await render(
      <CategoryTile icon="cart" color="#22D3EE" shape={BADGE_SHAPES.rounded} label="Groceries" selected onPress={() => {}} />,
    );

    const tile = view.getByRole('button', { name: 'Groceries' });
    expect(tile.props.accessibilityState).toEqual({ selected: true });
  });

  it('reserves enough height and border for the label without clipping', async () => {
    const view = await render(
      <CategoryTile icon="cart" color="#22D3EE" shape={BADGE_SHAPES.rounded} label="Groceries" onPress={() => {}} />,
    );

    const tile = flattenStyle(view.getByRole('button', { name: 'Groceries' }).props.style);
    expect(tile.minHeight).toBe(80);
    expect(tile.aspectRatio).toBeUndefined();
    expect(tile.borderWidth).toBe(2);
  });

  it('calls onPress when tapped', async () => {
    const onPress = vi.fn();
    const view = await render(
      <CategoryTile icon="cart" color="#22D3EE" shape={BADGE_SHAPES.rounded} label="Groceries" onPress={onPress} />,
    );

    await fireEvent.press(view.getByRole('button', { name: 'Groceries' }));
    expect(onPress).toHaveBeenCalled();
  });
});
