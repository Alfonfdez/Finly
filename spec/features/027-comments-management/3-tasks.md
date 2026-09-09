# Tasks — 027 Comments management
Execution order. Mark each task as completed.

---

### Phase 1 — Database

[x] T1 — `transactionRepo.ts`: add `getDistinctComments()` (GROUP BY `TRIM(description)`, count, NOCASE order), `updateComment(old, new)` (bulk UPDATE matching `TRIM(description)`, returns changed rows), `deleteComment(comment)` (sets `description = NULL`, returns changed rows), `countByDescription(comment)`. Export `CommentUsage` type.

[x] T2 — Rework `searchComments()`: `SELECT DISTINCT TRIM(description)`, filter non-empty, prefix-first ranking (`CASE WHEN ... LIKE ? COLLATE NOCASE THEN 0 ELSE 1 END`), `description COLLATE NOCASE`, `LIMIT MAX_SUGGESTIONS`; trim the term and return early on empty.

---

### Phase 2 — UI

[x] T3 — `TransactionForm.tsx`: save `description: comment.trim() || null` (Add + Modify).

[x] T4 — `constants/types.ts`: add `MIN_COMMENT_SUGGESTION_LENGTH = 2`. `CommentInput.tsx`: trigger the debounced search only when `comment.trim().length >= MIN_COMMENT_SUGGESTION_LENGTH`; search with the trimmed term.

[x] T5 — New `CommentsScreen.tsx`: distinct comments list with usage counts, header search toggle (`SearchBar` client-side filter), `EmptyState`, reload on focus.

[x] T6 — New `ModifyCommentScreen.tsx`: route param `{ comment }`, preloaded multiline input with counter, Save disabled when empty/unchanged, Delete via `ConfirmationModal` with usage count, merge hint.

[x] T7 — `AppNavigator.tsx`: register `Comments` and `ModifyComment` in `HomeStack`; Drawer item after Tags (`nav_comments`, `chatbubble-outline`); extend `DrawerItemDef`.

[x] T8 — i18n keys in `en.ts`, `es.ts`, `ca.ts`: `nav_comments`, `comments_empty`, `comments_search_placeholder`, `comments_used_in`, `comments_modify_title`, `comments_save`, `comments_delete`, `comments_delete_confirm_title`, `comments_delete_confirm_message`, `comments_delete_confirm_delete`, `comments_delete_confirm_cancel`, `comments_error_empty`, `comments_merge_hint`.

---

### Phase 3 — Tests

[x] T9 — Contract suite: `searchComments` trim/dedupe, `getDistinctComments` grouping + counts, `countByDescription`, `updateComment` rename + changed count, merge regression (case-variant update → one row with summed count), `deleteComment` count + nulled rows. Extend `ContractTransactionRepo`.

[x] T10 — New `CommentInput.test.tsx`: no search below min length, whitespace ignored, search at min length, trimmed term, suggestions after debounce, selection fills + clears, counter + a11y label.

[x] T11 — Specs: `spec/features/027-comments-management/` (1-spec, 2-plan, 3-tasks) + `spec/constitution/3-roadmap.md` entry + `docs/changelog.md`.

---

### Verification

[ ] T12 — Run `npm run test:all` (typecheck + lint + tests). Then `npx expo start --web` and verify at 375px:
  - Drawer shows "Comments" between Tags and the separator; opens the Comments screen.
  - Adding transactions with comments "coffee" and "  coffee  " collapses them into one row "Used in 2 transactions".
  - Editing "coffee" to "cafe" renames it everywhere; the list updates on return.
  - Editing "food" to "Food" (another existing comment) merges them into one row with summed count.
  - Deleting a comment confirms with the exact count and removes it from those transactions.
  - Autocomplete in Add transaction only suggests from 2 characters, prefix matches first.
  - Saving a comment trims it; a whitespace-only comment is stored as none.
