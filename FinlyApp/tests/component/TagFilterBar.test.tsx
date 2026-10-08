import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import TagFilterBar from '../../src/components/TagFilterBar';
import type { Tag } from '../../src/database/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.assign(out, value);
  };
  walk(style);
  return out;
}

const tag = { id: 7, user_id: 1, name: 'lunch', created_at: '2026-01-01' } as Tag;

describe('TagFilterBar', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders normal tags with the primary text color and special chips with the secondary color', async () => {
    const view = await render(
      <TagFilterBar tags={[tag]} activeTagIds={[]} onToggle={() => {}} onClear={() => {}} />,
    );

    expect(flattenStyle(view.getByText('lunch').props.style).color).toBe('#22D3EE');
    expect(flattenStyle(view.getByText('Untagged').props.style).color).toBe('#94A3B8');
  });
});
