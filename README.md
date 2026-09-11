# Finly

[Español](README.es.md) · [Català](README.ca.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [Italiano](README.it.md)

**Finly** is a personal finance app for tracking income and expenses. Record what you earn and spend on the days it happens, organize it across multiple accounts and custom categories, and understand your money through charts, period filters, tags, and comments.

Everything runs **on-device**: your data lives in a local SQLite database (sql.js + IndexedDB on the web), nothing leaves your phone, and there is no account or subscription required.

| | |
|---|---|
| **Platforms** | iOS, Android, and Web |
| **Version** | 2.0.0 |
| **Languages** | English, Spanish, Catalan, French, German, Portuguese, Italian |
| **Data** | 100 % local (SQLite on native, sql.js + IndexedDB on web) |
| **Themes** | Dark, Light, and Automatic (follows the system) |

## Features

- **Multiple accounts** — create, edit, and delete accounts, each with its own icon, color, and optional starting balance. A special **Total** account aggregates everything.
- **Income & expense tracking** — add transactions on a specific day with an amount, account, category, tags, a comment, and an optional photo.
- **Custom categories** — pick from a library of icons and colors, and create your own categories for expenses and income.
- **Charts** — donut chart with total in the center and a horizontal stacked bar chart, with a per-category breakdown showing percentages.
- **Period filters** — Day, Week, Month, Year, and custom ranges with a calendar picker.
- **All Transactions** — combined filters: type, categories (multi-select), period, account, tags, and search with sorting by date or amount.
- **Tags & comments** — tag transactions, then filter by tag; manage every comment across the app and apply edits or bulk deletes to many transactions at once.
- **Photos** — attach a photo to a transaction from the gallery on every platform (camera on iOS and Android).
- **Bulk actions** — multi-select and delete transactions, tags, comments, and categories in one go.
- **Data backup** — export your whole database as a JSON snapshot and import it back at any time.
- **Settings** — theme, text size, currency, decimal separator, language, first day of week, icon shapes, home and add-transaction defaults, and privacy options to hide balances.
- **Built-in calculator** — a small calculator on the add-transaction screen to compute amounts.

## Screenshots

![Home screen](images/screenshots/v2-01-a-home-empty.png)<br>*Home screen before any account is configured.*<br><br>
![Home screen](images/screenshots/v2-01-b-home.png)<br>*Home screen with accounts, donut chart, and category breakdown.*<br><br>
![Hamburger menu](images/screenshots/v2-02-hamburger.png)<br>*Drawer menu with Home, Accounts, Categories, Tags, Comments, All Transactions, and Settings.*<br><br>
![Add transaction](images/screenshots/v2-03-add-transaction.png)<br>*Add an expense or income with amount, account, category, day, tags, comment, and photo.*<br><br>
![Date picker](images/screenshots/v2-04-date-picker.png)<br>*Calendar picker for choosing a day, week, month, year, or custom period range.*<br><br>
![Categories](images/screenshots/v2-05-categories.png)<br>*Categories organized by type (expenses/income) in a 4×N grid.*<br><br>
![Tags](images/screenshots/v2-06-tags.png)<br>*Tags screen with search and bulk selection.*<br><br>
![All transactions empty state](images/screenshots/v2-07-a-all-transactions-empty-state.png)<br>*All Transactions empty state.*<br><br>
![All transactions](images/screenshots/v2-07-b-all-transactions.png)<br>*All Transactions with type, category, period, and tag filters plus sorting and search.*<br><br>
![Accounts](images/screenshots/v2-08-accounts.png)<br>*Accounts screen with balances and the aggregate Total account.*<br><br>
![Income details](images/screenshots/v2-09-a-details-income.png)<br>*Income transaction details with edit and delete.*<br><br>
![Expense details](images/screenshots/v2-09-b-details-expense.png)<br>*Expense transaction details with edit and delete.*<br><br>
![Settings](images/screenshots/v2-10-settings.png)<br>*Settings: Appearance, Regional, Personalization, and Data.*<br><br>
![Regional settings](images/screenshots/v2-11-regional-en.png)<br>*Regional settings: language, currency, decimal separator, and first day of week.*<br><br>
![Appearance settings](images/screenshots/v2-12-settings-appearance.png)<br>*Appearance: theme, text size, and icon shapes.*<br><br>
![Personalization settings](images/screenshots/v2-13-settings-personalization.png)<br>*Personalization: home and add-transaction defaults plus privacy.*<br><br>
![Data settings](images/screenshots/v2-14-settings-data.png)<br>*Data: backup export/import and delete/reset actions.*<br><br>

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native with Expo (SDK 57) |
| Language | TypeScript |
| Navigation | React Navigation (Stack + Drawer) |
| Icons | @expo/vector-icons (Ionicons) |
| Charts | react-native-svg |
| Color picker | reanimated-color-picker |
| Persistence | SQLite (expo-sqlite) on native, sql.js (WASM) + IndexedDB on web |
| ORM | Drizzle ORM (sqlite-proxy over a shared DatabaseHandle) |
| Validation | Zod schemas as single source of truth for stored rows |
| Web | react-native-web |
| State | Context API (AppContext + ConfigContext) |
| i18n | Custom system (en, es, ca, fr, de, pt, it) |

## Development

This section is for contributors and for anyone who wants to run, fork, or extend the app.

### Requirements

- Node.js 20+ (Node 24 recommended)
- npm
- An optional Android emulator (the `android/` folder is generated by CNG — see below)

### First time after cloning

```bash
cd FinlyApp
npm install
npx expo start
```

This starts Metro Bundler. Then:

| To view on… | Do this |
|---|---|
| **Browser** | Open http://localhost:8081 or run `npx expo start --web` |
| **Android (emulator)** | Run `npx expo run:android` |
| **iOS (simulator)** | Run `npx expo run:ios` (macOS only) |

### Commands

| Command | Description |
|---|---|
| `npm start` | Start Expo in dev mode |
| `npm run web` | Start and open in browser |
| `npm run android` | Start on Android emulator |
| `npm run ios` | Start on iOS simulator (macOS only) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint through `expo lint` |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:all` | typecheck + lint + tests (the full local gate) |

### Testing

- **Unit / integration** — Vitest. The suite covers the database repositories on both SQLite backends (native + sql.js), backup round-trips, and components rendered with `@testing-library/react-native`.
- **Native E2E** — Maestro flows in `FinlyApp/.maestro/` (10 flows + helpers) run against the debug APK on an Android emulator; see `docs/harnesses.md`.
- **Web verification** — the acceptance criteria of each feature are verified in a real browser at 375px with Playwright.
- The CI pipeline (`.github/workflows/ci.yml`) runs the full `npm run test:all` gate on every push and pull request to `develop` and `main`.

> **Local gate:** a change is only done when `npm run test:all` passes.

### Project layout

```
FinlyApp/
  src/
    components/    — reusable UI components
    constants/     — themes, types, colors, icons
    context/       — AppContext, ConfigContext (global state)
    database/      — SQLite/sql.js engines, repositories, migrations, Drizzle schema
    hooks/         — custom hooks
    i18n/          — translations (en, es, ca, fr, de, pt, it)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — screen components (PascalCase)
    utils/         — formatters, calculator, platform, language
  .maestro/        — native E2E flows and helpers
```

### Database

- One engine interface (`DatabaseHandle`) on all platforms: expo-sqlite on native, sql.js (WASM) with IndexedDB persistence on web.
- Migrations are versioned with `PRAGMA user_version` (`001_initial`, `002_seed`, `003_config`) and applied once, inside a transaction.
- Repositories are written with Drizzle ORM over the shared handle; stored rows are validated with Zod schemas.
- On web the exported SQLite bytes are persisted to IndexedDB, so the same data outlives reloads.

### Generating an Android APK / AAB (EAS Build)

Requires an Expo account and EAS CLI:

```bash
npm install -g eas-cli
eas login
cd FinlyApp
```

| Profile | Command | Output |
|---|---|---|
| Development | `eas build --profile development` | dev-client build (internal) |
| Preview | `eas build --platform android --profile preview` | installable APK (internal) |
| Production | `eas build --platform android --profile production --no-wait` | publishable AAB (store) |

The `production` profile in `eas.json` uses `"distribution": "store"` and `"buildType": "app-bundle"`, producing an AAB for store submission. Note that the native `android/` folder is generated by Expo CNG (`expo prebuild`); you normally do not need to commit it.

### Methodology

This project uses **Specification-Driven Development (SDD).** Specs live in `spec/` and are the single source of truth — what to build is defined first in `1-spec.md` docs, then implemented, then verified against the acceptance criteria. The roadmap is tracked in `spec/constitution/3-roadmap.md`.

## License

Finly is licensed under the MIT License — see the [LICENSE](LICENSE) file.