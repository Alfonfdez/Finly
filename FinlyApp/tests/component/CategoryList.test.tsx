import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import CategoryList from '../../src/components/CategoryList';
import { UNTAGGED_ID, type CategoryWithTotal } from '../../src/constants/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.assign(out, value);
  };
  walk(style);
  return out;
}

const category: CategoryWithTotal = {
  id: 1,
  name: 'Food',
  icon: 'cart',
  color: '#F87171',
  type: 'expense',
  total: 100,
  percentage: 100,
};

describe('CategoryList', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders normal tags in the primary color and Untagged in the secondary color', async () => {
    const tagBreakdowns = new Map([
      [1, [
        { tag_id: 7, name: 'lunch', total: 20 },
        { tag_id: UNTAGGED_ID, name: 'ignored', total: 5 },
      ]],
    ]);
    const view = await render(
      <CategoryList
        categories={[category]}
        tagBreakdowns={tagBreakdowns}
        expandedCategoryIds={new Set([1])}
        onToggleExpand={vi.fn()}
      />,
    );

    expect(flattenStyle(view.getByText('lunch').props.style).color).toBe('#22D3EE');
    expect(flattenStyle(view.getByText('Untagged').props.style).color).toBe('#94A3B8');
  });
});
