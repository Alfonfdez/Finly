# Tasks — 003 Settings page (restructure)
Execution order. Mark each task when completed.

---

### Phase 1 — Config infrastructure

[ ] T1 — Add 7 new fields to `Config` interface in `src/context/ConfigContext.tsx`: `homeDefaultAccountId`, `homeDefaultPeriod`, `addDefaultAccountId`, `addShowLabels`, `addShowComments`, `addShowPhoto`, `hideBalances`. Update `CONFIG_DEFAULT` with sensible defaults.

[ ] T2 — Add new config defaults to `src/database/migrations/003_config.ts` (SQLite) and `src/database/webStorage.ts` (localStorage). Ensure new fields are persisted and loaded correctly.

---

### Phase 2 — Settings navigation restructure

[ ] T3 — Create `src/screens/settings/` folder. Move existing `SettingsScreen.tsx` to `src/screens/settings/SettingsScreen.tsx` (rename old file to be replaced).

[ ] T4 — Rewrite `src/screens/settings/SettingsScreen.tsx` as the main subsection list: 4 rows (Appearance, Regional, Personalization, Data) with icons, labels, and chevron-right. Each row navigates to the corresponding detail screen.

[ ] T5 — Update `src/constants/types.ts`: add `SettingsAppearance`, `SettingsRegional`, `SettingsPersonalization`, `SettingsData` to `RootStackParamList` with `undefined` params. Add corresponding screen props types.

[ ] T6 — Update `src/navigation/AppNavigator.tsx`: register 4 new screens in HomeStack with `headerShown: false`. Update existing Settings route to point to new `settings/SettingsScreen.tsx`.

---

### Phase 3 — Appearance subsection

[ ] T7 — Create `src/screens/settings/AppearanceScreen.tsx`. Custom header (back arrow + "Appearance" title). Theme selector (Dark/Light/System), Text size selector (Small/Medium/Large), Account icon shape (Square/Circle), Category icon shape (Square/Circle). Reuse `SelectorInline` component pattern from current SettingsScreen.

[ ] T8 — Add i18n keys: `settings_appearance`, `settings_personalization`, `settings_data`, `settings_regional` (section titles) in en/es/ca.

---

### Phase 4 — Regional subsection

[ ] T9 — Create `src/screens/settings/RegionalScreen.tsx`. Custom header (back arrow + "Regional" title). Language selector (EN/ES/CA with flags), Currency selector (€/$/£/¥), Decimal separator (Comma/Period), First day of week (Monday/Sunday). Reuse `SelectorInline` component pattern.

---

### Phase 5 — Personalization > Home screen defaults

[ ] T10 — Create `src/screens/settings/PersonalizationScreen.tsx` with custom header (back arrow + "Personalization" title).

[ ] T11 — Add "Home screen" subtitle section. Default account selector: lists ALL accounts (including Total), sorted with Total first. Default = Total. Reads/writes `config.homeDefaultAccountId`.

[ ] T12 — Default period selector: Day/Week/Month/Year. Default = Month. Reads/writes `config.homeDefaultPeriod`. No "Period" (custom range) option.

[ ] T13 — Add i18n keys: `settings_home_screen`, `settings_add_transaction`, `settings_privacy`, `settings_default_account`, `settings_default_period`, `settings_not_selected` in en/es/ca.

---

### Phase 6 — Personalization > Add transaction defaults

[ ] T14 — Add "Add transaction" subtitle section in PersonalizationScreen. Default account selector: lists accounts EXCLUDING Total, sorted alphabetically. Default = "Not selected" (`null`). Reads/writes `config.addDefaultAccountId`.

[ ] T15 — Add "Optional fields" subsection with 3 checkboxes: Labels, Comments, Photo. All checked by default. Each checkbox reads/writes the corresponding `config.addShowLabels`, `config.addShowComments`, `config.addShowPhoto`.

[ ] T16 — Add i18n keys: `settings_optional_fields`, `settings_labels`, `settings_comments`, `settings_photo` in en/es/ca.

---

### Phase 7 — Personalization > Privacy

[ ] T17 — Add "Privacy" subtitle section in PersonalizationScreen. Toggle: "Hide account balances" (default: off). Reads/writes `config.hideBalances`.

[ ] T18 — Add i18n keys: `settings_hide_balances` in en/es/ca.

---

### Phase 8 — Privacy eye icon implementation

[ ] T19 — Create `src/components/EyeToggle.tsx`: small eye icon button (`eye-outline` / `eye-off-outline`). Props: `isHidden: boolean`, `onToggle: () => void`.

[ ] T20 — Implement eye icon in `HomeScreen.tsx`: add `isRevealed` state + `useFocusEffect` reset. EyeToggle next to balance amount. Balance masked with `•••••` when hidden.

[ ] T21 — Implement eye icon in `AccountsScreen.tsx`: `isRevealed` state + reset. EyeToggle in total header row. All account balances in list masked when hidden.

[ ] T22 — Implement eye icon in `AccountModal.tsx`: `isRevealed` state + reset. EyeToggle in modal header. Account balances in list masked when hidden.

[ ] T23 — Verify eye icon does NOT appear in TransactionDetailsScreen, AddTransactionScreen, or ModifyTransactionScreen (amounts always visible there).

---

### Phase 9 — Apply personalization defaults

[ ] T24 — Update `HomeScreen.tsx`: on mount, if `homeDefaultAccountId` is set (not null), initialize `activeAccount` to that account. If `homeDefaultAccountId` is null, preserve current behavior.

[ ] T25 — Update `HomeScreen.tsx`: on mount, if `homeDefaultPeriod` is set, initialize `activePeriod` to that value.

[ ] T26 — Update `AddTransactionScreen.tsx`: initialize `accountId` based on `addDefaultAccountId`. If null, use current logic (inherit from HomeScreen; if Total, fallback to first non-Total). If set to a specific account, use that account.

[ ] T27 — Update `AddTransactionScreen.tsx`: conditionally hide Labels, Comments, and Photo sections based on `config.addShowLabels`, `config.addShowComments`, `config.addShowPhoto`.

[ ] T28 — Update `ModifyTransactionScreen.tsx`: same optional fields logic as AddTransactionScreen.

---

### Phase 10 — Data subsection

[ ] T29 — Create `src/screens/settings/DataScreen.tsx` with custom header (back arrow + "Data" title). Rows: "Delete all transactions" (trash-outline, red), "Delete all data" (warning-outline, red), "Reset to factory state" (refresh-outline, red). Each destructive row shows a short description. Each with chevron-right.

[ ] T30 — Implement "Delete all transactions" confirmation modal. Title, message, Cancel/Delete buttons. On confirm: delete all rows from `transactions` and `transaction_tags`. Show toast/snackbar confirmation.

[ ] T31 — Implement "Delete all data" double confirmation modal. First modal: title, message, Cancel/Delete all. Second modal: title, message, text input ("DELETE"), Cancel/Confirm (disabled until correct text). On confirm: clear all data, re-seed seed data, keep config (only null dangling default-account keys).

[ ] T31b — Implement "Reset to factory state" double confirmation modal (same two-step pattern). On confirm: clear all data and re-seed config to defaults (language English, dark theme, etc.).

[ ] T32 — Add i18n keys: `settings_delete_all_transactions`, `settings_delete_all_transactions_description`, `settings_delete_all_data`, `settings_delete_all_data_description`, `settings_factory_reset`, `settings_factory_reset_description`, `settings_factory_reset_confirm_title`, `settings_factory_reset_confirm_message`, `settings_delete_transactions_confirm_title`, `settings_delete_transactions_confirm_message`, `settings_delete_data_confirm_title`, `settings_delete_data_confirm_message`, `settings_delete_data_confirm_title2`, `settings_delete_data_confirm_message2`, `settings_delete_data_confirm_placeholder`, `settings_delete_confirm`, `settings_delete_all_transactions_done`, `settings_delete_all_data_done` in en/es/ca.

[ ] T33 — Implement native deletion logic: `DELETE FROM transactions`, `DELETE FROM transaction_tags` for transactions; `clearDataKeepSettings()` (delete data + re-seed data + sanitize dangling account defaults) for "Delete all data"; `resetDatabase()` (delete data + re-seed data and config defaults) for factory reset.

[ ] T34 — Implement web deletion logic: same paths via sql.js `getDatabase()` (no `localStorage` branches).

---

### Verification

[ ] T35 — Lint check: `npx expo lint` — 0 errors, 0 warnings.

[ ] T36 — Manual verification: navigate to each subsection, change settings, verify persistence on restart. Test eye icon reveal/reset. Test delete flows. Test Add transaction default account behavior. Test optional fields visibility. Validate all acceptance criteria from `1-spec.md`.
