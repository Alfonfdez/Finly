import { CommonActions } from '@react-navigation/native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../constants/types';

export type DrawerScreenName =
  | 'Home'
  | 'AllTransactions'
  | 'Accounts'
  | 'Categories'
  | 'Tags'
  | 'Comments'
  | 'Recurring'
  | 'Settings';

export const ROOT_DRAWER_SCREENS: readonly DrawerScreenName[] = [
  'Home',
  'AllTransactions',
  'Accounts',
  'Categories',
  'Tags',
  'Comments',
  'Recurring',
];

export function openDrawerScreen(
  drawerNavigation: DrawerContentComponentProps['navigation'],
  stackNavigation: NativeStackNavigationProp<RootStackParamList> | null,
  screen: DrawerScreenName,
): void {
  if (ROOT_DRAWER_SCREENS.includes(screen)) {
    stackNavigation?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screen as keyof RootStackParamList }],
      }),
    );
  } else {
    drawerNavigation.navigate('Main', { screen });
  }
  drawerNavigation.closeDrawer();
}
