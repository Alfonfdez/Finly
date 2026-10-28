# Finly

[English](README.md) · [Español](README.es.md) · [Català](README.ca.md) · [Galego](README.gl.md) · [Euskara](README.eu.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** é unha app de finanzas persoais para controlar ingresos e gastos. Anota o que gañas e gastas os días en que ocorre, organízao en varias contas e categorías personalizadas, e entende o teu diñeiro con gráficos, filtros por período, etiquetas e comentarios.

Todo funciona **no dispositivo**: os teus datos viven nunha base de datos SQLite local (sql.js + IndexedDB na web), nada sae do teu teléfono e non se require conta nin subscrición.

| | |
|---|---|
| **Plataformas** | iOS, Android e Web |
| **Versión** | 2.2.0 |
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
- **Regras recorrentes** — converte unha transacción nunha programación que se repite (diaria, semanal, mensual ou anual, con intervalo e data de fin opcional); as ocorrencias vencidas xéranse soas e cada regra pódese pausar, retomar ou editar aplicando o cambio só ao futuro ou tamén ao pasado.
- **Accións masivas** — multiselecciona e elimina transaccións, etiquetas, comentarios e categorías dunha soa vez.
- **Copia de seguridade dos datos** — exporta toda a túa base de datos como unha instantánea JSON e impórtaa de novo cando queiras.
- **Axustes** — tema, tamaño do texto, moeda, separador decimal, idioma, primeiro día da semana, formas das iconas, valores predeterminados de inicio e de engadir transacción, e opcións de privacidade para ocultar os saldos.
- **Calculadora integrada** — unha pequena calculadora na pantalla de engadir transacción para calcular importes.

## Capturas de pantalla

![Pantalla de inicio](images/screenshots/v3.3-01-a-home-empty.png)<br>*Instalación nova sen transaccións.*<br><br>
![Pantalla de inicio](images/screenshots/v3.3-01-b-home.png)<br>*Pantalla de inicio con contas, gráfico de donut e desglose por categorías.*<br><br>
![Menú hamburguesa](images/screenshots/v3.3-02-hamburger.png)<br>*Menú lateral con Inicio, Todas as transaccións, Recorrentes, Contas, Categorías, Etiquetas, Comentarios e Axustes.*<br><br>
![Engadir transacción](images/screenshots/v3.3-03-add-transaction.png)<br>*Engade un gasto ou ingreso con importe, conta, categoría, día, etiquetas, comentario e foto.*<br><br>
![Selector de data](images/screenshots/v3.3-04-date-picker.png)<br>*Selector de calendario para escoller un día, semana, mes, ano ou rango de período personalizado.*<br><br>
![Todas as transaccións, baleiro](images/screenshots/v3.3-05-a-all-transactions-empty-state.png)<br>*Estado baleiro de Todas as transaccións.*<br><br>
![Todas as transaccións](images/screenshots/v3.3-05-b-all-transactions.png)<br>*Todas as transaccións con filtros de tipo, categoría, período e etiquetas, ademais de ordenación e busca.*<br><br>
![Filtro de categorías](images/screenshots/v3.3-05-c-category-filter.png)<br>*Filtro de categorías cos predefinidos Todas as categorías, Todos os gastos e Todas as receitas.*<br><br>
![Detalles de ingreso](images/screenshots/v3.3-05-d-details-income.png)<br>*Detalles dunha transacción de ingreso con edición e eliminación.*<br><br>
![Detalles de gasto](images/screenshots/v3.3-05-e-details-expense.png)<br>*Detalles dunha transacción de gasto con edición e eliminación.*<br><br>
![Modificar transacción](images/screenshots/v3.3-05-f-modify-transaction.png)<br>*Edita o importe, a conta, a categoría, o día, as etiquetas, o comentario e a foto dunha transacción.*<br><br>
![Recurrentes](images/screenshots/v3.3-06-recurring.png)<br>*Regras recorrentes con próximas datas, importes e interruptores de activa/en pausa.*<br><br>
![Nova regra recorrente](images/screenshots/v3.3-06-a-create-recurring.png)<br>*Configura unha regra recorrente co nome, a frecuencia, o intervalo e unha data de fin opcional.*<br><br>
![Editar regra recorrente](images/screenshots/v3.3-06-b-modify-recurring.png)<br>*Edita a programación dunha regra recorrente e escolle se o cambio se aplica só ás próximas repeticións ou tamén ás pasadas.*<br><br>
![Contas](images/screenshots/v3.3-07-accounts.png)<br>*Pantalla de contas con saldos e a conta Total agregada.*<br><br>
![Crear conta](images/screenshots/v3.3-07-a-create-account.png)<br>*Crea unha conta con nome, icona, cor, saldo inicial e nota opcional.*<br><br>
![Modificar conta](images/screenshots/v3.3-07-b-modify-account.png)<br>*Edita os datos, o saldo inicial e a nota dunha conta, ou elimínaa.*<br><br>
![Categorías](images/screenshots/v3.3-08-categories.png)<br>*Categorías organizadas por tipo (gastos/ingresos) nunha cuadrícula de 4×N.*<br><br>
![Crear categoría](images/screenshots/v3.3-08-a-create-category.png)<br>*Crea unha categoría de gasto ou ingreso con nome, icona e cor.*<br><br>
![Modificar categoría](images/screenshots/v3.3-08-b-modify-category.png)<br>*Edita o nome, a icona e a cor dunha categoría, ou elimínaa.*<br><br>
![Etiquetas](images/screenshots/v3.3-09-tags.png)<br>*Pantalla de etiquetas con busca e selección masiva.*<br><br>
![Nova etiqueta](images/screenshots/v3.3-09-a-create-tag.png)<br>*Crea unha etiqueta para agrupar transaccións.*<br><br>
![Editar etiqueta](images/screenshots/v3.3-09-b-modify-tag.png)<br>*Cambia o nome ou elimina unha etiqueta.*<br><br>
![Comentarios](images/screenshots/v3.3-10-comments.png)<br>*Pantalla de comentarios con busca, reconto de uso e selección múltiple.*<br><br>
![Editar comentario](images/screenshots/v3.3-10-a-modify-comment.png)<br>*Edita un comentario en todas as transaccións que o usan.*<br><br>
![Axustes](images/screenshots/v3.3-11-settings.png)<br>*Axustes: Aparencia, Rexional, Personalización e Datos.*<br><br>
![Axustes de aparencia](images/screenshots/v3.3-11-a-appearance.png)<br>*Aparencia: tema, tamaño do texto e formas das iconas.*<br><br>
![Axustes rexionais](images/screenshots/v3.3-11-b-regional-en.png)<br>*Axustes rexionais: idioma, moeda, separador decimal e primeiro día da semana.*<br><br>
![Axustes de personalización](images/screenshots/v3.3-11-c-personalization.png)<br>*Personalización: valores predeterminados de inicio e de engadir transacción, máis privacidade.*<br><br>
![Axustes de datos](images/screenshots/v3.3-11-d-data.png)<br>*Datos: exportación/importación de copia de seguridade e accións de borrado/reinicio.*<br><br>

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
| `npm run lint:fix` | Corrixe automaticamente os problemas de lint/formato (sangrado, comiñas, comas finais, salto de liña final) |
| `npm run i18n` | Engade, actualiza, elimina ou lista claves de tradución nos 9 idiomas |

### Probas

- **Unitarias / integración** — Vitest. A suite cobre os repositorios da base de datos en ambos os backends SQLite (nativo + sql.js), as idas e voltas da copia de seguridade e os compoñentes renderizados con `@testing-library/react-native`.
- **E2E nativas** — os fluxos de Maestro en `FinlyApp/.maestro/` (15 fluxos + helpers) execútanse contra o APK de depuración nun emulador de Android; ver `docs/harnesses.md`.
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
- As migracións versiónanse con `PRAGMA user_version` (`001_initial`, `002_seed`, `003_config`, `004_recurring`) e aplícanse unha soa vez, dentro dunha transacción.
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
