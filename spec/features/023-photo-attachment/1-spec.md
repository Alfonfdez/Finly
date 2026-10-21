# 023 — Photo Attachment

- **Goal**
Allow users to attach up to 3 photos (receipts, invoices, etc.) to a transaction. Native supports camera and gallery; web supports the gallery/file picker only (see 024). Photos are stored as a JSON array in `transactions.photo` on every platform.

---

## Functional requirements

### 1. Platform scope

- The photo feature is available on **iOS, Android, and web**.
- **Native:** photos are captured with the camera or picked from the gallery, copied to `documentDirectory` via `expo-file-system`, and the permanent `file://` URI is stored in `transactions.photo`.
- **Web:** the gallery/file picker is available; picked images are read as base64 data URIs and stored in the same JSON array (see 024). Camera capture stays native-only, so the source modal shows only "Add from gallery" on web.
- `PhotoSection` renders in `AddTransactionScreen` and `ModifyTransactionScreen` on every platform when `config.addShowPhoto` is true.
- The photo row renders in `TransactionDetailsScreen` on every platform.
- The "Show photo" checkbox is visible in `PersonalizationScreen` on every platform.
- The `photo TEXT` column is populated on all platforms.

### 2. Photo section in Add/Modify Transaction

- Title: "Photo" (i18n key `add_photo`, multilingual).
- Displays a horizontal row of up to 3 photo thumbnails (80×80 each, `borderRadius: 12`).
- When fewer than 3 photos exist, a dashed-border "+" button appears at the end of the row.
- Each photo has a small "×" button (top-right corner overlay) for removal.
- When the "+" button or any empty space is tapped, a modal opens with two options:

| Option | Icon | Action |
|--------|------|--------|
| Take photo | `camera-outline` | Opens device camera |
| Add from gallery | `images-outline` | Opens device gallery/file picker |
| Cancel | — | Closes the modal |

On web the modal shows only "Add from gallery" and "Cancel": camera capture is native-only (see 024).

### 3. Camera capture (native only)

- Tapping "Take photo" requests camera permissions via `ImagePicker.requestCameraPermissionsAsync()`.
- If permission is granted, opens `ImagePicker.launchCameraAsync()` with:
  - `mediaTypes: ['images']`
  - `quality: 0.7` (compressed to reduce storage footprint)
  - `allowsEditing: false`
- The captured image URI (cache directory) is copied to the app's `documentDirectory` with a unique filename: `photo_{Date.now()}.jpg` using `expo-file-system`.
- The permanent URI is appended to the photos array and displayed as a thumbnail.
- If permission is denied, no action is taken (the modal closes silently).

### 4. Gallery selection

- Tapping "Add from gallery" opens `ImagePicker.launchImageLibraryAsync()` with:
  - `mediaTypes: ['images']`
  - `quality: 0.7`
  - `allowsEditing: false`
- No permission request is needed for the gallery on iOS/Android (handled by the system).
- On web, the picker opens the browser file input and the selected file is read as a base64 data URI (`FileReader.readAsDataURL`) instead of being copied to a directory (see 024).
- On native, the selected image URI (cache directory) is copied to `documentDirectory` with a unique filename.
- The permanent URI or data URI is appended to the photos array and displayed as a thumbnail.

### 5. Photo thumbnail in PhotoSection

- When photos exist, the row shows 80×80 thumbnails (filled, `borderRadius: 12`) instead of the "+" icon.
- Each photo has a small "×" button (top-right corner overlay) for removal.
- A delete confirmation modal appears before removing a photo (i18n keys `photo_delete_title`, `photo_delete_message`).
- Tapping the "+" button opens the source modal again (camera/gallery on native, gallery only on web).
- Maximum 3 photos per transaction; "+" button hidden when 3 photos exist.

### 6. Photo persistence

- Photos are stored as a JSON array string in the `transactions.photo` column: `["uri1", "uri2", "uri3"]`.
- On native, the URIs are file paths that persist until the app is uninstalled or the user explicitly deletes them.
- On web, the array holds base64 data URIs, so photos live inside the DB row and survive reloads via sql.js/IndexedDB (see 024).
- Backwards compatible: existing single-URI photos are parsed as `[singleUri]`, and `parsePhotos()` handles both file URIs and data URIs.

### 7. Photo display in TransactionDetailsScreen

- A "Photo" row (i18n key `details_photo`) appears after the Tags row whenever the transaction has photos (on every platform).
- Shows a horizontal row of tappable thumbnails (48×48 each, `borderRadius: 8`).
- Tapping any thumbnail opens a full-screen image viewer: a `<Modal>` with black background, the image displayed with `resizeMode: 'contain'`, and a close button ("×" icon) in the top-right corner (i18n key `photo_viewer_close`).
- If no photos, the row is hidden entirely (not showing "—").

### 8. Photo in ModifyTransactionScreen

- When editing a transaction with existing photos, thumbnails are preloaded from `transaction.photo` (parsed from JSON).
- The user can add more photos (camera or gallery on native, gallery on web — same flow as Add) or remove individual photos (× button).
- On native, removing a photo also deletes its file from `documentDirectory`; on web, removing it drops the data URI from the array.

### 9. File cleanup

- **Delete transaction**: when a transaction with photos is deleted (`TransactionDetailsScreen`), all its native photo files are deleted from `documentDirectory`.
- **Remove photo**: when the user removes a photo (× button) in `ModifyTransactionScreen` or `AddTransactionScreen`, the native file is deleted.
- Cleanup uses `new File(uri).delete()` from `expo-file-system`; it is a no-op on web and for data URIs, whose photos live inside the DB row.
- Errors during cleanup are logged with the shared `ERROR_PREFIXES.photoDelete` prefix (non-critical).

### 10. Delete confirmation modal

- When the user taps the "×" button on a photo, a confirmation modal appears.
- Modal title: i18n key `photo_delete_title` ("Delete photo").
- Modal message: i18n key `photo_delete_message` ("Are you sure you want to delete this photo?").
- Buttons: Cancel (surface background) and Delete (red background).
- Cancel closes the modal without deleting.
- Delete removes the photo from the array (and, on native, deletes the file).

### 11. Visibility setting

- The `config.addShowPhoto` checkbox controls `PhotoSection` visibility on every platform.
- The checkbox is visible in `PersonalizationScreen` on every platform.

---

## Non-functional requirements

- **Storage**: native photos are stored in `documentDirectory` (permanent, not cache); web photos are base64 data URIs inside the DB row.
- **File naming**: `photo_{Date.now()}.jpg` to avoid collisions on native.
- **Compression**: quality 0.7 to balance visual quality and storage size.
- **Permissions**: camera permission requested only when "Take photo" is tapped (native); no upfront permission request.
- **Cleanup**: native photo files are deleted when a transaction is deleted or a photo is removed; web removes the data URI from the array.
- **Multilingual**: all visible texts use `t()` from the i18n system (en/es/ca/gl/eu/fr/de/pt/it).
- **Theme**: uses `useConfig().activeColors` for colors (not hardcoded).
- **Text**: uses `useFontSize()` for text scaling.
- **Backwards compatibility**: existing single-photo transactions are parsed correctly.

---

## Acceptance criteria

- [x] `PhotoSection` is visible on iOS/Android when `config.addShowPhoto` is true.
- [x] On web the photo section is visible (gallery/file-picker only) and the camera option is not offered.
- [x] "Show photo" checkbox is visible in `PersonalizationScreen` on every platform.
- [x] Up to 3 photos can be added per transaction.
- [x] "Take photo" opens the device camera after permission is granted.
- [x] "Add from gallery" opens the device gallery/file picker.
- [x] Each photo is displayed as a thumbnail in the `PhotoSection` (80×80, rounded corners).
- [x] "+" button appears when fewer than 3 photos exist.
- [x] "×" button on each photo opens a delete confirmation modal.
- [x] Confirmation modal has Cancel and Delete buttons.
- [x] Deleting a photo removes it from the array (and deletes the native file when present).
- [x] Native photo files are copied from cache to `documentDirectory` (persists across app restarts).
- [x] Photos are stored as JSON array string in `transactions.photo` column (file URIs on native, data URIs on web).
- [x] `TransactionDetailsScreen` shows multiple photo thumbnails when photos exist on every platform.
- [x] Tapping a thumbnail in details opens a full-screen viewer with close button.
- [x] `ModifyTransactionScreen` preloads existing photos and allows adding/removing.
- [x] Deleting a transaction deletes all its native photo files from `documentDirectory`.
- [x] All texts are multilingual (en/es/ca/gl/eu/fr/de/pt/it).
- [x] The screen respects the active theme (dark/light).
- [x] The screen respects the configured text size.
- [x] Existing single-photo transactions are parsed correctly (backwards compatible).
