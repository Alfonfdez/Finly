import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import SearchBar from '../../src/components/SearchBar';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

describe('SearchBar', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders a text input with placeholder and value', async () => {
    const view = await render(
      <SearchBar placeholder="Search transactions" value="grocer" onChangeText={() => {}} onClose={() => {}} />
    );

    const input = view.getByPlaceholderText('Search transactions');
    expect(input.props.value).toBe('grocer');
  });

  it('renders search and close icons', async () => {
    const view = await render(
      <SearchBar placeholder="Search" value="" onChangeText={() => {}} onClose={() => {}} />
    );

    const icons = view.root!.queryAll((i) => i.type === 'RCTText').map((i) => i.children[0]);
    expect(icons).toContain('search-outline');
    expect(icons).toContain('close-circle');
  });

  it('applies themed colors to the container', async () => {
    const view = await render(
      <SearchBar placeholder="Search" value="" onChangeText={() => {}} onClose={() => {}} />
    );

    const style = flattenStyle(view.root!.props.style);
    expect(style.backgroundColor).toBe('#1E293B');
    expect(style.borderColor).toBe('#334155');
  });

  it('styles the input text with the configured color and scaled font size', async () => {
    const view = await render(
      <SearchBar placeholder="Search" value="" onChangeText={() => {}} onClose={() => {}} />
    );

    const input = view.getByPlaceholderText('Search');
    const style = flattenStyle(input.props.style);
    expect(style.color).toBe('#E2E8F0');
    expect(style.fontSize).toBe(15);
    expect(input.props.placeholderTextColor).toBe('#94A3B8');
  });

  it('reports text changes through onChangeText', async () => {
    const onChangeText = vi.fn();
    const view = await render(
      <SearchBar placeholder="Search" value="" onChangeText={onChangeText} onClose={() => {}} />
    );

    const input = view.getByPlaceholderText('Search');
    await fireEvent.changeText(input, 'coffee');
    expect(onChangeText).toHaveBeenCalledWith('coffee');
  });

  it('fires onClose when the close button is pressed', async () => {
    const onClose = vi.fn();
    const view = await render(
      <SearchBar placeholder="Search" value="" onChangeText={() => {}} onClose={onClose} />
    );

    await fireEvent.press(view.getByText('close-circle'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('is focused on mount when autoFocus is set', async () => {
    const view = await render(
      <SearchBar placeholder="Search" value="" onChangeText={() => {}} onClose={() => {}} autoFocus />
    );

    expect(view.getByPlaceholderText('Search').props.autoFocus).toBe(true);
  });
});
