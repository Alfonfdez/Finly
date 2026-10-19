import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import OptionPickerModal from '../../src/components/OptionPickerModal';
import { t } from '../../src/i18n';

type Value = 'alpha' | 'beta' | 'gamma' | `v${number}`;

const options: { label: string; value: Value }[] = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' },
];

async function renderPicker(overrides: Partial<{
  visible: boolean;
  selected: Value;
  options: { label: string; value: Value }[];
  searchable: boolean;
}> = {}) {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const view = await render(
    <OptionPickerModal<Value>
      visible
      title="Pick one"
      options={options}
      selected="alpha"
      onSelect={onSelect}
      onClose={onClose}
      {...overrides}
    />,
  );
  return { view, onSelect, onClose };
}

describe('OptionPickerModal', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('renders the title, every option and the current selection', async () => {
    const { view } = await renderPicker();

    expect(view.getByText('Pick one')).toBeTruthy();
    expect(view.getByText('Alpha')).toBeTruthy();
    expect(view.getByText('Beta')).toBeTruthy();
    expect(view.getByText('Gamma')).toBeTruthy();
  });

  it('confirms the current selection when nothing was tapped', async () => {
    const { view, onSelect, onClose } = await renderPicker();

    await fireEvent.press(view.getByText(t().transactions_confirm));

    expect(onSelect).toHaveBeenCalledWith('alpha');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('confirms a newly tapped option', async () => {
    const { view, onSelect, onClose } = await renderPicker();

    await fireEvent.press(view.getByText('Beta'));
    await fireEvent.press(view.getByText(t().transactions_confirm));

    expect(onSelect).toHaveBeenCalledWith('beta');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cancels without selecting', async () => {
    const { view, onSelect, onClose } = await renderPicker();

    await fireEvent.press(view.getByText('Gamma'));
    await fireEvent.press(view.getByText(t().transactions_cancel));

    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('offers a search bar when there are many options and filters them', async () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `v${index + 1}` as Value,
    }));
    const view = await render(
      <OptionPickerModal<Value>
        visible
        title="Many"
        options={many}
        selected={'v1' as Value}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(view.getByPlaceholderText(t().settings_picker_search)).toBeTruthy();

    await fireEvent.changeText(view.getByPlaceholderText(t().settings_picker_search), 'Option 12');
    expect(view.getByText('Option 12')).toBeTruthy();
    expect(view.queryByText('Option 11')).toBeNull();

    await fireEvent.changeText(view.getByPlaceholderText(t().settings_picker_search), 'nothing');
    expect(view.getByText(t().settings_picker_no_results)).toBeTruthy();
  });

  it('has no search bar for a short, non-searchable list', async () => {
    const { view } = await renderPicker({ searchable: false });

    expect(view.queryByPlaceholderText(t().settings_picker_search)).toBeNull();
  });
});
