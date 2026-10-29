import { describe, it, expect, vi } from 'vitest';
import { CommonActions } from '@react-navigation/native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../src/constants/types';
import { openDrawerScreen, ROOT_DRAWER_SCREENS } from '../../src/navigation/drawerNavigation';

function drawerNavigation() {
  return {
    navigate: vi.fn(),
    closeDrawer: vi.fn(),
  } as unknown as DrawerContentComponentProps['navigation'];
}

function stackNavigation() {
  return {
    dispatch: vi.fn(),
  } as unknown as NativeStackNavigationProp<RootStackParamList>;
}

describe('openDrawerScreen', () => {
  it('resets the stack and closes the drawer for All transactions', () => {
    const drawer = drawerNavigation();
    const stack = stackNavigation();

    openDrawerScreen(drawer, stack, 'AllTransactions');

    expect(ROOT_DRAWER_SCREENS).toContain('AllTransactions');
    expect(stack.dispatch).toHaveBeenCalledWith(CommonActions.reset({
      index: 0,
      routes: [{ name: 'AllTransactions' }],
    }));
    expect(drawer.navigate).not.toHaveBeenCalled();
    expect(drawer.closeDrawer).toHaveBeenCalledTimes(1);
  });

  it('pushes Settings and closes the drawer', () => {
    const drawer = drawerNavigation();
    const stack = stackNavigation();

    openDrawerScreen(drawer, stack, 'Settings');

    expect(stack.dispatch).not.toHaveBeenCalled();
    expect(drawer.navigate).toHaveBeenCalledWith('Main', { screen: 'Settings' });
    expect(drawer.closeDrawer).toHaveBeenCalledTimes(1);
  });

  it('closes the drawer even before the stack navigation is available', () => {
    const drawer = drawerNavigation();

    openDrawerScreen(drawer, null, 'Home');

    expect(drawer.closeDrawer).toHaveBeenCalledTimes(1);
  });
});
