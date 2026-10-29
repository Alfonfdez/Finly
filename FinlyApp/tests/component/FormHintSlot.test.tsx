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
    expect(text.props.accessibilityLiveRegion).toBe('polite');
    expect(text.props.accessibilityRole).toBe('alert');
    expect(view.getByTestId(TEST_IDS.formHintSlot)).toBeTruthy();
  });

  it('renders nothing for an empty message', async () => {
    const view = await render(<FormHintSlot message="" />);

    expect(view.queryByText(/./)).toBeNull();
  });

  it('always reserves room so the buttons never move, even with no message', async () => {
    const empty = await render(<FormHintSlot message={null} />);
    const filled = await render(<FormHintSlot message="Enter a name" />);

    const reserved = slotMinHeight(empty);
    expect(reserved).toBeGreaterThan(0);
    expect(slotMinHeight(filled)).toBe(reserved);
  });

  it('renders the muted tone (delete explanation) in secondary color', async () => {
    const view = await render(<FormHintSlot tone="muted" message="Last account" />);

    const text = view.getByText('Last account');
    expect(StyleSheet.flatten(text.props.style).color).toBe('#94A3B8');
    expect(view.getByTestId(TEST_IDS.formMutedSlot)).toBeTruthy();
  });

  it('reserves the muted tone too, with no message', async () => {
    const view = await render(<FormHintSlot tone="muted" message={null} />);

    const queries = view as unknown as { getByTestId: (id: string) => { props: { style: unknown } } };
    const style = StyleSheet.flatten(queries.getByTestId(TEST_IDS.formMutedSlot).props.style) as { minHeight?: number };
    expect(style.minHeight).toBeGreaterThan(0);
    expect(view.queryByText(/./)).toBeNull();
  });

  it('scales the reserved room with the text size', async () => {
    const normal = await render(<FormHintSlot message="" />);
    const normalHeight = slotMinHeight(normal);

    setConfig({ textSize: 'large' });
    const large = await render(<FormHintSlot message="" />);

    expect(slotMinHeight(large)).toBeGreaterThan(normalHeight as number);
  });
});
