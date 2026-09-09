# 019 — Tag selection in transactions

- **Objective**
  Replace the hardcoded tag UI in Add/ModifyTransaction with persistent tags from the database. Users can select existing tags and create new ones inline. Tags are saved to the `transaction_tags` junction table. Tags are also displayed on transaction rows in the TransactionsScreen and AllTransactionsScreen.

---

## Functional requirements

### 1. TagSection component update

- Replace the local `Tag[]` state with tags loaded from `tagRepo.list()` via AppContext.
- Existing tags shown as chips (same visual: `primary` background when selected, `surface` when not).
- Search icon toggles search input (same behavior as current).
- "+" chip opens the inline create modal (same as current).
- When the 50-tag maximum (`MAX_TAGS`) is reached, the "+ Add tag" chip is hidden (the form still allows selecting the existing 50 tags).
- Selected tags passed as `tagIds: number[]` instead of local state.
- Tags are displayed in creation order (oldest first, newest last), so newly created tags appear at the end just before the "+ Add tag" pill.

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
- Add `transactionRepo.getTagsByTransactionIds(transactionIds: number[])`: batch query returning `{ transaction_id: number; tag_id: number; name: string }[]` for a set of transaction IDs. Used by TransactionGroup to display tags per row.

### 6. Transaction list with tags

- **TransactionGroup** component shows tag chips on each transaction row.
- Tags are loaded via `getTagsByTransactionIds()` batch query for all visible transactions.
- Layout per row:

```
[CatIcon] [CategoryName]              Amount
          [Description]
          [Tag1] [Tag2]               ← small chips (fs(11), compact, no icon)
```

- If a transaction has no tags, no tag chips are shown (no empty state).
- Tag chips use `surface` background + `textSecondary` text (visually distinct from selected state in TagSection).
- Tags are displayed in both TransactionsScreen (014) and AllTransactionsScreen (015).

### 6b. Tag display in TransactionDetailsScreen

- Load tags for the current transaction via `getTagsByTransactionId(transactionId)`.
- Render tags as chips in the data section, after the Comment row.
- Layout:

```
Comment    | Some description
Tags       | [Urgent] [Recurring]
```

- If no tags, show the Tags row with `textSecondary` placeholder (e.g., `—`), same pattern as "No comment".
- Tag chips use `primary` + `20` opacity background + `primary` text color (visually distinct from the compact `surface`/`textSecondary` chips on transaction rows — detail view chips are slightly more prominent).
- Tags row uses the same `DataRow` component as other rows.

### 7. Tag filter in navigation

- `Transactions` screen receives optional `tagIds?: number[]` navigation parameter.
- When `tagIds` is provided, the TransactionsScreen filters its transaction list to only include transactions that match any of the provided tag IDs (OR logic).
- When `tagIds` contains -1, includes untagged transactions (no tags).
- When `tagIds` is not provided or empty, all transactions for the category are shown (current behavior).
- The `tagIds` parameter is passed from HomeScreen when a tag filter is active.

### 8. Web localStorage support

- Add `webTransactionRepo.createWithTags()`, `updateWithTags()`, `getTagsByTransactionId()`, `getTagsByTransactionIds()`.
- Junction operations done in JS (read/write `@Finly/transaction_tags`).

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()`.
- **Configuration**: `useConfig().activeColors` for colors.
- **Text**: `useFontSize()` for scaling.
- **Tag selection UX**: same visual as current TagSection (chips, search, modal).
- **Tags are global**: not filtered by type. A tag can appear on both expense and income transactions.
- **Transaction row tags**: compact size (fs(11)), no icon, `surface` background, `textSecondary` color.

---

## Acceptance criteria

- [x] TagSection loads tags from the database instead of hardcoded values.
- [x] Creating a tag inline persists it to the database.
- [x] Selecting tags when adding a transaction saves them to the junction table.
- [x] When modifying a transaction, existing tags are pre-selected.
- [x] Saving a modified transaction replaces the old tag associations.
- [x] Duplicate tag names (case-insensitive) are rejected in the create modal.
- [x] Empty tag names are rejected.
- [x] Tag names are limited to 20 characters.
- [x] New tags created inline are auto-selected after creation.
- [x] At the 50-tag maximum, the "+ Add tag" chip is hidden in the transaction form (existing tags remain selectable).
- [x] After adding/modifying, `refreshTags()` is called.
- [x] Transaction rows show tag chips below the description.
- [x] Transactions with no tags show no tag chips.
- [x] Tags are loaded via batch query for all visible transactions.
- [x] TransactionsScreen accepts optional `tagIds` navigation parameter.
- [x] When `tagIds` is provided, transactions are filtered by those tags (OR logic).
- [x] When `tagIds` contains -1, untagged transactions are included.
- [x] Tags are displayed in both TransactionsScreen and AllTransactionsScreen.
- [x] TransactionDetailsScreen shows tags after Comment.
- [x] Tags on details load via `getTagsByTransactionId()`.
- [x] Transactions with no tags show a `—` placeholder on the details screen.
- [x] All texts change when switching language.
- [x] The screen respects the active theme and text size.
