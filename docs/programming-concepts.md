# Programming concepts

# React Native

## React Native
**Definición:** Framework para construir aplicaciones móviles nativas usando JavaScript/TypeScript y React.
**Explicación:** Permite escribir una app que funciona en iOS y Android con el mismo código base. Usa componentes nativos reales (no WebView). Finly usa React Native con Expo para facilitar el desarrollo.
**Ejemplo:**
```tsx
import { View, Text } from 'react-native';
export default function Saludo() {
  return <View><Text>Hola</Text></View>;
}
```

## Expo
**Definición:** Plataforma y conjunto de herramientas que simplifica el desarrollo con React Native.
**Explicación:** Proporciona una SDK preconfigurada, manejo de builds, OTA updates, y acceso a APIs del dispositivo sin configuraciones nativas. Finly usa Expo managed workflow.
**Ejemplo:**
```bash
npx create-expo-app@latest FinlyApp --template blank-typescript
npx expo start
```

## StyleSheet.create
**Definición:** Método de React Native para crear estilos de forma eficiente.
**Explicación:** Los estilos se definen como objetos JavaScript. `create()` optimiza el rendimiento al crear los estilos una sola vez y reutilizarlos. Es la alternativa al CSS tradicional.
**Ejemplo:**
```tsx
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  texto: { color: '#E2E8F0', fontSize: 16 },
});
```

## react-native-worklets
**Definición:** Librería que ejecuta funciones de JavaScript en un hilo separado para no bloquear la UI.
**Explicación:** react-native-reanimated la usa internamente para animaciones fluidas en el hilo de la UI. Cada versión de Expo SDK requiere una versión específica. Si hay mismatch, da error `TurboModule method "installTurboModule" called with 1 arguments`.
**Ejemplo:**
```bash
# SDK 54 requiere worklets 0.5.1
npx expo install react-native-worklets@0.5.1
```

# TypeScript

## Interfaces vs Types
**Definición:** Mecanismos de TypeScript para definir la forma de los objetos.
**Explicación:** Las interfaces (`interface`) se usan para definir contratos de objetos y son extendibles. Los tipos (`type`) son más flexibles (uniones, tuplas). En Finly se usan interfaces para los modelos de datos.
**Ejemplo:**
```tsx
interface Cuenta {
  id: number;
  nombre: string;
  saldo: number;
  icono: string;
}
```

## Type Re-export (Re-exportación de tipos)
**Definición:** Patrón de TypeScript para re-exportar tipos desde un archivo centralizado, manteniendo una única fuente de verdad.
**Explicación:** Cuando varios archivos necesitan el mismo tipo, se define en un solo lugar y se re-exporta con `export type { X }`. Esto evita definiciones duplicadas y facilita el mantenimiento. En Finly, `calendars/types.ts` re-exporta `Periodo` desde `constants/types.ts`.
**Ejemplo:**
```tsx
// constants/types.ts — definición original
export type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo';

// calendars/types.ts — re-exportación
import { Periodo } from '../../constants/types';
export type { Periodo };
```

# React

## Context API
**Definición:** Sistema de React para compartir estado entre componentes sin pasar props manualmente.
**Explicación:** `createContext` crea un contenedor de estado. `Provider` inyecta el estado en el árbol. `useContext` (o un hook personalizado como `useApp`) lo consume. Evita el "prop drilling".
**Ejemplo:**
```tsx
const AppContext = createContext<AppContextType | null>(null);
// Provider envuelve toda la app
// useApp() consume el contexto desde cualquier componente hijo
```

## useState
**Definición:** Hook de React para añadir estado local a componentes funcionales.
**Explicación:** Devuelve un par [valor, setter]. Cuando el estado cambia, el componente se re-renderiza. Se usa en Finly para controlar modales, pestañas activas, etc.
**Ejemplo:**
```tsx
const [modalVisible, setModalVisible] = useState(false);
```

## useMemo
**Definición:** Hook de React que memoriza el resultado de un cálculo costoso.
**Explicación:** Solo recalcula cuando cambian las dependencias. En Finly se usa para filtrar transacciones, calcular totales y generar categorías activas sin recalcular en cada render.
**Ejemplo:**
```tsx
const totalGastos = useMemo(() =>
  transacciones.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.cantidad, 0),
  [transacciones]
);
```

## useCallback
**Definición:** Hook de React que memoriza funciones para evitar recrearlas en cada render.
**Explicación:** Similar a useMemo pero para funciones. Útil para pasarlas como props a componentes hijos y evitar renders innecesarios.
**Ejemplo:**
```tsx
const handleCategoriaPress = useCallback((cat) => {
  navigation.navigate('Transactions', { categoriaId: cat.id });
}, [navigation]);
```

# Navegación

## React Navigation (Stack Navigator)
**Definición:** Sistema de navegación que apila pantallas una encima de otra.
**Explicación:** Cada pantalla nueva se coloca sobre la anterior. El usuario puede volver atrás con el botón nativo. En Finly se usa para navegar de Home a AddTransaction o Transactions.
**Ejemplo:**
```tsx
const Stack = createNativeStackNavigator({
  screens: {
    Home: { screen: HomeScreen, options: { headerShown: false } },
    AddTransaction: { screen: AddTransactionScreen },
  },
});
```

## React Navigation (Drawer Navigator)
**Definición:** Menú lateral que se despliza desde el borde izquierdo de la pantalla.
**Explicación:** Muestra opciones de navegación en un panel oculto. En Finly contiene Inicio, y placeholders para Cuentas, Categorías y Ajustes.
**Ejemplo:**
```tsx
const Drawer = createDrawerNavigator({
  screens: { Main: { screen: HomeStack } },
  screenOptions: { drawerStyle: { backgroundColor: '#1E293B' } },
});
```

## DrawerActions
**Definición:** Acciones reutilizables para controlar el Drawer Navigator desde cualquier pantalla, incluso si está anidada en otro navigator.
**Explicación:** Cuando un Screen está dentro de un Stack que a su vez está dentro de un Drawer, `navigation.openDrawer()` no existe en el tipo del Stack. La solución es despachar la acción con `navigation.dispatch(DrawerActions.openDrawer())`. Es el patrón recomendado por React Navigation.
**Ejemplo:**
```tsx
import { useNavigation, DrawerActions } from '@react-navigation/native';

function MiPantalla() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <Text>Abrir menú</Text>
    </TouchableOpacity>
  );
}
```

## NativeStackNavigationProp
**Definición:** Tipo de TypeScript que define las operaciones de navegación disponibles en un NativeStackNavigator.
**Explicación:** Se usa para tipar `useNavigation()` y obtener autocompletado de `navigation.navigate('ScreenName', params)`. Evita errores en tiempo de compilación al pasar nombres de pantalla o parámetros incorrectos.
**Ejemplo:**
```tsx
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Transactions: { categoriaId?: number } | undefined;
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  navigation.navigate('Transactions', { categoriaId: 1 });
}
```

## RouteProp
**Definición:** Tipo de TypeScript que define la forma de los parámetros de ruta recibidos por un screen.
**Explicación:** Se usa con `useRoute()` para acceder a los parámetros de navegación con tipado seguro. Elimina la necesidad de hacer casts con `as`. En Finly se usa en TransactionsScreen para recibir `categoriaId` y `tipo`.
**Ejemplo:**
```tsx
import { useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Transactions: { categoriaId?: number; tipo?: string } | undefined;
};

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const categoriaId = route.params?.categoriaId;
}
```

# SVG y Gráficos

## react-native-svg
**Definición:** Librería para renderizar gráficos SVG en React Native.
**Explicación:** Permite dibujar formas vectoriales (círculos, rectángulos, rutas) directamente en la app. Finly la usa para el gráfico de anillos (DonutChart) con elementos `<Circle>` y `strokeDasharray`.
**Ejemplo:**
```tsx
import Svg, { Circle } from 'react-native-svg';
<Svg width={160} height={160}>
  <Circle cx="80" cy="80" r={60} stroke="#22D3EE" strokeWidth={15} fill="none" />
</Svg>
```

## strokeDasharray
**Definición:** Propiedad SVG que controla el patrón de trazos y espacios en una línea.
**Explicación:** Se usa en el DonutChart para crear segmentos de anillo. Cada categoría ocupa una porción de la circunferencia total calculada como `(porcentaje / 100) * 2 * PI * radio`.
**Ejemplo:**
```tsx
<Circle
  strokeDasharray={`${longitud} ${circunferencia - longitud}`}
  strokeDashoffset={-offsetAcumulado}
/>
```

# Persistencia

## AsyncStorage
**Definición:** Sistema de almacenamiento local clave-valor, asíncrono y persistente para React Native.
**Explicación:** Similar a localStorage en web. Guarda datos como strings JSON. En Finly se usa para persistir cuentas, categorías y transacciones. Es simple pero no soporta consultas complejas ni relaciones.
**Ejemplo:**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('@Finly/cuentas', JSON.stringify(datos));
const data = JSON.parse(await AsyncStorage.getItem('@Finly/cuentas') ?? '[]');
```

# Componentes UI

## FlatList
**Definición:** Componente de React Native para renderizar listas largas de forma eficiente.
**Explicación:** Solo renderiza los elementos visibles en pantalla (virtualización), lo que ahorra memoria. Acepta `data`, `renderItem` y `keyExtractor`. Se usa en CategoryList, AccountModal y TransactionsScreen.
**Ejemplo:**
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <Text>{item.nombre}</Text>}
/>
```

## Modal
**Definición:** Componente de React Native que muestra contenido superpuesto sobre la pantalla actual.
**Explicación:** Útil para diálogos, selectores o formularios sin cambiar de pantalla. En Finly se usa para el selector de cuentas (AccountModal) y el selector de fechas (CalendarModal).
**Ejemplo:**
```tsx
<Modal visible={visible} transparent animationType="slide">
  <View style={overlay}><Text>Contenido del modal</Text></View>
</Modal>
```

## TouchableOpacity
**Definición:** Componente de React Native que reacciona al toque con un efecto de opacidad.
**Explicación:** Envuelve cualquier elemento para hacerlo pulsable. Al presionarlo reduce su opacidad. `hitSlop` amplía el área táctil para mejorar accesibilidad.
**Ejemplo:**
```tsx
<TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
  <Text>Pulsar</Text>
</TouchableOpacity>
```

## SafeAreaView
**Definición:** Componente de React Native que respeta las áreas seguras de la pantalla (notch, barra de estado, etc.).
**Explicación:** Evita que el contenido quede oculto detrás de elementos del sistema operativo. Se usa en todas las pantallas de Finly.
**Ejemplo:**
```tsx
<SafeAreaView style={{ flex: 1 }}>
  <Text>Contenido seguro</Text>
</SafeAreaView>
```

# Principios de diseño

## Single Source of Truth (SSOT)
**Definición:** Principio de diseño que establece que cada pieza de información debe tener una única fuente authoritative en el sistema.
**Explicación:** Evita inconsistencias causadas por datos duplicados en múltiples ubicaciones. Cuando un valor cambia, solo se modifica en un sitio. En Finly, los tipos como `Periodo` se definen una sola vez en `constants/types.ts` y se importan desde allí en todos los archivos que los necesitan, en lugar de redefinirlos en cada componente.
**Ejemplo:**
```tsx
// ✅ SSOT: un solo archivo define el tipo
// constants/types.ts
export type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo';

// componentes importan desde la fuente única
import { Periodo } from '../constants/types';

// ❌ Sin SSOT: el mismo tipo definido en 3 archivos diferentes
type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo'; // en AppContext
type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo'; // en PeriodTabs
type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo'; // en calendars/types
```

## Named Constants (Evitar Magic Numbers)
**Definición:** Sustituir valores literales hardcodeados por constantes con nombre descriptivo.
**Explicación:** Los "magic numbers" o "magic strings" son valores aparecidos de la nada en el código que dificultan la comprensión y el mantenimiento. Si el valor cambia, hay que buscarlo en todo el código. Al extraerlo a una constante con nombre, se entiende su propósito y se puede modificar en un solo lugar. En Finly, `new Date(2026, 0, 1)` se reemplazó por `new Date(ANIO_MINIMO, 0, 1)` donde `ANIO_MINIMO` es una constante calculada dinámicamente.
**Ejemplo:**
```tsx
// ❌ Magic number: ¿por qué 2026?
const fechaMinima = new Date(2026, 0, 1);

// ✅ Named constant: el propósito es claro
const ANIO_MINIMO = new Date().getFullYear();
const fechaMinima = new Date(ANIO_MINIMO, 0, 1);
```

