# Tasks — 019 Tag selection in transactions
Execution order. Check off each task as you complete it.

---

### Phase 1 — Repository methods

[ ] T1 — Add `createWithTags(data, tagIds)`, `updateWithTags(id, data, tagIds)`, `getTagsByTransactionId(transactionId)`, `getTagsByTransactionIds(transactionIds)` to `src/database/repositories/transactionRepo.ts`. `createWithTags` creates the transaction then inserts junction rows. `updateWithTags` updates the transaction then deletes + re-inserts junction rows. `getTagsByTransactionId` returns tag IDs via JOIN. `getTagsByTransactionIds` returns `{ transaction_id, tag_id, name }[]` for a batch of transaction IDs via JOIN.

[ ] T2 — Add same 4 methods to `webTransactionRepo` in `src/database/webStorage.ts`. Junction operations in JS (read/write `@Finly/transaction_tags`).

[ ] T3 — Add `tagIds?: number[]` to `Transactions` in `src/constants/types.ts` `RootStackParamList`.

[ ] T4 — Add i18n keys `add_tag_error_duplicate` and `add_tag_error_empty` in `src/i18n/en.ts`, `src/i18n/es.ts`, `src/i18n/ca.ts`.

---

### Phase 2 — Component and screen updates

[ ] T5 — Update `src/components/TagSection.tsx`: replace local `Tag[]` state with `tags` from AppContext. Change `selectedTags` to `number[]` (tag IDs). Inline create modal calls `tagRepo.create()` + `refreshTags()` + auto-selects new tag. Add duplicate validation (case-insensitive) using `tagRepo.existsByName()`.

[ ] T6 — Update `src/screens/AddTransactionScreen.tsx`: remove local `availableTags` state and `handleCreateTag`. Use `tags` from AppContext. `selectedTags: number[]`. On submit: call `transactionRepository.createWithTags(data, tagIds)` instead of `create()`. Clear selectedTags on success.

[ ] T7 — Update `src/screens/ModifyTransactionScreen.tsx`: on mount, call `transactionRepository.getTagsByTransactionId(transactionId)` to pre-select existing tags. On submit: call `transactionRepository.updateWithTags(transactionId, data, tagIds)` instead of `update()`. Remove local `availableTags` state.

[ ] T8 — Update `src/components/TransactionGroup.tsx`: add `tagsByTransaction: Map<number, { tag_id: number; name: string }[]>` prop. Render tag chips below description for each transaction. Chips: `surface` background + `textSecondary` text, fs(11), compact padding, no icon. Only render if transaction has tags.

---

### Phase 3 — Screen integration

[ ] T9 — Update `src/screens/TransactionsScreen.tsx`: read `tagIds` from route params. On mount, load tags for visible transactions via `getTagsByTransactionIds()`. Filter transactions by `tagIds` (OR logic, with untagged support when tagIds contains -1). Pass `tagsByTransaction` to TransactionGroup.

[ ] T10 — Update `src/screens/AllTransactionsScreen.tsx`: on mount, load tags for visible transactions via `getTagsByTransactionIds()`. Pass `tagsByTransaction` to TransactionGroup.

---

### Verification

[ ] T11 — Manual verification: `npx expo start --web` and `npx expo start`. Test adding a transaction with tags, modifying a transaction (tags pre-selected), creating a tag inline from AddTransaction, verifying tags persist in the database, duplicate rejection in inline create modal, tag chips visible on transaction rows in TransactionsScreen and AllTransactionsScreen, tag filter inheritance from HomeScreen (select tag on Home, tap category, verify TransactionsScreen filters by that tag).
