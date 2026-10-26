import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import SelectionCheckbox from '../../src/components/SelectionCheckbox';
import { resetStub } from './helpers/configStub';

describe('SelectionCheckbox', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the standard unchecked and checked icons', async () => {
    const unchecked = await render(<SelectionCheckbox selected={false} />);
    expect(unchecked.getByText('checkbox-outline')).toBeTruthy();

    const checked = await render(<SelectionCheckbox selected />);
    expect(checked.getByText('checkbox')).toBeTruthy();
  });
});
