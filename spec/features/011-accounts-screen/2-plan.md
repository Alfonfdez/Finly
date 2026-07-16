# Implementation plan — 011 Accounts page

## Architecture

### New components

- **AccountsScreen.tsx**: Main screen with header (hamburger menu + title), total section, and account list with icon + name + balance.

### Modified files

- **AppNavigator.tsx**: Add `AccountsScreen` to `HomeStack`. Connect the "Accounts" `DrawerItem` (currently `onPress={() => {}}`) to navigate to the new screen.
- **types.ts**: Add `Accounts` to `RootStackParamList` and `AccountsScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Add key `accounts_total` (if it doesn't exist).

### Navigation flow

```
Drawer → "Accounts" → AccountsScreen
  ├── press "+" (FAB) → CreateAccountScreen (013)
  └── press account → ModifyAccountScreen (012) { accountId }
```

### Account list

- FlatList with rows showing icon (with background color), name, note (if exists), and balance.
- The note is displayed below the name in `textoSuave` color and reduced size. If empty, it is not rendered.
- Each row is a `TouchableOpacity` that navigates to `ModifyAccountScreen`.
- Empty state with `wallet-outline` icon + message.

### Total

- Calculated by summing `getCurrentBalance()` of each account.
- Formatted with `formatCurrency()`.
- Color: `c.green` if >= 0, `c.red` if < 0.

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `accounts_total` | Total | Total | Total |

*(nav_accounts already exists)*

---

## UI states

```
┌─────────────────────────────────┐
│ ☰  Accounts                    │  ← Header with hamburger menu
├─────────────────────────────────┤
│ Total:                          │
│ 3,450.00 €                     │  ← Total balance (green/red)
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ icon  Account 1    1,200 €  │ │  ← Main row (always)
│ │       Example note           │ │  ← Second row (only if note)
│ ├─────────────────────────────┤ │
│ │ icon  Account 2    2,250 €  │ │  ← No note, single row
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Dependencies

- Existing `accountRepository`.
- Existing `formatCurrency`.
- `useConfig()`, `useFontSize()`, i18n.
- Existing `AccountModal` component (not reused, used for selection).

## Estimate

- **Tasks**: 5 tasks in 2 phases
- **Estimated time**: 1-2 hours
