import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';
import { resetStub } from './helpers/configStub';
import RadioButton from '../../src/components/RadioButton';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

function circleOf(root: TestInstance): TestInstance | undefined {
  return root.queryAll((i) => i.type === 'RCTView' && flattenStyle(i.props.style).borderWidth === 2, { includeSelf: true })[0];
}

function dotsOf(root: TestInstance, color = '#22D3EE'): TestInstance[] {
  return root.queryAll((i) => i.type === 'RCTView' && flattenStyle(i.props.style).backgroundColor === color);
}

describe('RadioButton', () => {
  beforeEach(() => {
    resetStub();
  });

  it('draws an unselected circle with the border color', async () => {
    const view = await render(<RadioButton selected={false} />);

    const circle = circleOf(view.root!);
    const style = flattenStyle(circle?.props.style);
    expect(style.width).toBe(22);
    expect(style.height).toBe(22);
    expect(style.borderRadius).toBe(11);
    expect(style.borderColor).toBe('#334155');
    expect(dotsOf(view.root!)).toHaveLength(0);
  });

  it('fills the dot with the primary color when selected', async () => {
    const view = await render(<RadioButton selected />);

    const style = flattenStyle(circleOf(view.root!)?.props.style);
    expect(style.borderColor).toBe('#22D3EE');

    const dot = dotsOf(view.root!)[0];
    expect(flattenStyle(dot?.props.style).backgroundColor).toBe('#22D3EE');
  });

  it('sizes the inner dot proportionally', async () => {
    const view = await render(<RadioButton selected size={30} />);

    const dotStyle = flattenStyle(dotsOf(view.root!)[0]?.props.style);
    expect(dotStyle.width).toBeCloseTo(16.35, 2);
    expect(dotStyle.height).toBeCloseTo(16.35, 2);
  });

  it('respects a custom color override', async () => {
    const view = await render(<RadioButton selected color="#FF0000" />);

    expect(flattenStyle(circleOf(view.root!)?.props.style).borderColor).toBe('#FF0000');
    expect(flattenStyle(dotsOf(view.root!, '#FF0000')[0]?.props.style).backgroundColor).toBe('#FF0000');
  });

  it('renders a plain view without press handling by default', async () => {
    const view = await render(<RadioButton selected />);

    expect(view.queryByRole('radio')).toBeNull();
    expect(view.root!.props.onPress).toBeUndefined();
  });

  it('exposes a radio role with the selected state when pressable', async () => {
    const view = await render(<RadioButton selected onPress={() => {}} />);

    expect(view.getByRole('radio', { selected: true })).toBeTruthy();
  });

  it('fires onPress when the radio is pressed', async () => {
    const onPress = vi.fn();
    const view = await render(<RadioButton selected={false} onPress={onPress} />);

    await fireEvent.press(view.getByRole('radio', { selected: false }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

