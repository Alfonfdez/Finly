import { describe, it, expect, beforeEach } from 'vitest';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import CharCounter, { COUNTER_FONT_SIZE } from '../../src/components/form/CharCounter';

interface CounterStyle {
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
}

function styleOf(node: unknown): CounterStyle {
  const instance = node as { props: { style: unknown } };
  return StyleSheet.flatten(instance.props.style) as CounterStyle;
}

describe('CharCounter', () => {
  beforeEach(() => {
    resetStub();
  });

  it('shows value/maxLength muted, right-aligned, below the limit', async () => {
    const view = await render(<CharCounter value={3} maxLength={20} />);

    const style = styleOf(view.getByText('3/20'));
    expect(style.color).toBe('#94A3B8');
    expect(style.fontWeight).toBe('500');
    expect(style.fontSize).toBe(COUNTER_FONT_SIZE);
    expect(style.textAlign).toBe('right');
  });

  it('turns the whole counter red and bold once the limit is reached', async () => {
    const view = await render(<CharCounter value={20} maxLength={20} />);

    const style = styleOf(view.getByText('20/20'));
    expect(style.color).toBe('#F87171');
    expect(style.fontWeight).toBe('700');
  });

  it('stays red and bold for a value over the limit', async () => {
    const view = await render(<CharCounter value={42} maxLength={30} />);

    const style = styleOf(view.getByText('42/30'));
    expect(style.color).toBe('#F87171');
    expect(style.fontWeight).toBe('700');
  });

  it('renders a localized string as children and still flags the limit', async () => {
    const view = await render(<CharCounter value={100} maxLength={100}>{'100 of 100 tags'}</CharCounter>);

    const style = styleOf(view.getByText('100 of 100 tags'));
    expect(style.color).toBe('#F87171');
    expect(style.fontWeight).toBe('700');
  });

  it('never flags a count without a maximum', async () => {
    const view = await render(<CharCounter value={500}>{'500 comments'}</CharCounter>);

    const style = styleOf(view.getByText('500 comments'));
    expect(style.color).toBe('#94A3B8');
    expect(style.fontWeight).toBe('500');
  });

  it('scales with the text size and lets the caller override the style', async () => {
    setConfig({ textSize: 'large' });
    const view = await render(<CharCounter value={1} maxLength={10} style={{ textAlign: 'center' }} />);

    const style = styleOf(view.getByText('1/10'));
    expect(style.fontSize).toBeGreaterThan(COUNTER_FONT_SIZE);
    expect(style.textAlign).toBe('center');
  });
});
