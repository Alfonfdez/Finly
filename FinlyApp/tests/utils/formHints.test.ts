import { describe, it, expect } from 'vitest';
import { getIconColorHintText, getNameHintText } from '../../src/utils/formHints';

const iconColorKeys = {
  empty: 'EMPTY',
  iconColor: 'ICON_COLOR',
  icon: 'ICON',
  color: 'COLOR',
};

describe('getIconColorHintText', () => {
  it('returns the empty hint when the name is blank', () => {
    expect(getIconColorHintText('', null, null, null, iconColorKeys)).toBe('EMPTY');
    expect(getIconColorHintText('   ', null, null, null, iconColorKeys)).toBe('EMPTY');
  });

  it('takes precedence with the name error over other hints', () => {
    expect(getIconColorHintText('Food', 'ERR', null, null, iconColorKeys)).toBe('ERR');
    expect(getIconColorHintText('Food', 'ERR', 'icon', '#fff', iconColorKeys)).toBe('ERR');
  });

  it('returns the icon+color hint when neither is chosen', () => {
    expect(getIconColorHintText('Food', null, null, null, iconColorKeys)).toBe('ICON_COLOR');
  });

  it('returns the icon hint when only a color is chosen', () => {
    expect(getIconColorHintText('Food', null, null, '#fff', iconColorKeys)).toBe('ICON');
  });

  it('returns the color hint when only an icon is chosen', () => {
    expect(getIconColorHintText('Food', null, 'fast-food', null, iconColorKeys)).toBe('COLOR');
  });

  it('returns null when icon and color are both chosen', () => {
    expect(getIconColorHintText('Food', null, 'fast-food', '#fff', iconColorKeys)).toBeNull();
  });
});

describe('getNameHintText', () => {
  it('returns the empty hint when the name is blank', () => {
    expect(getNameHintText('', null, 'EMPTY')).toBe('EMPTY');
    expect(getNameHintText(' \n ', null, 'EMPTY')).toBe('EMPTY');
  });

  it('returns the name error when present', () => {
    expect(getNameHintText('Food', 'ERR', 'EMPTY')).toBe('ERR');
  });

  it('returns null for a valid name', () => {
    expect(getNameHintText('Food', null, 'EMPTY')).toBeNull();
  });
});