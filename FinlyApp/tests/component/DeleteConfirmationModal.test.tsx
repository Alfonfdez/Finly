import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import DeleteConfirmationModal from '../../src/components/DeleteConfirmationModal';
import { resetStub } from './helpers/configStub';

describe('DeleteConfirmationModal', () => {
  beforeEach(() => {
    resetStub();
  });

  it('uses the standard trash icon and Cancel/Delete labels', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const view = await render(
      <DeleteConfirmationModal
        visible
        title="Delete item?"
        message="This cannot be undone."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(view.getByText('trash-outline', { includeHiddenElements: true })).toBeTruthy();
    expect(view.getByText('Delete item?', { exact: false })).toBeTruthy();
    expect(view.getByText('This cannot be undone.')).toBeTruthy();

    await fireEvent.press(view.getByText('Cancel'));
    await fireEvent.press(view.getByText('Delete'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('allows action-specific labels', async () => {
    const view = await render(
      <DeleteConfirmationModal
        visible
        title="Delete category?"
        confirmLabel="Permanent delete"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(view.getByText('Permanent delete')).toBeTruthy();
    expect(view.getByText('Cancel')).toBeTruthy();
  });
});
