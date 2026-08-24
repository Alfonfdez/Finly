import { Text, View, Image, StyleSheet } from 'react-native';
import type { ComponentType } from 'react';
import { useEffect, useMemo, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { NavigationContainer, useNavigation, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import type { RootStackParamList } from '../constants/types';
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import CreateCategoryScreen from '../screens/CreateCategoryScreen';
import ModifyCategoryScreen from '../screens/ModifyCategoryScreen';
import AccountsScreen from '../screens/AccountsScreen';
import ModifyAccountScreen from '../screens/ModifyAccountScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AllTransactionsScreen from '../screens/AllTransactionsScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';
import ModifyTransactionScreen from '../screens/ModifyTransactionScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AppearanceScreen from '../screens/settings/AppearanceScreen';
import RegionalScreen from '../screens/settings/RegionalScreen';
import PersonalizationScreen from '../screens/settings/PersonalizationScreen';
import DataScreen from '../screens/settings/DataScreen';
import TagsScreen from '../screens/TagsScreen';
import CreateTagScreen from '../screens/CreateTagScreen';
import ModifyTagScreen from '../screens/ModifyTagScreen';
import CommentsScreen from '../screens/CommentsScreen';
import ModifyCommentScreen from '../screens/ModifyCommentScreen';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import DrawerMenuButton from '../components/DrawerMenuButton';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

let _stackNav: NativeStackNavigationProp<RootStackParamList> | null = null;

type ScreenDef = {
  name: keyof RootStackParamList;
  component: ComponentType<any>;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  drawerMenu?: boolean;
  options: Record<string, unknown>;
};

type DrawerScreenName = 'Home' | 'AllTransactions' | 'Accounts' | 'Categories' | 'Tags' | 'Comments' | 'Settings';

type DrawerItemDef =
  | { label: string; icon: keyof typeof Ionicons.glyphMap; screen: DrawerScreenName }
  | { separator: true };

const HeaderTitle = memo(function HeaderTitle({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <View style={styles.headerTitleRow}>
      <Ionicons name={icon} size={20} color={c.text} />
      <Text style={[styles.headerTitleText, { color: c.text, fontSize: fs(17) }]}>{label}</Text>
    </View>
  );
});

const StackHeaderLeft = memo(function StackHeaderLeft() {
  const labels = t();
  return <DrawerMenuButton accessibilityLabel={labels.home_open_menu} />;
});

function DrawerNavItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <DrawerItem
      label={label}
      onPress={onPress}
      icon={({ color, size }) => <Ionicons name={icon} size={size} color={color} />}
      labelStyle={{ color: c.text, fontSize: fs(14) }}
      inactiveTintColor={c.primary}
    />
  );
}

const ROOT_DRAWER_SCREENS: DrawerScreenName[] = [
  'Home',
  'Accounts',
  'Categories',
  'Tags',
  'Comments',
];

function openDrawerScreen(navigation: DrawerContentComponentProps['navigation'], screen: DrawerScreenName) {
  if (ROOT_DRAWER_SCREENS.includes(screen)) {
    if (_stackNav) {
      _stackNav.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: screen as keyof RootStackParamList }],
        })
      );
    }
    navigation.closeDrawer();
    return;
  }
  navigation.navigate('Main', { screen });
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const drawerItems: DrawerItemDef[] = [
    { label: labels.nav_home, icon: 'home-outline', screen: 'Home' },
    { label: labels.nav_all_transactions, icon: 'receipt-outline', screen: 'AllTransactions' },
    { label: labels.nav_accounts, icon: 'wallet-outline', screen: 'Accounts' },
    { label: labels.nav_categories, icon: 'grid-outline', screen: 'Categories' },
    { label: labels.nav_tags, icon: 'pricetag-outline', screen: 'Tags' },
    { label: labels.nav_comments, icon: 'chatbubble-outline', screen: 'Comments' },
    { separator: true },
    { label: labels.nav_settings, icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <DrawerContentScrollView {...props} style={{ backgroundColor: c.surface }}>
        <View style={[styles.drawerHeader, { borderBottomColor: c.border }]}>
          <Image source={require('../../assets/icon.png')} style={styles.drawerLogo} />
          <Text style={[styles.drawerTitle, { color: c.primary, fontSize: fs(24) }]}>Finly</Text>
        </View>
        {drawerItems.map((item, index) =>
          'separator' in item ? (
            <View key={`sep-${index}`} style={[styles.separator, { backgroundColor: c.border }]} />
          ) : (
            <DrawerNavItem
              key={item.screen}
              label={item.label}
              icon={item.icon}
              onPress={() => openDrawerScreen(props.navigation, item.screen)}
            />
          )
        )}
      </DrawerContentScrollView>
      <Text style={[styles.drawerVersion, { color: c.textSecondary, fontSize: fs(11) }]}>
        v{Constants.expoConfig?.version}
      </Text>
    </View>
  );
}

function HomeNavCapture() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => { _stackNav = navigation; }, [navigation]);
  return <HomeScreen />;
}

const HomeStack = memo(function HomeStack() {
  const { activeColors: c } = useConfig();
  const labels = t();

  const screenOptions = useMemo(() => ({
    headerStyle: { backgroundColor: c.surface },
    headerTintColor: c.text,
    headerTitleAlign: 'center' as const,
    animationTypeForReplace: 'push' as const,
    freezeOnBlur: true,
  }), [c.surface, c.text]);

  const screens = useMemo<ScreenDef[]>(() => [
    { name: 'Home', component: HomeNavCapture, icon: 'home-outline', label: labels.nav_home, drawerMenu: true,
      options: { headerTitle: () => <HeaderTitle icon="home-outline" label={labels.nav_home} />, headerLeft: () => <StackHeaderLeft /> } },
    { name: 'AddTransaction', component: AddTransactionScreen, icon: 'add-circle-outline', label: labels.add_title,
      options: { headerTitle: () => <HeaderTitle icon="add-circle-outline" label={labels.add_title} /> } },
    { name: 'AddCategory', component: AddCategoryScreen, icon: 'grid-outline', label: labels.add_cat_title,
      options: { headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.add_cat_title} /> } },
    { name: 'CreateCategory', component: CreateCategoryScreen, icon: 'grid-outline', label: labels.create_cat_title,
      options: { headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.create_cat_title} /> } },
    { name: 'ModifyCategory', component: ModifyCategoryScreen, icon: 'grid-outline', label: labels.modify_cat_title,
      options: { headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.modify_cat_title} /> } },
    { name: 'Categories', component: CategoriesScreen, icon: 'grid-outline', label: labels.nav_categories, drawerMenu: true,
      options: { headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.nav_categories} />, headerLeft: () => <StackHeaderLeft /> } },
    { name: 'Accounts', component: AccountsScreen, icon: 'wallet-outline', label: labels.nav_accounts, drawerMenu: true,
      options: { headerTitle: () => <HeaderTitle icon="wallet-outline" label={labels.nav_accounts} />, headerLeft: () => <StackHeaderLeft /> } },
    { name: 'ModifyAccount', component: ModifyAccountScreen, icon: 'wallet-outline', label: labels.modify_account_title,
      options: { headerTitle: () => <HeaderTitle icon="wallet-outline" label={labels.modify_account_title} /> } },
    { name: 'CreateAccount', component: CreateAccountScreen, icon: 'wallet-outline', label: labels.create_account_title,
      options: { headerTitle: () => <HeaderTitle icon="wallet-outline" label={labels.create_account_title} /> } },
    { name: 'Transactions', component: TransactionsScreen, icon: 'document-text-outline', label: labels.nav_transactions,
      options: { headerTitle: () => <HeaderTitle icon="document-text-outline" label={labels.nav_transactions} /> } },
    { name: 'AllTransactions', component: AllTransactionsScreen, icon: 'receipt-outline', label: labels.nav_all_transactions, drawerMenu: true,
      options: { headerTitle: () => <HeaderTitle icon="receipt-outline" label={labels.nav_all_transactions} />, headerLeft: () => <StackHeaderLeft /> } },
    { name: 'Settings', component: SettingsScreen, icon: 'settings-outline', label: labels.nav_settings,
      options: { headerTitle: () => <HeaderTitle icon="settings-outline" label={labels.nav_settings} /> } },
    { name: 'SettingsAppearance', component: AppearanceScreen, icon: 'color-palette-outline', label: labels.settings_appearance,
      options: { headerTitle: () => <HeaderTitle icon="color-palette-outline" label={labels.settings_appearance} /> } },
    { name: 'SettingsRegional', component: RegionalScreen, icon: 'globe-outline', label: labels.settings_regional,
      options: { headerTitle: () => <HeaderTitle icon="globe-outline" label={labels.settings_regional} /> } },
    { name: 'SettingsPersonalization', component: PersonalizationScreen, icon: 'options-outline', label: labels.settings_personalization,
      options: { headerTitle: () => <HeaderTitle icon="options-outline" label={labels.settings_personalization} /> } },
    { name: 'SettingsData', component: DataScreen, icon: 'server-outline', label: labels.settings_data,
      options: { headerTitle: () => <HeaderTitle icon="server-outline" label={labels.settings_data} /> } },
    { name: 'TransactionDetails', component: TransactionDetailsScreen, icon: 'information-circle-outline', label: labels.details_title,
      options: { headerTitle: () => <HeaderTitle icon="information-circle-outline" label={labels.details_title} /> } },
    { name: 'ModifyTransaction', component: ModifyTransactionScreen, icon: 'create-outline', label: labels.modify_title,
      options: { headerTitle: () => <HeaderTitle icon="create-outline" label={labels.modify_title} /> } },
    { name: 'Tags', component: TagsScreen, icon: 'pricetag-outline', label: labels.nav_tags, drawerMenu: true,
      options: { headerTitle: () => <HeaderTitle icon="pricetag-outline" label={labels.nav_tags} />, headerLeft: () => <StackHeaderLeft /> } },
    { name: 'CreateTag', component: CreateTagScreen, icon: 'pricetag-outline', label: labels.create_tag_title,
      options: { headerTitle: () => <HeaderTitle icon="pricetag-outline" label={labels.create_tag_title} /> } },
    { name: 'ModifyTag', component: ModifyTagScreen, icon: 'pricetag-outline', label: labels.modify_tag_title,
      options: { headerTitle: () => <HeaderTitle icon="pricetag-outline" label={labels.modify_tag_title} /> } },
    { name: 'Comments', component: CommentsScreen, icon: 'chatbubble-outline', label: labels.nav_comments, drawerMenu: true,
      options: { headerTitle: () => <HeaderTitle icon="chatbubble-outline" label={labels.nav_comments} />, headerLeft: () => <StackHeaderLeft /> } },
    { name: 'ModifyComment', component: ModifyCommentScreen, icon: 'chatbubble-outline', label: labels.comments_modify_title,
      options: { headerTitle: () => <HeaderTitle icon="chatbubble-outline" label={labels.comments_modify_title} /> } },
  ], [labels]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {screens.map(({ name, component, options }) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={options}
        />
      ))}
    </Stack.Navigator>
  );
})

function AppDrawer() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { backgroundColor: c.surface, width: 260 },
        drawerLabelStyle: { color: c.text, fontSize: fs(16) },
        drawerActiveTintColor: c.primary,
        drawerInactiveTintColor: c.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={HomeStack}
        options={{
          headerShown: false,
          drawerLabel: labels.nav_home,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <AppDrawer />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  drawerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  drawerTitle: {
    fontWeight: '700',
  },
  separator: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  drawerVersion: {
    textAlign: 'right',
    paddingVertical: 12,
    paddingRight: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitleText: {
    fontWeight: '600',
  },
});
