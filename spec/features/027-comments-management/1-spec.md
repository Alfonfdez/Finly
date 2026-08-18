# 027 — Comments management

- **Objective**
  Provide a dedicated comments manager: a Drawer "Comments" screen listing every distinct comment used across transactions (with usage counts), plus a modify screen to edit the comment in bulk across all transactions that use it, or delete it. Comments are normalized on save (trimmed), suggestions are ranked prefix-first, and the autocomplete only triggers from 2 characters on.

---

## Functional requirements

### 1. Comments screen

- New "Comments" Drawer item (icon `chatbubble-outline`, label `nav_comments`) placed after "Tags".
- `CommentsScreen` lists every distinct comment grouped by its trimmed value, sorted alphabetically (case-insensitive).
- Each row shows the comment and "Used in N transactions" (`comments_used_in(n)`).
- Tapping a row navigates to `ModifyComment` with `{ comment }`.
- Header has a search toggle button: opens a `SearchBar` that filters the list client-side (case-insensitive substring on the comment).
- Empty state: `comments_empty` ("No comments yet").
- When there are no comments, the header Select button and search icon are hidden; they appear as soon as a comment exists.
- The list reloads on focus via `useFocusEffect` → `transactionRepository.getDistinctComments()`.
- No FAB.

### 2. Modify comment screen

- `ModifyCommentScreen` receives `{ comment: string }` (already a trimmed, distinct value).
- Multiline input preloaded with the comment, `0/4096` counter (`MAX_COMMENT_LENGTH`), auto-focus.
- "Save" (`comments_save`) is disabled when the field is empty or unchanged.
- On save: `transactionRepository.updateComment(old, trimmed)` renames the comment on **all** matching transactions (matched by `TRIM(description)`), then `navigation.goBack()`.
- "Delete comment" (`comments_delete`) opens a confirmation modal: "Delete this comment?" + "This will remove the comment from N transactions. This cannot be undone." (`comments_delete_confirm_title`, `comments_delete_confirm_message(n)`).
- On confirm: `transactionRepository.deleteComment(comment)` sets `description = NULL` on all matching transactions, then `navigation.goBack()`.
- The usage count for the delete message comes from `transactionRepository.countByDescription(comment)` loaded on mount.
- Small hint at the bottom (`comments_merge_hint`): comments that differ only by case or extra spaces are merged into one.

### 3. Comment normalization and merge semantics

- On save from Add/Modify transaction (`TransactionForm`), the comment is trimmed: `description: comment.trim() || null`. Whitespace-only comments are stored as `NULL`.
- `getDistinctComments()` groups by `TRIM(description)`, so `"food"`, `"  food  "` and `"Food"` collapse into a single row; the shown value is the trimmed text.
- Because editing renames whole groups, updating `food` → `Food` merges the two groups into one (they become a single `Food` row with summed counts). This is intentional and covered by a contract test.
- `searchComments()` returns distinct trimmed suggestions, prefix matches ranked first, then remaining matches, both sorted case-insensitively, capped at `MAX_SUGGESTIONS` (5).

### 4. Autocomplete behavior

- `CommentInput` only triggers the debounced search when `comment.trim().length >= MIN_COMMENT_SUGGESTION_LENGTH` (2).
- Whitespace-only input never triggers a search.
- The search term is trimmed before querying.
- Debounce (`DEBOUNCE_MS = 300`) and `MAX_SUGGESTIONS` behavior are unchanged.

### 5. Multi-select bulk delete (Comments screen)

- The header shows a "Select" (`comments_select`) text button next to the search icon; pressing it toggles selection mode (label switches to "Done", `comments_select_done`).
- In selection mode each row shows a leading checkbox (`checkbox-outline` unchecked / `checkbox` checked in primary color); tapping a row toggles its selection instead of navigating.
- The header search and search filtering keep working during selection mode; selection applies to the filtered list.
- A bottom action bar with "Cancel" and `Delete (N)` (`comments_bulk_delete(n)`) appears; the delete button is disabled while no comments are selected.
- Deleting opens a single `ConfirmationModal`: `Delete N comments?` (`comments_bulk_delete_confirm_title(n)`) with message "The selected comments will be removed from their transactions. This cannot be undone." (`comments_bulk_delete_confirm_message`) and Cancel / Delete buttons.
- On confirm: `transactionRepository.deleteComments(values)` sets `description = NULL` on every matching transaction, the selection and selection mode reset, and the list reloads via `getDistinctComments()`.

---

## Non-functional requirements

- **Multilingual**: all new texts go through `t()` (en/es/ca).
- **Reuse**: `SearchBar`, `EmptyState`, `LabeledTextField`, `PrimaryButton`, `DeleteButton`, `FormError`, `ConfirmationModal`, `SelectionActionBar`, `useFocusEffect`.
- **No schema/migration changes**: comments live in the existing `transactions.description` column.
- **Theme/text size**: all screens/components use `useConfig().activeColors` and `useFontSize()`.
- **Tests**: new Phase B contract tests for the four repo methods + merge regression; new component test for `CommentInput` min-length and suggestion flow.

---

## Acceptance criteria

- [x] "Comments" appears in the Drawer between "Tags" and the separator, with a chat bubble icon.
- [x] The Comments screen lists every distinct comment with its "Used in N transactions" count, sorted alphabetically.
- [x] Whitespace/case variants of the same comment collapse into one row with a summed count.
- [x] The search toggle filters the list client-side; empty state shows when there are no comments.
- [x] A counter above the list shows the number of visible comments (e.g., "2 comments"); it updates when a search filters the list.
- [x] When there are no comments, the header Select and Search actions are hidden.
- [x] Tapping a comment opens the modify screen with the comment preloaded and the counter showing `N/4096`.
- [x] Save is disabled when the comment is empty or unchanged.
- [x] Saving renames the comment on all transactions that use it and returns to the list (counts updated).
- [x] Editing a comment to another existing case-variant merges them into a single row with the summed count.
- [x] Deleting shows the confirmation with the exact usage count; confirming removes the comment from those transactions.
- [x] "Select" in the header enters selection mode; rows show checkboxes and tapping toggles selection instead of navigating.
- [x] The action bar shows `Delete (N)` with the selected count; it is disabled when nothing is selected.
- [x] Bulk delete confirms once for the whole batch and removes all selected comments from their transactions.
- [x] In Add/Modify transaction, saving a comment trims it; whitespace-only comments are saved as none.
- [x] Autocomplete suggestions appear only from 2 trimmed characters, prefix matches first.
- [x] All texts are multilingual and respect theme + text size.
