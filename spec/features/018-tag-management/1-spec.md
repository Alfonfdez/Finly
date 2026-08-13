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
- `tagRepo.deleteMany(ids)`: deletes several tags in one query; junction rows cascade via ON DELETE CASCADE.
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
- Header search toggle (magnifying glass icon) that shows/hides a `SearchBar` below the header.
- Search placeholder "Search tags" (multilingual, new `tags_search` key); "x" button closes the search and restores the full list.
- Search filters the list client-side by characters contained in the tag name (case-insensitive).
- When a search returns no results, empty state with search icon + "No results found" (reuse `filter_no_results`).
- FlatList of all tags ordered by creation date.
- Each row: tag name + chevron right.
- Pressing a tag navigates to `ModifyTag` screen.
- Floating "+" FAB centered at bottom that navigates to `CreateTag` screen.
- When the 50-tag maximum (`MAX_TAGS`) is reached, the "+" FAB is hidden and the message "Maximum of 50 tags reached" is shown centered in its place.
- Empty state with `pricetag-outline` icon and "No tags" message.

### 5. Create tag screen

- Header with back arrow + "Create tag" title (multilingual).
- Name input with max 20 characters, counter (0/20), placeholder "Tag name".
- Case-insensitive duplicate validation with 300ms debounce.
- Empty name error: "Enter a tag name".
- Duplicate error: "A tag with this name already exists".
- "Create" button: disabled if name is empty, too long, or duplicate. Calls `tagRepo.create()`, then `refreshTags()`, then navigates back.
- Maximum of 50 tags (`MAX_TAGS` in `src/constants/types.ts`). When 50 tags already exist, the "Create" button is disabled and the message "Maximum of 50 tags reached" is shown in red. Enforced at the UI layer only, no database constraint.

### 6. Modify/delete tag screen

- Header with back arrow + "Modify tag" title (multilingual).
- Name input preloaded, max 20 characters, counter, same validation as create.
- "Delete" button with confirmation modal:
  - Title: `Delete tag "TagName"` (interpolated).
  - Message: "Transactions with this tag will keep it. The tag link will be removed."
  - Cancel / Delete buttons.
  - On confirm: `tagRepo.delete(id)`, `refreshTags()`, navigate back.
- "Save" button: calls `tagRepo.update()`, `refreshTags()`, navigate back.

### 7. Multi-select bulk delete (Tags screen)

- The header shows a "Select" (`tags_select`) text button next to the search icon; pressing it toggles selection mode (label switches to "Done", `tags_select_done`).
- In selection mode each row shows a leading checkbox (`checkbox-outline` unchecked / `checkbox` checked in primary color); tapping a row toggles its selection instead of navigating.
- The header search and search filtering keep working during selection mode; selection applies to the filtered list.
- In selection mode the "+" FAB (and the "Maximum of 50 tags reached" message) is replaced by a bottom action bar with "Cancel" and `Delete (N)` (`tags_bulk_delete(n)`), where N is the number of selected tags.
- The delete button is disabled while no tags are selected; "Cancel" exits selection mode and clears the selection.
- Deleting opens a single `ConfirmationModal`: `Delete N tags?` (`tags_bulk_delete_confirm_title(n)`) with message "The selected tags will be deleted and their links to transactions will be removed. This cannot be undone." (`tags_bulk_delete_confirm_message`) and Cancel / Delete buttons.
- On confirm: `tagRepo.deleteMany(ids)` deletes all selected tags (junction rows cascade), selection and selection mode reset, and `refreshTags()` reloads the list.

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()`.
- **i18n**: new key `tags_search` (en/es/ca) for the search placeholder.
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
- [ ] At the 50-tag maximum, the "+" FAB is hidden and "Maximum of 50 tags reached" is shown in its place.
- [x] The header search button shows/hides a "Search tags" bar.
- [x] Typing filters the tag list by name (case-insensitive substring).
- [x] Closing the search restores the full list.
- [x] A search with no matches shows "No results found".
- [ ] If there are no tags, an empty state is shown.
- [ ] Creating a tag with a duplicate name (case-insensitive) shows an error.
- [ ] Creating a tag with an empty name shows an error.
- [ ] Creating a tag with more than 20 characters is prevented.
- [ ] Creating a tag when the maximum of 50 tags has been reached is prevented (button disabled + "Maximum of 50 tags reached").
- [ ] Modifying a tag name with a duplicate shows an error (excluding current).
- [ ] Deleting a tag shows a confirmation modal with the tag name.
- [ ] After deleting, the tag is removed and junction rows are cascade-deleted.
- [x] "Select" in the header enters selection mode; rows show checkboxes and tapping toggles selection instead of navigating.
- [x] The action bar shows `Delete (N)` with the selected count; it is disabled when nothing is selected.
- [x] Bulk delete confirms once for the whole batch and removes all selected tags at once.
- [ ] After create/modify/delete, `refreshTags()` is called and the list updates.
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
