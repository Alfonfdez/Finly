# Implementation plan — 020 Tag filter on HomeScreen

## Architecture

### New components

- **`TagFilterBar.tsx`**: Horizontal ScrollView of tag chips with "All" as first item. Single selection. Props: `tags: Tag[]`, `activeTagId: number | null`, `onSelect(id: number | null)`.

### Modified files

- **`components/CategoryList.tsx`**: Each row gains an expandable tag breakdown section below the existing progress bar. Props: `tagBreakdowns: Map<number, { tag_id: number; name: string }[]>`, `expandedCategoryIds: Set<number>`, `onToggleExpand(id: number)`.
- **`screens/HomeScreen.tsx`**: Import + render `TagFilterBar` below PeriodTabs. Pass `activeTagId` and `setActiveTagId` from AppContext. Manage expanded category state locally.
- **`context/AppContext.tsx`**: Add `activeTagId`, `setActiveTagId`. Update `filteredTransactions` to filter by tag. Add `categoryTagBreakdowns: Map<number, { tag_id: number; name: string }[]>`.
- **`database/repositories/transactionRepo.ts`**: Add `breakdownByCategoryAndTag()`, extend `list()` with `tag_id` filter.
- **`database/webStorage.ts`**: Same methods for web.
- **`i18n/en.ts, es.ts, ca.ts`**: Add `home_tag_all` (All) key.

### Data flow

```
HomeScreen:
  AppContext.tags → TagFilterBar → activeTagId
  AppContext.filteredTransactions (filtered by tag) → activeCategories → DonutChart / BarChart
  AppContext.categoryTagBreakdowns → CategoryList (per-category tags)
```

### Tag filter bar placement

```
┌─────────────────────────────────┐
│ ☰  Account selector  📊        │  ← Header
├─────────────────────────────────┤
│ [Expenses] [Income]             │  ← TypeTabs
├─────────────────────────────────┤
│ [Day] [Week] [Month] [Year] [..]│  ← PeriodTabs
├─────────────────────────────────┤
│ [All] [Urgent] [Recurring] [...]│  ← TagFilterBar (NEW)
├─────────────────────────────────┤
│         Donut Chart             │
├─────────────────────────────────┤
│ 🛒 Food           45.2%  120€  │
│    [Urgent] [Recurring]         │  ← Tag chips (NEW)
│ 🚌 Transport      22.1%   58€  │
│    [Commute]                    │
│ ...                             │
└─────────────────────────────────┘
```

### Per-category tag breakdown

- Default: collapsed. Show top 3 tags as compact chips.
- Expanded: show all tags + "View all (N)" text becomes "Show less".
- Tapping the category row (icon/name/amount area) navigates to Transactions (unchanged).
- Tapping the tag section area (below the progress bar) toggles expand.

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `home_tag_all` | All | Todos | Tots |
| `home_tag_view_all` | View all (N) | Ver todos (N) | Veure tots (N) |
| `home_tag_show_less` | Show less | Mostrar menos | Mostrar menys |

---

## Dependencies

- 018-tag-management (database schema, tagRepo, AppContext.tags)
- 019-tag-transactions (tag persistence in transactions)
- Existing CategoryList, HomeScreen, AppContext

## Estimate

- **Tasks**: 8 tasks in 3 phases
- **Estimated time**: 3-4 hours
