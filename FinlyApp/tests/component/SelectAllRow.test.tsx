import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import SelectAllRow from '../../src/components/SelectAllRow';

type Props = ComponentProps<typeof SelectAllRow>;

function makeProps(over: Partial<Props> = {}): Props {
  return {
    allSelected: false,
    countLabel: '3 items',
    selectAllLabel: 'Select all',
    deselectAllLabel: 'Deselect all',
    onToggle: vi.fn(),
    ...over,
  };
}

describe('SelectAllRow', () => {
  beforeEach(() => {
    resetStub();
  });

  it('shows Select all with the count and fires onToggle when pressed', async () => {
    const props = makeProps();
    const view = await render(<SelectAllRow {...props} />);
    expect(view.getByText('Select all')).toBeTruthy();
    expect(view.getByText('3 items')).toBeTruthy();
    await fireEvent.press(view.getByText('Select all'));
    expect(props.onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows Deselect all when everything is selected', async () => {
    const view = await render(<SelectAllRow {...makeProps({ allSelected: true })} />);
    expect(view.getByText('Deselect all')).toBeTruthy();
    expect(view.queryByText('Select all')).toBeNull();
  });

  it('does not fire when disabled', async () => {
    const props = makeProps({ disabled: true });
    const view = await render(<SelectAllRow {...props} />);
    await fireEvent.press(view.getByText('Select all'));
    expect(props.onToggle).not.toHaveBeenCalled();
  });
});
