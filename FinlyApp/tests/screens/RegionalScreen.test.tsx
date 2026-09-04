import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import RegionalScreen from '../../src/screens/settings/RegionalScreen';
import { resetStub } from '../component/helpers/configStub';

vi.mock('react-native-svg', () => ({
  Svg: ({ children }: { children?: ReactNode }) => <>{children}</>,
  Rect: () => null,
  Line: () => null,
}));

describe('RegionalScreen', () => {
  beforeEach(() => {
    resetStub();
  });

  afterEach(() => {
    resetStub();
  });

  it('renders the language, currency and format options', async () => {
    const view = await render(<RegionalScreen />);
    expect(view.getAllByText('LANGUAGE').length).toBeGreaterThan(0);
    expect(view.getByText('MONEY FORMAT')).toBeTruthy();
    expect(view.getByText('English')).toBeTruthy();
    expect(view.getByText('Currency')).toBeTruthy();
    expect(view.getByText('Decimal separator')).toBeTruthy();
    expect(view.getByText('First day of week')).toBeTruthy();
  });
});
