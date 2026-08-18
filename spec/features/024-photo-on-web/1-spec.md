# 024 — Photo Attachment on Web

- **Goal**
  Bring photo attachment to web, closing the last documented platform gap (023 was iOS/Android-only). On web, users attach up to 3 photos (receipts, invoices, etc.) per transaction by picking an image from the file system/gallery. Picked images are read as **base64 data URIs** and stored in the existing `transactions.photo` column (JSON array), which the sql.js engine already persists to IndexedDB — so photos survive page reloads with no new storage infrastructure. Camera capture remains native-only.

---

## Functional requirements

### 1. Platform scope

- The photo feature is available on **iOS, Android, and web**.
- **Native (unchanged from 023):** picked photos are copied to `documentDirectory` via `expo-file-system`; the permanent `file://` URI is stored in `transactions.photo`.
- **Web:** picked images are read as base64 data URIs (`data:image/...;base64,...`) and stored in `transactions.photo` as a JSON array.
- The `photo TEXT` column is now populated on all platforms (previously always `null` on web).
- The three `isNative` web gates introduced in 023 are removed: `PhotoSection` in Add/Modify, the photo row in `TransactionDetailsScreen`, and the "Show photo" checkbox in `PersonalizationScreen`.
- Camera capture stays native-only: web offers the gallery/file-picker option only.

### 2. Web gallery selection

- Tapping "Add from gallery" on web uses the existing `ImagePicker.launchImageLibraryAsync()` (its web implementation opens a hidden `<input type="file" accept="image/*">`).
- `requestMediaLibraryPermissionsAsync()` resolves `granted` on web (no permission dialog).
- The returned web asset exposes the raw browser `File` via `asset.file` (web-only property). The file is read with `FileReader.readAsDataURL(file)` to produce a data URI.
- The data URI is appended to the photos array and rendered as a thumbnail via `<Image source={{ uri: dataUri }}>` (data URIs render in react-native-web exactly like file URIs on native).
- If `asset.file` is missing (defensive), fall back to `fetch(asset.uri)` → `Blob` → `FileReader.readAsDataURL(blob)`.

### 3. Photo persistence on web

- Photos are stored as a JSON array string in the `transactions.photo` column: `["data:image/jpeg;base64,..."]` — the same format native uses.
- Data URIs survive a full page reload because the column lives in the sql.js database persisted to IndexedDB (one write per committed transaction).
- Backwards compatible: `parsePhotos()` handles JSON arrays and single-URI fallback for both file URIs and data URIs.

### 4. Photo display

- The photo row in `TransactionDetailsScreen` renders on all platforms (not just native), with tappable thumbnails.
- The full-screen viewer `<Modal>` (black background, `resizeMode: 'contain'`, close button) works on web.

### 5. Visibility setting

- The `config.addShowPhoto` checkbox is now visible in `PersonalizationScreen` on all platforms and controls `PhotoSection` visibility everywhere.
- Existing users keep their saved preference (stored in the shared config table).

### 6. Camera

- `PhotoSection`'s source modal shows the "Take photo" entry **only on native**.
- On web the modal shows only "Add from gallery" and "Cancel".
- Web camera capture (`capture="camera"` on the input) is out of scope: it would only work on mobile browsers and cannot be verified in a desktop browser at the 375px viewport.

### 7. Photo removal and cleanup

- The "×" remove flow (with the delete confirmation modal) works on web identically to native.
- `deletePhotoFile(uri)` becomes a **no-op for `data:` URIs**: web photos live inside the DB row, so deleting them means removing the string from the array (and, on transaction delete, the row itself).
- `deleteTransactionPhotos` (bulk delete paths in `transactionRepo`/`accountRepo`/`categoryRepo`) needs no web branch: rows are deleted by SQL on every platform, and `deletePhotoFile` already no-ops on data URIs.
- Errors during cleanup are logged to console (non-critical), as on native.

---

## Non-functional requirements

- **Storage:** base64 data URIs in the DB on web. Rationale: `expo-file-system` is a web stub (its `File`/`Paths` API throws on web) and the picker's `blob:` URIs are ephemeral (page-session only). Storing the data URI in the existing column reuses the engine's IndexedDB persistence. This deliberately overrides 023's "no base64" rule **for web only**; native storage is unchanged.
- **Size control:** `quality: 0.7` compression and `MAX_PHOTOS = 3` keep base64 bloat acceptable for the whole-DB persistence model.
- **Camera:** native-only; not offered on web.
- **Permissions:** unchanged from 023.
- **Multilingual:** all visible texts use `t()` from the i18n system (en/es/ca) — no new keys required (023 labels reused).
- **Theme / text size:** `useConfig().activeColors` and `useFontSize()` as in 023.
- **No new dependencies:** `expo-image-picker` and `expo-file-system` are already installed.
- **Backwards compatibility:** existing native file-URI photos and web data-URI photos both parse correctly; native behavior is byte-for-byte unchanged.

---

## Acceptance criteria

- [x] `PhotoSection` is visible on web when `config.addShowPhoto` is true.
- [x] "Show photo" checkbox is visible in `PersonalizationScreen` on web.
- [x] On web, "Add from gallery" opens the file picker and adds a thumbnail that renders.
- [x] Web photos persist across a full page reload (re-rendered thumbnails in Add/Modify and Details).
- [x] Up to 3 photos can be added per transaction on web.
- [x] The "Take photo" (camera) option is not shown on web.
- [x] Removing a photo on web (× + confirm) removes it without error.
- [x] `TransactionDetailsScreen` shows photo thumbnails on web and the full-screen viewer opens/works.
- [x] `ModifyTransactionScreen` preloads web photos and allows adding/removing.
- [x] Deleting a transaction with web photos deletes the row cleanly (photos gone).
- [x] `deletePhotoFile` no-ops on `data:` URIs without throwing.
- [x] `parsePhotos` round-trips data-URI JSON arrays and single data URIs.
- [x] All texts are multilingual (en/es/ca), theme and text size are respected.
- [x] `npm run test:all` is green (typecheck + lint + tests).
