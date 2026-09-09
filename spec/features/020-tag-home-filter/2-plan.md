# Implementation plan — 020 Tag filter on HomeScreen, TransactionsScreen, and AllTransactionsScreen

## Architecture

### New components

- **`TagFilterBar.tsx`**: Horizontal ScrollView of tag chips with multi-select. "All" always first (resets filter), "Untagged" always second (exclusive with regular tags), remaining tags alphabetically sorted. Props: `tags: Tag[]`, `activeTagIds: number[]`, `onToggle(id: number)`, `onClear()`.

### Modified files

- **`components/CategoryList.tsx`**: Each row gains an expandable tag breakdown section below the existing progress bar. Props: `tagBreakdowns: Map<number, { tag_id: number; name: string }[]>`, `expandedCategoryIds: Set<number>`, `onToggleExpand(id: number)`.
- **`screens/HomeScreen.tsx`**: Import + render `TagFilterBar` below PeriodTabs. Pass `activeTagIds`, `toggleTagId`, `clearTagFilter` from AppContext. Manage expanded category state locally. Pass `tagIds` to TransactionsScreen navigation.
- **`context/AppContext.tsx`**: Add `activeTagIds: number[]`, `toggleTagId(id)`, `clearTagFilter()`. Update `filteredTransactions` memo to filter by `activeTagIds` (OR logic, with untagged as exclusive). Add `categoryTagBreakdowns: Map<number, { tag_id: number; name: string }[]>` computed from transactions + tags.
- **`database/repositories/transactionRepo.ts`**: Add `breakdownByCategoryAndTag()` with Untagged row support, extend `list()` with `tagIds: number[]` filter (OR + NOT EXISTS for untagged), add `getTagsByTransactionIds()` batch query.
- **`database/webStorage.ts`**: Same methods for web.
- **`screens/TransactionsScreen.tsx`**: Add localTagIds state from route params, render TagFilterBar, local toggle/clear handlers, move tag filtering to useMemo for real-time reactivity.
- **`screens/AllTransactionsScreen.tsx`**: Add localTagIds state (default `[]`), render TagFilterBar below controls, local toggle/clear handlers, filter transactions by tags in useMemo, update balance to reflect filtered transactions.
- **`i18n/en.ts, es.ts, ca.ts`**: Add `home_tag_all`, `home_tag_untagged`, `home_tag_view_all`, `home_tag_show_less` keys.

### Data flow

```
HomeScreen:
  AppContext.tags → TagFilterBar → activeTagIds (multi-select, OR logic)
  AppContext.filteredTransactions (filtered by activeTagIds) → activeCategories → DonutChart / BarChart
  AppContext.categoryTagBreakdowns → CategoryList (per-category tags, including Untagged)
  handleCategoryPress → passes activeTagIds as tagIds nav param → TransactionsScreen

TransactionsScreen:
  route.params.tagIds → localTagIds (initial state from nav params)
  TagFilterBar with localTagIds → user can toggle/clear independently
  local filter: allTransactions.filter(by selectedAccountId, by localTagIds) → filtered → SectionList

AllTransactionsScreen:
  localTagIds = [] (always starts unfiltered, no nav params)
  TagFilterBar with localTagIds → user can toggle/clear independently
  local filter: allTransactions.filter(by selectedAccountId, by localTagIds) → filtered → SectionList
  accountBalance recalculated from filtered transactions (not allTransactions)
```

### Tag filter bar placement

```
HomeScreen:
┌─────────────────────────────────┐
│ ☰  Account selector  📊        │  ← Header
├─────────────────────────────────┤
│ [Expenses] [Income]             │  ← TypeTabs
├─────────────────────────────────┤
│ [Day] [Week] [Month] [Year] [..]│  ← PeriodTabs
├─────────────────────────────────┤
│         Donut Chart             │
├─────────────────────────────────┤
│ [All] [Untagged] [Urgent] [..]  │  ← TagFilterBar (NEW, multi-select)
├─────────────────────────────────┤
│ 🛒 Food           45.2%  120€  │
│    [Urgent] [Untagged]          │  ← Tag chips (NEW, includes Untagged)
│ 🚌 Transport      22.1%   58€  │
│    [Commute]                    │
│ ...                             │
└─────────────────────────────────┘

AllTransactionsScreen:
┌─────────────────────────────────┐
│ ☰  All transactions      list   │  ← Header (drawer)
├─────────────────────────────────┤
│ Account selector                │
│ +1.234,56 €                     │  ← Balance (updates with tag filter)
│ [By date ▼] [By amount]        │  ← SortToggle
├─────────────────────────────────┤
│ [All] [Untagged] [Urgent] [..]  │  ← TagFilterBar (NEW, multi-select)
├─────────────────────────────────┤
│ 📅 19 Jul 2026                  │
│ 🛒 Food        Supermarket -45€ │
│ 🚌 Transport   Metro card  -12€ │
│ ...                             │
│                    [ + ]        │  ← FAB
└─────────────────────────────────┘
```

### Per-category tag breakdown

- Default: collapsed. Show top 3 tags as compact chips (including "Untagged" if present).
- Expanded: show all tags + "View all (N)" text becomes "Show less". Count includes "Untagged" as a distinct entry.
- Tapping the category row (icon/name/amount area) navigates to Transactions (unchanged). Passes `activeTagIds` as `tagIds` nav param.
- Tapping the tag section area (below the progress bar) toggles expand.

### Multi-select filtering logic (AppContext)

```typescript
// activeTagIds = [] → no filter (All)
// activeTagIds = [-1] → only untagged transactions
// activeTagIds = [1, 3] → transactions with tag 1 OR tag 3
// activeTagIds = [-1, 1] → untagged OR transactions with tag 1

filteredTransactions = useMemo(() => {
  let result = transactions.filter(t => t.type === activeType);
  if (activeTagIds.length > 0) {
    const hasUntagged = activeTagIds.includes(-1);
    const regularIds = activeTagIds.filter(id => id !== -1);
    result = result.filter(t => {
      const txnTagIds = tagsByTransaction.get(t.id) ?? [];
      if (hasUntagged && txnTagIds.length === 0) return true;
      if (regularIds.length > 0 && regularIds.some(id => txnTagIds.includes(id))) return true;
      return false;
    });
  }
  return result;
}, [transactions, activeType, activeTagIds, tagsByTransaction]);
```

### Untagged handling in breakdown queries

```sql
-- breakdownByCategoryAndTag: includes Untagged row
SELECT tt.tag_id, t.name, SUM(tr.amount) AS total
FROM transactions tr
JOIN transaction_tags tt ON tr.id = tt.transaction_id
JOIN tags t ON tt.tag_id = t.id
WHERE tr.account_id = ? AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
  AND tr.category_id = ?
GROUP BY tt.tag_id

UNION ALL

SELECT -1 AS tag_id, 'Untagged' AS name, SUM(tr.amount) AS total
FROM transactions tr
WHERE tr.account_id = ? AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
  AND tr.category_id = ?
  AND NOT EXISTS (SELECT 1 FROM transaction_tags WHERE transaction_id = tr.id)
```

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `home_tag_all` | All | Todos | Tots |
| `home_tag_untagged` | Untagged | Sin etiqueta | Sense etiqueta |
| `home_tag_view_all` | View all (N) | Ver todos (N) | Veure tots (N) |
| `home_tag_show_less` | Show less | Mostrar menos | Mostrar menys |

---

## Dependencies

- 018-tag-management (database schema, tagRepo, AppContext.tags)
- 019-tag-transactions (tag persistence in transactions, getTagsByTransactionIds)
- Existing CategoryList, HomeScreen, AppContext

## Estimate

- **Tasks**: 14 tasks in 5 phases
- **Estimated time**: 6-7 hours
