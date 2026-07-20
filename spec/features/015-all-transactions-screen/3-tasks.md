# Tasks — 015 All transactions screen (updated)
Execution order. Mark each task when completed.

---

### Phase 1 — Repository and i18n

[ ] T1 — Add `category_ids?: number[]` to `TransactionFilters` interface in `src/database/repositories/transactionRepo.ts`. Add SQL clause: `AND category_id IN (...)` when `category_ids` is provided and non-empty.

[ ] T2 — Add i18n keys to `src/i18n/en.ts`: `tab_all`, `filter_categories`, `filter_all_categories`, `filter_apply`, `filter_no_results`, `filter_expenses`, `filter_income`. Add same keys to `es.ts` and `ca.ts`.

---

### Phase 2 — New components

[ ] T3 — Create `src/components/AllTypeTabs.tsx`: 3-tab component (All / Expenses / Income) following the TypeTabs visual pattern. Props: `active: 'all' | TransactionType`, `onChange: (type) => void`. "All" tab uses `c.primary` background when active. Default active: `'all'`.

[ ] T4 — Create `src/components/CategoryFilterModal.tsx`: full-screen modal (spec 021). Props: `visible`, `categories`, `selectedIds: number[]`, `type: 'all' | TransactionType`, `onApply: (ids: number[]) => void`, `onClose`. Features: SearchBar, "All" chip, 4×N category grid with multi-select, type-aware sections (headers when type='all'), Apply button with count.

---

### Phase 3 — Screen integration

[ ] T5 — Update `src/screens/AllTransactionsScreen.tsx`: add state for `typeTab: 'all' | TransactionType` (default 'all'), `selectedCategoryIds: number[]` (default []), `period: Period` (default 'year'), `selectedDate: Date`, custom date range. Add AllTypeTabs at top, CategoryFilterButton in controls, PeriodTabs + CalendarPicker below controls.

[ ] T6 — Update transaction loading in AllTransactionsScreen: pass `type` (when not 'all'), `category_ids` (when non-empty), `start_date`/`end_date` (from period computation) to `transactionRepository.list()`. Compute period dates same as HomeScreen.

[ ] T7 — Update filtered/sections/balance memos in AllTransactionsScreen to account for type, category, and period filters. Balance = sum of filtered transactions (respecting type, category, period, tags).

[ ] T8 — Add CategoryFilterModal rendering to AllTransactionsScreen. Wire category button press → modal open, modal Apply → update selectedCategoryIds, modal Close.

---

### Phase 4 — Manual verification

[ ] T9 — Verify type tabs: "All" shows all, "Expenses" shows only expenses, "Income" shows only income. Balance updates per tab.

[ ] T10 — Verify category filter: button shows "All categories" by default, opens modal, multi-select works, Apply filters the list, "All" in modal clears filter.

[ ] T11 — Verify period selector: Year default, changing period updates calendar and filters list. All period types work (day/week/month/year/custom).

[ ] T12 — Verify all filters combine correctly (AND logic). Test empty states. Test language change, theme, text size.

---

### Verification

[ ] T13 — Final verification: `npx expo start --web` and `npx expo start`. Test all new filters, navigation, sorting, tags, FAB, empty states.
