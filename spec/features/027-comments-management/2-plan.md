# Implementation plan — 027 Comments management

## Architecture

### New components

None. The feature reuses existing screens and components.

### New screens

- **src/screens/CommentsScreen.tsx**: drawer screen listing distinct comments with usage counts; header search toggle; reloads on focus.
- **src/screens/ModifyCommentScreen.tsx**: route param `{ comment: string }`; multiline preloaded input with counter; Save / Delete flow.

### Modified files

- **src/database/repositories/transactionRepo.ts**: add `getDistinctComments()`, `updateComment(old, new)`, `deleteComment(comment)`, `countByDescription(comment)`; rework `searchComments()` to prefix-first ranking + distinct trimmed values.
- **src/constants/types.ts**: add `MIN_COMMENT_SUGGESTION_LENGTH = 2`; add `Comments: undefined` and `ModifyComment: { comment: string }` to `RootStackParamList`.
- **src/components/TransactionForm.tsx**: save `description: comment.trim() || null` (Add and Modify share this form).
- **src/components/CommentInput.tsx**: trigger the debounced search only when `comment.trim().length >= MIN_COMMENT_SUGGESTION_LENGTH`; query with the trimmed term.
- **src/navigation/AppNavigator.tsx**: register both screens in `HomeStack`; add Drawer item after Tags (`nav_comments`, `chatbubble-outline`).
- **src/i18n/en.ts, es.ts, ca.ts**: new keys.

### Reused components / utils

- `SearchBar`, `EmptyState`, `ConfirmationModal`, `LabeledTextField`, `PrimaryButton`, `DeleteButton`, `FormError`.
- `useFocusEffect`, `useConfig`, `useFontSize`, `t()`.

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `nav_comments` | Comments | Comentarios | Comentaris |
| `comments_empty` | No comments yet | No hay comentarios | No hi ha comentaris |
| `comments_search_placeholder` | Search comments | Buscar comentarios | Cercar comentaris |
| `comments_used_in(n)` | Used in N transaction(s) | Usado en N transacción(es) | Usat en N transacció(ns) |
| `comments_modify_title` | Edit comment | Editar comentario | Editar comentari |
| `comments_save` | Save | Guardar | Desa |
| `comments_delete` | Delete comment | Eliminar comentario | Elimina comentari |
| `comments_delete_confirm_title` | Delete this comment? | ¿Eliminar este comentario? | Vols eliminar aquest comentari? |
| `comments_delete_confirm_message(n)` | This will remove the comment from N transaction(s). This cannot be undone. | Se eliminará de N transacción(es). Esta acción no se puede deshacer. | S'eliminarà de N transacció(ns). Aquesta acció no es pot desfer. |
| `comments_delete_confirm_delete` | Delete | Eliminar | Elimina |
| `comments_delete_confirm_cancel` | Cancel | Cancelar | Cancel·la |
| `comments_error_empty` | Comment cannot be empty | El comentario no puede estar vacío | El comentari no pot estar buit |
| `comments_merge_hint` | Comments that differ only by capital letters or extra spaces are merged into one. | Los comentarios que solo se diferencian en mayúsculas o espacios se fusionan en uno. | Els comentaris que només es diferencien en majúscules o espais es fusionen en un. |

### Navigation flow

```
Drawer: ... Tags | Comments | ---- | Settings
Stack: Home ... Tags → Comments → ModifyComment { comment: string }
```

---

## UI states

### CommentsScreen

```
┌──────────────────────────────────────┐
│ [≡]  Comments                [🔍]    │
├──────────────────────────────────────┤
│ Coffee                              ›│
│ Used in 2 transactions               │
│──────────────────────────────────────│
│ Lunch                               ›│
│ Used in 1 transaction                │
│──────────────────────────────────────│
│ [Search comments...]          [x]    │  ← when search active
│──────────────────────────────────────│
│              🗨 No comments yet       │  ← empty state
└──────────────────────────────────────┘
```

### ModifyCommentScreen

```
┌──────────────────────────────────────┐
│ [←]  Edit comment                    │
├──────────────────────────────────────┤
│ Comment                              │
│ ┌──────────────────────────────────┐ │
│ │  Coffee                          │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│ 0/4096                               │
│ [🗑 Delete comment]                  │
│ [            Save            ]      │
│ Comments that differ only by capital │
│ letters or extra spaces are merged… │
└──────────────────────────────────────┘
```

## Dependencies

- Existing `transactionRepository` (extended).
- Existing form primitives + `ConfirmationModal` (destructive default).
- `useConfig()`, `useFontSize()`, i18n.

## Tests

- **Phase B contract suite** (`contractSuite.ts`): `searchComments` trim/dedupe, `getDistinctComments` grouping + counts, `countByDescription`, `updateComment` rename + changed count, **merge regression** (case-variant update → one row, summed count), `deleteComment` count + nulled rows.
- **Component test** (`CommentInput.test.tsx`): no search below 2 chars, whitespace-only ignored, search at min length, trimmed term, suggestions shown after debounce, selection fills + clears, counter + a11y label.
- `npm run test:all` must stay green.

## Estimate

- **Tasks**: 12 tasks in 3 phases
- **Estimated time**: 2-2.5 hours
