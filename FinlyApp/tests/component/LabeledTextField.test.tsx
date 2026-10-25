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

  it('places a multiline counter inside the input when requested', async () => {
    const view = await render(
      <LabeledTextField
        placeholder="Note"
        value="Hi"
        onChangeText={() => {}}
        maxLength={200}
        showCounter
        inlineCounter
        multiline
      />,
    );

    const style = StyleSheet.flatten(view.getByText('2/200').props.style) as {
      position?: string;
      right?: number;
      bottom?: number;
    };
    expect(style.position).toBe('absolute');
    expect(style.right).toBe(8);
    expect(style.bottom).toBe(6);
  });
});
