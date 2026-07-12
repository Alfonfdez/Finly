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
import TransactionsScreen from '../screens/TransactionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { RootStackParamList } from '../constants/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: c.fondoAlto }}>
      <View style={[styles.drawerHeader, { borderBottomColor: c.borde }]}>
        <Text style={[styles.drawerTitulo, { color: c.primario, fontSize: fs(24) }]}>Finly</Text>
      </View>
      <DrawerItem
        label={texto.nav_home}
        onPress={() => props.navigation.navigate('Main')}
        icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.texto }]}
        activeTintColor={c.primario}
        inactiveTintColor={c.primario}
      />
      <DrawerItem
        label={texto.nav_settings}
        onPress={() => props.navigation.navigate('Main', { screen: 'Settings' })}
        icon={({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.texto, fontSize: fs(14) }]}
        inactiveTintColor={c.primario}
      />
      <DrawerItem
        label={texto.nav_transactions}
        onPress={() => props.navigation.navigate('Main', { screen: 'Transactions' })}
        icon={({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.texto, fontSize: fs(14) }]}
        inactiveTintColor={c.primario}
      />
      <View style={[styles.separador, { backgroundColor: c.borde }]} />
      <Text style={[styles.drawerSeccion, { color: c.textoSuave, fontSize: fs(12) }]}>{texto.nav_coming_soon}</Text>
      <DrawerItem
        label={texto.nav_accounts}
        onPress={() => {}}
        icon={({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.textoSuave, fontSize: fs(14) }]}
        inactiveTintColor={c.textoSuave}
      />
      <DrawerItem
        label={texto.nav_categories}
        onPress={() => {}}
        icon={({ color, size }) => <Ionicons name="pricetag-outline" size={size} color={color} />}
        labelStyle={[styles.drawerItemLabel, { color: c.textoSuave, fontSize: fs(14) }]}
        inactiveTintColor={c.textoSuave}
      />
    </DrawerContentScrollView>
  );
}

function HomeStack() {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.fondoAlto },
        headerTintColor: c.texto,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: texto.nav_add }} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="stats-chart-outline" size={20} color={c.texto} />
            <Text style={{ color: c.texto, fontSize: fs(17), fontWeight: '600' }}>{texto.nav_transactions}</Text>
          </View>
        ),
      }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="settings-outline" size={20} color={c.texto} />
            <Text style={{ color: c.texto, fontSize: fs(17), fontWeight: '600' }}>{texto.nav_settings}</Text>
          </View>
        ),
      }} />
    </Stack.Navigator>
  );
}

function AppDrawer() {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { backgroundColor: c.fondoAlto, width: 260 },
        drawerLabelStyle: { color: c.texto, fontSize: fs(16) },
        drawerActiveTintColor: c.primario,
        drawerInactiveTintColor: c.textoSuave,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={HomeStack}
        options={{
          headerShown: false,
          drawerLabel: texto.nav_home,
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
  drawerTitulo: {
    fontWeight: '800',
  },
  separador: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  drawerSeccion: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  drawerItemLabel: {},
});
