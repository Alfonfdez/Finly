import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryTile from '../../src/components/CategoryTile';
import { BADGE_SHAPES } from '../../src/constants/types';

describe('CategoryTile', () => {
  it('exposes the tile as a button with its selected state', async () => {
    const view = await render(
      <CategoryTile icon="cart" color="#22D3EE" shape={BADGE_SHAPES.rounded} label="Groceries" selected onPress={() => {}} />,
    );

    const tile = view.getByRole('button', { name: 'Groceries' });
    expect(tile.props.accessibilityState).toEqual({ selected: true });
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
