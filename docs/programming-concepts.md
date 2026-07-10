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

