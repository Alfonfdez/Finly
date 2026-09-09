# Tasks — 023 Photo Attachment
Execution order. Mark each task when completed.

---

### Phase 1 — Database

[x] T1 — Update `src/database/migrations/001_initial.ts`: add `photo TEXT` column to `transactions` CREATE TABLE (after `updated_at`, before `created_at`).

[x] T2 — Update `src/database/types.ts`: add `photo: string | null` to `Transaction` interface (after `updated_at`).

[x] T3 — Update `src/database/repositories/transactionRepo.ts`:
  - `create()`: add `photo` to INSERT columns and params.
  - `update()`: add `photo` field handling in dynamic fields block.

---

### Phase 2 — Install library

[x] T4 — Install `expo-image-picker`: run `npx expo install expo-image-picker`.

---

### Phase 3 — Photo handlers

[x] T5 — Update `src/screens/AddTransactionScreen.tsx`:
  - Import `* as ImagePicker` from `expo-image-picker` and `* as FileSystem` from `expo-file-system`.
  - Add `Platform` to react-native imports.
  - Change `const [fotoUri]` → `const [photos, setPhotos] = useState<string[]>([])`.
  - Implement `handleTakePhoto`: request camera permission → `launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })` → copy to `documentDirectory` → append to photos array.
  - Implement `handlePickFromGallery`: `launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })` → copy to `documentDirectory` → append to photos array.
  - Implement `handleRemovePhoto(index)`: remove from array and delete file.
  - Store `JSON.stringify(photos)` in `createWithTags()`.

[x] T6 — Update `src/screens/ModifyTransactionScreen.tsx`:
  - Same imports as T5.
  - Change `const [fotoUri]` → `const [photos, setPhotos] = useState<string[]>([])` initialized from `transaction?.photo ? JSON.parse(transaction.photo) : []`.
  - Same handler implementations as T5.
  - Store `JSON.stringify(photos)` in `updateWithTags()`.
  - Handle backwards compatibility: parse old single URI as `[uri]`.

---

### Phase 4 — UI

[x] T7 — Update `src/components/PhotoSection.tsx`:
  - Accept `photos: string[]` instead of single `photoUri`.
  - Display horizontal row of up to 3 thumbnails (80×80 each, `borderRadius: 12`).
  - Add "+" button when fewer than 3 photos exist.
  - Each photo has "×" button with delete confirmation modal.
  - Add delete confirmation modal (Cancel/Delete buttons).
  - Add `photoGrid`, `removeButton`, `addButton` styles.

[x] T8 — Update `src/screens/TransactionDetailsScreen.tsx`:
  - Import `Image` and `Platform` from react-native.
  - Add `parsedPhotos` useMemo to parse `transaction.photo` (handle old single URI and new JSON array).
  - Add `selectedPhotoIndex` state for viewer.
  - Add Photo `DataRow` after Tags row (when `parsedPhotos.length > 0` and `Platform.OS !== 'web'`):
    - Display horizontal row of tappable thumbnails (48×48 each, `borderRadius: 8`).
  - Add full-screen image viewer `<Modal>`:
    - Black background overlay.
    - `<Image source={{ uri: parsedPhotos[selectedPhotoIndex] }} resizeMode="contain" style={styles.viewerImage} />`.
    - Close button (X icon) in top-right corner.
  - In `handleDelete`: call `deleteAllPhotos(parsedPhotos)` before `transactionRepository.delete()`.
  - Add `deleteAllPhotos()` helper that loops through all photos.
  - Add `photoGrid`, `photoThumbnail`, `viewerImage` styles.

[x] T9 — Update `src/screens/settings/PersonalizationScreen.tsx`:
  - Import `Platform` from react-native.
  - Wrap the photo `Checkbox` (lines 155-161) with `{Platform.OS !== 'web' && (...)}`.

---

### Phase 5 — i18n and specs

[x] T10 — Add i18n keys:
  - `src/i18n/en.ts`: `details_photo: 'Photo'`, `photo_viewer_close: 'Close'`, `photo_delete_title: 'Delete photo'`, `photo_delete_message: 'Are you sure you want to delete this photo?'`
  - `src/i18n/es.ts`: `details_photo: 'Foto'`, `photo_viewer_close: 'Cerrar'`, `photo_delete_title: 'Eliminar foto'`, `photo_delete_message: '¿Estás seguro de que quieres eliminar esta foto?'`
  - `src/i18n/ca.ts`: `details_photo: 'Foto'`, `photo_viewer_close: 'Tancar'`, `photo_delete_title: 'Eliminar foto'`, `photo_delete_message: 'Estàs segur que vols eliminar aquesta foto?'`

[x] T11 — Update existing specs:
  - `spec/features/023-photo-attachment/1-spec.md`: update to reflect multi-photo implementation.
  - `spec/features/023-photo-attachment/2-plan.md`: update to reflect multi-photo implementation.

---

### Phase 6 — Verification

[x] T12 — Manual verification on iOS/Android (Expo Go):
  - Add up to 3 photos → verify thumbnails appear in PhotoSection → submit → verify in TransactionDetails.
  - Remove individual photos → verify confirmation modal appears.
  - Modify transaction → verify photos load → add/remove → verify files deleted.
  - Delete transaction → verify all photo files deleted from documentDirectory.
  - Settings → toggle "Show photo" off → verify PhotoSection hidden.
  - Settings → toggle "Show photo" on → verify PhotoSection visible.

[x] T13 — Manual verification on web (`npx expo start --web`):
  - Verify PhotoSection does not render in Add/Modify screens.
  - Verify "Show photo" checkbox is hidden in Settings > Personalization.
  - Verify photo row does not appear in TransactionDetails.
