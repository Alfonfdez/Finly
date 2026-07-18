# Implementation plan — 019 Tag selection in transactions

## Architecture

### Modified files

- **`components/TagSection.tsx`**: Replace local `Tag[]` with tags from AppContext. Change `selectedTags` to `number[]` (tag IDs). Inline create calls `tagRepo.create()` + `refreshTags()` + auto-select.
- **`components/TransactionGroup.tsx`**: Add `tagsByTransaction: Map<number, { tag_id: number; name: string }[]>` prop. Render tag chips below description for each transaction. Chips use `surface` background + `textSecondary` text, fs(11).
- **`screens/AddTransactionScreen.tsx`**: Load tags from AppContext. Replace local `availableTags` with `tags`. Use `selectedTags: number[]`. On submit: call `transactionRepository.createWithTags()`.
- **`screens/ModifyTransactionScreen.tsx`**: Load existing tags for transaction on mount via `getTagsByTransactionId()`. Pre-select. On submit: call `transactionRepository.updateWithTags()`.
- **`screens/TransactionsScreen.tsx`**: Read `tagIds` from route params. Filter transactions by `tagIds` (OR logic, with untagged support). Load tags for visible transactions via `getTagsByTransactionIds()`. Pass `tagsByTransaction` to TransactionGroup.
- **`screens/AllTransactionsScreen.tsx`**: Load tags for visible transactions via `getTagsByTransactionIds()`. Pass `tagsByTransaction` to TransactionGroup.
- **`database/repositories/transactionRepo.ts`**: Add `createWithTags()`, `updateWithTags()`, `getTagsByTransactionId()`, `getTagsByTransactionIds()`.
- **`database/webStorage.ts`**: Add same 4 methods to `webTransactionRepo`.
- **`constants/types.ts`**: Add `tagIds?: number[]` to `Transactions` in `RootStackParamList`.
- **`context/AppContext.tsx`**: Add `tags: Tag[]` and `refreshTags()` (from 018).

### Data flow

```
AddTransaction:
  AppContext.tags → TagSection → user selects/creates → selectedTags: number[]
  On submit → transactionRepo.createWithTags(data, tagIds)

ModifyTransaction:
  AppContext.tags → TagSection
  On mount → transactionRepo.getTagsByTransactionId(txId) → pre-select
  On submit → transactionRepo.updateWithTags(txId, data, tagIds)

TransactionsScreen (from HomeScreen):
  route.params.tagIds → filter transactions (OR logic, with untagged)
  On mount → transactionRepo.getTagsByTransactionIds(visibleTxIds) → tagsByTransaction
  TransactionGroup ← tagsByTransaction → renders tag chips per row

AllTransactionsScreen:
  On mount → transactionRepo.getTagsByTransactionIds(visibleTxIds) → tagsByTransaction
  TransactionGroup ← tagsByTransaction → renders tag chips per row
```

### New repository methods

```typescript
// transactionRepo
async createWithTags(
  data: Omit<Transaction, 'id' | 'created_at'>,
  tagIds: number[]
): Promise<Transaction>

async updateWithTags(
  id: number,
  data: Partial<Omit<Transaction, 'id' | 'created_at'>>,
  tagIds: number[]
): Promise<void>

async getTagsByTransactionId(transactionId: number): Promise<number[]>

async getTagsByTransactionIds(transactionIds: number[]): Promise<{
  transaction_id: number;
  tag_id: number;
  name: string;
}[]>
```

### TransactionGroup tag rendering

```tsx
// Per transaction row, after description:
{txTags.length > 0 && (
  <View style={styles.tagRow}>
    {txTags.map(tag => (
      <View key={tag.tag_id} style={[styles.tagChip, { backgroundColor: c.surface }]}>
        <Text style={[styles.tagName, { color: c.textSecondary, fontSize: fs(11) }]}>
          {tag.name}
        </Text>
      </View>
    ))}
  </View>
)}
```

### TransactionsScreen tag filtering

```typescript
// On mount, read tagIds from route params
const tagIds = route.params?.tagIds;

// Filter transactions by tagIds (OR logic)
const filteredByTags = useMemo(() => {
  if (!tagIds || tagIds.length === 0) return allTransactions;
  const hasUntagged = tagIds.includes(-1);
  const regularIds = tagIds.filter(id => id !== -1);
  return allTransactions.filter(tx => {
    const txTagIds = tagsByTransaction.get(tx.id) ?? [];
    if (hasUntagged && txTagIds.length === 0) return true;
    if (regularIds.length > 0 && regularIds.some(id => txTagIds.includes(id))) return true;
    return false;
  });
}, [allTransactions, tagIds, tagsByTransaction]);
```

### i18n

Most keys already exist from the current TagSection implementation:
- `add_tags`, `add_tag_search`, `add_tag_new`, `add_tag_modal_title`, `add_tag_name_placeholder`

New key if needed:
| Key | EN | ES | CA |
|---|---|---|---|
| `add_tag_error_duplicate` | A tag with this name already exists | Ya existe una etiqueta con este nombre | Ja existeix una etiqueta amb aquest nom |
| `add_tag_error_empty` | Enter a tag name | Introduce un nombre de etiqueta | Introdueix un nom d'etiqueta |

---

## Dependencies

- 018-tag-management (database schema, tagRepo, AppContext.tags)
- Existing TagSection component
- Existing AddTransactionScreen, ModifyTransactionScreen
- Existing TransactionsScreen, AllTransactionsScreen, TransactionGroup

## Estimate

- **Tasks**: 9 tasks in 3 phases
- **Estimated time**: 3-4 hours
