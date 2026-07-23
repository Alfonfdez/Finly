# Implementation Plan — 023 Photo Attachment

## Architecture

### Libraries

- **expo-image-picker**: camera capture and gallery selection (handles both on all platforms).
- **expo-file-system**: copy files from cache to `documentDirectory` for persistence (bundled with Expo SDK 54, no install needed).

### Modified Files

- **database/migrations/001_initial.ts**: Add `photo TEXT` column to `transactions` CREATE TABLE (after `updated_at`, before `created_at`).
- **database/types.ts**: Add `photo: string | null` to `Transaction` interface.
- **database/repositories/transactionRepo.ts**:
  - `create()`: add `photo` to INSERT columns and params.
  - `update()`: add `photo` field handling in dynamic fields.
- **database/webStorage.ts**: No changes needed — `create`/`update` use spread (`{ ...items[idx], ...data }`), so `photo` is handled automatically.
- **components/PhotoSection.tsx**:
  - Add `onRemovePhoto` prop to interface.
  - Replace "Selected photo" text with `<Image source={{ uri: photoUri }}>` thumbnail.
  - Add "×" remove button overlay (top-right corner) when photoUri is set.
  - Add `photoThumbnail` and `removeButton` styles.
- **screens/AddTransactionScreen.tsx**:
  - Import `expo-image-picker` and `expo-file-system`.
  - Add `Platform` to react-native imports.
  - Change `const [fotoUri]` → `const [fotoUri, setFotoUri]` (add setter).
  - Implement `handleTakePhoto`: request camera permission → launch camera → copy to documentDirectory → set state.
  - Implement `handlePickFromGallery`: launch image library → copy to documentDirectory → set state.
  - Add `Platform.OS !== 'web'` guard around `PhotoSection` render.
  - Pass `photo: fotoUri` to `createWithTags()`.
- **screens/ModifyTransactionScreen.tsx**:
  - Same imports as AddTransactionScreen.
  - Change `const [fotoUri]` → `const [fotoUri, setFotoUri]` initialized from `transaction?.photo ?? null`.
  - Same handler implementations as AddTransactionScreen.
  - Same web guard around `PhotoSection`.
  - Pass `photo: fotoUri` to `updateWithTags()`.
  - Add `deletePhoto()` helper for cleanup on replace/remove.
- **screens/TransactionDetailsScreen.tsx**:
  - Import `Image` and `Platform` from react-native.
  - Add Photo `DataRow` after Tags row (when `transaction.photo` exists and `Platform.OS !== 'web'`).
  - Add `photoViewerVisible` state and full-screen `<Modal>` with `<Image>` + close button.
  - Add `deletePhoto()` in `handleDelete` before deleting the transaction.
  - Add `photoThumbnail` and viewer styles.
- **screens/settings/PersonalizationScreen.tsx**:
  - Import `Platform` from react-native.
  - Wrap "Show photo" `Checkbox` with `Platform.OS !== 'web'` guard.
- **i18n/en.ts**: Add `details_photo: 'Photo'`, `photo_viewer_close: 'Close'`.
- **i18n/es.ts**: Add `details_photo: 'Foto'`, `photo_viewer_close: 'Cerrar'`.
- **i18n/ca.ts**: Add `details_photo: 'Foto'`, `photo_viewer_close: 'Tancar'`.

### Reused Components

- `PhotoSection` — modified to show thumbnail and remove button.
- `DataRow` (inline in TransactionDetailsScreen) — reused for photo row.

### Navigation Flow

```
AddTransactionScreen / ModifyTransactionScreen
        │
        ▼
   PhotoSection  ←── Platform.OS check (hidden on web)
        │
        ▼
   expo-image-picker  ←── launchCameraAsync / launchImageLibraryAsync
        │
        ▼
   expo-file-system   ←── copyAsync (cache → documentDirectory)
        │
        ▼
   transactionRepo.create/update  ←── photo URI stored in DB
        │
        ▼
   TransactionDetailsScreen  ←── reads photo URI, displays thumbnail
```

### Data flow — AddTransactionScreen

```
1. User taps PhotoSection → modal opens
2. User selects "Take photo" or "Add from gallery"
3. expo-image-picker returns URI (cache directory)
4. expo-file-system copies file to documentDirectory
5. Permanent URI stored in fotoUri state
6. PhotoSection displays thumbnail
7. On submit: photo URI passed to createWithTags() → stored in DB
```

### Data flow — ModifyTransactionScreen

```
1. Screen loads → fotoUri initialized from transaction.photo
2. PhotoSection displays existing thumbnail
3. User can replace (repeat steps 2-4 above, delete old file)
4. User can remove (fotoUri = null, delete old file)
5. On submit: photo URI (or null) passed to updateWithTags() → DB updated
```

### Data flow — TransactionDetailsScreen

```
1. Screen loads → reads transaction.photo
2. If photo exists → renders Photo DataRow with thumbnail
3. Tapping thumbnail → opens full-screen modal with Image
4. Close button → dismisses modal
```

### i18n

| Key | EN | ES | CA |
|-----|----|----|----|
| `details_photo` | Photo | Foto | Foto |
| `photo_viewer_close` | Close | Cerrar | Tancar |

### Platform guards

```typescript
// AddTransactionScreen and ModifyTransactionScreen
{config.addShowPhoto && Platform.OS !== 'web' && (
  <PhotoSection
    photoUri={fotoUri}
    onTakePhoto={handleTakePhoto}
    onPickFromGallery={handlePickFromGallery}
    onRemovePhoto={() => { deletePhoto(fotoUri); setFotoUri(null); }}
  />
)}

// PersonalizationScreen
{Platform.OS !== 'web' && (
  <Checkbox ... label={labels.settings_photo} />
)}
```

### File cleanup utility

```typescript
const deletePhoto = async (uri: string | null) => {
  if (!uri) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch {}
};
```

Called in:
- `TransactionDetailsScreen.handleDelete` — delete photo file before deleting the transaction.
- `ModifyTransactionScreen` — when user replaces or removes photo, delete old file.

---

## Dependencies

- `expo-image-picker` (new install via `npx expo install expo-image-picker`).
- `expo-file-system` (bundled with Expo SDK 54, no install needed).
- Existing `transactionRepository`, `PhotoSection`, `DataRow` (inline).
- `useConfig()`, `useFontSize()`, i18n.

---

## Estimate

- **Tasks**: 11 tasks in 5 phases
- **Estimated time**: 2-3 hours
