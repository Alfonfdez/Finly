# Tasks — 020 Tag filter on HomeScreen, TransactionsScreen, and AllTransactionsScreen
Execution order. Check off each task as you complete it.

---

### Phase 1 — Database queries

[x] T1 — Add `breakdownByCategoryAndTag(accountId, categoryId, type, startDate, endDate)` to `src/database/repositories/transactionRepo.ts`. Returns `{ tag_id: number; name: string; total: number }[]` for a specific category and period. Uses UNION ALL to include an "Untagged" row (tag_id = -1) for transactions with no tags via `NOT EXISTS`.

[x] T2 — Add `tagIds: number[]` filter to `list()` in `src/database/repositories/transactionRepo.ts`: when tagIds is provided and non-empty, build OR conditions. For regular IDs: `t.id IN (SELECT transaction_id FROM transaction_tags WHERE tag_id IN (...))`. If tagIds contains -1: add `OR NOT EXISTS (SELECT 1 FROM transaction_tags WHERE transaction_id = t.id)`.

[x] T3 — Add `getTagsByTransactionIds(transactionIds: number[])` to `src/database/repositories/transactionRepo.ts`. Returns `{ transaction_id: number; tag_id: number; name: string }[]` via JOIN on transaction_tags and tags. Used by TransactionGroup for batch tag loading.

[x] T4 — Add same 3 methods to `webTransactionRepo` in `src/database/webStorage.ts`: `breakdownByCategoryAndTag()` with JS filtering, `tagIds` filter in `list()`, `getTagsByTransactionIds()`.

---

### Phase 2 — Context and components

[x] T5 — Update `src/context/AppContext.tsx`: add `activeTagIds: number[]` state, `toggleTagId(id: number)` (handles exclusive Untagged logic: if id === -1, clear regular IDs; if id > -1, clear -1 from array), `clearTagFilter()` (resets to []). Update `filteredTransactions` memo to filter by `activeTagIds` using OR logic. Add `tagsByTransaction: Map<number, number[]>` computed from transactions + tags (from 018).

[x] T6 — Create `src/components/TagFilterBar.tsx`: horizontal ScrollView of tag chips with multi-select. First chip is "All" (selected when `activeTagIds.length === 0`). Second chip is "Untagged" (selected when `activeTagIds.includes(-1)`). Remaining chips from `tags` prop sorted by name. Tapping a chip calls `onToggle(id)`. Tapping "All" calls `onClear()`. Hidden when `tags.length === 0`. Use `useConfig`, `useFontSize`, `t()`. Visual: selected = `primary` bg + `background` text; unselected = `surface` bg + `text` text.

[x] T7 — Update `src/components/CategoryList.tsx`: add expandable tag breakdown section below each category row. Props: `tagBreakdowns` (Map), `expandedCategoryIds` (Set), `onToggleExpand`. Collapsed: show top 3 tags as compact chips (fs(11), no icon, including Untagged if present). Expanded: show all tags + "Show less". Tapping the tag area toggles expand. Tapping the main row area navigates (unchanged).

---

### Phase 3 — Screen integration

[x] T8 — Update `src/screens/HomeScreen.tsx`: import + render `TagFilterBar` below PeriodTabs and above the chart. Pass `tags`, `activeTagIds`, `toggleTagId`, `clearTagFilter` from AppContext. Manage `expandedCategoryIds: Set<number>` locally with toggle handler. Pass `tagBreakdowns`, `expandedCategoryIds`, `onToggleExpand` to CategoryList. Update `handleCategoryPress` to pass `tagIds: activeTagIds` in navigation params.

[x] T9 — Update `src/constants/types.ts`: add `tagIds?: number[]` to `Transactions` in `RootStackParamList`.

[x] T10 — Add i18n keys `home_tag_all`, `home_tag_untagged`, `home_tag_view_all`, `home_tag_show_less` in `src/i18n/en.ts`, `src/i18n/es.ts`, `src/i18n/ca.ts`.

---

### Phase 4 — TransactionsScreen filter bar

[x] T11 — Update `src/screens/TransactionsScreen.tsx`: add `localTagIds` state initialized from `route.params.tagIds` (default `[]`). Render `TagFilterBar` below controls, above SectionList. Use local `onToggle` and `onClear` handlers that update `localTagIds` independently (no AppContext mutation). Move existing tag-based filtering from `useFocusEffect` to the `filtered` useMemo so it reacts to localTagIds changes in real-time. Import `TagFilterBar` and `tags` from AppContext.

---

### Phase 5 — AllTransactionsScreen filter bar

[ ] T13 — Update `src/screens/AllTransactionsScreen.tsx`: add `localTagIds` state (default `[]`). Import and render `TagFilterBar` below controls (AccountSelector + SortToggle), above SectionList. Add local `onToggle` and `onClear` handlers that update `localTagIds` independently. Load `tags` from AppContext. Filter `filtered` useMemo by `localTagIds` using OR logic (same pattern as TransactionsScreen). Update `accountBalance` useMemo to compute from filtered transactions (not allTransactions) so the balance reflects the tag filter.

[ ] T14 — Verify `tagsByTransaction` loading is already present in AllTransactionsScreen (loads tags for all visible transactions via `getTagsByTransactionIds`). Ensure the `filtered` memo uses `tagsByTransaction` for tag filtering.

---

### Verification

[ ] T12 — Manual verification: `npx expo start --web` and `npx expo start`. Test tag filter bar visibility (hidden when no tags), multi-select with OR logic (select two tags, verify chart + category list update), Untagged chip exclusive behavior, "All" resets filter, expand/collapse tag breakdown in category rows, tag filter inheritance to TransactionsScreen (verify tagIds passed and filtered), verify tag filter bar on TransactionsScreen (initialize from inherited tags, toggle independently, clear), verify tag filter bar on AllTransactionsScreen (starts with "All", toggle/clear independently, balance updates with filter), verify all 3 languages, verify all period types work with tag filter.
