# 019 — Tag selection in transactions

- **Objective**
  Replace the hardcoded tag UI in Add/ModifyTransaction with persistent tags from the database. Users can select existing tags and create new ones inline. Tags are saved to the `transaction_tags` junction table.

---

## Functional requirements

### 1. TagSection component update

- Replace the local `Tag[]` state with tags loaded from `tagRepo.list()` via AppContext.
- Existing tags shown as chips (same visual: `primary` background when selected, `surface` when not).
- Search icon toggles search input (same behavior as current).
- "+" chip opens the inline create modal (same as current).
- Selected tags passed as `tagIds: number[]` instead of local state.

### 2. Inline tag creation (modal)

- Modal with "Add tag" title, name input (max 20 chars, counter), Cancel / Submit buttons.
- Case-insensitive duplicate check before creation.
- On create: `tagRepo.create()` → `refreshTags()` → auto-select the new tag → close modal.
- Empty name and duplicate validation same as 018 CreateTagScreen.

### 3. AddTransactionScreen integration

- On mount: load tags via `tagRepo.list()` (from AppContext).
- `selectedTags: number[]` state (tag IDs, not local Tag objects).
- On submit: after `transactionRepository.create()`, insert rows into `transaction_tags` for each selected tag ID.
- Clear `selectedTags` on successful submit.

### 4. ModifyTransactionScreen integration

- On mount: load existing tags for this transaction via `tagRepo.getByTransactionIds([transactionId])`.
- Pre-select the tag IDs in `selectedTags`.
- On submit: delete existing junction rows for this transaction, re-insert selected tags.

### 5. Tag persistence in transactionRepo

- Add `transactionRepo.createWithTags(data, tagIds)`: creates transaction + inserts junction rows in a single operation (or sequential).
- Add `transactionRepo.updateWithTags(id, data, tagIds)`: updates transaction + replaces junction rows.
- Add `transactionRepo.getTagsByTransactionId(transactionId)`: returns tag IDs for a transaction.

### 6. Web localStorage support

- Add `webTransactionRepo.createWithTags()`, `updateWithTags()`, `getTagsByTransactionId()`.
- Junction operations done in JS (read/write `@Finly/transaction_tags`).

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()`.
- **Configuration**: `useConfig().activeColors` for colors.
- **Text**: `useFontSize()` for scaling.
- **Tag selection UX**: same visual as current TagSection (chips, search, modal).
- **Tags are global**: not filtered by type. A tag can appear on both expense and income transactions.

---

## Acceptance criteria

- [ ] TagSection loads tags from the database instead of hardcoded values.
- [ ] Creating a tag inline persists it to the database.
- [ ] Selecting tags when adding a transaction saves them to the junction table.
- [ ] When modifying a transaction, existing tags are pre-selected.
- [ ] Saving a modified transaction replaces the old tag associations.
- [ ] Duplicate tag names (case-insensitive) are rejected in the create modal.
- [ ] Empty tag names are rejected.
- [ ] Tag names are limited to 20 characters.
- [ ] New tags created inline are auto-selected after creation.
- [ ] After adding/modifying, `refreshTags()` is called.
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
