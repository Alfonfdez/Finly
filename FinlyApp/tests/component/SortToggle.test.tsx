import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';
import { resetStub } from './helpers/configStub';
import SortToggle from '../../src/components/SortToggle';
import { SORT_BY, SORT_DIRECTIONS } from '../../src/constants/types';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

function iconNames(root: TestInstance): string[] {
  return root.queryAll((i) => i.type === 'RCTText').map((i) => String(i.children[0]));
}

describe('SortToggle', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the date and amount sort options', async () => {
    const view = await render(
      <SortToggle sortBy={SORT_BY.date} direction={SORT_DIRECTIONS.desc} onToggleSort={() => {}} onToggleDirection={() => {}} />
    );

    expect(view.getByText('By date')).toBeTruthy();
    expect(view.getByText('By amount')).toBeTruthy();
  });

  it('marks the active sort option with the primary color', async () => {
    const view = await render(
      <SortToggle sortBy={SORT_BY.amount} direction={SORT_DIRECTIONS.asc} onToggleSort={() => {}} onToggleDirection={() => {}} />
    );

    expect(flattenStyle(view.getByText('By amount').props.style).color).toBe('#22D3EE');
    expect(flattenStyle(view.getByText('By date').props.style).color).toBe('#94A3B8');
  });

  it('shows a descending arrow for desc direction', async () => {
    const view = await render(
      <SortToggle sortBy={SORT_BY.date} direction={SORT_DIRECTIONS.desc} onToggleSort={() => {}} onToggleDirection={() => {}} />
    );

    expect(iconNames(view.root!)).toContain('arrow-down');
    expect(iconNames(view.root!)).not.toContain('arrow-up');
  });

  it('shows an ascending arrow for asc direction', async () => {
    const view = await render(
      <SortToggle sortBy={SORT_BY.date} direction={SORT_DIRECTIONS.asc} onToggleSort={() => {}} onToggleDirection={() => {}} />
    );

    expect(iconNames(view.root!)).toContain('arrow-up');
  });

  it('only renders the direction arrow next to the active option', async () => {
    const view = await render(
      <SortToggle sortBy={SORT_BY.date} direction={SORT_DIRECTIONS.desc} onToggleSort={() => {}} onToggleDirection={() => {}} />
    );

    expect(iconNames(view.root!).filter((n) => n.startsWith('arrow-'))).toHaveLength(1);
  });

  it('fires onToggleDirection when the arrow is pressed', async () => {
    const onToggleDirection = vi.fn();
    const view = await render(
      <SortToggle sortBy={SORT_BY.date} direction={SORT_DIRECTIONS.asc} onToggleSort={() => {}} onToggleDirection={onToggleDirection} />
    );

    await fireEvent.press(view.getByText('arrow-up'));
    expect(onToggleDirection).toHaveBeenCalledTimes(1);
  });

  it('switches the sort field on option press', async () => {
    const onToggleSort = vi.fn();
    const view = await render(
      <SortToggle sortBy={SORT_BY.date} direction={SORT_DIRECTIONS.desc} onToggleSort={onToggleSort} onToggleDirection={() => {}} />
    );

    await fireEvent.press(view.getByText('By amount'));
    expect(onToggleSort).toHaveBeenCalledWith(SORT_BY.amount);

    await fireEvent.press(view.getByText('By date'));
    expect(onToggleSort).toHaveBeenCalledWith(SORT_BY.date);
  });
});

