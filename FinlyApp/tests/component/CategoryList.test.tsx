import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import CategoryList from '../../src/components/CategoryList';
import { UNTAGGED_ID, type CategoryWithTotal } from '../../src/constants/types';
import { formatAmount, HIDDEN_BALANCE } from '../../src/utils/formatters';

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

  it('shows the mask instead of each category total when hidden', async () => {
    const view = await render(<CategoryList categories={[category]} hidden />);
    expect(view.getByText(HIDDEN_BALANCE)).toBeTruthy();
    expect(flattenStyle(view.getByText(HIDDEN_BALANCE).props.style).color).toBe('#94A3B8');
    // The category name and its percentage stay visible: only the money is masked.
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.getByText('100.0%')).toBeTruthy();
  });

  it('keeps the normal total color when visible', async () => {
    const view = await render(<CategoryList categories={[category]} />);
    expect(flattenStyle(view.getByText(formatAmount(100, { currency: '€', decimalSeparator: ',' })).props.style).color).toBe('#E2E8F0');
  });

  it('re-renders the rows when the setting toggles', async () => {
    const view = await render(<CategoryList categories={[category]} hidden={false} />);
    expect(view.queryByText(HIDDEN_BALANCE)).toBeNull();

    await view.rerender(<CategoryList categories={[category]} hidden />);
    expect(flattenStyle(view.getByText(HIDDEN_BALANCE).props.style).color).toBe('#94A3B8');

    await view.rerender(<CategoryList categories={[category]} hidden={false} />);
    expect(view.queryByText(HIDDEN_BALANCE)).toBeNull();
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
