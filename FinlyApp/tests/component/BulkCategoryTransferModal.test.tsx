import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import BulkCategoryTransferModal from '../../src/components/BulkCategoryTransferModal';
import type { BulkCategoryItem } from '../../src/hooks/useCategoryBulkDelete';
import { t } from '../../src/i18n';
import type { Category } from '../../src/database/types';

const food: Category = { id: 7, user_id: 1, name: 'Food', icon: 'fast-food', color: '#F87171', type: 'expense', created_at: '' } as Category;
const travel: Category = { id: 8, user_id: 1, name: 'Travel', icon: 'airplane', color: '#22D3EE', type: 'expense', created_at: '' } as Category;
const home: Category = { id: 9, user_id: 1, name: 'Home', icon: 'home', color: '#34D399', type: 'expense', created_at: '' } as Category;
const work: Category = { id: 10, user_id: 1, name: 'Work', icon: 'briefcase', color: '#A78BFA', type: 'expense', created_at: '' } as Category;

const items: BulkCategoryItem[] = [
  { category: food, txCount: 2, ruleCount: 1 },
  { category: travel, txCount: 0, ruleCount: 0 },
];

const labels = t();

async function renderBulk(
  overrides: Partial<{
    decisions: Record<number, number | 'delete' | null>;
    categories: BulkCategoryItem[];
  }> = {},
) {
  const onDecide = vi.fn();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const view = await render(
    <BulkCategoryTransferModal
      visible
      categories={items}
      targets={[home, work]}
      decisions={{}}
      onDecide={onDecide}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { view, onDecide, onConfirm, onCancel };
}

function rerenderWithDecisions(
  view: Awaited<ReturnType<typeof render>>,
  decisions: Record<number, number | 'delete' | null>,
  onConfirm: () => void,
) {
  return view.rerender(
    <BulkCategoryTransferModal
      visible
      categories={items}
      targets={[home, work]}
      decisions={decisions}
      onDecide={vi.fn()}
      onConfirm={onConfirm}
      onCancel={vi.fn()}
    />,
  );
}

describe('BulkCategoryTransferModal', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('lists every category with its data and no decision yet', async () => {
    const { view } = await renderBulk();

    expect(view.getByText(labels.categories_bulk_move_title, { exact: false })).toBeTruthy();
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.getByText(labels.categories_bulk_move_data(2, 1))).toBeTruthy();
    // A category without data has no subtitle at all.
    expect(view.getByText('Travel')).toBeTruthy();
    expect(view.getAllByText(labels.categories_bulk_move_choose)).toHaveLength(2);
    expect(view.getByText(labels.categories_bulk_move_confirm)).toBeDisabled();
  });

  it('opens the target picker and reports the chosen category', async () => {
    const { view, onDecide } = await renderBulk();

    await fireEvent.press(view.getByText('Food'));
    expect(view.getByText(labels.categories_bulk_move_title, { exact: false })).toBeTruthy();
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.getByText(labels.categories_bulk_move_data(2, 1))).toBeTruthy();

    await fireEvent.press(view.getByText('Home'));
    expect(onDecide).toHaveBeenCalledWith(7, 9);
  });

  it('reports the delete option through the picker', async () => {
    const { view, onDecide } = await renderBulk();

    await fireEvent.press(view.getByText('Travel'));
    await fireEvent.press(view.getByText(labels.categories_bulk_move_delete_option));

    expect(onDecide).toHaveBeenCalledWith(8, 'delete');
  });

  it('enables Confirm only once every category is resolved', async () => {
    const onConfirm = vi.fn();
    const { view, onConfirm: firstConfirm } = await renderBulk();

    await rerenderWithDecisions(view, { 7: 9 }, firstConfirm);
    expect(view.getByText(labels.categories_bulk_move_confirm)).toBeDisabled();

    await rerenderWithDecisions(view, { 7: 9, 8: 'delete' }, onConfirm);
    expect(view.getByText(labels.categories_bulk_move_confirm)).not.toBeDisabled();

    await fireEvent.press(view.getByText(labels.categories_bulk_move_confirm));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels', async () => {
    const { view, onCancel } = await renderBulk();

    await fireEvent.press(view.getByText(labels.cancel));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
