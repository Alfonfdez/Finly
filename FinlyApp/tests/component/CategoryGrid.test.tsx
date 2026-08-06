import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import CategoryGrid from '../../src/components/CategoryGrid';
import type { Category } from '../../src/database/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === 'object') {
      Object.assign(out, value);
    }
  };
  walk(style);
  return out;
}

const categories: Category[] = [
  { id: 101, user_id: 1, name: 'Groceries', icon: 'cart', color: '#22D3EE', type: 'expense', created_at: '2026-01-01' },
  { id: 102, user_id: 1, name: 'Salary', icon: 'wallet', color: '#34D399', type: 'income', created_at: '2026-01-01' },
];

describe('CategoryGrid', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the title and every category name', async () => {
    const view = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={() => {}} />);

    expect(view.getByText('Categories')).toBeTruthy();
    expect(view.getByText('Groceries')).toBeTruthy();
    expect(view.getByText('Salary')).toBeTruthy();
  });

  it('can hide the title', async () => {
    const view = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={() => {}} hideTitle />);

    expect(view.queryByText('Categories')).toBeNull();
  });

  it('highlights the selected category tile', async () => {
    const view = await render(<CategoryGrid categories={categories} selectedCategory={101} onSelect={() => {}} onAddMore={() => {}} />);

    const tile = flattenStyle(view.getByText('Groceries').parent?.props.style);
    expect(tile.backgroundColor).toBe('#22D3EE33');
    expect(tile.borderColor).toBe('#22D3EE');
    expect(tile.borderWidth).toBe(2);
  });

  it('keeps unselected tiles on the surface color', async () => {
    const view = await render(<CategoryGrid categories={categories} selectedCategory={101} onSelect={() => {}} onAddMore={() => {}} />);

    const tile = flattenStyle(view.getByText('Salary').parent?.props.style);
    expect(tile.backgroundColor).toBe('#1E293B');
  });

  it('renders a dashed add-more tile with the default label', async () => {
    const view = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={() => {}} />);

    const tile = flattenStyle(view.getByText('More').parent?.props.style);
    expect(tile.borderStyle).toBe('dashed');
    expect(tile.borderWidth).toBe(1.5);
  });

  it('supports a custom add-more label and hides the tile when disabled', async () => {
    const withLabel = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={() => {}} addMoreLabel="Create new" />);
    expect(withLabel.getByText('Create new')).toBeTruthy();

    const without = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={() => {}} showAddMore={false} />);
    expect(without.queryByText('More')).toBeNull();
  });

  it('fires onSelect with the category id when a tile is pressed', async () => {
    const onSelect = vi.fn();
    const view = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={onSelect} onAddMore={() => {}} />);

    await fireEvent.press(view.getByText('Groceries'));
    expect(onSelect).toHaveBeenCalledWith(101);
  });

  it('fires onAddMore when the add-more tile is pressed', async () => {
    const onAddMore = vi.fn();
    const view = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={onAddMore} />);

    await fireEvent.press(view.getByText('More'));
    expect(onAddMore).toHaveBeenCalledTimes(1);
  });

  it('exposes an accessible label per category tile', async () => {
    const view = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={() => {}} />);

    expect(view.getByLabelText('Category Groceries')).toBeTruthy();
  });

  it('renders category badges with the category color', async () => {
    const view = await render(<CategoryGrid categories={categories} selectedCategory={null} onSelect={() => {}} onAddMore={() => {}} />);

    const cart = view.root!.queryAll((i) => i.type === 'RCTText' && i.children[0] === 'cart')[0];
    expect(cart.props.size).toBe(24);
    expect(cart.props.color).toBe('#22D3EE');
  });
});
