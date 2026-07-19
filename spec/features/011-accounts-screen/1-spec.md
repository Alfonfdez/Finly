# 011 — Accounts page

- **Objective**
  Screen accessible from the Drawer (hamburger menu) that displays all existing accounts with their balance and allows navigation to modify each account. All texts are multilingual (en/es/ca).

---

## Functional requirements

### 1. Access and navigation

- The screen is accessed from the "Accounts" item in the Drawer Navigator (hamburger menu), currently a placeholder with `onPress={() => {}}`.
- The header has a hamburger menu button on the left to open/close the Drawer.
- The header title is "Accounts" (multilingual, key `nav_accounts` already exists).

### 2. Total balance

- Below the header, a section is displayed with the text "Total:" (multilingual) and the accumulated total balance of all accounts.
- The total balance is calculated by summing `initial_balance` plus income minus expenses for each account.
- The total color follows the rule: green if >= 0, red if < 0.

### 3. Account list

- Below the total, a list (FlatList or ScrollView) is displayed with one row per account.
- Each row contains:
  - **First row** (always visible): account icon with its background color on the left, account name in the center, current balance formatted with the active currency on the right.
  - **Second row** (only if the account has a note): note text below the name, in `textoSuave` color and reduced size, spanning the available width.
- The full row is a `TouchableOpacity` that navigates to `ModifyAccountScreen` (012) with `accountId` as a parameter when pressed.
- If there are no accounts, an empty state is shown with an icon and message.

### 4. Default account name (multilingual)

- The seeded default account (id 1, "My Wallet") is treated like a default category: its name is stored in English (`'My Wallet'`) and is shown translated according to the active language via `getDisplayAccountName(account)`.
- The mapping of account id → i18n key lives in `ACCOUNT_I18N_KEYS` in `src/i18n/index.ts` (currently `{ 1: 'account_my_wallet' }`).
- If the user renames the default account, `account.name` no longer equals the English default, so it is displayed verbatim (custom name, no longer multilingual). Renaming it back to exactly the English default (`'My Wallet'`) restores the multilingual behavior.
- The translated values are: en `My Wallet`, es `Mi Cartera`, ca `La meva cartera`.


### 4. Floating "+" button

- Floating button (FAB) centered at the bottom with `Ionicons "add"` icon.
- When pressed, navigates to `CreateAccountScreen` (013) to create a new account.
- Background: primary color (`c.primary`). Icon: `c.background` (adaptable to dark/light theme).
- Position: `position: absolute`, `bottom: 56`, `alignSelf: 'center'`.
- It overlays on top of the account list.

### 5. Persistence

- Accounts are loaded from `accountRepository.list()` with the active user.
- Balances are obtained with `accountRepository.getCurrentBalance()`.
- **Refresh after mutations**: after creating or modifying an account (013 and 012), `refreshAccounts()` from `AppContext` must be invoked so the account list in HomeScreen (AccountModal) updates immediately.

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()` from the existing i18n system.
- **Configuration**: use `useConfig().activeColors` for colors.
- **Text**: use `useFontSize()` for scaling.
- **Navigation**: add to `HomeStack` in `AppNavigator.tsx` and connect the "Accounts" `DrawerItem` to navigate to it.
- **Persistence**: data from `accountRepository` (native SQLite / web localStorage).
- **Monetary format**: all amounts are displayed with a maximum of 2 decimals using `formatCurrency()`.

---

## Acceptance criteria

- [ ] The Drawer shows "Accounts" and pressing it navigates to the accounts screen.
- [ ] The header shows a hamburger menu button and the title "Accounts" in the active language.
- [ ] "Total:" is displayed with the total balance of all accounts, green if >= 0, red if < 0, with a maximum of 2 decimals.
- [ ] Each account shows an icon with background color + name + formatted balance.
- [ ] If the account has a note (description), it is displayed below the name in a soft color and reduced size.
- [ ] Pressing an account navigates to "Modify account" (012) with the `accountId`.
- [ ] If there are no accounts, an empty state is shown.
- [ ] The default account "My Wallet" is displayed translated according to the active language (e.g. es "Mi Cartera", ca "La meva cartera") via `getDisplayAccountName`.
- [ ] The floating "+" button navigates to "Create account" (013).
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
