# Tasks — 018 Tag management
Execution order. Check off each task as you complete it.

---

### Phase 1 — Database schema and repositories

[ ] T1 — Create `src/database/migrations/004_tags.ts`: CREATE TABLE tags (id, user_id, name, created_at), CREATE TABLE transaction_tags (transaction_id, tag_id), foreign keys with ON DELETE CASCADE, indexes idx_tags_user and idx_transaction_tags_tag.

[ ] T2 — Update `src/database/database.ts`: import + call `migrate004`, set `DATABASE_VERSION = 4`.

[ ] T3 — Add `Tag` and `TransactionTag` interfaces to `src/database/types.ts`.

[ ] T4 — Create `src/database/repositories/tagRepo.ts` with: list(userId), create(data), update(id, data), delete(id), existsByName(userId, name, excludeId?), getByTransactionIds(transactionIds[]).

[ ] T5 — Add `webTagRepo` and `webTransactionTagRepo` to `src/database/webStorage.ts`: localStorage CRUD for tags and junction table, cascade delete in JS, seed empty arrays in `initWebStorage`.

[ ] T6 — Update `src/database/index.ts`: export `tagRepository` with platform switching.

---

### Phase 2 — Context and navigation

[ ] T7 — Update `src/context/AppContext.tsx`: add `tags: Tag[]` to state, `refreshTags()` callback, load tags on init alongside accounts and categories. Expose in `AppContextType`.

[ ] T8 — Update `src/constants/types.ts`: add `Tags`, `CreateTag`, `ModifyTag` (with `{ tagId: number }`) to `RootStackParamList`. Add screen props types.

[ ] T9 — Update `src/navigation/AppNavigator.tsx`: import + register TagsScreen, CreateTagScreen, ModifyTagScreen in HomeStack. Connect "Tags" DrawerItem (add label `nav_tags`, icon `pricetag-outline`) to navigate to TagsScreen.

---

### Phase 3 — Screens

[ ] T10 — Create `src/screens/TagsScreen.tsx`: header (hamburger + title), FlatList of tags from AppContext, each row with name + chevron, empty state, "+" FAB navigating to CreateTag. Match CategoriesScreen layout pattern.

[ ] T11 — Create `src/screens/CreateTagScreen.tsx`: name input (max 20 chars, counter, placeholder), case-insensitive duplicate validation with 300ms debounce, "Create" button (disabled if invalid), on submit: tagRepo.create() + refreshTags() + goBack().

[ ] T12 — Create `src/screens/ModifyTagScreen.tsx`: name input preloaded, same validation as create, "Delete" button with confirmation modal (interpolated name, message, Cancel/Delete), on delete: tagRepo.delete() + refreshTags() + goBack(). "Save" button: tagRepo.update() + refreshTags() + goBack().

---

### Phase 4 — i18n and styling

[ ] T13 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts`, `src/i18n/ca.ts`: nav_tags, tags_empty, create_tag_title, create_tag_name_placeholder, create_tag_button, create_tag_error_empty, create_tag_error_duplicate, modify_tag_title, modify_tag_save, modify_tag_delete, modify_tag_delete_confirm_title, modify_tag_delete_confirm_message, modify_tag_delete_confirm_cancel, modify_tag_delete_confirm_delete.

---

### Verification

[ ] T14 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test Drawer navigation to Tags screen, create tag, modify tag name, delete tag with confirmation, verify empty state, verify duplicate validation, verify all 3 languages.
