# Tasks — 019 Tag selection in transactions
Execution order. Check off each task as you complete it.

---

### Phase 1 — Repository methods

[ ] T1 — Add `createWithTags(data, tagIds)`, `updateWithTags(id, data, tagIds)`, `getTagsByTransactionId(transactionId)` to `src/database/repositories/transactionRepo.ts`. `createWithTags` creates the transaction then inserts junction rows. `updateWithTags` updates the transaction then deletes + re-inserts junction rows. `getTagsByTransactionId` returns tag IDs via JOIN.

[ ] T2 — Add same 3 methods to `webTransactionRepo` in `src/database/webStorage.ts`. Junction operations in JS (read/write `@Finly/transaction_tags`).

[ ] T3 — Add i18n keys `add_tag_error_duplicate` and `add_tag_error_empty` in `src/i18n/en.ts`, `src/i18n/es.ts`, `src/i18n/ca.ts`.

---

### Phase 2 — Component and screen updates

[ ] T4 — Update `src/components/TagSection.tsx`: replace local `Tag[]` state with `tags` from AppContext. Change `selectedTags` to `number[]` (tag IDs). Inline create modal calls `tagRepo.create()` + `refreshTags()` + auto-selects new tag. Add duplicate validation (case-insensitive) using `tagRepo.existsByName()`.

[ ] T5 — Update `src/screens/AddTransactionScreen.tsx`: remove local `availableTags` state and `handleCreateTag`. Use `tags` from AppContext. `selectedTags: number[]`. On submit: call `transactionRepository.createWithTags(data, tagIds)` instead of `create()`. Clear selectedTags on success.

[ ] T6 — Update `src/screens/ModifyTransactionScreen.tsx`: on mount, call `transactionRepository.getTagsByTransactionId(transactionId)` to pre-select existing tags. On submit: call `transactionRepository.updateWithTags(transactionId, data, tagIds)` instead of `update()`. Remove local `availableTags` state.

---

### Verification

[ ] T7 — Manual verification: `npx expo start --web` and `npx expo start`. Test adding a transaction with tags, modifying a transaction (tags pre-selected), creating a tag inline from AddTransaction, verifying tags persist in the database, duplicate rejection in inline create modal.
