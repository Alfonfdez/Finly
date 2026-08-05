import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import EmptyState from '../../src/components/EmptyState';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

describe('EmptyState', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the message', async () => {
    const view = await render(<EmptyState message="No transactions yet" />);

    expect(view.getByText('No transactions yet')).toBeTruthy();
  });

  it('renders no icon when none is provided', async () => {
    const view = await render(<EmptyState message="Nothing here" />);

    expect(view.root!.queryAll((i) => i.type === 'RCTText')).toHaveLength(1);
  });

  it('renders the provided icon at a large size in the secondary color', async () => {
    const view = await render(<EmptyState icon="card-outline" message="Nothing here" />);

    const icon = view.getByText('card-outline');
    expect(icon.props.size).toBe(64);
    expect(icon.props.color).toBe('#94A3B8');
  });

  it('styles the message with the secondary color and scaled font', async () => {
    const view = await render(<EmptyState message="Nothing here" />);

    const style = flattenStyle(view.getByText('Nothing here').props.style);
    expect(style.color).toBe('#94A3B8');
    expect(style.fontSize).toBe(16);
  });
});
