import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import ListItemRow from '../../src/components/ListItemRow';

describe('ListItemRow', () => {
  it('clamps the title and subtitle to one line by default', async () => {
    const view = await render(<ListItemRow title="Title" subtitle="Subtitle" />);

    expect(view.getByText('Title').props.numberOfLines).toBe(1);
    expect(view.getByText('Subtitle').props.numberOfLines).toBe(1);
  });

  it('forwards custom title and subtitle line limits', async () => {
    const view = await render(
      <ListItemRow title="Title" titleLines={2} subtitle="Subtitle" subtitleLines={3} />,
    );

    expect(view.getByText('Title').props.numberOfLines).toBe(2);
    expect(view.getByText('Subtitle').props.numberOfLines).toBe(3);
  });
});
