import { Text, View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
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
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RootStackParamList } from '../constants/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function HeaderTitle({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  return (
    <View style={styles.headerTitleRow}>
      <Ionicons name={icon} size={20} color={c.text} />
      <Text style={[styles.headerTitleText, { color: c.text, fontSize: fs(17) }]}>{label}</Text>
    </View>
  );
}

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

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <DrawerContentScrollView {...props} style={{ backgroundColor: c.surface }}>
        <View style={[styles.drawerHeader, { borderBottomColor: c.border }]}>
          <Image source={require('../../assets/icon.png')} style={styles.drawerLogo} />
          <Text style={[styles.drawerTitle, { color: c.primary, fontSize: fs(24) }]}>Finly</Text>
        </View>
        <DrawerNavItem
          label={labels.nav_home}
          icon="home-outline"
          onPress={() => props.navigation.navigate('Main', { screen: 'Home' })}
        />
        <DrawerNavItem
          label={labels.nav_all_transactions}
          icon="stats-chart-outline"
          onPress={() => props.navigation.navigate('Main', { screen: 'AllTransactions' })}
        />
        <DrawerNavItem
          label={labels.nav_accounts}
          icon="wallet-outline"
          onPress={() => props.navigation.navigate('Main', { screen: 'Accounts' })}
        />
        <DrawerNavItem
          label={labels.nav_categories}
          icon="grid-outline"
          onPress={() => props.navigation.navigate('Main', { screen: 'Categories' })}
        />
        <DrawerNavItem
          label={labels.nav_tags}
          icon="pricetag-outline"
          onPress={() => props.navigation.navigate('Main', { screen: 'Tags' })}
        />
        <View style={[styles.separator, { backgroundColor: c.border }]} />
        <DrawerNavItem
          label={labels.nav_settings}
          icon="settings-outline"
          onPress={() => props.navigation.navigate('Main', { screen: 'Settings' })}
        />
      </DrawerContentScrollView>
      <Text style={[styles.drawerVersion, { color: c.textSecondary, fontSize: fs(11) }]}>
        v{Constants.expoConfig?.version}
      </Text>
    </View>
  );
}

function HomeStack() {
  const { activeColors: c } = useConfig();
  const labels = t();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ headerTitle: () => <HeaderTitle icon="add-circle-outline" label={labels.add_title} /> }}
      />
      <Stack.Screen
        name="AddCategory"
        component={AddCategoryScreen}
        options={{ headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.add_cat_title} /> }}
      />
      <Stack.Screen
        name="CreateCategory"
        component={CreateCategoryScreen}
        options={{ headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.create_cat_title} /> }}
      />
      <Stack.Screen
        name="ModifyCategory"
        component={ModifyCategoryScreen}
        options={{ headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.modify_cat_title} /> }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ headerTitle: () => <HeaderTitle icon="grid-outline" label={labels.nav_categories} /> }}
      />
      <Stack.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{ headerTitle: () => <HeaderTitle icon="wallet-outline" label={labels.nav_accounts} /> }}
      />
      <Stack.Screen
        name="ModifyAccount"
        component={ModifyAccountScreen}
        options={{ headerTitle: () => <HeaderTitle icon="wallet-outline" label={labels.modify_account_title} /> }}
      />
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
        options={{ headerTitle: () => <HeaderTitle icon="wallet-outline" label={labels.create_account_title} /> }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ headerTitle: () => <HeaderTitle icon="stats-chart-outline" label={labels.nav_transactions} /> }}
      />
      <Stack.Screen
        name="AllTransactions"
        component={AllTransactionsScreen}
        options={{ headerTitle: () => <HeaderTitle icon="stats-chart-outline" label={labels.nav_all_transactions} /> }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: () => <HeaderTitle icon="settings-outline" label={labels.nav_settings} /> }}
      />
      <Stack.Screen
        name="SettingsAppearance"
        component={AppearanceScreen}
        options={{ headerTitle: () => <HeaderTitle icon="color-palette-outline" label={labels.settings_appearance} /> }}
      />
      <Stack.Screen
        name="SettingsRegional"
        component={RegionalScreen}
        options={{ headerTitle: () => <HeaderTitle icon="globe-outline" label={labels.settings_regional} /> }}
      />
      <Stack.Screen
        name="SettingsPersonalization"
        component={PersonalizationScreen}
        options={{ headerTitle: () => <HeaderTitle icon="options-outline" label={labels.settings_personalization} /> }}
      />
      <Stack.Screen
        name="SettingsData"
        component={DataScreen}
        options={{ headerTitle: () => <HeaderTitle icon="server-outline" label={labels.settings_data} /> }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ headerTitle: () => <HeaderTitle icon="information-circle-outline" label={labels.details_title} /> }}
      />
      <Stack.Screen
        name="ModifyTransaction"
        component={ModifyTransactionScreen}
        options={{ headerTitle: () => <HeaderTitle icon="create-outline" label={labels.modify_title} /> }}
      />
      <Stack.Screen
        name="Tags"
        component={TagsScreen}
        options={{ headerTitle: () => <HeaderTitle icon="pricetag-outline" label={labels.nav_tags} /> }}
      />
      <Stack.Screen
        name="CreateTag"
        component={CreateTagScreen}
        options={{ headerTitle: () => <HeaderTitle icon="pricetag-outline" label={labels.create_tag_title} /> }}
      />
      <Stack.Screen
        name="ModifyTag"
        component={ModifyTagScreen}
        options={{ headerTitle: () => <HeaderTitle icon="pricetag-outline" label={labels.modify_tag_title} /> }}
      />
    </Stack.Navigator>
  );
}

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
