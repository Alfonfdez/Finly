import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import CategoriesScreen from '../screens/CategoriesScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RootStackParamList } from '../constants/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: c.surface }}>
      <View style={[styles.drawerHeader, { borderBottomColor: c.border }]}>
        <Text style={[styles.drawerTitle, { color: c.primary, fontSize: fs(24) }]}>Finly</Text>
      </View>
      <DrawerItem
        label={labels.nav_home}
        onPress={() => props.navigation.navigate('Main')}
        icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.text }]}
        activeTintColor={c.primary}
        inactiveTintColor={c.primary}
      />
      <DrawerItem
        label={labels.nav_settings}
        onPress={() => props.navigation.navigate('Main', { screen: 'Settings' })}
        icon={({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.text, fontSize: fs(14) }]}
        inactiveTintColor={c.primary}
      />
      <DrawerItem
        label={labels.nav_transactions}
        onPress={() => props.navigation.navigate('Main', { screen: 'Transactions' })}
        icon={({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.text, fontSize: fs(14) }]}
        inactiveTintColor={c.primary}
      />
      <DrawerItem
        label={labels.nav_categories}
        onPress={() => props.navigation.navigate('Main', { screen: 'Categories' })}
        icon={({ color, size }) => <Ionicons name="pricetag-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.text, fontSize: fs(14) }]}
        inactiveTintColor={c.primary}
      />
      <View style={[styles.separator, { backgroundColor: c.border }]} />
      <Text style={[styles.drawerSection, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.nav_coming_soon}</Text>
      <DrawerItem
        label={labels.nav_accounts}
        onPress={() => {}}
        icon={({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.textSecondary, fontSize: fs(14) }]}
        inactiveTintColor={c.textSecondary}
      />
    </DrawerContentScrollView>
  );
}

function HomeStack() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="add-circle-outline" size={20} color={c.text} />
            <Text style={{ color: c.text, fontSize: fs(17), fontWeight: '600' }}>{labels.add_title}</Text>
          </View>
        ),
      }} />
      <Stack.Screen name="AddCategory" component={AddCategoryScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="pricetag-outline" size={20} color={c.text} />
            <Text style={{ color: c.text, fontSize: fs(17), fontWeight: '600' }}>{labels.add_cat_title}</Text>
          </View>
        ),
      }} />
      <Stack.Screen name="CreateCategory" component={CreateCategoryScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="pricetag-outline" size={20} color={c.text} />
            <Text style={{ color: c.text, fontSize: fs(17), fontWeight: '600' }}>{labels.create_cat_title}</Text>
          </View>
        ),
      }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="pricetag-outline" size={20} color={c.text} />
            <Text style={{ color: c.text, fontSize: fs(17), fontWeight: '600' }}>{labels.nav_categories}</Text>
          </View>
        ),
      }} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="stats-chart-outline" size={20} color={c.text} />
            <Text style={{ color: c.text, fontSize: fs(17), fontWeight: '600' }}>{labels.nav_transactions}</Text>
          </View>
        ),
      }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="settings-outline" size={20} color={c.text} />
            <Text style={{ color: c.text, fontSize: fs(17), fontWeight: '600' }}>{labels.nav_settings}</Text>
          </View>
        ),
      }} />
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
    padding: 20,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  drawerTitle: {
    fontWeight: '800',
  },
  separator: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  drawerSection: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  drawerItemLabel: {},
});
