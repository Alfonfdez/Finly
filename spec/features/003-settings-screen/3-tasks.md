# Tasks — 003 Settings page
Execution order. Mark each task when completed.

---

### Phase 1 — Settings infrastructure

[ ] T1 — Create `src/constants/themes.ts` with `coloresDark` (current palette) and `coloresLight` (light palette with white backgrounds, dark text, cyan-600 primary). Export `PaletaColores` type.

[ ] T2 — Create `src/context/ConfigContext.tsx` with `Configuracion` interface (theme, primerDiaSemana, currency, decimalSeparator, language, text size) and default values. Implement `ConfigProvider` that loads settings on mount and persists on change. Exposes `config` and `actualizarConfig()`.

[ ] T3 — Create `src/database/migrations/003_configuracion.ts` with `CREATE TABLE IF NOT EXISTS configuracion (clave TEXT PRIMARY KEY, valor TEXT)`. Insert default values if the table is empty.

[ ] T4 — Create `src/database/repositories/configRepo.ts` with `obtenerConfig(): Configuracion` and `guardarConfig(partial: Partial<Configuracion>)`. Also implement the web version with localStorage key `finly_config`.

[ ] T5 — Update `src/database/index.ts` to export `configRepository` with the same interface on both platforms (SQLite native, localStorage web).

[ ] T6 — Wrap the app with `ConfigProvider` in `App.tsx` (alongside `AppProvider`). Ensure settings are loaded before the first render (loading state).

---

### Phase 2 — Settings screen

[ ] T7 — Update `src/constants/types.ts`: add `Configuracion` to the root stack type and create `SettingsScreenProps`. Add `SettingsScreen` to `HomeStack` in `AppNavigator.tsx` with title "Settings" and headerStyle/headerTintColor.

[ ] T8 — Connect the "Settings" DrawerItem in `AppNavigator.tsx` to navigate to `SettingsScreen` (replace `onPress={() => {}}`).

[ ] T9 — Create `src/screens/SettingsScreen.tsx` with 5 sections: Appearance (theme), Calendar (first day), Money format (currency, separator), Language, Text (size). Each section uses a `View` with a header and `TouchableOpacity` rows showing the current value and a selection indicator (checkmark).

[ ] T10 — Implement selection logic in each row: when tapped, a sub-selector (inline or modal) shows the available options. The selected value is saved immediately in `ConfigContext`.

---

### Phase 3 — Theme integration

[ ] T11 — Modify `SettingsScreen.tsx` to use the active theme's color palette (read from `ConfigContext` + `themes.ts`). Verify it looks correct in both dark and light mode.

[ ] T12 — Modify `AppNavigator.tsx` so the Drawer and Stack headers use the active theme palette instead of importing `colores` directly.

---

### Phase 4 — Calendar

[ ] T13 — Modify `DayPicker.tsx`: accept `primerDia` as a prop. Fix the alignment bug: headers and grid must use the same offset calculation. With `primerDia=1` (Monday), headers are `Mo Tu We Th Fr Sa Su`; with `primerDia=0` (Sunday), headers are `Su Mo Tu We Th Fr Sa`.

[ ] T14 — Modify `WeekPicker.tsx`: accept `primerDia` as a prop and pass it to `inicioDeSemana`/`finDeSemana`.

[ ] T15 — Update `AppContext.tsx` so `CalendarPicker` receives `config.primerDiaSemana` from `ConfigContext`.

---

### Phase 5 — Money format and language

[ ] T16 — Modify `formatearMoneda` in `src/utils/formatters.ts` to accept `currency` and `decimalSeparator` parameters. With separator `,`: use `toLocaleString('es-ES')` or manual formatting with `.` for thousands and `,` for decimal. With separator `.`: use `toLocaleString('en-US')` or manual formatting with `,` for thousands and `.` for decimal.

[ ] T17 — Create `src/i18n/es.ts` and `src/i18n/en.ts` with UI texts (tabs, buttons, placeholders, month names, days of the week). Create a `t(key)` helper that reads `config.idioma`.

[ ] T18 — Update `DayPicker.tsx` so day headers use the configured language (e.g., `Lu` → `Mo` in English).

[ ] T19 — Update `obtenerNombreMes` and `obtenerNombreMesAbrev` in `formatters.ts` to accept language and return names in Spanish or English based on config.

---

### Phase 6 — Text size

[ ] T20 — Add `escalarFontSize(size: number, config: Configuracion): number` function in `formatters.ts` that applies the scale factor (Small=0.85, Medium=1.0, Large=1.15).

[ ] T21 — Apply `escalarFontSize` in `SettingsScreen.tsx` as a proof of concept. Existing components will be incrementally migrated in future features.

---

### Phase 7 — Category icon shape

[ ] T22 — Add field `categoryIconShape: 'square' | 'circle'` with default `'square'` to the `Config` type in `ConfigContext.tsx`. Add i18n keys `settings_category_icon_shape`, `shape_square`, `shape_circle` in all 3 languages.

[ ] T23 — Add "Category icon shape" section in `SettingsScreen.tsx` with a shape selector (Square/Circle). Use `updateConfig({ categoryIconShape })` on change.

[ ] T24 — Update components that render category icons (`CategoryGrid`, `CategoryList`, grid in `CategoriesScreen`, grid in `AddCategoryScreen`, inline grid in `CreateCategoryScreen`, preview in `ModifyCategoryScreen`, category icon in transaction details) to read `config.categoryIconShape` and apply square (12) or circular (half the size) `borderRadius`.

---

### Phase 8 — Account icon shape

[ ] T25 — Add field `accountIconShape: 'square' | 'circle'` with default `'square'` to the `Config` type in `ConfigContext.tsx`. Add i18n key `settings_account_icon_shape` in all 3 languages.

[ ] T26 — Add "Account icon shape" section in `SettingsScreen.tsx` with a shape selector (Square/Circle). Use `updateConfig({ accountIconShape })` on change.

[ ] T27 — Update components that render account icons (`AccountsScreen`, `HomeScreen`, `AccountSelector`, `AccountModal`, grid in `CreateAccountScreen`, grid in `ModifyAccountScreen`) to read `config.accountIconShape` and apply square (12) or circular (half the size) `borderRadius`.

---

### Verification

[ ] T28 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test all acceptance criteria from `1-spec.md`. Verify persistence across restarts.
