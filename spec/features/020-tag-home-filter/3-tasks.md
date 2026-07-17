# Tasks — 020 Tag filter on HomeScreen
Execution order. Check off each task as you complete it.

---

### Phase 1 — Database queries

[ ] T1 — Add `breakdownByCategoryAndTag(accountId, categoryId, type, startDate, endDate)` to `src/database/repositories/transactionRepo.ts`. Returns `{ tag_id: name: string; total: number }[]` for a specific category and period. Uses JOIN on transaction_tags and tags.

[ ] T2 — Add `tag_id` filter to `list()` in `src/database/repositories/transactionRepo.ts`: when `filters.tag_id` is provided, add `AND t.id IN (SELECT transaction_id FROM transaction_tags WHERE tag_id = ?)` to the query.

[ ] T3 — Add same methods to `webTransactionRepo` in `src/database/webStorage.ts`: `breakdownByCategoryAndTag()` with JS filtering, `tag_id` filter in `list()`.

---

### Phase 2 — Context and components

[ ] T4 — Update `src/context/AppContext.tsx`: add `activeTagId: number | null` state, `setActiveTagId` setter. Update `filteredTransactions` memo to filter by `activeTagId` when not null. Add `categoryTagBreakdowns: Map<number, { tag_id: number; name: string }[]>` computed from transactions + tags.

[ ] T5 — Create `src/components/TagFilterBar.tsx`: horizontal ScrollView of tag chips. First chip is "All" (selected when `activeTagId === null`). Remaining chips from `tags` prop. Single selection. Props: `tags`, `activeTagId`, `onSelect`. Hidden when `tags.length === 0`. Use `useConfig`, `useFontSize`, `t()`.

[ ] T6 — Update `src/components/CategoryList.tsx`: add expandable tag breakdown section below each category row. Props: `tagBreakdowns` (Map), `expandedCategoryIds` (Set), `onToggleExpand`. Collapsed: show top 3 tags as compact chips. Expanded: show all tags + "Show less". Tapping the tag area toggles expand. Tapping the main row area navigates (unchanged).

---

### Phase 3 — Screen integration

[ ] T7 — Update `src/screens/HomeScreen.tsx`: import + render `TagFilterBar` below PeriodTabs and above the chart. Pass `tags`, `activeTagId`, `setActiveTagId` from AppContext. Manage `expandedCategoryIds: Set<number>` locally with toggle handler. Pass `tagBreakdowns`, `expandedCategoryIds`, `onToggleExpand` to CategoryList.

[ ] T8 — Add i18n keys `home_tag_all`, `home_tag_view_all`, `home_tag_show_less` in `src/i18n/en.ts`, `src/i18n/es.ts`, `src/i18n/ca.ts`.

---

### Verification

[ ] T9 — Manual verification: `npx expo start --web` and `npx expo start`. Test tag filter bar visibility (hidden when no tags), select a tag and verify chart + category list update, expand/collapse tag breakdown in category rows, verify "All" resets filter, verify all 3 languages, verify all period types work with tag filter.
