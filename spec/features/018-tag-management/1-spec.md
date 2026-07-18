# 018 — Tag management

- **Objective**
  Database schema for tags (many-to-many with transactions), repository CRUD, web localStorage support, and a Drawer-accessible screen to view, modify and delete tags. All texts multilingual (en/es/ca).

---

## Functional requirements

### 1. Database schema

- **`tags` table**: `id` (INTEGER PK AUTOINCREMENT), `user_id` (INTEGER NOT NULL → users.id), `name` (TEXT NOT NULL), `created_at` (TEXT DEFAULT datetime('now','localtime')).
- **`transaction_tags` junction table**: `transaction_id` (INTEGER NOT NULL → transactions.id), `tag_id` (INTEGER NOT NULL → tags.id), PRIMARY KEY (`transaction_id`, `tag_id`).
- Foreign keys with ON DELETE CASCADE: `transaction_id` → transactions.id, `tag_id` → tags.id.
- Indexes: `idx_tags_user ON tags(user_id)`, `idx_transaction_tags_tag ON transaction_tags(tag_id)`.
- Migration: `004_tags.ts`, DATABASE_VERSION = 4.

### 2. Tag repository (native SQLite)

- `tagRepo.list(userId)`: returns all tags ordered by creation date (id).
- `tagRepo.create(data)`: inserts a tag (user_id, name). Returns the created tag.
- `tagRepo.update(id, data)`: updates name. Case-insensitive duplicate check excluding current id.
- `tagRepo.delete(id)`: deletes tag. Junction rows cascade via ON DELETE CASCADE.
- `tagRepo.existsByName(userId, name, excludeId?)`: case-insensitive duplicate check.
- `tagRepo.getByTransactionIds(transactionIds)`: returns `{ transaction_id, tag_id, name }[]` for a batch of transaction IDs.

### 3. Web localStorage support

- `webTagRepo`: same interface as tagRepo using localStorage key `@Finly/tags`.
- `webTransactionTagRepo`: junction table stored as `@Finly/transaction_tags`.
- `initWebStorage`: seed empty arrays for tags and transaction_tags.
- Cascade on delete handled in JS (filter out junction rows).

### 4. Tags screen (Drawer)

- Accessed from "Tags" item in Drawer Navigator.
- Header with hamburger menu + "Tags" title (multilingual).
- FlatList of all tags ordered by creation date.
- Each row: tag name + chevron right.
- Pressing a tag navigates to `ModifyTag` screen.
- Floating "+" FAB centered at bottom that navigates to `CreateTag` screen.
- Empty state with `pricetag-outline` icon and "No tags" message.

### 5. Create tag screen

- Header with back arrow + "Create tag" title (multilingual).
- Name input with max 20 characters, counter (0/20), placeholder "Tag name".
- Case-insensitive duplicate validation with 300ms debounce.
- Empty name error: "Enter a tag name".
- Duplicate error: "A tag with this name already exists".
- "Create" button: disabled if name is empty, too long, or duplicate. Calls `tagRepo.create()`, then `refreshTags()`, then navigates back.

### 6. Modify/delete tag screen

- Header with back arrow + "Modify tag" title (multilingual).
- Name input preloaded, max 20 characters, counter, same validation as create.
- "Delete" button with confirmation modal:
  - Title: `Delete tag "TagName"` (interpolated).
  - Message: "Transactions with this tag will keep it. The tag link will be removed."
  - Cancel / Delete buttons.
  - On confirm: `tagRepo.delete(id)`, `refreshTags()`, navigate back.
- "Save" button: calls `tagRepo.update()`, `refreshTags()`, navigate back.

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()`.
- **Configuration**: `useConfig().activeColors` for colors.
- **Text**: `useFontSize()` for scaling.
- **Navigation**: add `Tags`, `CreateTag`, `ModifyTag` to `RootStackParamList` and `HomeStack`. Connect "Tags" DrawerItem.
- **Persistence**: data from `tagRepo` (native) / `webTagRepo` (web).
- **Tags are global**: not tied to a specific type (expense/income). Same tag can be used on both.
- **Max name length**: 20 characters (same as tag input in AddTransaction).

---

## Acceptance criteria

- [ ] The database has a `tags` table and a `transaction_tags` junction table after migration.
- [ ] The Drawer shows "Tags" and pressing it navigates to the tags screen.
- [ ] The header shows a hamburger menu button and "Tags" title in the active language.
- [ ] All tags are displayed in a list ordered by creation date (newest at the bottom).
- [ ] Pressing a tag navigates to "Modify tag" with the tag id.
- [ ] The "+" FAB navigates to "Create tag".
- [ ] If there are no tags, an empty state is shown.
- [ ] Creating a tag with a duplicate name (case-insensitive) shows an error.
- [ ] Creating a tag with an empty name shows an error.
- [ ] Creating a tag with more than 20 characters is prevented.
- [ ] Modifying a tag name with a duplicate shows an error (excluding current).
- [ ] Deleting a tag shows a confirmation modal with the tag name.
- [ ] After deleting, the tag is removed and junction rows are cascade-deleted.
- [ ] After create/modify/delete, `refreshTags()` is called and the list updates.
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
