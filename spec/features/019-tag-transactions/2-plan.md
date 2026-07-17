# Implementation plan — 019 Tag selection in transactions

## Architecture

### Modified files

- **`components/TagSection.tsx`**: Replace local `Tag[]` with tags from AppContext. Change `selectedTags` to `number[]` (tag IDs). Inline create calls `tagRepo.create()` + `refreshTags()` + auto-select.
- **`screens/AddTransactionScreen.tsx`**: Load tags from AppContext. Replace local `availableTags` with `tags`. Use `selectedTags: number[]`. On submit: call `transactionRepository.createWithTags()`.
- **`screens/ModifyTransactionScreen.tsx`**: Load existing tags for transaction on mount via `getTagsByTransactionId()`. Pre-select. On submit: call `transactionRepository.updateWithTags()`.
- **`database/repositories/transactionRepo.ts`**: Add `createWithTags()`, `updateWithTags()`, `getTagsByTransactionId()`.
- **`database/webStorage.ts`**: Add same 3 methods to `webTransactionRepo`.
- **`context/AppContext.tsx`**: Add `tags: Tag[]` and `refreshTags()` (from 018).
- **`i18n/en.ts, es.ts, ca.ts`**: Add any missing keys (most already exist from current TagSection).

### Data flow

```
AddTransaction:
  AppContext.tags → TagSection → user selects/creates → selectedTags: number[]
  On submit → transactionRepo.createWithTags(data, tagIds)

ModifyTransaction:
  AppContext.tags → TagSection
  On mount → transactionRepo.getTagsByTransactionId(txId) → pre-select
  On submit → transactionRepo.updateWithTags(txId, data, tagIds)
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

## Estimate

- **Tasks**: 6 tasks in 2 phases
- **Estimated time**: 2-3 hours
