import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render } from '@testing-library/react-native';
import { Keyboard, Text } from 'react-native';
import ModalShell from '../../src/components/ModalShell';
import { resetStub } from './helpers/configStub';

describe('ModalShell', () => {
  beforeEach(() => {
    resetStub();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dismisses the underlying keyboard when it opens', async () => {
    const dismiss = vi.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    const view = await render(
      <ModalShell visible={false} onClose={() => {}}>
        <Text>Modal content</Text>
      </ModalShell>,
    );
    expect(dismiss).not.toHaveBeenCalled();

    await act(async () => {
      view.rerender(
        <ModalShell visible onClose={() => {}}>
          <Text>Modal content</Text>
        </ModalShell>,
      );
    });
    expect(dismiss).toHaveBeenCalledTimes(1);

    await act(async () => {
      view.rerender(
        <ModalShell visible={false} onClose={() => {}}>
          <Text>Modal content</Text>
        </ModalShell>,
      );
    });
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
