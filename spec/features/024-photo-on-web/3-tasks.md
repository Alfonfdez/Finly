# Tasks â€” 024 Photo Attachment on Web

Execution order. Mark each task when completed.

---

### Phase 1 â€” Shared utils

[x] T1 â€” Update `src/utils/photoUtils.ts`:
  - `deletePhotoFile`: return early (no-op) when `uri.startsWith('data:')`, before touching `expo-file-system` (web photos live in the DB, not the file system).

[x] T2 â€” Update `src/hooks/usePhotos.ts`:
  - Import `isWeb` from `../utils/platform` and the `ImagePickerAsset` type.
  - Add a `readAsDataUrl(blob: Blob)` helper using `FileReader.readAsDataURL`.
  - Add a `webPhotoUri(asset)` helper: `asset.file` â†’ `readAsDataUrl`, else `fetch(asset.uri)` â†’ `Blob` â†’ `readAsDataUrl`.
  - In `handlePickFromGallery`: when `isWeb`, push `webPhotoUri(asset)` into the photos array instead of the expo-file-system copy flow.
  - Keep the native copy flow byte-for-byte identical.

---

### Phase 2 â€” Platform guards

[x] T3 â€” Update `src/components/PhotoSection.tsx`:
  - Import `isNative` from `../utils/platform`.
  - Wrap the "Take photo" modal option in `{isNative && (...)}` (camera stays native-only).

[x] T4 â€” Update `src/components/TransactionForm.tsx`:
  - Remove `isNative` from the `PhotoSection` render guard (now `config.addShowPhoto && (...)`).
  - Remove the now-unused `isNative` import.

[x] T5 â€” Update `src/screens/TransactionDetailsScreen.tsx`:
  - Remove `isNative` from the photo row guard (now `parsedPhotos.length > 0 && (...)`).
  - Remove the now-unused `isNative` import.

[x] T6 â€” Update `src/screens/settings/PersonalizationScreen.tsx`:
  - Show the "Show photo" `CheckboxRow` on all platforms (drop the `isNative` wrapper).
  - Remove the now-unused `isNative` import.

---

### Phase 3 â€” Tests

[x] T7 â€” Add `tests/utils/photoUtils.test.ts`:
  - `parsePhotos` round-trips a JSON array of data URIs and a single data URI.
  - `deletePhotoFile` resolves without error and without touching `expo-file-system` for `data:` URIs.

[x] T8 â€” Add `tests/component/PhotoSection.test.tsx`:
  - Mock `../../src/utils/platform` as web (`isWeb: true, isNative: false`): the source modal shows "Add from gallery" and hides the camera option.
  - Native (`isNative: true`): the modal shows both options.

---

### Phase 4 â€” Docs

[x] T9 â€” Update `spec/constitution/7-platform-differences.md`:
  - Photo matrix: gallery/file-picker becomes available on web; camera stays native-only.
  - Replace the "photo on web out of scope" notes with the 024 outcome (base64 data URIs in DB).

[x] T10 â€” Update `docs/harnesses.md` and `AGENTS.md`:
  - Clarify that web photo *gallery* picking is now checkable on web, while *camera capture* still is not.

[x] T11 â€” Update `spec/constitution/3-roadmap.md`: add a `024-photo-on-web` completed entry.

[x] T12 â€” Update `docs/changelog.md`: record the 024 implementation.

---

### Phase 5 â€” Verification

[x] T13 â€” `npm run test:all` green (typecheck + lint + tests).

[x] T14 â€” Web verification loop (Playwright, 375px viewport):
  - Settings â†’ Personalization: "Show photo" checkbox visible and toggles the PhotoSection.
  - Add a transaction â†’ "+" â†’ "Add from gallery" opens the file picker; attach an image; thumbnail renders.
  - Save the transaction â†’ **full page reload** â†’ thumbnail persists (base64 data URI in the sql.js/IndexedDB DB).
  - TransactionDetailsScreen shows the photo thumbnails; the full-screen viewer opens and closes.
  - ModifyTransactionScreen preloads the photo and allows removal.
  - Remove photo (Ã— + confirm) removes it without error.
  - 3-photo cap enforced on web.
  - Delete the transaction; the photo is gone after reload.
  - Camera option is not rendered on web (source modal shows gallery only).
  - Camera capture is reported as "not checkable on web" (native-only).
