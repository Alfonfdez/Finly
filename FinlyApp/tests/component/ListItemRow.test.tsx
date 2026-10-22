import { describe, it, expect } from 'vitest';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ListItemRow from '../../src/components/ListItemRow';

describe('ListItemRow', () => {
  it('clamps the title and subtitle to one line by default', async () => {
    const view = await render(<ListItemRow title="Title" subtitle="Subtitle" />);

    expect(view.getByText('Title').props.numberOfLines).toBe(1);
    expect(view.getByText('Subtitle').props.numberOfLines).toBe(1);
  });

  it('renders the meta slot between the title and subtitle', async () => {
    const view = await render(
      <ListItemRow title="Title" meta={<Text>Meta</Text>} subtitle="Subtitle" />,
    );
    const json = JSON.stringify(view.toJSON());
    expect(json.indexOf('Title')).toBeLessThan(json.indexOf('Meta'));
    expect(json.indexOf('Meta')).toBeLessThan(json.indexOf('Subtitle'));
  });

  it('exposes a pressable row as a button and a static row as plain content', async () => {
    const pressable = await render(
      <ListItemRow title="Title" onPress={() => {}} accessibilityState={{ selected: true }} />,
    );
    expect(pressable.getByRole('button').props.accessibilityState).toEqual({ selected: true });

    const staticView = await render(<ListItemRow title="Title" />);
    expect(staticView.queryByRole('button')).toBeNull();
  });

  it('forwards custom title and subtitle line limits', async () => {
    const view = await render(
      <ListItemRow title="Title" titleLines={2} subtitle="Subtitle" subtitleLines={3} />,
    );

    expect(view.getByText('Title').props.numberOfLines).toBe(2);
    expect(view.getByText('Subtitle').props.numberOfLines).toBe(3);
  });
});
