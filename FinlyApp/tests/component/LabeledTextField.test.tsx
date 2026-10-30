import { describe, it, expect, beforeEach } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import LabeledTextField from '../../src/components/form/LabeledTextField';

function borderColor(node: unknown): unknown {
  const instance = node as { props: { style: unknown } };
  return (StyleSheet.flatten(instance.props.style) as { borderColor?: unknown }).borderColor;
}

describe('LabeledTextField', () => {
  beforeEach(() => {
    resetStub();
  });

  it('does not paint an untouched field red, even with an error', async () => {
    const view = await render(<LabeledTextField placeholder="Name" value="" error="Enter a name" onChangeText={() => {}} />);

    expect(borderColor(view.getByPlaceholderText('Name'))).toBe('#334155');
  });

  it('paints the field red once the user changes it', async () => {
    const view = await render(<LabeledTextField placeholder="Name" value="" error="Enter a name" onChangeText={() => {}} />);
    const input = view.getByPlaceholderText('Name');

    await fireEvent.changeText(input, 'a');
    expect(borderColor(input)).toBe('#F87171');
  });

  it('paints the field red once the user leaves it', async () => {
    const view = await render(<LabeledTextField placeholder="Name" value="" error="Enter a name" onChangeText={() => {}} />);
    const input = view.getByPlaceholderText('Name');

    await fireEvent(input, 'blur');
    expect(borderColor(input)).toBe('#F87171');
  });

  it('keeps a valid touched field neutral', async () => {
    const view = await render(<LabeledTextField placeholder="Name" value="Cash" onChangeText={() => {}} />);
    const input = view.getByPlaceholderText('Name');

    await fireEvent.changeText(input, 'Cash2');
    expect(borderColor(input)).toBe('#334155');
  });

  it('forwards change and blur handlers', async () => {
    const onChangeText = () => {};
    let blurred = false;
    const view = await render(
      <LabeledTextField
        placeholder="Name"
        value=""
        onChangeText={onChangeText}
        onBlur={() => {
          blurred = true;
        }}
      />,
    );

    await fireEvent(view.getByPlaceholderText('Name'), 'blur');
    expect(blurred).toBe(true);
  });

  it('uses the visible label as the accessible name', async () => {
    const view = await render(
      <LabeledTextField label="Note" value="" onChangeText={() => {}} />,
    );

    expect(view.getByLabelText('Note')).toBeTruthy();
  });

  it('keeps a single-line counter below the input', async () => {
    const view = await render(
      <LabeledTextField
        placeholder="Name"
        value="Cash"
        onChangeText={() => {}}
        maxLength={30}
        showCounter
      />,
    );

    const style = StyleSheet.flatten(view.getByText('4/30').props.style) as {
      position?: string;
      marginTop?: number;
    };
    expect(style.position).toBeUndefined();
    expect(style.marginTop).toBe(4);
  });

  it('keeps a legacy value above the limit editable and flags the counter', async () => {
    const value = 'x'.repeat(45);
    const view = await render(
      <LabeledTextField label="Name" value={value} onChangeText={() => {}} maxLength={30} showCounter />,
    );

    expect(view.getByLabelText('Name').props.maxLength).toBe(45);
    expect(view.getByText('45/30')).toBeTruthy();
  });

  it('places the counter in the header when requested', async () => {
    const view = await render(
      <LabeledTextField
        label="Name"
        value="Cash"
        onChangeText={() => {}}
        maxLength={30}
        showCounter
        counterInHeader
      />,
    );

    expect(view.getByText('Name')).toBeTruthy();
    const style = StyleSheet.flatten(view.getByText('4/30').props.style) as {
      position?: string;
      marginTop?: number;
    };
    expect(style.position).toBeUndefined();
    expect(style.marginTop).toBeUndefined();
  });
});
