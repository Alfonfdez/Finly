# Tasks — 011 Accounts page
Execution order. Check off each task as you complete it.

---

### Phase 1 — Infrastructure and navigation

[ ] T1 — Add i18n key `accounts_total` in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts`. *(nav_accounts already exists)*

[ ] T2 — Update `src/constants/types.ts`: add `Accounts` to `RootStackParamList` and create `AccountsScreenProps`.

[ ] T3 — Update `src/navigation/AppNavigator.tsx`:
  - Add `AccountsScreen` to `HomeStack` with multilingual title and header style.
  - Connect the "Accounts" `DrawerItem` (currently `onPress={() => {}}`) to navigate to `AccountsScreen`.

---

### Phase 2 — Main screen

[ ] T4 — Create `AccountsScreen.tsx` with:
  - Header with hamburger menu button (opens Drawer) + multilingual "Accounts" title.
  - "Total:" section with total balance of all accounts (green/red based on sign).
  - FlatList of accounts loaded from `accountRepository.list()` with balance from `getCurrentBalance()`.
  - Each row: first row with icon (background color) + name + formatted balance; second row (only if note exists) with text in soft color and reduced size.
  - Empty state if no accounts.
  - Floating "+" button (FAB) that navigates to `CreateAccountScreen` (013).
  - Pressing an account: navigate to `ModifyAccountScreen` with `{ accountId }`.

[ ] T5 — Apply `useConfig().activeColors`, `useFontSize()` and `accessibilityLabel` to all elements.

---

### Verification

[ ] T6 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test Drawer navigation, account list, total balance, and navigation to modify account.
