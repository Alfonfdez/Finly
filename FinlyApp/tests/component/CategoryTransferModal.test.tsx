import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import CategoryTransferModal from '../../src/components/CategoryTransferModal';
import { t } from '../../src/i18n';
import type { Category } from '../../src/database/types';

const food: Category = { id: 7, user_id: 1, name: 'Food', icon: 'fast-food', color: '#F87171', type: 'expense', created_at: '' } as Category;
const travel: Category = { id: 8, user_id: 1, name: 'Travel', icon: 'airplane', color: '#22D3EE', type: 'expense', created_at: '' } as Category;

const labels = t();

async function renderModal(overrides: Partial<{
  categories: Category[];
  selectedId: number | 'delete' | null;
  deleteOptionLabel: string | undefined;
}> = {}) {
  const onSelect = vi.fn();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const view = await render(
    <CategoryTransferModal
      visible
      title="Move them to another category"
      categories={[food, travel]}
      selectedId={null}
      confirmLabel="Move"
      cancelLabel="Cancel"
      deleteOptionLabel="Delete them"
      onSelect={onSelect}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { view, onSelect, onConfirm, onCancel };
}

describe('CategoryTransferModal', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('lists the categories and the delete option', async () => {
    const { view } = await renderModal();

    expect(view.getByText('Move them to another category')).toBeTruthy();
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.getByText('Travel')).toBeTruthy();
    expect(view.getByText('Delete them')).toBeTruthy();
  });

  it('reports the tapped category and the delete option', async () => {
    const { view, onSelect } = await renderModal();

    await fireEvent.press(view.getByText('Food'));
    expect(onSelect).toHaveBeenLastCalledWith(7);

    await fireEvent.press(view.getByText('Delete them'));
    expect(onSelect).toHaveBeenLastCalledWith('delete');
  });

  it('keeps Confirm disabled until a target is selected', async () => {
    const { view, onConfirm } = await renderModal();

    expect(view.getByText('Move')).toBeDisabled();

    await view.rerender(
      <CategoryTransferModal
        visible
        title="Move them to another category"
        categories={[food, travel]}
        selectedId={8}
        confirmLabel="Move"
        cancelLabel="Cancel"
        deleteOptionLabel="Delete them"
        onSelect={vi.fn()}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    expect(view.getByText('Move')).not.toBeDisabled();

    await fireEvent.press(view.getByText('Move'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels', async () => {
    const { view, onCancel } = await renderModal();

    await fireEvent.press(view.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state and no delete option when there are no targets', async () => {
    const { view } = await renderModal({ categories: [], deleteOptionLabel: undefined });

    expect(view.getByText(labels.add_cat_no_results)).toBeTruthy();
    expect(view.queryByText('Delete them')).toBeNull();
  });
});
