# Finly

[English](README.md) · [Español](README.es.md) · [Català](README.ca.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** es una app de finanzas personales para controlar ingresos y gastos. Anota lo que ganas y gastas cada día, organízalo en varias cuentas y categorías personalizadas, y entiende tu dinero con gráficos, filtros por período, etiquetas y comentarios.

Todo funciona **en el dispositivo**: tus datos viven en una base de datos SQLite local (sql.js + IndexedDB en la web), nada sale de tu teléfono y no necesitas cuenta ni suscripción.

| | |
|---|---|
| **Plataformas** | iOS, Android y Web |
| **Versión** | 2.0.0 |
| **Idiomas** | Inglés, Español, Catalán, Francés, Alemán, Portugués e Italiano |
| **Datos** | 100 % locales (SQLite en nativo, sql.js + IndexedDB en web) |
| **Temas** | Oscuro, Claro y Automático (sigue el sistema) |

## Funciones

- **Varias cuentas** — crea, edita y elimina cuentas, cada una con su propio icono, color y saldo inicial opcional. Una cuenta especial **Total** agrega todo.
- **Control de ingresos y gastos** — añade transacciones en un día concreto con importe, cuenta, categoría, etiquetas, comentario y una foto opcional.
- **Categorías personalizadas** — elige entre una biblioteca de iconos y colores, y crea tus propias categorías de gastos e ingresos.
- **Gráficos** — gráfico de donut con el total en el centro y gráfico de barras apiladas horizontal, con desglose por categorías que muestra porcentajes.
- **Filtros por período** — Día, Semana, Mes, Año y rangos personalizados con selector de calendario.
- **Todas las transacciones** — filtros combinados: tipo, categorías (multiselección), período, cuenta, etiquetas y búsqueda con ordenación por fecha o importe.
- **Etiquetas y comentarios** — etiqueta transacciones y filtra por etiqueta; gestiona todos los comentarios de la app y aplica ediciones o borrados masivos a varias transacciones a la vez.
- **Fotos** — adjunta una foto a una transacción desde la galería en todas las plataformas (cámara en iOS y Android).
- **Acciones masivas** — multiselecciona y elimina transacciones, etiquetas, comentarios y categorías de una vez.
- **Copia de seguridad** — exporta toda tu base de datos como instantánea JSON e impórtala cuando quieras.
- **Ajustes** — tema, tamaño de texto, moneda, separador decimal, idioma, primer día de la semana, formas de iconos, valores predeterminados de inicio y de añadir transacción, y opciones de privacidad para ocultar saldos.
- **Calculadora integrada** — una pequeña calculadora en la pantalla de añadir transacción para calcular importes.

## Capturas de pantalla

![Pantalla de inicio](images/screenshots/v2-01-a-home-empty.png)<br>*Pantalla de inicio antes de configurar ninguna cuenta.*<br><br>
![Pantalla de inicio](images/screenshots/v2-01-b-home.png)<br>*Pantalla de inicio con cuentas, gráfico de donut y desglose por categorías.*<br><br>
![Menú hamburguesa](images/screenshots/v2-02-hamburger.png)<br>*Menú lateral con Inicio, Cuentas, Categorías, Etiquetas, Comentarios, Todas las transacciones y Ajustes.*<br><br>
![Añadir transacción](images/screenshots/v2-03-add-transaction.png)<br>*Añade un gasto o ingreso con importe, cuenta, categoría, día, etiquetas, comentario y foto.*<br><br>
![Selector de fecha](images/screenshots/v2-04-date-picker.png)<br>*Selector de calendario para elegir un día, semana, mes, año o rango de período personalizado.*<br><br>
![Categorías](images/screenshots/v2-05-categories.png)<br>*Categorías organizadas por tipo (gastos/ingresos) en una cuadrícula de 4×N.*<br><br>
![Etiquetas](images/screenshots/v2-06-tags.png)<br>*Pantalla de etiquetas con búsqueda y selección masiva.*<br><br>
![Todas las transacciones, vacío](images/screenshots/v2-07-a-all-transactions-empty-state.png)<br>*Todas las transacciones en estado vacío.*<br><br>
![Todas las transacciones](images/screenshots/v2-07-b-all-transactions.png)<br>*Todas las transacciones con filtros de tipo, categoría, período y etiquetas, además de ordenación y búsqueda.*<br><br>
![Cuentas](images/screenshots/v2-08-accounts.png)<br>*Pantalla de cuentas con saldos y la cuenta Total agregada.*<br><br>
![Detalles de ingreso](images/screenshots/v2-09-a-details-income.png)<br>*Detalles de una transacción de ingreso con edición y eliminación.*<br><br>
![Detalles de gasto](images/screenshots/v2-09-b-details-expense.png)<br>*Detalles de una transacción de gasto con edición y eliminación.*<br><br>
![Ajustes](images/screenshots/v2-10-settings.png)<br>*Ajustes: Apariencia, Regional, Personalización y Datos.*<br><br>
![Ajustes regionales](images/screenshots/v2-11-regional-en.png)<br>*Ajustes regionales: idioma, moneda, separador decimal y primer día de la semana.*<br><br>
![Ajustes de apariencia](images/screenshots/v2-12-settings-appearance.png)<br>*Apariencia: tema, tamaño de texto y formas de iconos.*<br><br>
![Ajustes de personalización](images/screenshots/v2-13-settings-personalization.png)<br>*Personalización: valores predeterminados de inicio y de añadir transacción, y privacidad.*<br><br>
![Ajustes de datos](images/screenshots/v2-14-settings-data.png)<br>*Datos: exportación/importación de copia de seguridad y acciones de borrado/reinicio.*<br><br>

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React Native con Expo (SDK 57) |
| Lenguaje | TypeScript |
| Navegación | React Navigation (Stack + Drawer) |
| Iconos | @expo/vector-icons (Ionicons) |
| Gráficos | react-native-svg |
| Selector de color | reanimated-color-picker |
| Persistencia | SQLite (expo-sqlite) en nativo, sql.js (WASM) + IndexedDB en web |
| ORM | Drizzle ORM (sqlite-proxy sobre un DatabaseHandle compartido) |
| Validación | Esquemas Zod como única fuente de verdad para las filas almacenadas |
| Web | react-native-web |
| Estado | Context API (AppContext + ConfigContext) |
| i18n | Sistema propio (en, es, ca, fr, de, pt, it) |

## Desarrollo

Esta sección es para quienes contribuyen y para cualquiera que quiera ejecutar, hacer un fork o ampliar la app.

### Requisitos

- Node.js 20+ (se recomienda Node 24)
- npm
- Un emulador de Android opcional (la carpeta `android/` la genera CNG — ver abajo)

### Primera vez después de clonar

```bash
cd FinlyApp
npm install
npx expo start
```

Esto inicia Metro Bundler. Después:

| Para ver en… | Haz esto |
|---|---|
| **Navegador** | Abre http://localhost:8081 o ejecuta `npx expo start --web` |
| **Android (emulador)** | Ejecuta `npx expo run:android` |
| **iOS (simulador)** | Ejecuta `npx expo run:ios` (solo macOS) |

### Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Inicia Expo en modo desarrollo |
| `npm run web` | Inicia y abre en el navegador |
| `npm run android` | Inicia en el emulador de Android |
| `npm run ios` | Inicia en el simulador de iOS (solo macOS) |
| `npm run typecheck` | Comprobación de TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint mediante `expo lint` |
| `npm test` | Ejecuta la suite de Vitest |
| `npm run test:watch` | Ejecuta Vitest en modo watch |
| `npm run test:all` | typecheck + lint + tests (la verificación local completa) |

### Pruebas

- **Unitarias / integración** — Vitest. La suite cubre los repositorios de base de datos en ambos backends SQLite (nativo + sql.js), los round-trips de copia de seguridad y los componentes renderizados con `@testing-library/react-native`.
- **E2E nativas** — los flujos de Maestro en `FinlyApp/.maestro/` (10 flujos + helpers) se ejecutan contra el APK de depuración en un emulador de Android; ver `docs/harnesses.md`.
- **Verificación web** — los criterios de aceptación de cada función se verifican en un navegador real a 375px con Playwright.
- El pipeline de CI (`.github/workflows/ci.yml`) ejecuta el gate completo `npm run test:all` en cada push y pull request de `develop` y `main`.

> **Gate local:** un cambio solo está hecho cuando `npm run test:all` pasa.

### Estructura del proyecto

```
FinlyApp/
  src/
    components/    — componentes de UI reutilizables
    constants/     — temas, tipos, colores, iconos
    context/       — AppContext, ConfigContext (estado global)
    database/      — motores SQLite/sql.js, repositorios, migraciones, esquema Drizzle
    hooks/         — hooks personalizados
    i18n/          — traducciones (en, es, ca, fr, de, pt, it)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — componentes de pantalla (PascalCase)
    utils/         — formateadores, calculadora, plataforma, idioma
  .maestro/        — flujos y helpers E2E nativos
```

### Base de datos

- Una única interfaz de motor (`DatabaseHandle`) en todas las plataformas: expo-sqlite en nativo, sql.js (WASM) con persistencia en IndexedDB en web.
- Las migraciones se versionan con `PRAGMA user_version` (`001_initial`, `002_seed`, `003_config`) y se aplican una sola vez, dentro de una transacción.
- Los repositorios están escritos con Drizzle ORM sobre el manejo compartido; las filas almacenadas se validan con esquemas Zod.
- En web, los bytes SQLite exportados se persisten en IndexedDB, así que los mismos datos sobreviven a las recargas.

### Generar un APK / AAB de Android (EAS Build)

Requiere una cuenta de Expo y el CLI de EAS:

```bash
npm install -g eas-cli
eas login
cd FinlyApp
```

| Perfil | Comando | Resultado |
|---|---|---|
| Development | `eas build --profile development` | build de dev-client (interno) |
| Preview | `eas build --platform android --profile preview` | APK instalable (interno) |
| Production | `eas build --platform android --profile production --no-wait` | AAB publicable (tienda) |

El perfil `production` de `eas.json` usa `"distribution": "store"` y `"buildType": "app-bundle"`, produciendo un AAB para su envío a la tienda. Ten en cuenta que la carpeta nativa `android/` la genera Expo CNG (`expo prebuild`); normalmente no necesitas confirmarla en el repositorio.

### Metodología

Este proyecto usa **Desarrollo guiado por especificaciones (SDD).** Las especificaciones viven en `spec/` y son la única fuente de verdad — primero se define qué construir en los documentos `1-spec.md`, luego se implementa y después se verifica contra los criterios de aceptación. La hoja de ruta se sigue en `spec/constitution/3-roadmap.md`.

## Licencia

Finly está bajo la licencia MIT — consulta el archivo [LICENSE](LICENSE).