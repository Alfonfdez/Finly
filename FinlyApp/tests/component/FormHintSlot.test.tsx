import { describe, it, expect, beforeEach } from 'vitest';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import FormHintSlot from '../../src/components/form/FormHintSlot';
import { TEST_IDS } from '../../src/constants/testIds';

function slotMinHeight(view: unknown): number | undefined {
  const queries = view as { getByTestId: (id: string) => { props: { style: unknown } } };
  const style = StyleSheet.flatten(queries.getByTestId(TEST_IDS.formHintSlot).props.style) as { minHeight?: number };
  return style.minHeight;
}

describe('FormHintSlot', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the message in red', async () => {
    const view = await render(<FormHintSlot message="Select a category" />);

    const text = view.getByText('Select a category');
    expect(StyleSheet.flatten(text.props.style).color).toBe('#F87171');
  });

  it('renders nothing for an empty message', async () => {
    const view = await render(<FormHintSlot message="" />);

    expect(view.queryByText(/./)).toBeNull();
  });

  it('reserves room so the buttons never move, even with no message', async () => {
    const empty = await render(<FormHintSlot message={null} />);
    const filled = await render(<FormHintSlot message="Enter a name" />);

    const reserved = slotMinHeight(empty);
    expect(reserved).toBeGreaterThan(0);
    expect(slotMinHeight(filled)).toBe(reserved);
  });

  it('does not reserve room when asked not to', async () => {
    const view = await render(<FormHintSlot message="" reserve={false} />);

    expect(slotMinHeight(view)).toBeUndefined();
  });

  it('scales the reserved room with the text size', async () => {
    const normal = await render(<FormHintSlot message="" />);
    const normalHeight = slotMinHeight(normal);

    setConfig({ textSize: 'large' });
    const large = await render(<FormHintSlot message="" />);

    expect(slotMinHeight(large)).toBeGreaterThan(normalHeight as number);
  });
});
