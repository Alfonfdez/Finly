import { describe, it, expect, beforeEach } from 'vitest';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import ModalEntitySubject from '../../src/components/ModalEntitySubject';
import { TEST_IDS } from '../../src/constants/testIds';
import { BADGE_SHAPES } from '../../src/constants/types';
import { resetStub } from './helpers/configStub';

describe('ModalEntitySubject', () => {
  beforeEach(() => {
    resetStub();
  });

  it('centers the icon, name and subtitle as one group', async () => {
    const view = await render(
      <ModalEntitySubject
        name="Subscriptions"
        icon="pricetag-outline"
        color="#22D3EE"
        shape={BADGE_SHAPES.rounded}
        subtitle="2 transactions · 1 recurring rule"
      />,
    );

    const row = StyleSheet.flatten(view.getByTestId(TEST_IDS.modalEntitySubject).props.style);
    expect(row.justifyContent).toBe('center');
    expect(row.alignItems).toBe('center');

    const name = StyleSheet.flatten(view.getByText('Subscriptions').props.style);
    const subtitle = StyleSheet.flatten(view.getByText('2 transactions · 1 recurring rule').props.style);
    expect(name.textAlign).toBe('left');
    expect(subtitle.textAlign).toBe('left');
  });

  it('centers a single-line entity without a subtitle', async () => {
    const view = await render(
      <ModalEntitySubject name="Cash" icon="wallet-outline" color="#22D3EE" shape={BADGE_SHAPES.rounded} />,
    );

    const row = StyleSheet.flatten(view.getByTestId(TEST_IDS.modalEntitySubject).props.style);
    expect(row.alignItems).toBe('center');
    expect(StyleSheet.flatten(view.getByText('Cash').props.style).textAlign).toBe('left');
  });
});
