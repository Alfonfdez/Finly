# Implementation plan — 003 Settings page (restructure)

## Overview

Restructure the flat Settings screen into a main subsection list (4 rows) with navigation to detail screens. Add new Personalization and Data subsections.

---

## Files to create

```
src/screens/settings/
├── SettingsScreen.tsx          ← main screen (subsection list)
├── AppearanceScreen.tsx        ← theme, text size, icon shapes
├── RegionalScreen.tsx          ← language, currency, separator, first day
├── PersonalizationScreen.tsx   ← home defaults, add transaction defaults, privacy
└── DataScreen.tsx              ← delete transactions, delete all data
```

## Files to modify

```
src/context/ConfigContext.tsx    ← add 7 new config fields
src/database/migrations/003_config.ts ← add new defaults
src/database/webStorage.ts      ← add new config defaults
src/constants/types.ts          ← add Settings stack params + props
src/navigation/AppNavigator.tsx ← register 4 new screens, update Settings route
src/screens/AddTransactionScreen.tsx ← respect addDefaultAccountId + optional fields
src/screens/ModifyTransactionScreen.tsx ← respect optional fields
src/screens/HomeScreen.tsx      ← respect homeDefaultAccountId + homeDefaultPeriod
src/screens/AccountsScreen.tsx  ← eye icon + hideBalances
src/components/AccountModal.tsx ← eye icon + hideBalances
src/components/AccountSelector.tsx (if exists) ← eye icon + hideBalances
src/i18n/en.ts, es.ts, ca.ts   ← ~30 new keys
src/i18n/index.ts               ← nothing new needed
```

## Files to delete

```
src/screens/SettingsScreen.tsx  ← replaced by src/screens/settings/SettingsScreen.tsx
```

---

## Architecture

### Config Interface

```ts
export interface Config {
  // Existing
  theme: 'dark' | 'light' | 'system';
  firstDayOfWeek: 0 | 1;
  currency: string;
  decimalSeparator: ',' | '.';
  language: 'es' | 'en' | 'ca';
  textSize: 'small' | 'medium' | 'large';
  categoryIconShape: 'square' | 'circle';
  accountIconShape: 'square' | 'circle';

  // New — Personalization > Home screen
  homeDefaultAccountId: number | null;   // null = no default (current behavior)
  homeDefaultPeriod: 'day' | 'week' | 'month' | 'year';

  // New — Personalization > Add transaction
  addDefaultAccountId: number | null;    // null = inherit from HomeScreen
  addShowLabels: boolean;
  addShowComments: boolean;
  addShowPhoto: boolean;

  // New — Personalization > Privacy
  hideBalances: boolean;
}
```

### Config Defaults

```ts
const CONFIG_DEFAULT: Config = {
  // Existing
  theme: 'dark',
  firstDayOfWeek: 1,
  currency: '€',
  decimalSeparator: ',',
  language: 'en',
  textSize: 'medium',
  categoryIconShape: 'square',
  accountIconShape: 'square',

  // New
  homeDefaultAccountId: null,
  homeDefaultPeriod: 'month',
  addDefaultAccountId: null,
  addShowLabels: true,
  addShowComments: true,
  addShowPhoto: true,
  hideBalances: false,
};
```

### Navigation Structure

```
HomeStack
├── Home (existing)
├── Settings (main subsection list)     ← headerShown: false
├── SettingsAppearance (detail screen)  ← headerShown: false
├── SettingsRegional (detail screen)    ← headerShown: false
├── SettingsPersonalization (detail screen) ← headerShown: false
├── SettingsData (detail screen)        ← headerShown: false
├── ... (other existing screens)
```

All settings detail screens use a custom header with back arrow + title (same pattern as other screens in the app).

### RevealContext (Privacy — eye icon)

A lightweight context to manage temporary balance reveal state:

```ts
interface RevealContextType {
  isRevealed: boolean;
  toggleReveal: () => void;
}

// Provided at the app root level (or within HomeStack).
// State resets on screen focus via useFocusEffect in consuming screens.
```

When `hideBalances` is OFF:
- Balances visible, icon = `eye-off-outline`.
- Tap → balances hidden, icon = `eye-outline`.
- Navigate away → state resets (balances visible again).

When `hideBalances` is ON:
- Balances hidden (`•••••`), icon = `eye-outline`.
- Tap → balances revealed, icon = `eye-off-outline`.
- Navigate away → state resets (balances hidden again).

**Implementation approach:** instead of a global context, each affected screen manages its own `isRevealed` state via `useState` + `useFocusEffect` to reset on focus. The `hideBalances` config value determines the initial state.

```tsx
// In HomeScreen, AccountsScreen, etc.
const { config } = useConfig();
const [isRevealed, setIsRevealed] = useState(false);

// Reset to setting default when screen gains focus
useFocusEffect(
  useCallback(() => {
    setIsRevealed(false);
  }, [])
);

const isHidden = config.hideBalances !== isRevealed;
// If hideBalances=true and isRevealed=false → hidden
// If hideBalances=true and isRevealed=true → visible
// If hideBalances=false and isRevealed=false → visible
// If hideBalances=false and isRevealed=true → hidden
```

### Eye Icon Component

```tsx
function EyeToggle({ isHidden, onToggle }: { isHidden: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle} hitSlop={8}>
      <Ionicons
        name={isHidden ? 'eye-outline' : 'eye-off-outline'}
        size={18}
        color={c.textSecondary}
      />
    </TouchableOpacity>
  );
}
```

### Balance Display Helper

```tsx
function formatBalance(amount: number, isHidden: boolean, currency: string, separator: ',' | '.'): string {
  if (isHidden) return '•••••';
  return formatCurrency(amount, currency, separator);
}
```

---

## Data Subsection — Deletion Logic

### Delete all transactions

```ts
// Native (SQLite)
await db.runAsync('DELETE FROM transactions');
await db.runAsync('DELETE FROM transaction_tags');

// Web (localStorage)
removeStore('transactions');
removeStore('transaction_tags');
```

### Delete all data (keeps settings)

```ts
// Native (SQLite) — clearDataKeepSettings() in database.ts
await db.runAsync('DELETE FROM transactions');
await db.runAsync('DELETE FROM transaction_tags');
await db.runAsync('DELETE FROM accounts');
await db.runAsync('DELETE FROM categories');
await db.runAsync('DELETE FROM tags');
// Re-seed data only
await seedData(db); // from 002_seed.ts
// Config is preserved; null dangling account defaults only
await db.runAsync(`
  UPDATE config SET value = 'null'
  WHERE key IN ('home_default_account_id', 'add_default_account_id')
    AND value != 'null'
    AND value NOT IN (SELECT CAST(id AS TEXT) FROM accounts WHERE is_total = 0)
`);

// Web (sql.js) — same path via getDatabase()
```

### Reset to factory state

```ts
// Native (SQLite) — resetDatabase() in database.ts
await db.runAsync('DELETE FROM transactions');
await db.runAsync('DELETE FROM transaction_tags');
await db.runAsync('DELETE FROM accounts');
await db.runAsync('DELETE FROM categories');
await db.runAsync('DELETE FROM tags');
await db.runAsync('DELETE FROM config');
// Re-seed data + config defaults
await seedData(db);    // from 002_seed.ts
await seedConfig(db);  // from 003_config.ts

// Web (sql.js) — same path via getDatabase()
```

---

## i18n — New Keys

| Key | EN | ES | CA |
|---|---|---|---|
| `settings_appearance` | Appearance | Apariencia | Aparença |
| `settings_regional` | Regional | Regional | Regional |
| `settings_personalization` | Personalization | Personalización | Personalització |
| `settings_data` | Data | Datos | Dades |
| `settings_home_screen` | Home screen | Pantalla principal | Pantalla principal |
| `settings_add_transaction` | Add transaction | Añadir transacción | Afegir transacció |
| `settings_privacy` | Privacy | Privacidad | Privacitat |
| `settings_default_account` | Default account | Cuenta predeterminada | Compte predeterminat |
| `settings_default_period` | Default period | Período predeterminat | Període predeterminat |
| `settings_not_selected` | Not selected | No seleccionado | No seleccionat |
| `settings_optional_fields` | Optional fields | Campos opcionals | Camps opcionals |
| `settings_labels` | Labels | Etiquetas | Etiquetes |
| `settings_comments` | Comments | Comentarios | Comentaris |
| `settings_photo` | Photo | Foto | Foto |
| `settings_hide_balances` | Hide account balances | Ocultar saldos de cuentas | Amagar saldos de comptes |
| `settings_delete_all_transactions` | Delete all transactions | Eliminar todas las transacciones | Eliminar totes les transaccions |
| `settings_delete_all_transactions_description` | Removes all transactions. Accounts, categories, and tags are kept. | Elimina todas las transacciones. Las cuentas, categorías y etiquetas se conservan. | Elimina totes les transaccions. Els comptes, categories i etiquetes es conserven. |
| `settings_delete_all_data` | Delete all data | Eliminar todos los datos | Eliminar totes les dades |
| `settings_delete_all_data_description` | Deletes all accounts, categories, tags, and transactions. Your settings are kept. | Elimina todas las cuentas, categorías, etiquetas y transacciones. Tu configuración se conserva. | Elimina tots els comptes, categories, etiquetes i transaccions. La teva configuració es conserva. |
| `settings_factory_reset` | Reset to factory state | Restablecer estado de fábrica | Restablir estat de fàbrica |
| `settings_factory_reset_description` | Deletes everything and restores defaults: language, theme, currency, and settings. | Elimina todo y restablece los valores predeterminados: idioma, tema, moneda y configuración. | Elimina-ho tot i restableix els valors per defecte: idioma, tema, moneda i configuració. |
| `settings_factory_reset_confirm_title` | Reset to factory state? | ¿Restablecer el estado de fábrica? | Restablir l\'estat de fàbrica? |
| `settings_factory_reset_confirm_message` | This will reset the app to factory state. All accounts, categories, tags, transactions, and settings will be deleted and returned to their defaults. This cannot be undone. | Esto restablecerá la app al estado de fábrica. Todas las cuentas, categorías, etiquetas, transacciones y configuración se eliminarán y volverán a sus valores predeterminados. Esto no se puede deshacer. | Això restablirà l\'app a l\'estat de fàbrica. Tots els comptes, categories, etiquetes, transaccions i configuració s\'eliminaran i tornaran als seus valors per defecte. Això no es pot desfer. |
| `settings_delete_transactions_confirm_title` | Delete all transactions? | ¿Eliminar todas las transacciones? | Eliminar totes les transaccions? |
| `settings_delete_transactions_confirm_message` | All transaction history will be permanently deleted. Accounts, categories, and tags are kept. | Todo el historial de transacciones se eliminará permanentemente. Las cuentas, categorías y etiquetas se conservarán. | Tot l'historial de transaccions s'eliminarà permanentment. Els comptes, categories i etiquetes es conservaran. |
| `settings_delete_data_confirm_title` | Delete all data? | ¿Eliminar todos los datos? | Eliminar totes les dades? |
| `settings_delete_data_confirm_message` | All accounts, categories, tags, and transactions will be permanently deleted. Your settings (language, theme, currency, and defaults) are kept. This cannot be undone. | Todas las cuentas, categorías, etiquetas y transacciones se eliminarán permanentemente. Tu configuración (idioma, tema, moneda y valores predeterminados) se conserva. Esto no se puede deshacer. | Tots els comptes, categories, etiquetes i transaccions s\'eliminaran permanentment. La teva configuració (idioma, tema, moneda i valors per defecte) es conserva. Això no es pot desfer. |
| `settings_delete_data_confirm_title2` | Are you sure? | ¿Estás seguro? | N\'estàs segur? |
| `settings_delete_data_confirm_message2` | Type DELETE to confirm | Escribe DELETE para confirmar | Escriu DELETE per confirmar |
| `settings_delete_data_confirm_placeholder` | Type DELETE here | Escribe DELETE aquí | Escriu DELETE aquí |
| `settings_delete_confirm` | Confirm | Confirmar | Confirmar |
| `settings_delete_all_transactions_done` | All transactions deleted | Todas las transacciones eliminadas | Totes les transaccions eliminades |
| `settings_delete_all_data_done` | All data deleted. Settings kept. | Todos los datos eliminados. Configuración conservada. | Totes les dades eliminades. Configuració conservada. |
| `settings_home_default_period_day` | Day | Día | Dia |
| `settings_home_default_period_week` | Week | Semana | Setmana |
| `settings_home_default_period_month` | Month | Mes | Mes |
| `settings_home_default_period_year` | Year | Any | Any |

---

## Verification

1. `npx expo start --web` — test in browser: navigate to each subsection, change settings, verify persistence on reload.
2. `npx expo start` + Expo Go — test on native: SQLite persistence, theme, eye icon, delete flows.
3. Validate all acceptance criteria from `1-spec.md`.
4. Test Privacy eye icon: reveal → navigate away → come back → verify reset.
5. Test Data: delete transactions (verify accounts/categories kept), delete all data (verify settings kept, defaults fall back only when account gone), reset to factory state (verify full defaults incl. English).
6. Test Add transaction default account: set "My Wallet" → go to Home with different account → tap "+" → verify "My Wallet" selected.
