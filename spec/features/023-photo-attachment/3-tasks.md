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
  - Change `const [fotoUri]` → `const [fotoUri, setFotoUri]` (add setter).
  - Implement `handleTakePhoto`: request camera permission → `launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })` → copy to `documentDirectory` → set state.
  - Implement `handlePickFromGallery`: `launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })` → copy to `documentDirectory` → set state.
  - Add `deletePhoto()` helper using `FileSystem.getInfoAsync` + `FileSystem.deleteAsync`.
  - Pass `photo: fotoUri` to `createWithTags()` in `handleSubmit`.

[x] T6 — Update `src/screens/ModifyTransactionScreen.tsx`:
  - Same imports as T5.
  - Change `const [fotoUri]` → `const [fotoUri, setFotoUri]` initialized from `transaction?.photo ?? null`.
  - Same handler implementations as T5.
  - Same `deletePhoto()` helper.
  - Pass `photo: fotoUri` to `updateWithTags()` in `handleSubmit`.
  - On photo replace: call `deletePhoto(oldUri)` before setting new URI.

---

### Phase 4 — UI

[x] T7 — Update `src/components/PhotoSection.tsx`:
  - Add `onRemovePhoto` prop to `Props` interface.
  - Import `Image` from react-native.
  - Replace "Selected photo" text with `<Image source={{ uri: photoUri }} style={styles.photoThumbnail} />`.
  - Add "×" remove button overlay (top-right corner of photoButton) when photoUri is set.
  - Add `photoThumbnail` style: `width: '100%', height: '100%', borderRadius: 12`.
  - Add `removeButton` style: absolute positioned top-right, zIndex 1.

[x] T8 — Update `src/screens/TransactionDetailsScreen.tsx`:
  - Import `Image` and `Platform` from react-native.
  - Add `photoViewerVisible` state.
  - After Tags `DataRow`, add Photo `DataRow` (when `transaction.photo` exists and `Platform.OS !== 'web'`):
    - `label={labels.details_photo}`
    - `TouchableOpacity` wrapping `<Image source={{ uri: transaction.photo }}>` with thumbnail style.
    - `onPress={() => setPhotoViewerVisible(true)}`.
  - Add full-screen image viewer `<Modal>`:
    - Black background overlay.
    - `<Image source={{ uri: transaction.photo }} resizeMode="contain" style={styles.viewerImage} />`.
    - Close button (X icon) in top-right corner.
  - In `handleDelete`: call `deletePhoto(transaction.photo)` before `transactionRepository.delete()`.
  - Add `deletePhoto()` helper.
  - Add `photoThumbnail` and `viewerImage` styles.

[x] T9 — Update `src/screens/settings/PersonalizationScreen.tsx`:
  - Import `Platform` from react-native.
  - Wrap the photo `Checkbox` (lines 155-161) with `{Platform.OS !== 'web' && (...)}`.

---

### Phase 5 — i18n and specs

[x] T10 — Add i18n keys:
  - `src/i18n/en.ts`: `details_photo: 'Photo'`, `photo_viewer_close: 'Close'`
  - `src/i18n/es.ts`: `details_photo: 'Foto'`, `photo_viewer_close: 'Cerrar'`
  - `src/i18n/ca.ts`: `details_photo: 'Foto'`, `photo_viewer_close: 'Tancar'`

[x] T11 — Update existing specs:
  - `spec/features/004-add-transaction-screen/1-spec.md`: replace TODO in section 9 with reference to 023.
  - `spec/features/016-transaction-details-screen/1-spec.md`: add photo display section referencing 023.
  - `spec/features/017-modify-transaction-screen/1-spec.md`: update section 9 to reference 023 for full implementation.
  - `spec/constitution/3-roadmap.md`: add 023-photo-attachment entry.

---

### Verification

[x] T12 — Manual verification on iOS/Android (Expo Go):
  - Take a photo → verify thumbnail appears in PhotoSection → submit → verify in TransactionDetails.
  - Pick from gallery → same flow.
  - Modify transaction → verify photo loads → replace → verify old file deleted.
  - Modify transaction → remove photo → verify file deleted.
  - Delete transaction → verify photo file deleted from documentDirectory.
  - Settings → toggle "Show photo" off → verify PhotoSection hidden.
  - Settings → toggle "Show photo" on → verify PhotoSection visible.

[x] T13 — Manual verification on web (`npx expo start --web`):
  - Verify PhotoSection does not render in Add/Modify screens.
  - Verify "Show photo" checkbox is hidden in Settings > Personalization.
  - Verify photo row does not appear in TransactionDetails.
