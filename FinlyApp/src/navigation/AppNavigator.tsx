import { Text, View, StyleSheet } from 'react-native';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import { colores } from '../constants/colors';

const HomeStack = createNativeStackNavigator({
  screens: {
    Home: { screen: HomeScreen, options: { headerShown: false } },
    AddTransaction: { screen: AddTransactionScreen, options: { title: 'Añadir', headerStyle: { backgroundColor: colores.fondoAlto }, headerTintColor: colores.texto } },
    Transactions: { screen: TransactionsScreen, options: { title: 'Transacciones', headerStyle: { backgroundColor: colores.fondoAlto }, headerTintColor: colores.texto } },
  },
});

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} style={styles.drawerScroll}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitulo}>Finly</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.separador} />
      <Text style={styles.drawerSeccion}>Futuras funciones</Text>
      <DrawerItem
        label="Cuentas"
        onPress={() => {}}
        labelStyle={styles.drawerItemLabel}
        inactiveTintColor={colores.textoSuave}
      />
      <DrawerItem
        label="Categorías"
        onPress={() => {}}
        labelStyle={styles.drawerItemLabel}
        inactiveTintColor={colores.textoSuave}
      />
      <DrawerItem
        label="Ajustes"
        onPress={() => {}}
        labelStyle={styles.drawerItemLabel}
        inactiveTintColor={colores.textoSuave}
      />
    </DrawerContentScrollView>
  );
}

const AppDrawer = createDrawerNavigator({
  drawerContent: (props) => <CustomDrawerContent {...props} />,
  screens: {
    Main: {
      screen: HomeStack,
      options: {
        headerShown: false,
        drawerLabel: 'Inicio',
      },
    },
  },
  screenOptions: {
    drawerStyle: { backgroundColor: colores.fondoAlto, width: 260 },
    drawerLabelStyle: { color: colores.texto, fontSize: 16 },
    drawerActiveTintColor: colores.primario,
    drawerInactiveTintColor: colores.textoSuave,
  },
});

const Navigation = createStaticNavigation(AppDrawer);

export default Navigation;

const styles = StyleSheet.create({
  drawerScroll: {
    backgroundColor: colores.fondoAlto,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    marginBottom: 8,
  },
  drawerTitulo: {
    color: colores.primario,
    fontSize: 24,
    fontWeight: '800',
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  drawerSeccion: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  drawerItemLabel: {
    color: colores.textoSuave,
    fontSize: 14,
  },
});
