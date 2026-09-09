# Implementation plan — 013 Create account page

## Architecture

### New components

- **CreateAccountScreen.tsx**: Screen with editable name, icon selector, color selector, note (description), and Create button.
- **ACCOUNT_ICONS**: List of ~20 Ionicons for accounts (reuse `constants/accountIcons.ts` from 012; if 012 doesn't exist yet, create the file here).

### Modified files

- **AppNavigator.tsx**: Add `CreateAccountScreen` to the `HomeStack`.
- **types.ts**: Add `CreateAccount` to `RootStackParamList` and `CreateAccountScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Add multilingual keys.
- **accountRepo.ts / webAccountRepo.ts**: Add function `existsByName(name: string, excludeId?: number)` for duplicate validation. The `excludeId` parameter is used in 012 to exclude the current account.
- **database.ts / webStorage.ts**: Add `create()` if it doesn't exist.

### Reused components

- `ColorGrid` + `QUICK_COLORS` (from `ColorGrid.tsx`).
- `ColorPickerModal` (from `ColorPickerModal.tsx`).
- Inline icon grid (same pattern as CreateCategoryScreen / ModifyAccountScreen).

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `create_account_title` | Create account | Crear cuenta | Crear compte |
| `create_account_name` | Account name | Nombre de la cuenta | Nom del compte |
| `create_account_note` | Note | Nota | Nota |
| `create_account_button` | Create | Crear | Crear |
| `create_account_error_empty` | Enter an account name | Introduzca un nombre para la cuenta | Introduïu un nom per al compte |
| `create_account_error_duplicate` | An account with this name already exists | Ya existe una cuenta con este nombre | Ja existeix un compte amb aquest nom |
| `create_account_error_icon` | Select an icon | Selecciona un icono | Selecciona una icona |
| `create_account_error_color` | Select a color | Selecciona un color | Selecciona un color |
| `create_account_error_icon_color` | Select an icon and a color | Selecciona un icono y un color | Selecciona una icona i un color |

*(nav_accounts already exists)*

### Navigation flow

```
AccountsScreen (011) → press "+" (FAB) → CreateAccountScreen (013)
  └── press "Create" → accountRepository.create() → navigate back to AccountsScreen
```

---

## UI states

```
┌─────────────────────────────────┐
│ ←  Create account              │  ← Header with back button
├─────────────────────────────────┤
│ Account name                     │
│ [_____________________________] │  ← Input with counter 0/30
├─────────────────────────────────┤
│ Symbols                          │
│ ┌────┬────┬────┬────┐          │
│ │ 💰 │ 💵 │ 💳 │ 🏢 │          │  ← 4-column grid
│ ├────┼────┼────┼────┤          │
│ │ 🏦 │ 🏧 │ ...              │
│ └────┴────┴────┴────┘          │
├─────────────────────────────────┤
│ Color                            │
│ ● ● ● ● ● ● +                  │  ← 6 predefined + picker
├─────────────────────────────────┤
│ Note                             │
│ [_____________________________] │  ← Multiline input 0/200
├─────────────────────────────────┤
│ [          Create          ]    │  ← Enabled/disabled button
└─────────────────────────────────┘
```

## Dependencies

- Existing `accountRepository`.
- Existing `ColorGrid`, `ColorPickerModal`.
- `useConfig()`, `useFontSize()`, i18n.
- `@expo/vector-icons` (Ionicons).

## Estimate

- **Tasks**: 10 tasks in 3 phases
- **Estimated time**: 1.5-2 hours
