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
  - Accept `photos: string[]` instead of single `photoUri`.
  - Display horizontal row of up to 3 thumbnails (80×80 each, `borderRadius: 12`).
  - Add "+" button when fewer than 3 photos exist.
  - Each photo has "×" button with delete confirmation modal.
  - Add `photoGrid`, `removeButton`, `addButton` styles.
- **screens/AddTransactionScreen.tsx**:
  - Import `expo-image-picker` and `expo-file-system`.
  - Add `Platform` to react-native imports.
  - Change `const [fotoUri]` → `const [photos, setPhotos] = useState<string[]>([])`.
  - Implement `handleTakePhoto`: request camera permission → launch camera → copy to documentDirectory → append to photos array.
  - Implement `handlePickFromGallery`: launch image library → copy to documentDirectory → append to photos array.
  - Implement `handleRemovePhoto(index)`: remove from array and delete file.
  - Add `Platform.OS !== 'web'` guard around `PhotoSection` render.
  - Pass `photos={photos}` to `PhotoSection`.
  - Store `JSON.stringify(photos)` in `createWithTags()`.
- **screens/ModifyTransactionScreen.tsx**:
  - Same imports as AddTransactionScreen.
  - Change `const [fotoUri]` → `const [photos, setPhotos] = useState<string[]>([])` initialized from `transaction?.photo ? JSON.parse(transaction.photo) : []`.
  - Same handler implementations as AddTransactionScreen.
  - Same web guard around `PhotoSection`.
  - Pass `photos={photos}` to `PhotoSection`.
  - Store `JSON.stringify(photos)` in `updateWithTags()`.
- **screens/TransactionDetailsScreen.tsx**:
  - Import `Image` and `Platform` from react-native.
  - Add `parsedPhotos` useMemo to parse `transaction.photo` (handle old single URI and new JSON array).
  - Add Photo `DataRow` after Tags row (when `parsedPhotos.length > 0` and `Platform.OS !== 'web'`).
  - Display horizontal row of tappable thumbnails (48×48 each, `borderRadius: 8`).
  - Add `photoViewerVisible` state and full-screen `<Modal>` with `<Image>` + close button.
  - Add `deleteAllPhotos()` in `handleDelete` before deleting the transaction.
  - Add `photoGrid`, `photoThumbnail`, viewer styles.
- **screens/settings/PersonalizationScreen.tsx**:
  - Import `Platform` from react-native.
  - Wrap "Show photo" `Checkbox` with `Platform.OS !== 'web'` guard.
- **i18n/en.ts**: Add `details_photo: 'Photo'`, `photo_viewer_close: 'Close'`, `photo_delete_title: 'Delete photo'`, `photo_delete_message: 'Are you sure you want to delete this photo?'`.
- **i18n/es.ts**: Add `details_photo: 'Foto'`, `photo_viewer_close: 'Cerrar'`, `photo_delete_title: 'Eliminar foto'`, `photo_delete_message: '¿Estás seguro de que quieres eliminar esta foto?'`.
- **i18n/ca.ts**: Add `details_photo: 'Foto'`, `photo_viewer_close: 'Tancar'`, `photo_delete_title: 'Eliminar foto'`, `photo_delete_message: 'Estàs segur que vols eliminar aquesta foto?'`.

### Reused Components

- `PhotoSection` — modified to show multiple thumbnails, add button, and remove with confirmation.
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
   transactionRepo.create/update  ←── photos array stored as JSON string in DB
        │
        ▼
   TransactionDetailsScreen  ←── reads photos array, displays thumbnails
```

### Data flow — AddTransactionScreen

```
1. User taps PhotoSection "+" button → modal opens
2. User selects "Take photo" or "Add from gallery"
3. expo-image-picker returns URI (cache directory)
4. expo-file-system copies file to documentDirectory
5. Permanent URI appended to photos array
6. PhotoSection displays thumbnail
7. On submit: photos array stored as JSON string → createWithTags() → DB
```

### Data flow — ModifyTransactionScreen

```
1. Screen loads → photos initialized from JSON.parse(transaction.photo)
2. PhotoSection displays existing thumbnails
3. User can add more (repeat steps 2-4 above)
4. User can remove individual photos (delete file, remove from array)
5. On submit: photos array stored as JSON string → updateWithTags() → DB
```

### Data flow — TransactionDetailsScreen

```
1. Screen loads → parses transaction.photo (JSON array or single URI)
2. If photos exist → renders Photo DataRow with thumbnail row
3. Tapping thumbnail → opens full-screen modal with Image
4. Close button → dismisses modal
```

### i18n

| Key | EN | ES | CA |
|-----|----|----|----|
| `details_photo` | Photo | Foto | Foto |
| `photo_viewer_close` | Close | Cerrar | Tancar |
| `photo_delete_title` | Delete photo | Eliminar foto | Eliminar foto |
| `photo_delete_message` | Are you sure you want to delete this photo? | ¿Estás seguro de que quieres eliminar esta foto? | Estàs segur que vols eliminar aquesta foto? |

### Platform guards

```typescript
// AddTransactionScreen and ModifyTransactionScreen
{config.addShowPhoto && Platform.OS !== 'web' && (
  <PhotoSection
    photos={photos}
    onAddPhoto={handleAddPhoto}
    onRemovePhoto={handleRemovePhoto}
  />
)}

// PersonalizationScreen
{Platform.OS !== 'web' && (
  <Checkbox ... label={labels.settings_photo} />
)}
```

### File cleanup utility

```typescript
const deletePhoto = async (uri: string) => {
  if (!uri) return;
  try {
    const file = new File(uri);
    const exists = await file.exists();
    if (exists) {
      await file.delete();
    }
  } catch (err) {
    console.warn('Failed to delete photo:', uri, err);
  }
};

const deleteAllPhotos = async (photos: string[]) => {
  for (const photo of photos) {
    await deletePhoto(photo);
  }
};
```

Called in:
- `TransactionDetailsScreen.handleDelete` — delete all photo files before deleting the transaction.
- `ModifyTransactionScreen` / `AddTransactionScreen` — when user removes a photo, delete file.

---

## Dependencies

- `expo-image-picker` (new install via `npx expo install expo-image-picker`).
- `expo-file-system` (bundled with Expo SDK 54, no install needed).
- Existing `transactionRepository`, `PhotoSection`, `DataRow` (inline).
- `useConfig()`, `useFontSize()`, i18n.

---

## Estimate

- **Tasks**: 13 tasks in 6 phases
- **Estimated time**: 3-4 hours
