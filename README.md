# Finly

App para gestionar ingresos y gastos personales con múltiples cuentas, categorías personalizables, filtros por período y gráficos visuales.

![Vista previa de la app](images/excalidraw/Finly_v2.png)

## Metodología

**Specification-Driven Development (SDD).** Las especificaciones están en `spec/` y son la única fuente de verdad. Primero se define qué construir, luego se implementa.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React Native con Expo (SDK 54) |
| Lenguaje | TypeScript |
| Navegación | React Navigation (Stack + Drawer) |
| Gráficos | react-native-svg |
| Color picker | reanimated-color-picker |
| Persistencia | SQLite (expo-sqlite) en nativo, localStorage en web |
| Web | react-native-web |
| Estado | Context API (AppContext + ConfigContext) |
| i18n | Sistema propio (español, inglés, catalán) |

## Cómo empezar

### Requisitos

- Node.js 18+
- npm
- Expo Go (app móvil gratuita) para verlo en el móvil

### Primera vez al clonar

```bash
cd FinlyApp
npm install
npx expo start
```

Esto arranca Metro Bundler. A partir de ahí:

| Para ver en… | Haz esto |
|---|---|
| **Navegador** | Abre [http://localhost:8081](http://localhost:8081) o ejecuta `npx expo start --web` |
| **Móvil (Expo Go)** | Pulsa la tecla **`s`** en la terminal y escanéa el QR con Expo Go |

> Si `expo` no se reconoce como comando, usa `npx expo ...` o `npm run web`.

### Notas importantes

- Este proyecto usa **Expo SDK 54** por compatibilidad con Expo Go. No actualices el SDK ni ejecutes `npm audit fix --force` (rompe las versiones).
- Si al escanear el QR en Expo Go no pasa nada, asegúrate de haber pulsado **`s`** para cambiar a modo Expo Go (el mensaje debe poner "Scan the QR code to open in Expo Go").
- Si da error `TurboModule method "installTurboModule"`, ejecuta:
  ```bash
  npx expo install react-native-worklets@0.5.1
  ```

### Otros comandos

| Comando | Descripción |
|---|---|
| `npm start` | Arranca Expo en modo desarrollo |
| `npm run web` | Arranca y abre en navegador |
| `npm run android` | Arranca en emulador Android |
| `npm run ios` | Arranca en simulador iOS (solo macOS) |

### Desarrollo por USB (sin red compartida)

Útil cuando el PC y el móvil no están en la misma red (ej. en clase).

**Requisitos previos:**
- Habilitar depuración USB en el móvil: Ajustes → Acerca del teléfono → tocar "Número de compilación" 7 veces → Ajustes → Opciones del desarrollador → activar "Depuración USB"
- Descargar `adb` (Android Debug Bridge):
  ```bash
  Invoke-WebRequest -Uri "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -OutFile "$env:TEMP\platform-tools.zip"
  Expand-Archive -Path "$env:TEMP\platform-tools.zip" -DestinationPath "C:\platform-tools" -Force
  ```
- Para que `adb` esté disponible globalmente, reiniciar la terminal después de la instalación.

**Pasos:**
1. Conectar el móvil al PC con cable USB
2. Reenviar el puerto con adb:
   ```bash
   C:\platform-tools\adb.exe reverse tcp:8081 tcp:8081
   ```
3. Arrancar Expo:
   ```bash
   npx expo start
   ```
4. En Expo Go: agitar el móvil → "Introducir URL manualmente" → escribir:
   ```
   exp://localhost:8081
   ```

### Desarrollo por USB Tethering (sin ADB, sin red compartida)

Alternativa cuando ADB no detecta el móvil (ej. drivers no instalados, cable sin datos).

**Requisito:** Datos móviles activos en el teléfono.

**Pasos:**
1. Conectar el móvil al PC con cable USB
2. En el móvil: **Ajustes → Conexiones → Zona WiFi compartida / USB tethering → activar "USB tethering"**
3. En el PC, arrancar Expo:
   ```bash
   npx expo start
   ```
4. Pulsar **`s`** para cambiar a modo Expo Go y escanear el QR

El PC navega a través de los datos del móvil, por lo que ambos dispositivos están en la misma red virtual. No requiere ADB ni `adb reverse`.

### Desarrollo por Tunnel (sin red compartida, sin cable)

```bash
npx expo start --tunnel
```
Requiere `@expo/ngrok` instalado globalmente (`npm install -g @expo/ngrok`). Funciona desde cualquier red pero es más lento.

## Estructura del proyecto

```
Finly/
├── FinlyApp/                    ← App React Native / Expo
│   ├── App.tsx                      ← Punto de entrada
│   ├── app.json                     ← Configuración Expo
│   ├── src/
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx     ← Stack + Drawer navigator
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx       ← Pantalla principal
│   │   │   ├── AddTransactionScreen.tsx ← Añadir gasto/ingreso
│   │   │   ├── AddCategoryScreen.tsx← Seleccionar categoría
│   │   │   ├── CreateCategoryScreen.tsx ← Crear categoría
│   │   │   ├── TransactionsScreen.tsx ← Listado de transacciones
│   │   │   └── SettingsScreen.tsx   ← Configuración de la app
│   │   ├── components/
│   │   │   ├── AccountModal.tsx     ← Modal de selección de cuentas
│   │   │   ├── CalculatorModal.tsx  ← Calculadora básica
│   │   │   ├── DonutChart.tsx       ← Gráfico de anillos SVG
│   │   │   ├── BarChart.tsx         ← Barra horizontal apilada
│   │   │   ├── CategoryList.tsx     ← Lista de desglose por categorías
│   │   │   ├── CategoryGrid.tsx     ← Grid 4×N de categorías
│   │   │   ├── ColorGrid.tsx        ← Selector de colores rápido
│   │   │   ├── ColorPickerModal.tsx ← Selector de color dinámico
│   │   │   ├── IconGrid.tsx         ← Grid de iconos
│   │   │   ├── CalendarPicker.tsx   ← Selector de fecha textual
│   │   │   ├── CalendarModal.tsx    ← Modal contenedor de calendarios
│   │   │   ├── DaySelector.tsx      ← Selector de día (Hoy/Ayer/Dinámico)
│   │   │   ├── PeriodTabs.tsx       ← Tabs Día/Semana/Mes/Año/Período
│   │   │   ├── TypeTabs.tsx         ← Tabs Gastos/Ingresos
│   │   │   ├── SearchBar.tsx        ← Barra de búsqueda reutilizable
│   │   │   ├── TagSection.tsx       ← Sección de etiquetas
│   │   │   ├── CommentInput.tsx     ← Input de comentario con contador
│   │   │   ├── PhotoSection.tsx     ← Sección de foto (cámara/galería)
│   │   │   └── calendars/           ← Selectores de fecha
│   │   │       ├── DayPicker.tsx
│   │   │       ├── WeekPicker.tsx
│   │   │       ├── MonthGrid.tsx
│   │   │       ├── MonthNav.tsx
│   │   │       ├── YearGrid.tsx
│   │   │       ├── YearNav.tsx
│   │   │       ├── PeriodPicker.tsx
│   │   │       └── types.ts
│   │   ├── context/
│   │   │   ├── AppContext.tsx        ← Estado de negocio
│   │   │   └── ConfigContext.tsx     ← Preferencias del usuario
│   │   ├── database/
│   │   │   ├── database.ts          ← Inicialización SQLite + migraciones
│   │   │   ├── types.ts             ← Interfaces TypeScript
│   │   │   ├── index.ts             ← Switching por plataforma
│   │   │   ├── webStorage.ts        ← Fallback localStorage para web
│   │   │   ├── migrations/
│   │   │   │   ├── 001_initial.ts
│   │   │   │   ├── 002_seed.ts
│   │   │   │   ├── 003_config.ts
│   │   │   │   ├── 004_new_categories.ts
│   │   │   │   └── 005_english_schema.ts
│   │   │   └── repositories/
│   │   │       ├── userRepo.ts
│   │   │       ├── accountRepo.ts
│   │   │       ├── categoryRepo.ts
│   │   │       ├── transactionRepo.ts
│   │   │       └── configRepo.ts
│   │   ├── i18n/
│   │   │   ├── index.ts             ← Selector de idioma + helpers
│   │   │   ├── en.ts
│   │   │   ├── es.ts
│   │   │   └── ca.ts
│   │   ├── hooks/
│   │   │   └── useFontSize.ts       ← Hook de escalado de texto
│   │   ├── constants/
│   │   │   ├── themes.ts            ← Paletas dark + light
│   │   │   ├── colors.ts            ← Paleta legacy
│   │   │   ├── types.ts             ← Tipos compartidos
│   │   │   └── platformStyles.ts    ← Estilos por plataforma
│   │   ├── data/
│   │   │   └── mockData.ts          ← Datos mock (legacy)
│   │   └── utils/
│   │       ├── calculator.ts        ← Evaluador de expresiones
│   │       └── formatters.ts        ← Formatear moneda, fechas, etc.
│   ├── assets/
│   ├── package.json
│   └── tsconfig.json
│
├── spec/                         ← Especificaciones SDD
│   ├── constitution/
│   └── features/
│       ├── 001-pagina-inicial/
│       ├── 002-diseño-DB/
│       ├── 003-pagina-configuracion/
│       ├── 004-pagina-transaccion/
│       ├── 005-pagina-anadir-categoria/
│       ├── 006-pagina-crear-categoria/
│       └── 007-calculadora/
│
├── .agents/skills/               ← Skills para asistentes IA
├── docs/                         ← Documentación de conceptos
├── images/                       ← Diagramas y wireframes
├── AGENTS.md                     ← Reglas SDD globales
└── README.md                     ← Este archivo
```

## Funcionalidades

- Gestión de múltiples cuentas
- Registro de ingresos y gastos por categorías
- Filtros por período: Día, Semana, Mes, Año, Período personalizado
- Selector de fecha interactivo (DateTimePicker)
- Gráfico de anillos (donut) y barra horizontal apilada
- Desglose por categorías con porcentajes
- Pantalla de ajustes: tema, divisa, idioma, calendario, tamaño de texto
- Tema oscuro y claro con cambio en tiempo real
- Soporte multilingüe: español, inglés, catalán
- Escalado de texto según preferencias del usuario
- Navegación con menú lateral (Drawer)
- Creación de categorías personalizadas con icono y color
- Calculadora básica integrada
