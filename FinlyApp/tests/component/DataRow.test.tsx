import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import DataRow from '../../src/components/DataRow';
import { resetStub, setConfig } from './helpers/configStub';

function flatten(style: unknown): Record<string, unknown> {
  return StyleSheet.flatten(style as never) as Record<string, unknown>;
}

describe('DataRow', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('renders the icon, the label and the value', async () => {
    const view = await render(
      <DataRow label="Tags" icon="pricetag-outline">
        <Text>work</Text>
      </DataRow>,
    );

    expect(view.getByText('pricetag-outline', { includeHiddenElements: true })).toBeTruthy();
    expect(view.getByText('Tags')).toBeTruthy();
    expect(view.getByText('work')).toBeTruthy();
  });

  it('top-aligns the row so a wrapping value keeps the label on the first line', async () => {
    const view = await render(
      <DataRow label="Tags">
        <Text>{'one two three four five six seven eight nine ten eleven twelve'}</Text>
      </DataRow>,
    );

    const row = view.getByText('Tags').parent?.parent;
    expect(flatten(row?.props.style).alignItems).toBe('flex-start');
  });
});
