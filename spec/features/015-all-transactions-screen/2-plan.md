# Implementation plan — 015 All transactions screen (updated)

## Architecture

This update adds three new filter dimensions to AllTransactionsScreen: type tabs, multi-select category filter, and period selector. It introduces two new components and extends the transaction repository.

### Data flow

```
Drawer/HomeScreen → navigation.navigate('AllTransactions') [no params]
       → AllTransactionsScreen
       → state: typeTab ('all'|'expense'|'income'), categoryIds (number[]),
                period (Period), selectedDate, customDate range
       → transactionRepository.list({ account_id, type, category_ids, start_date, end_date })
       → local tag filtering (localTagIds)
       → sort + group by date → SectionList
```

### Files

| File | Action |
|------|--------|
| `src/components/AllTypeTabs.tsx` | **Create** — 3-tab component (All / Expenses / Income) |
| `src/components/CategoryFilterModal.tsx` | **Create** — full-screen multi-select category modal (spec 021) |
| `src/screens/AllTransactionsScreen.tsx` | **Modify** — integrate AllTypeTabs, CategoryFilterModal, PeriodTabs, CalendarPicker |
| `src/database/repositories/transactionRepo.ts` | **Modify** — add `category_ids?: number[]` to TransactionFilters, SQL IN clause |
| `src/i18n/en.ts` | **Modify** — add new labels |
| `src/i18n/es.ts` | **Modify** — add new labels |
| `src/i18n/ca.ts` | **Modify** — add new labels |

### Components reused

- `AccountModal.tsx` — account selector modal.
- `SortToggle.tsx` — date/amount sort toggle.
- `TransactionGroup.tsx` — date header + transaction rows.
- `TagFilterBar.tsx` — horizontal tag chip filter.
- `PeriodTabs.tsx` — Day/Week/Month/Year/Period tabs.
- `CalendarPicker.tsx` — date/period display + CalendarModal.

### Components created

- `AllTypeTabs.tsx` — extends TypeTabs pattern with a third "All" tab.
- `CategoryFilterModal.tsx` — full-screen modal with search, "All" chip, 4×N category grid, multi-select, type-aware sections, Apply button.

---

## Verification criteria

1. Open hamburger menu → "Transactions" → screen shows with type tabs (All selected), account selector, category button, period tabs (Year selected), calendar, tag bar, transaction list.
2. Tap "Expenses" tab → only expense transactions shown, balance updates.
3. Tap "Income" tab → only income transactions shown, balance updates.
4. Tap "All" tab → both types shown, balance updates.
5. Tap category button → modal opens showing categories adapted to current type tab.
6. Select categories in modal → tap Apply → transaction list filters to those categories.
7. Tap "All" in modal → all categories selected → no category filtering.
8. Change period (Day/Week/Month/Year/Period) → calendar updates → list filters by date range.
9. Sort toggle, tag filter, account selector, FAB all work as before.
10. All filters combine correctly (AND logic).
