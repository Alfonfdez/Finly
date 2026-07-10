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
| Persistencia | AsyncStorage |
| Web | react-native-web |
| Estado | Context API |

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

## Estructura del proyecto

```
Finly/
├── FinlyApp/               ← App React Native / Expo
│   ├── App.tsx                  ← Punto de entrada
│   ├── app.json                 ← Configuración Expo
│   ├── src/
│   │   ├── components/          ← Componentes UI
│   │   │   ├── DonutChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── CalendarPicker.tsx
│   │   │   ├── CalendarModal.tsx
│   │   │   ├── AccountModal.tsx
│   │   │   ├── PeriodTabs.tsx
│   │   │   ├── TypeTabs.tsx
│   │   │   └── calendars/       ← Selectores de fecha
│   │   │       ├── DayPicker.tsx
│   │   │       ├── WeekPicker.tsx
│   │   │       ├── MonthGrid.tsx
│   │   │       ├── MonthNav.tsx
│   │   │       ├── YearGrid.tsx
│   │   │       └── PeriodPicker.tsx
│   │   ├── screens/             ← Pantallas
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── AddTransactionScreen.tsx
│   │   │   └── TransactionsScreen.tsx
│   │   ├── navigation/          ← Navegación
│   │   │   └── AppNavigator.tsx
│   │   ├── context/             ← Estado global
│   │   │   └── AppContext.tsx
│   │   ├── data/                ← Datos mock
│   │   │   └── mockData.ts
│   │   ├── storage/             ← Persistencia (AsyncStorage)
│   │   │   └── storage.ts
│   │   ├── constants/           ← Constantes
│   │   │   └── colors.ts
│   │   └── utils/               ← Utilidades
│   │       └── formatters.ts
│   ├── assets/
│   ├── package.json
│   └── tsconfig.json
│
├── spec/                        ← Especificaciones SDD
│   └── features/
│       ├── 001-pagina-inicial/
│       └── 002-diseño-DB/
│
├── .agents/skills/              ← Skills para asistentes IA
├── docs/                        ← Documentación de conceptos
├── excalidraw/                  ← Diagramas y wireframes
├── AGENTS.md                    ← Reglas SDD globales
└── README.md                    ← Este archivo
```

## Funcionalidades

- Gestión de múltiples cuentas
- Registro de ingresos y gastos por categorías
- Filtros por período: Día, Semana, Mes, Año, Período personalizado
- Selector de fecha interactivo (DateTimePicker)
- Gráfico de anillos (donut) y barra horizontal apilada
- Desglose por categorías con porcentajes
- Tema oscuro
- Navegación con menú lateral (Drawer)
