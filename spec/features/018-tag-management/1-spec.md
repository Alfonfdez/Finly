# 018 — Tag management

- **Objective**
  Database schema for tags (many-to-many with transactions), repository CRUD, shared web persistence through sql.js/IndexedDB, and a Drawer-accessible screen to view, modify and delete tags. All texts multilingual (en/es/ca/gl/eu/fr/de/pt/it).

---

## Functional requirements

### 1. Database schema

- **`tags` table**: `id` (INTEGER PK AUTOINCREMENT), `user_id` (INTEGER NOT NULL → users.id), `name` (TEXT NOT NULL), `created_at` (TEXT DEFAULT datetime('now','localtime')).
- **`transaction_tags` junction table**: `transaction_id` (INTEGER NOT NULL → transactions.id), `tag_id` (INTEGER NOT NULL → tags.id), PRIMARY KEY (`transaction_id`, `tag_id`).
- Foreign keys with ON DELETE CASCADE: `transaction_id` → transactions.id, `tag_id` → tags.id.
- Indexes: `idx_tags_user ON tags(user_id)`, `idx_transaction_tags_tag ON transaction_tags(tag_id)`.
- Created by `001_initial` (schema version 1); no separate tags migration exists.

### 2. Tag repository (shared)

- `tagRepo.list(userId)`: returns all tags ordered by creation date (id).
- `tagRepo.create(data)`: inserts a tag (user_id, name). Returns the created tag.
- `tagRepo.update(id, data)`: updates name. Case-insensitive duplicate check excluding current id.
- `tagRepo.delete(id)`: deletes tag. Junction rows cascade via ON DELETE CASCADE.
- `tagRepo.deleteMany(ids)`: deletes several tags in one query; junction rows cascade via ON DELETE CASCADE.
- `tagRepo.existsByName(userId, name, excludeId?)`: case-insensitive duplicate check.
- `tagRepo.getByTransactionIds(transactionIds)`: returns `{ transaction_id, tag_id, name }[]` for a batch of transaction IDs.

### 3. Web persistence

- There is no separate web repository: `tagRepo` runs over the same SQLite schema through sql.js, persisted to IndexedDB.
- The engine writes the exported database bytes once per committed transaction, so tags and their junction rows survive reloads.
- Cascade on delete is handled by SQLite (`ON DELETE CASCADE`), identically on native and web.

### 4. Tags screen (Drawer)

- Accessed from "Tags" item in Drawer Navigator.
- Header with hamburger menu + "Tags" title (multilingual).
- Header search toggle (magnifying glass icon) that shows/hides a `SearchBar` below the header.
- Search placeholder "Search tags" (multilingual, new `tags_search` key); "x" button closes the search and restores the full list.
- Search filters the list client-side by characters contained in the tag name (case-insensitive).
- When a search returns no results, empty state with search icon + "No results found" (reuse `filter_no_results`).
- FlatList of all tags ordered by creation date (oldest first).
- Each row: tag name, a "Used in N transactions" line (`tags_used_in`) and a "Created <date>" line (`tags_created_on`), plus a chevron right.
- A sort strip (`SortToggle` in a `SortRow`) above the list sorts by **name**, **created** or **usage** (number of transactions using the tag); each field has a natural default direction (name ascending, created/usage descending) and tapping the active field flips it. The choice is **remembered** (`tagsSortBy` / `tagsSortDirection` in the `config` table) and restored on the next visit and after restarting the app.
- Pressing a tag navigates to `ModifyTag` screen.
- Floating "+" FAB centered at bottom that navigates to `CreateTag` screen.
- When the 100-tag maximum (`MAX_TAGS`) is reached, the "+" FAB is hidden and the message "Maximum of 100 tags reached" is shown centered in its place.
- A counter above the list shows how many tags exist out of the maximum, e.g. "12 of 100 tags" (`tags_counter`), hidden during selection mode.
- Empty state with `pricetag-outline` icon and "No tags" message.
- When there are no tags at all, the header Select button and search icon are hidden (nothing to select or search); they appear as soon as the first tag exists.

### 5. Create tag screen

- Header with back arrow + "Create tag" title (multilingual).
- `Name` section (multilingual `form_name`) with an `id-card-outline` icon and the `0/20` counter in the header's right slot, then the input with max 20 characters and placeholder "Tag name".
- Case-insensitive duplicate validation with 300ms debounce.
- Empty name error: "Enter a tag name".
- Duplicate error: "A tag with this name already exists".
- "Create" button: disabled if name is empty, too long, or duplicate. Calls `tagRepo.create()`, then `refreshTags()`, then navigates back.
- Maximum of 100 tags (`MAX_TAGS` in `src/constants/types.ts`). When 100 tags already exist, the "Create" button is disabled and the message "Maximum of 100 tags reached" is shown in red. Enforced at the UI layer only, no database constraint.

### 6. Modify/delete tag screen

- Header with back arrow + "Modify tag" title (multilingual).
- `Name` section (multilingual `form_name`) with an `id-card-outline` icon and the counter in the header's right slot, then the preloaded input with max 20 characters, same validation as create, and the same **empty** error (`create_tag_error_empty`): the bottom hint shows "Enter a tag name" (or the duplicate message) between Delete and Save, and the input reddens only once it has been changed or blurred.
- "Delete" button (generic `delete` label, like every form) with confirmation modal:
  - Title: `Delete 1 tag?` (`tags_bulk_delete_confirm_title(1)`, the same one-line title as the bulk flow), with a centered tag subject row below it showing the tag icon and name (`ModalEntitySubject`). The tag name never appears in the title.
  - Message: "Transactions with this tag will keep it. The tag link will be removed."
  - Cancel / Delete buttons.
  - On confirm: `tagRepo.delete(id)`, `refreshTags()`, navigate back.
- "Save" button: calls `tagRepo.update()`, `refreshTags()`, navigate back. It is enabled only when the name actually changed (compared by value with the preloaded tag), so an untouched editor keeps it disabled.

### 7. Multi-select bulk delete (Tags screen)

- The header shows a "Select" (`tags_select`) text button next to the search icon; pressing it toggles selection mode (label switches to "Done", `tags_select_done`).
- In selection mode each row shows a leading checkbox (`checkbox-outline` unchecked / `checkbox` checked in primary color); tapping a row toggles its selection instead of navigating.
- The header search and search filtering keep working during selection mode; selection applies to the filtered list. When a search change hides selected tags, those IDs are pruned from the selection, and bulk delete only ever deletes currently visible selected tags.
- In selection mode the "+" FAB (and the "Maximum of 100 tags reached" message) is replaced by a bottom action bar with "Cancel" and `Delete (N)` (`tags_bulk_delete(n)`), where N is the number of selected tags.
- The delete button is disabled while no tags are selected; "Cancel" exits selection mode and clears the selection.
- A **Select all** / **Deselect all** row sits above the list in selection mode (`select_all` / `deselect_all`, with the visible count `items_count`); tapping it selects every visible tag in one tap.
- Deleting opens a single `ConfirmationModal`: `Delete N tags?` (`tags_bulk_delete_confirm_title(n)`) with message "The selected tags will be deleted and their links to transactions will be removed. This cannot be undone." (`tags_bulk_delete_confirm_message`) and Cancel / Delete buttons.
- On confirm: `tagRepo.deleteMany(ids)` deletes all selected tags (junction rows cascade), selection and selection mode reset, and `refreshTags()` reloads the list.

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()`.
- **i18n**: new key `tags_search` (en/es/ca/gl/eu/fr/de/pt/it) for the search placeholder.
- **Configuration**: `useConfig().activeColors` for colors.
- **Text**: `useFontSize()` for scaling.
- **Navigation**: add `Tags`, `CreateTag`, `ModifyTag` to `RootStackParamList` and `HomeStack`. Connect "Tags" DrawerItem.
- **Persistence**: data from `tagRepo` over the shared SQLite engine (`expo-sqlite` native, sql.js + IndexedDB web).
- **Tags are global**: not tied to a specific type (expense/income). Same tag can be used on both.
- **Max name length**: 20 characters (same as tag input in AddTransaction).

---

## Acceptance criteria

- [x] The database has a `tags` table and a `transaction_tags` junction table after migration.
- [x] The Drawer shows "Tags" and pressing it navigates to the tags screen.
- [x] The header shows a hamburger menu button and "Tags" title in the active language.
- [x] All tags are displayed in a list ordered by creation date by default (oldest first, newest at the bottom).
- [x] Each tag row shows "Used in N transactions" and "Created <date>", and a sort strip sorts by name, created or usage (the choice is remembered across visits and restarts).
- [x] Pressing a tag navigates to "Modify tag" with the tag id.
- [x] The "+" FAB navigates to "Create tag".
- [x] At the 100-tag maximum, the "+" FAB is hidden and "Maximum of 100 tags reached" is shown in its place.
- [x] The screen shows a counter above the list with the current number of tags out of the maximum (e.g. "12 of 100 tags"), hidden during selection mode.
- [x] The header search button shows/hides a "Search tags" bar.
- [x] Typing filters the tag list by name (case-insensitive substring).
- [x] Closing the search restores the full list.
- [x] A search with no matches shows "No results found".
- [x] If there are no tags, an empty state is shown.
- [x] When there are no tags, the header Select and Search actions are hidden.
- [x] Creating a tag with a duplicate name (case-insensitive) shows an error.
- [x] Creating a tag with an empty name shows an error.
- [x] Creating a tag with more than 20 characters is prevented.
- [x] Creating a tag when the maximum of 100 tags has been reached is prevented (button disabled + "Maximum of 100 tags reached").
- [x] Modifying a tag name with a duplicate shows an error (excluding current).
- [x] Deleting a tag shows a "Delete 1 tag?" confirmation with the tag in a centered subject row.
- [x] After deleting, the tag is removed and junction rows are cascade-deleted.
- [x] "Select" in the header enters selection mode; rows show checkboxes and tapping toggles selection instead of navigating.
- [x] The action bar shows `Delete (N)` with the selected count; it is disabled when nothing is selected.
- [x] Bulk delete confirms once for the whole batch and removes all selected tags at once.
- [x] Search changes prune hidden selections; bulk delete only deletes currently visible selected tags.
- [x] A Select all / Deselect all row above the list selects every visible tag in one tap.
- [x] After create/modify/delete, `refreshTags()` is called and the list updates.
- [x] All texts change when switching language.
- [x] The screen respects the active theme and text size.
