# Finly

[English](README.md) · [Español](README.es.md) · [Català](README.ca.md) · [Galego](README.gl.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** é unha app de finanzas persoais para controlar ingresos e gastos. Anota o que gañas e gastas os días en que ocorre, organízao en varias contas e categorías personalizadas, e entende o teu diñeiro con gráficos, filtros por período, etiquetas e comentarios.

Todo funciona **no dispositivo**: os teus datos viven nunha base de datos SQLite local (sql.js + IndexedDB na web), nada sae do teu teléfono e non se require conta nin subscrición.

| | |
|---|---|
| **Plataformas** | iOS, Android e Web |
| **Versión** | 2.0.0 |
| **Idiomas** | Inglés, Español, Catalán, Galego, Éuscaro, Francés, Alemán, Portugués e Italiano |
| **Datos** | 100 % locais (SQLite en nativo, sql.js + IndexedDB na web) |
| **Temas** | Escuro, Claro e Automático (segue o sistema) |

## Funcionalidades

- **Varias contas** — crea, edita e elimina contas, cada unha coa súa propia icona, cor e saldo inicial opcional. Unha conta especial **Total** agrega todo.
- **Rexistro de ingresos e gastos** — engade transaccións nun día concreto cun importe, conta, categoría, etiquetas, un comentario e unha foto opcional.
- **Categorías personalizadas** — escolle dunha biblioteca de iconas e cores, e crea as túas propias categorías de gastos e ingresos.
- **Gráficos** — gráfico de donut co total no centro e un gráfico de barras apiladas horizontal, cun desglose por categoría que mostra porcentaxes.
- **Filtros por período** — Día, Semana, Mes, Ano e rangos personalizados cun selector de calendario.
- **Todas as transaccións** — filtros combinados: tipo, categorías (multiselección), período, conta, etiquetas e busca con ordenación por data ou importe.
- **Etiquetas e comentarios** — etiqueta transaccións e logo filtra por etiqueta; xestiona todos os comentarios da app e aplica edicións ou borrados masivos a moitas transaccións á vez.
- **Fotos** — adxunta unha foto a unha transacción desde a galería en todas as plataformas (cámara en iOS e Android).
- **Accións masivas** — multiselecciona e elimina transaccións, etiquetas, comentarios e categorías dunha soa vez.
- **Copia de seguridade dos datos** — exporta toda a túa base de datos como unha instantánea JSON e impórtaa de novo cando queiras.
- **Axustes** — tema, tamaño do texto, moeda, separador decimal, idioma, primeiro día da semana, formas das iconas, valores predeterminados de inicio e de engadir transacción, e opcións de privacidade para ocultar os saldos.
- **Calculadora integrada** — unha pequena calculadora na pantalla de engadir transacción para calcular importes.

## Capturas de pantalla

![Pantalla de inicio](images/screenshots/v2-01-a-home-empty.png)<br>*Pantalla de inicio antes de configurar ningunha conta.*<br><br>
![Pantalla de inicio](images/screenshots/v2-01-b-home.png)<br>*Pantalla de inicio con contas, gráfico de donut e desglose por categorías.*<br><br>
![Menú lateral](images/screenshots/v2-02-hamburger.png)<br>*Menú lateral con Inicio, Contas, Categorías, Etiquetas, Comentarios, Todas as transaccións e Axustes.*<br><br>
![Engadir transacción](images/screenshots/v2-03-add-transaction.png)<br>*Engade un gasto ou ingreso con importe, conta, categoría, día, etiquetas, comentario e foto.*<br><br>
![Selector de data](images/screenshots/v2-04-date-picker.png)<br>*Selector de calendario para escoller un día, semana, mes, ano ou rango de período personalizado.*<br><br>
![Categorías](images/screenshots/v2-05-categories.png)<br>*Categorías organizadas por tipo (gastos/ingresos) nunha cuadrícula de 4×N.*<br><br>
![Etiquetas](images/screenshots/v2-06-tags.png)<br>*Pantalla de etiquetas con busca e selección masiva.*<br><br>
![Todas as transaccións, baleiro](images/screenshots/v2-07-a-all-transactions-empty-state.png)<br>*Estado baleiro de Todas as transaccións.*<br><br>
![Todas as transaccións](images/screenshots/v2-07-b-all-transactions.png)<br>*Todas as transaccións con filtros de tipo, categoría, período e etiquetas, ademais de ordenación e busca.*<br><br>
![Contas](images/screenshots/v2-08-accounts.png)<br>*Pantalla de contas con saldos e a conta Total agregada.*<br><br>
![Detalles de ingreso](images/screenshots/v2-09-a-details-income.png)<br>*Detalles dunha transacción de ingreso con edición e eliminación.*<br><br>
![Detalles de gasto](images/screenshots/v2-09-b-details-expense.png)<br>*Detalles dunha transacción de gasto con edición e eliminación.*<br><br>
![Axustes](images/screenshots/v2-10-settings.png)<br>*Axustes: Aparencia, Rexional, Personalización e Datos.*<br><br>
![Axustes rexionais](images/screenshots/v2-11-regional-en.png)<br>*Axustes rexionais: idioma, moeda, separador decimal e primeiro día da semana.*<br><br>
![Axustes de aparencia](images/screenshots/v2-12-settings-appearance.png)<br>*Aparencia: tema, tamaño do texto e formas das iconas.*<br><br>
![Axustes de personalización](images/screenshots/v2-13-settings-personalization.png)<br>*Personalización: valores predeterminados de inicio e de engadir transacción, máis privacidade.*<br><br>
![Axustes de datos](images/screenshots/v2-14-settings-data.png)<br>*Datos: exportación/importación de copia de seguridade e accións de borrado/reinicio.*<br><br>

## Stack tecnolóxico

| Capa | Tecnoloxía |
|---|---|
| Framework | React Native con Expo (SDK 57) |
| Linguaxe | TypeScript |
| Navegación | React Navigation (Stack + Drawer) |
| Iconas | @expo/vector-icons (Ionicons) |
| Gráficos | react-native-svg |
| Selector de cor | reanimated-color-picker |
| Persistencia | SQLite (expo-sqlite) en nativo, sql.js (WASM) + IndexedDB na web |
| ORM | Drizzle ORM (sqlite-proxy sobre un DatabaseHandle compartido) |
| Validación | Esquemas Zod como única fonte de verdade para as filas almacenadas |
| Web | react-native-web |
| Estado | Context API (AppContext + ConfigContext) |
| i18n | Sistema propio (en, es, ca, gl, eu, fr, de, pt, it) |

## Desenvolvemento

Esta sección é para quen contribúe e para calquera que queira executar, facer un fork ou ampliar a app.

### Requisitos

- Node.js 20+ (recoméndase Node 24)
- npm
- Un emulador de Android opcional (a carpeta `android/` xéraa CNG — ver abaixo)

### Primeira vez despois de clonar

```bash
cd FinlyApp
npm install
npx expo start
```

Isto inicia Metro Bundler. Despois:

| Para ver en… | Fai isto |
|---|---|
| **Navegador** | Abre http://localhost:8081 ou executa `npx expo start --web` |
| **Android (emulador)** | Executa `npx expo run:android` |
| **iOS (simulador)** | Executa `npx expo run:ios` (só macOS) |

### Comandos

| Comando | Descrición |
|---|---|
| `npm start` | Inicia Expo en modo de desenvolvemento |
| `npm run web` | Inicia e abre no navegador |
| `npm run android` | Inicia no emulador de Android |
| `npm run ios` | Inicia no simulador de iOS (só macOS) |
| `npm run typecheck` | Comprobación de TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint mediante `expo lint` |
| `npm test` | Executa a suite de Vitest |
| `npm run test:watch` | Executa Vitest en modo watch |
| `npm run test:all` | typecheck + lint + tests (a porta local completa) |

### Probas

- **Unitarias / integración** — Vitest. A suite cobre os repositorios da base de datos en ambos os backends SQLite (nativo + sql.js), as idas e voltas da copia de seguridade e os compoñentes renderizados con `@testing-library/react-native`.
- **E2E nativas** — os fluxos de Maestro en `FinlyApp/.maestro/` (10 fluxos + helpers) execútanse contra o APK de depuración nun emulador de Android; ver `docs/harnesses.md`.
- **Verificación web** — os criterios de aceptación de cada funcionalidade vérifícanse nun navegador real a 375px con Playwright.
- O pipeline de CI (`.github/workflows/ci.yml`) executa a porta completa `npm run test:all` en cada push e pull request a `develop` e `main`.

> **Porta local:** un cambio só está feito cando `npm run test:all` pasa.

### Estrutura do proxecto

```
FinlyApp/
  src/
    components/    — compoñentes de UI reutilizables
    constants/     — temas, tipos, cores, iconas
    context/       — AppContext, ConfigContext (estado global)
    database/      — motores SQLite/sql.js, repositorios, migracións, esquema Drizzle
    hooks/         — hooks personalizados
    i18n/          — traducións (en, es, ca, gl, eu, fr, de, pt, it)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — compoñentes de pantalla (PascalCase)
    utils/         — formateadores, calculadora, plataforma, idioma
  .maestro/        — fluxos e helpers E2E nativos
```

### Base de datos

- Unha interface de motor única (`DatabaseHandle`) en todas as plataformas: expo-sqlite en nativo, sql.js (WASM) con persistencia en IndexedDB na web.
- As migracións versiónanse con `PRAGMA user_version` (`001_initial`, `002_seed`, `003_config`) e aplícanse unha soa vez, dentro dunha transacción.
- Os repositorios están escritos con Drizzle ORM sobre o handle compartido; as filas almacenadas valídanse con esquemas Zod.
- Na web, os bytes SQLite exportados persisten en IndexedDB, polo que os mesmos datos sobreviven ás recargas.

### Xerar un APK / AAB de Android (EAS Build)

Require unha conta de Expo e o CLI de EAS:

```bash
npm install -g eas-cli
eas login
cd FinlyApp
```

| Perfil | Comando | Saída |
|---|---|---|
| Development | `eas build --profile development` | build de dev-client (interna) |
| Preview | `eas build --platform android --profile preview` | APK instalable (interna) |
| Production | `eas build --platform android --profile production --no-wait` | AAB publicable (tenda) |

O perfil `production` de `eas.json` usa `"distribution": "store"` e `"buildType": "app-bundle"`, producindo un AAB para o envío á tenda. Ten en conta que a carpeta nativa `android/` xéraa Expo CNG (`expo prebuild`); normalmente non necesitas confirmala.

### Metodoloxía

Este proxecto usa **Desenvolvemento Guiado por Especificacións (SDD).** As especificacións viven en `spec/` e son a única fonte de verdade — o que hai que construír defínese primeiro nos documentos `1-spec.md`, despois impleméntase e finalmente vérifícase contra os criterios de aceptación. A folla de ruta séguise en `spec/constitution/3-roadmap.md`.

## Licenza

Finly está baixo a Licenza MIT — consulta o ficheiro [LICENSE](LICENSE).
