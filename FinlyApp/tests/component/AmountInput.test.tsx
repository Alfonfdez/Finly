import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import AmountInput from '../../src/components/AmountInput';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

describe('AmountInput', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the raw amount with comma decimal separator and thousands spaces', async () => {
    const view = await render(<AmountInput raw="1234.56" onChangeRaw={() => {}} />);

    expect(view.getByDisplayValue('1 234,56')).toBeTruthy();
    expect(view.getByText('€')).toBeTruthy();
  });

  it('honours the configured decimal separator', async () => {
    setConfig({ decimalSeparator: '.' });
    const view = await render(<AmountInput raw="1234.56" onChangeRaw={() => {}} />);

    expect(view.getByDisplayValue('1 234.56')).toBeTruthy();
  });

  it('shows the placeholder when empty', async () => {
    const view = await render(<AmountInput raw="" onChangeRaw={() => {}} />);

    expect(view.getByPlaceholderText('0')).toBeTruthy();
  });

  it('shows an error message for an invalid raw amount', async () => {
    const view = await render(<AmountInput raw="abc" onChangeRaw={() => {}} />);

    const error = view.getByText('The amount entered is not valid');
    expect(flattenStyle(error.props.style).color).toBe('#F87171');
    expect(flattenStyle(view.getByPlaceholderText('0').props.style).color).toBe('#F87171');
  });

  it('does not show an error for an empty raw amount', async () => {
    const view = await render(<AmountInput raw="" onChangeRaw={() => {}} />);

    expect(view.queryByText('The amount entered is not valid')).toBeNull();
  });

  it('reports a cleaned raw amount on text change', async () => {
    const onChangeRaw = vi.fn();
    const view = await render(<AmountInput raw="" onChangeRaw={onChangeRaw} />);

    await fireEvent.changeText(view.getByPlaceholderText('0'), '12,50');
    expect(onChangeRaw).toHaveBeenCalledWith('12.50');
  });

  it('ignores input that mixes both decimal separators', async () => {
    const onChangeRaw = vi.fn();
    const view = await render(<AmountInput raw="" onChangeRaw={onChangeRaw} />);

    await fireEvent.changeText(view.getByPlaceholderText('0'), '1,2.3');
    expect(onChangeRaw).not.toHaveBeenCalled();
  });

  it('renders and triggers the calculator button when provided', async () => {
    const onOpenCalculator = vi.fn();
    const view = await render(<AmountInput raw="10" onChangeRaw={() => {}} onOpenCalculator={onOpenCalculator} />);

    await fireEvent.press(view.getByText('calculator-outline'));
    expect(onOpenCalculator).toHaveBeenCalledTimes(1);
  });

  it('omits the calculator button when no handler is passed', async () => {
    const view = await render(<AmountInput raw="10" onChangeRaw={() => {}} />);

    expect(view.queryByText('calculator-outline')).toBeNull();
  });

  it('borders the input with the primary color while focused', async () => {
    const view = await render(<AmountInput raw="10" onChangeRaw={() => {}} />);
    const input = view.getByPlaceholderText('0');

    expect(flattenStyle(input.props.style).borderColor).toBe('transparent');
    await fireEvent(input, 'focus');
    expect(flattenStyle(input.props.style).borderColor).toBe('#22D3EE');
  });
});
