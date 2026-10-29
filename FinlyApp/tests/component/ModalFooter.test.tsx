import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import ModalFooter from '../../src/components/ModalFooter';
import { FOOTER_LAYOUTS } from '../../src/constants/types';
import {
  COMPACT_FOOTER_BUTTON_WIDTH,
  COMPACT_FOOTER_BUTTON_MAX_WIDTH,
} from '../../src/components/componentStyles';

describe('ModalFooter compact layout', () => {
  beforeEach(() => {
    resetStub();
  });

  it('sizes both buttons equally and keeps their actions', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const view = await render(
      <ModalFooter
        layout={FOOTER_LAYOUTS.compact}
        cancelLabel="Cancel"
        confirmLabel="Hinzufügen"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const cancel = view.getByRole('button', { name: 'Cancel' });
    const confirm = view.getByRole('button', { name: 'Hinzufügen' });
    const cancelStyle = StyleSheet.flatten(cancel.props.style);
    const confirmStyle = StyleSheet.flatten(confirm.props.style);

    for (const style of [cancelStyle, confirmStyle]) {
      expect(style.flexGrow).toBe(0);
      expect(style.flexShrink).toBe(1);
      expect(style.flexBasis).toBe(COMPACT_FOOTER_BUTTON_WIDTH);
      expect(style.maxWidth).toBe(COMPACT_FOOTER_BUTTON_MAX_WIDTH);
      expect(style.paddingVertical).toBe(12);
    }

    await fireEvent.press(cancel);
    await fireEvent.press(confirm);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
