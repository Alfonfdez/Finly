# Implementation plan — 018 Tag management

## Architecture

### New files

- **`database/migrations/004_tags.ts`**: Creates `tags` and `transaction_tags` tables, indexes, foreign keys.
- **`database/types.ts`**: Add `Tag` and `TransactionTag` interfaces.
- **`database/repositories/tagRepo.ts`**: CRUD for tags (native SQLite).
- **`database/webStorage.ts`**: Add `webTagRepo` with localStorage CRUD.
- **`database/index.ts`**: Export `tagRepository` with platform switching.
- **`screens/TagsScreen.tsx`**: Main screen with list of tags + FAB.
- **`screens/CreateTagScreen.tsx`**: Create tag form.
- **`screens/ModifyTagScreen.tsx`**: Modify/delete tag form.

### Modified files

- **`database/database.ts`**: Import + call `migrate004`. Set `DATABASE_VERSION = 4`.
- **`database/types.ts`**: Add `Tag` and `TransactionTag` interfaces.
- **`constants/types.ts`**: Add `Tags`, `CreateTag`, `ModifyTag` to `RootStackParamList` and screen props.
- **`navigation/AppNavigator.tsx`**: Register 3 new screens in HomeStack. Connect "Tags" DrawerItem.
- **`context/AppContext.tsx`**: Add `tags: Tag[]`, `refreshTags()`, load tags on init.
- **`i18n/en.ts, es.ts, ca.ts`**: Add tag management keys.

### Navigation flow

```
Drawer → "Tags" → TagsScreen
  ├── press "+" (FAB) → CreateTagScreen
  └── press tag → ModifyTagScreen { tagId }
```

### Data types

```typescript
interface Tag {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
}

interface TransactionTag {
  transaction_id: number;
  tag_id: number;
}
```

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `nav_tags` | Tags | Etiquetas | Etiquetes |
| `tags_empty` | No tags | No hay etiquetes | No hi ha etiquetes |
| `create_tag_title` | Create tag | Crear etiqueta | Crear etiqueta |
| `create_tag_name_placeholder` | Tag name | Nombre de etiqueta | Nom d'etiqueta |
| `create_tag_button` | Create | Crear | Crear |
| `create_tag_error_empty` | Enter a tag name | Introduce un nombre de etiqueta | Introdueix un nom d'etiqueta |
| `create_tag_error_duplicate` | A tag with this name already exists | Ya existe una etiqueta con este nombre | Ja existeix una etiqueta amb aquest nom |
| `modify_tag_title` | Modify tag | Modificar etiqueta | Modificar etiqueta |
| `modify_tag_save` | Save | Guardar | Guardar |
| `modify_tag_delete` | Delete | Eliminar | Eliminar |
| `modify_tag_delete_confirm_title` | Delete tag "TagName" | Eliminar etiqueta "TagName" | Eliminar etiqueta "TagName" |
| `modify_tag_delete_confirm_message` | Transactions with this tag will keep it. The tag link will be removed. | Las transacciones con esta etiqueta la mantendrán. El enlace se eliminarà. | Les transaccions amb aquesta etiqueta la mantindran. L'enllaç s'eliminarà. |
| `modify_tag_delete_confirm_cancel` | Cancel | Cancelar | Cancel·lar |
| `modify_tag_delete_confirm_delete` | Delete | Eliminar | Eliminar |

---

## UI states

### Tags screen (list)

```
┌─────────────────────────────────┐
│ ☰  Tags                         │  ← Header with hamburger menu
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Urgent                 >    │ │  ← Tag row
│ ├─────────────────────────────┤ │
│ │ Recurring              >    │ │
│ ├─────────────────────────────┤ │
│ │ Personal               >    │ │
│ └─────────────────────────────┘ │
│                                 │
│              [ + ]              │  ← FAB
└─────────────────────────────────┘
```

### Create tag screen

```
┌─────────────────────────────────┐
│ ←  Create tag                   │  ← Header with back button
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tag name                    │ │  ← Name input
│ └─────────────────────────────┘ │
│                       0/20      │  ← Counter
│                                 │
│ ┌─────────────────────────────┐ │
│ │         Create              │ │  ← Button (disabled if invalid)
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Modify tag screen

```
┌─────────────────────────────────┐
│ ←  Modify tag                   │  ← Header with back button
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tag name                    │ │  ← Name input (preloaded)
│ └─────────────────────────────┘ │
│                       7/20      │  ← Counter
│                                 │
│ ┌─────────────────────────────┐ │
│ │      🗑 Delete              │ │  ← Red delete button
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │          Save               │ │  ← Button (disabled if invalid)
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## Dependencies

- Existing `categoryRepo` pattern (CRUD + existsByName).
- Existing `AppContext` for state management.
- Existing `useConfig()`, `useFontSize()`, i18n.

## Estimate

- **Tasks**: 12 tasks in 4 phases
- **Estimated time**: 3-4 hours
