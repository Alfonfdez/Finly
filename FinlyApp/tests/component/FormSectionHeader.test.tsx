import { describe, it, expect, beforeEach } from 'vitest';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import FormSectionHeader from '../../src/components/form/FormSectionHeader';

describe('FormSectionHeader', () => {
  beforeEach(() => {
    resetStub();
  });

  it('exposes the title as a heading and hides the decorative icon', async () => {
    const view = await render(
      <FormSectionHeader title="Amount" icon="cash-outline" right={<Text>Action</Text>} />,
    );

    expect(view.getByRole('header', { name: 'Amount' })).toBeTruthy();
    expect(view.getByText('cash-outline', { includeHiddenElements: true })).toBeTruthy();
    expect(view.getByText('Action')).toBeTruthy();
  });
});
