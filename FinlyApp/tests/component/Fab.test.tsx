import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import Fab from '../../src/components/Fab';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

describe('Fab', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders with the given accessibility label', async () => {
    const view = await render(<Fab onPress={() => {}} accessibilityLabel="Add transaction" />);

    expect(view.getByLabelText('Add transaction')).toBeTruthy();
  });

  it('renders a plus icon in the background color', async () => {
    const view = await render(<Fab onPress={() => {}} accessibilityLabel="Add" />);

    const icon = view.getByText('add');
    expect(icon.props.size).toBe(28);
    expect(icon.props.color).toBe('#0F172A');
  });

  it('sizes the button as a circle in the primary color', async () => {
    const view = await render(<Fab onPress={() => {}} accessibilityLabel="Add" />);

    const style = flattenStyle(view.root!.props.style);
    expect(style.width).toBe(56);
    expect(style.height).toBe(56);
    expect(style.borderRadius).toBe(28);
    expect(style.backgroundColor).toBe('#22D3EE');
  });

  it('fires onPress when pressed', async () => {
    const onPress = vi.fn();
    const view = await render(<Fab onPress={onPress} accessibilityLabel="Add" />);

    await fireEvent.press(view.getByLabelText('Add'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('casts a native elevation shadow', async () => {
    const view = await render(<Fab onPress={() => {}} accessibilityLabel="Add" />);

    const style = flattenStyle(view.root!.props.style);
    expect(style.elevation).toBe(6);
    expect(style.shadowColor).toBe('#000000');
  });
});
