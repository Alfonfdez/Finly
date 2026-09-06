import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react-native';
import CalculatorModal from '../../src/components/CalculatorModal';
import { CALC_KEYS } from '../../src/constants/types';

const mockOnAccept = vi.fn();
const mockOnCancel = vi.fn();

function renderModal(visible = true) {
  return render(
    <CalculatorModal visible={visible} onAccept={mockOnAccept} onCancel={mockOnCancel} />
  );
}

describe('CalculatorModal', () => {
  beforeEach(() => {
    mockOnAccept.mockClear();
    mockOnCancel.mockClear();
  });

  it('does not render when invisible', async () => {
    const view = await renderModal(false);
    expect(view.queryByText('7')).toBeNull();
  });

  it('renders the title and keypad when visible', async () => {
    const view = await renderModal();
    expect(view.getByText('Calculator')).toBeTruthy();
    expect(view.getByText('7')).toBeTruthy();
    expect(view.getByText('0')).toBeTruthy();
    expect(view.getByText('+')).toBeTruthy();
    expect(view.getByText('=')).toBeTruthy();
  });

  it('builds an expression from digit buttons and displays a live result', async () => {
    const view = await renderModal();
    await act(async () => {
      fireEvent.press(view.getByLabelText('7'));
      fireEvent.press(view.getByLabelText('+'));
      fireEvent.press(view.getByLabelText('3'));
    });
    expect(view.getByText('= 10')).toBeTruthy();
  });

  it('evaluates multiplication correctly', async () => {
    const view = await renderModal();
    await act(async () => {
      fireEvent.press(view.getByLabelText('6'));
      fireEvent.press(view.getByLabelText('*'));
      fireEvent.press(view.getByLabelText('4'));
    });
    expect(view.getByText('= 24')).toBeTruthy();
  });

  it('calls onAccept with the result string', async () => {
    const view = await renderModal();
    await act(async () => {
      fireEvent.press(view.getByLabelText('5'));
      fireEvent.press(view.getByLabelText('+'));
      fireEvent.press(view.getByLabelText('5'));
    });
    fireEvent.press(view.getByText('Accept'));
    expect(mockOnAccept).toHaveBeenCalledWith('10');
  });

  it('clears the expression when C is pressed', async () => {
    const view = await renderModal();
    await act(async () => {
      fireEvent.press(view.getByLabelText('9'));
      fireEvent.press(view.getByLabelText('C'));
    });
    expect(view.queryByText('= 9')).toBeNull();
  });

  it('removes the last character when backspace is pressed', async () => {
    const view = await renderModal();
    await act(async () => {
      fireEvent.press(view.getByLabelText('1'));
      fireEvent.press(view.getByLabelText('2'));
      fireEvent.press(view.getByLabelText('3'));
      fireEvent.press(view.getByLabelText('⌫'));
    });
    expect(view.getByText('= 12')).toBeTruthy();
  });

  it('rejects trailing operators in equals', async () => {
    const view = await renderModal();
    await act(async () => {
      fireEvent.press(view.getByLabelText('5'));
      fireEvent.press(view.getByLabelText('+'));
    });
    fireEvent.press(view.getByText('Accept'));
    expect(mockOnAccept).not.toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is pressed', async () => {
    const view = await renderModal();
    fireEvent.press(view.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});