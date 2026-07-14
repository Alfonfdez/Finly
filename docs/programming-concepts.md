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

## SQLite (expo-sqlite)
**Definición:** Base de datos relacional embebida para React Native con soporte nativo en Expo.
**Explicación:** Almacena datos en un archivo local con esquema de tablas, relaciones y consultas SQL. Soporta integridad referencial, borrado en cascada, índices para optimizar consultas y migraciones versionadas. En Finly se usa en dispositivos móviles (Android/iOS) para persistir usuarios, cuentas, categorías y transacciones. No funciona en web porque depende de módulos nativos y WebAssembly que Expo bundler no resuelve correctamente.
**Ejemplo:**
```tsx
import { openDatabaseSync } from 'expo-sqlite';
const db = openDatabaseSync('Finly.db');
await db.runAsync('INSERT INTO cuentas (nombre, icono, color) VALUES (?, ?, ?)', 'Efectivo', 'wallet', '#22D3EE');
const cuentas = await db.getAllAsync('SELECT * FROM cuentas');
```

## localStorage
**Definición:** API del navegador para almacenar pares clave-valor de forma persistente en el navegador.
**Explicación:** Similar a AsyncStorage pero nativo del navegador. Los datos se guardan como strings JSON y persisten entre sesiones. Tiene un límite de ~5-10 MB según el navegador. En Finly se usa como alternativa a SQLite cuando la app se ejecuta en web, ya que expo-sqlite no está disponible en ese entorno.
**Ejemplo:**
```tsx
localStorage.setItem('@Finly/cuentas', JSON.stringify(cuentas));
const raw = localStorage.getItem('@Finly/cuentas');
const cuentas = raw ? JSON.parse(raw) : [];
```

## Plataforma switching (SQLite / localStorage)
**Definición:** Patrón que usa `Platform.OS` de React Native para seleccionar automáticamente la implementación de persistencia según el entorno de ejecución.
**Explicación:** Dado que `expo-sqlite` solo funciona en nativo (Android/iOS) y `localStorage` solo existe en web, se crea una capa de abstracción con la misma interfaz para ambas implementaciones. Un archivo `index.ts` exporta los repositorios correctos usando un condicional `Platform.OS === 'web'`. El resto de la app (AppContext, componentes) importa desde `index.ts` sin conocer la implementación subyacente. Esto permite que la app funcione en cualquier plataforma sin cambios en la lógica de negocio.
**Ejemplo:**
```tsx
// src/database/index.ts
import { Platform } from 'react-native';
import { cuentaRepo } from './repositories/cuentaRepo';       // SQLite
import { webCuentaRepo } from './webStorage';                  // localStorage

const isWeb = Platform.OS === 'web';
export const cuentaRepository = isWeb ? webCuentaRepo : cuentaRepo;

// AppContext.tsx — consume la implementación correcta automáticamente
import { cuentaRepository } from '../database';
const cuentas = await cuentaRepository.listar(usuarioId);
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

## useMemo
**Definición:** Hook de React que memoriza el resultado de un cálculo y solo lo recalcula cuando cambian sus dependencias.
**Explicación:** Cuando un valor derivado depende de varios estados, sin `useMemo` se recalcula en cada render. `useMemo` guarda el resultado y lo reutiliza si las dependencias no cambian. Es útil para objetos y arrays derivados que se pasan como props o se usan en comparaciones.
**Ejemplo:**
```tsx
// ❌ Cada render crea un nuevo objeto → todos los useEffect dependientes se re-ejecutan
const fechas = periodoActivo === 'periodo'
  ? fechaPersonalizada
  : calcularInicioFin(periodoActivo, fechaSeleccionada);

// ✅ Solo se recalcula cuando cambian periodoActivo, fechaPersonalizada o fechaSeleccionada
const fechas = useMemo(
  () => periodoActivo === 'periodo'
    ? fechaPersonalizada
    : calcularInicioFin(periodoActivo, fechaSeleccionada),
  [periodoActivo, fechaPersonalizada, fechaSeleccionada],
);
```

## Spread Antes de .sort() (Evitar Mutación)
**Definición:** Usar el spread operator `[...array]` antes de `.sort()` para no mutar el array original.
**Explicación:** El método `.sort()` de JavaScript **ordena el array in-place**, es decir, lo modifica directamente. Si ese array es estado de React, mutar su referencia interna causa bugs (el componente no se re-renderiza o se comporta de forma impredecible). Al hacer `[...lista].sort(...)`, se crea una copia y se ordena esa copia, dejando el original intacto.
**Ejemplo:**
```tsx
// ❌ Mutación in-place: modifica el array de estado directamente
return lista.sort((a, b) => b.fecha - a.fecha);

// ✅ Copia segura: no toca el array original
return [...lista].sort((a, b) => b.fecha - a.fecha);
```

## Evitar Dependencias Circulares en Tipos
**Definición:** Cuando dos archivos se importan mutuamente (A importa de B, B importa de A), se produce una dependencia circular que puede causar errores de runtime.
**Explicación:** En TypeScript, si `types.ts` importa un tipo de `mockData.ts` y `mockData.ts` importa otro tipo de `types.ts`, se crea un bucle. La solución es romper la cadena definiendo los campos necesarios directamente en el archivo que los necesita, en lugar de importarlos. Esto es especialmente común con tipos derivados (`type A = B & { extra }`) donde se puede reescribir inline.
**Ejemplo:**
```tsx
// ❌ types.ts importa de mockData.ts, y mockData.ts importa de types.ts → circular
import { Categoria } from '../data/mockData';
export type CategoriaConTotal = Categoria & { total: number; porcentaje: number };

// ✅ Definir los campos inline rompe la dependencia circular
export type CategoriaConTotal = {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  tipo: TipoTransaccion;
  total: number;
  porcentaje: number;
};
```

## Código Muerto: Ramas Idénticas
**Definición:** Bloques de código cuyas ramas alternativas producen exactamente el mismo resultado, haciendo la condición redundante.
**Explicación:** Cuando un `if/else` retorna lo mismo en ambas ramas, la condición es inútil y el código completo puede simplificarse eliminando el `if/else` y dejando solo el retorno. Esto mejora la legibilidad y reduce la complejidad mantenido.
**Ejemplo:**
```tsx
// ❌ Ambas ramas retornan lo mismo → el if es inútil
if (inicio.getMonth() === fin.getMonth()) {
  return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;
}
return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;

// ✅ Simplificado: una sola línea
return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;
```

## ComponentProps (Tipado Seguro de Librerías)
**Definición:** Tipo utility de React que extrae los props de un componente, permitiendo tipar valores dinámicos de librerías externas sin usar `as any`.
**Explicación:** Cuando una librería como `@expo/vector-icons` define un tipo union para un prop (ej: los nombres de iconos), usar `as any` anula la verificación de tipos y oculta errores. `ComponentProps<typeof Component>['prop']` extrae el tipo exacto del prop desde la definición del componente, manteniendo la seguridad de tipos. Es la forma correcta de tipar valores que vienen de datos externos (mock data, base de datos) pero que se usan como props de componentes tipados.
**Ejemplo:**
```tsx
// ❌ as any: pierde toda verificación de tipos
<Ionicons name={item.icono as any} size={22} color={item.color} />

// ✅ ComponentProps: tipado seguro contra la definición del componente
import { ComponentProps } from 'react';
<Ionicons name={item.icono as ComponentProps<typeof Ionicons>['name']} size={22} color={item.color} />
```

## Extracción de Funciones Puras Fuera del Componente
**Definición:** Mover funciones que no dependen de hooks o estado del cuerpo del componente al scope del archivo, para que no se recreen en cada render.
**Explicación:** Cuando una función se define dentro de un componente React, se crea una nueva referencia en cada render. Si esa función se pasa como prop o se usa en un `useMemo`, provoca re-renderizaciones innecesarias. Las funciones puras (que solo dependen de sus parámetros) pueden definirse fuera del componente y recibir los valores necesarios como argumentos. Esto las hace singleton: una sola referencia para toda la vida del componente.
**Ejemplo:**
```tsx
// ❌ Se recrea en cada render
function WeekPicker({ fecha, primerDia }) {
  function mismaSemana(a, b) {
    return inicioDeSemana(a, primerDia).getTime() === inicioDeSemana(b, primerDia).getTime();
  }
}

// ✅ Definida fuera, referencia estable
function mismaSemana(a: Date, b: Date, primerDia: 0 | 1): boolean {
  return inicioDeSemana(a, primerDia).getTime() === inicioDeSemana(b, primerDia).getTime();
}

function WeekPicker({ fecha, primerDia }) {
  // mismaSemana se llama con primerDia como argumento
  const seleccionada = mismaSemana(sem.inicio, fecha, primerDia);
}
```

## Single-Pass Reduce (Evitar Filter + Reduce)
**Definición:** Reemplazar múltiples iteraciones (filter followed by reduce) por un único `reduce` que acumula directamente el resultado deseado.
**Explicación:** El patrón `.filter(...).reduce(...)` itera el array dos veces: una para filtrar y otra para acumular. Con `.reduce()` se puede hacer ambas cosas en una sola pasada, reduciendo la complejidad de O(2n) a O(n). Esto es especialmente valioso cuando se procesan arrays grandes o cuando se necesita calcular múltiples métricas del mismo array. En lugar de N filtros × M cuentas, se hace un solo `reduce` que acumula un mapa de resultados.
**Ejemplo:**
```tsx
// ❌ O(accounts × transactions): itera transacciones por cada cuenta
cuentas.map(cuenta => {
  const ingresos = transacciones
    .filter(t => t.cuentaId === cuenta.id && t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.cantidad, 0);
  const gastos = transacciones
    .filter(t => t.cuentaId === cuenta.id && t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.cantidad, 0);
  return { ...cuenta, saldo: ingresos - gastos };
});

// ✅ O(transactions): un solo reduce acumula saldos por cuentaId
const saldos = transacciones.reduce((acc, t) => {
  acc[t.cuentaId] = (acc[t.cuentaId] ?? 0) + (t.tipo === 'ingreso' ? t.cantidad : -t.cantidad);
  return acc;
}, {});
cuentas.map(cuenta => ({ ...cuenta, saldo: saldos[cuenta.id] ?? 0 }));
```

# SQL y Base de Datos

## PRAGMA user_version
**Definición:** Metadato entero que SQLite almacena en el encabezado de la base de datos para controlar qué migraciones se han ejecutado.
**Explicación:** Se usa como contador de versión del esquema. Cada migración comprueba si `user_version` es menor que su número, ejecuta los cambios SQL necesarios y luego incrementa el valor con `PRAGMA user_version = N`. Así, la app sabe en cada arranque qué migraciones faltan sin necesidad de tablas de control adicionales. En Finly, el esquema pasa de versión 0 → 1 (tablas), 1→2 (seed), 2→3 (configuración), 3→4 (nuevas categorías).
**Ejemplo:**
```tsx
let { user_version: v } = await db.getFirstAsync('PRAGMA user_version');
if (v < 1) { await migrate001(db); v = 1; }
if (v < 2) { await seed002(db); v = 2; }
await db.execAsync(`PRAGMA user_version = ${v}`);
```

## INSERT OR IGNORE
**Definición:** Variante de INSERT que silenciosamente omite la inserción si la fila viola una restricción de clave duplicada (PRIMARY KEY o UNIQUE).
**Explicación:** Muy útil en semillas (seeds) y migraciones para que la app pueda ejecutar el mismo script de inicialización sin fallos si los datos ya existen. El problema es que no actualiza registros existentes: si cambiaste un valor entre versiones (ej: un icono), INSERT OR IGNORE no sobreescribirá el viejo. En ese caso hay que usar un UPDATE por separado.
**Ejemplo:**
```tsx
// Inserta la categoría solo si id=10 no existe aún
await db.runAsync(
  'INSERT OR IGNORE INTO categorias (id, nombre, icono) VALUES (?, ?, ?)',
  10, 'Videojuego', 'game-controller-outline'
);
// Si ya existe id=10, no hace nada — el icono viejo se queda
```

## Datos obsoletos en almacenamiento persistente
**Definición:** Situación en la que los datos guardados en la base de datos o en localStorage contienen valores de versiones anteriores del código que ya no son válidos.
**Explicación:** Cuando se corrige un valor en el código fuente (ej: renombrar un icono de `gamepad-outline` a `game-controller-outline`), los usuarios que ya tienen datos guardados no reciben el cambio automáticamente, porque la persistencia conserva los valores viejos. Esto produce errores de runtime como `"'gamepad-outline' is not a valid icon name"`. La solución es añadir lógica de actualización que se ejecute en cada arranque, corrigiendo los valores obsoletos conocidos.
**Ejemplo:**
```tsx
// webStorage.ts — migra iconos obsoletos en localStorage
function migrateWebCategories(): void {
  const categorias = getStore<Categoria>('categorias');
  const invalidIcons: Record<string, string> = {
    'gamepad-outline': 'game-controller-outline',
  };
  const updated = categorias.map(c => ({
    ...c,
    icono: invalidIcons[c.icono] ?? c.icono,
  }));
  setStore('categorias', updated);
}

// database.ts — migra iconos obsoletos en SQLite (cada arranque)
await db.runAsync(`UPDATE categorias SET icono = 'game-controller-outline' WHERE id = 10`);
```

## Migración de datos vs. Migración de esquema
**Definición:** Distinción entre cambios en la estructura de tablas (esquema) y cambios en el contenido de los registros existentes (datos).
**Explicación:** La migración de esquema crea tablas, añade columnas o índices y se ejecuta una sola vez controlada por `PRAGMA user_version`. La migración de datos corrige o actualiza registros existentes y debe ejecutarse en cada arranque (o con su propio control de versión), porque los datos obsoletos pueden estar presentes en cualquier versión del esquema. En Finly, `seed004` es migración de esquema (INSERT OR IGNORE), mientras que las líneas de UPDATE en `initDatabase()` son migración de datos que corren siempre.
**Ejemplo:**
```tsx
// Migración de esquema — una sola vez (controlada por PRAGMA)
if (v < 4) { await seed004(db); }

// Migración de datos — cada arranque (corregir valores obsoletos)
await db.runAsync(`UPDATE categorias SET icono = ? WHERE id = ?`, nuevoIcono, id);
```

## Diferencia entre nativo (SQLite) y web (localStorage) en migraciones
**Definición:** En entornos nativos, la migración corre una sola vez gracias a `PRAGMA user_version`; en web, los datos viven en `localStorage` y no hay control de versión automático.
**Explicación:** En nativo, SQLite conserva el `PRAGMA user_version` entre sesiones, así que cada migración se ejecuta exactamente una vez. En web, `localStorage` es un diccionario simple sin concepto de versión, por lo que la lógica de migración de datos debe ejecutarse siempre que la app arranca (similar a un "check de integridad"). Esto implica que las migraciones web deben ser idempotentes: ejecutarlas varias veces produce el mismo resultado que ejecutarlas una sola vez.
**Ejemplo:**
```tsx
// webStorage.ts — se ejecuta cada vez que la app arranca en web
export async function initWebStorage(): Promise<void> {
  const usuarios = getStore<Usuario>('usuarios');
  if (usuarios.length === 0) {
    seedWebData();
  } else {
    migrateWebCategories(); // idempotente: corrige datos obsoletos
  }
}

# App icons (Expo)

## App icon
**Definición:** Imagen PNG que representa la app en la pantalla de inicio del dispositivo, el menú de aplicaciones y las configuraciones del sistema.
**Explicación:** Expo usa `icon.png` (1024×1024) como icono principal. Durante el build, Expo la redimensiona automáticamente a todos los tamaños que cada plataforma necesita. En `app.json` se referencia en `expo.icon`.
**Ejemplo:**
```json
{
  "expo": {
    "icon": "./assets/icon.png"
  }
}
```

## Android adaptive icon
**Definición:** Sistema de iconos adaptativos de Android 8+ (API 26+) que permite diferentes formas (círculo, cuadrado, squirucle) según el fabricante.
**Explicación:** Se compone de dos capas PNG de 1024×1024: foreground (la imagen del logo, con fondo transparente) y background (un color sólido). Android las recorta según la máscara del dispositivo. También hay una capa monochrome opcional (API 33+) para themed icons. En Expo se configuran en `expo.android.adaptiveIcon`.
**Ejemplo:**
```json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundColor": "#E6F4FE",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    }
  }
}
```

## Splash screen
**Definición:** Pantalla de carga que se muestra brevemente mientras la app se inicia.
**Explicación:** Expo muestra una splash screen nativa mientras carga el bundle de JavaScript. Se configura con una imagen PNG centrada y un color de fondo. En Expo SDK 54+ se recomienda configurarlo en `expo.splash` de `app.json` (no mediante el plugin legacy `expo-splash-screen`).
**Ejemplo:**
```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    }
  }
}
```

## Favicon
**Definición:** Icono que aparece en la pestaña del navegador al abrir la app en web.
**Explicación:** Expo usa `favicon.png` (48×48) para web. Se referencia en `expo.web.favicon`. Solo aplica a la plataforma web.
**Ejemplo:**
```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

