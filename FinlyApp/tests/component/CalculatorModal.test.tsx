import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react-native';
import CalculatorModal from '../../src/components/CalculatorModal';

const mockOnAccept = vi.fn();
const mockOnCancel = vi.fn();

function renderModal(visible = true) {
  return render(
    <CalculatorModal visible={visible} onAccept={mockOnAccept} onCancel={mockOnCancel} />,
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

  it('commits equals and chains the next operation from the result', async () => {
    const view = await renderModal();
    const press = async (...keys: string[]) => {
      await act(async () => { for (const key of keys) fireEvent.press(view.getByLabelText(key)); });
    };
    await press('1', '0', '0', '-', '5', '0');
    await press('=');
    await press('/', '3');
    await press('=');
    expect(view.getByText('= 16.67')).toBeTruthy();
  });

  it('continues from the committed result when an operator follows equals', async () => {
    const view = await renderModal();
    const press = async (...keys: string[]) => {
      await act(async () => { for (const key of keys) fireEvent.press(view.getByLabelText(key)); });
    };
    await press('5', '+', '5');
    await press('=');
    await press('+', '2');
    await press('=');
    expect(view.getByText('= 12')).toBeTruthy();
  });

  it('starts a fresh calculation when a digit follows equals', async () => {
    const view = await renderModal();
    const press = async (...keys: string[]) => {
      await act(async () => { for (const key of keys) fireEvent.press(view.getByLabelText(key)); });
    };
    await press('5', '+', '5');
    await press('=');
    await press('3');
    expect(view.getByText('= 3')).toBeTruthy();
    expect(view.queryByText('= 10')).toBeNull();
  });

  it('resets the calculator when it is reopened', async () => {
    const view = await renderModal(true);
    await act(async () => {
      for (const key of ['5', '+', '5']) fireEvent.press(view.getByLabelText(key));
    });
    expect(view.getByText('= 10')).toBeTruthy();

    await act(async () => { view.rerender(<CalculatorModal visible={false} onAccept={mockOnAccept} onCancel={mockOnCancel} />); });
    await act(async () => { view.rerender(<CalculatorModal visible onAccept={mockOnAccept} onCancel={mockOnCancel} />); });

    expect(view.queryByText('= 10')).toBeNull();
    expect(view.getByText('Accept')).toBeDisabled();
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

  it('continues calculating from a negative intermediate result', async () => {
    const view = await renderModal();
    const press = async (...keys: string[]) => {
      await act(async () => { for (const key of keys) fireEvent.press(view.getByLabelText(key)); });
    };

    await press('5', '-', '1', '0', '=');
    expect(view.getByText('= -5')).toBeTruthy();
    expect(view.getByText('Accept')).toBeDisabled();

    await press('+', '1', '0');
    expect(view.getByText('= 5')).toBeTruthy();
    expect(view.getByText('Accept')).toBeEnabled();

    fireEvent.press(view.getByText('Accept'));
    expect(mockOnAccept).toHaveBeenCalledWith('5');
  });

  it('disables Accept for negative and zero results', async () => {
    const view = await renderModal();
    const press = async (...keys: string[]) => {
      await act(async () => { for (const key of keys) fireEvent.press(view.getByLabelText(key)); });
    };

    await press('5', '-', '1', '0');
    expect(view.getByText('= -5')).toBeTruthy();
    expect(view.getByText('Accept')).toBeDisabled();

    await press('C', '5', '-', '5');
    expect(view.getByText('= 0')).toBeTruthy();
    expect(view.getByText('Accept')).toBeDisabled();

    await press('C', '0', '.', '5');
    expect(view.getByText('= 0.5')).toBeTruthy();
    expect(view.getByText('Accept')).toBeEnabled();
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
