# 023 — Photo Attachment

- **Goal**
Allow users to attach up to 3 photos (receipts, invoices, etc.) to a transaction. Photos can be captured via camera or selected from the device gallery. Available on iOS and Android only; hidden on web due to localStorage 5 MB quota limitations.

---

## Functional requirements

### 1. Platform scope

- The photo feature is available on **iOS and Android only**.
- On **web**, the entire photo section is hidden:
  - `PhotoSection` does not render in `AddTransactionScreen` or `ModifyTransactionScreen`.
  - The "Show photo" checkbox is hidden in `PersonalizationScreen` (Settings).
  - The photo row does not render in `TransactionDetailsScreen`.
- The `photo TEXT` column exists in the database on all platforms (always `null` on web).

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

### 3. Camera capture

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
- The selected image URI (cache directory) is copied to `documentDirectory` with a unique filename.
- The permanent URI is appended to the photos array and displayed as a thumbnail.

### 5. Photo thumbnail in PhotoSection

- When photos exist, the row shows 80×80 thumbnails (filled, `borderRadius: 12`) instead of the "+" icon.
- Each photo has a small "×" button (top-right corner overlay) for removal.
- A delete confirmation modal appears before removing a photo (i18n keys `photo_delete_title`, `photo_delete_message`).
- Tapping the "+" button opens the source modal again (camera/gallery).
- Maximum 3 photos per transaction; "+" button hidden when 3 photos exist.

### 6. Photo persistence

- Photos are stored as a JSON array string in the `transactions.photo` column: `["uri1", "uri2", "uri3"]`.
- On native, the URIs persist until the app is uninstalled or the user explicitly deletes them.
- No base64 encoding — the URI paths are stored directly.
- Backwards compatible: existing single-URI photos are parsed as `[singleUri]`.

### 7. Photo display in TransactionDetailsScreen

- A "Photo" row (i18n key `details_photo`) appears after the Tags row, but only if the transaction has photos and the platform is not web.
- Shows a horizontal row of tappable thumbnails (48×48 each, `borderRadius: 8`).
- Tapping any thumbnail opens a full-screen image viewer: a `<Modal>` with black background, the image displayed with `resizeMode: 'contain'`, and a close button ("×" icon) in the top-right corner (i18n key `photo_viewer_close`).
- If no photos, the row is hidden entirely (not showing "—").

### 8. Photo in ModifyTransactionScreen

- When editing a transaction with existing photos, thumbnails are preloaded from `transaction.photo` (parsed from JSON).
- The user can add more photos (camera or gallery — same flow as Add) or remove individual photos (× button).
- If the user removes a photo, the file is deleted from `documentDirectory`.

### 9. File cleanup

- **Delete transaction**: when a transaction with photos is deleted (`TransactionDetailsScreen`), all photo files are deleted from `documentDirectory`.
- **Remove photo**: when the user removes a photo (× button) in `ModifyTransactionScreen` or `AddTransactionScreen`, the file is deleted.
- Cleanup uses `new File(uri).delete()` from `expo-file-system`.
- Errors during cleanup are logged to console (non-critical).

### 10. Delete confirmation modal

- When the user taps the "×" button on a photo, a confirmation modal appears.
- Modal title: i18n key `photo_delete_title` ("Delete photo").
- Modal message: i18n key `photo_delete_message` ("Are you sure you want to delete this photo?").
- Buttons: Cancel (surface background) and Delete (red background).
- Cancel closes the modal without deleting.
- Delete removes the photo from the array and deletes the file.

### 11. Visibility setting

- The `config.addShowPhoto` checkbox controls `PhotoSection` visibility on iOS/Android.
- On web, the checkbox is hidden in `PersonalizationScreen` and the `PhotoSection` is always hidden.

---

## Non-functional requirements

- **Storage**: photos are stored in `documentDirectory` (permanent, not cache).
- **File naming**: `photo_{Date.now()}.jpg` to avoid collisions.
- **Compression**: quality 0.7 to balance visual quality and storage size.
- **Permissions**: camera permission requested only when "Take photo" is tapped; no upfront permission request.
- **Cleanup**: photo files are deleted when transaction is deleted or photo is removed.
- **Multilingual**: all visible texts use `t()` from the i18n system (en/es/ca).
- **Theme**: uses `useConfig().activeColors` for colors (not hardcoded).
- **Text**: uses `useFontSize()` for text scaling.
- **Backwards compatibility**: existing single-photo transactions are parsed correctly.

---

## Acceptance criteria

- [ ] `PhotoSection` is visible on iOS/Android when `config.addShowPhoto` is true.
- [ ] `PhotoSection` is hidden on web regardless of config.
- [ ] "Show photo" checkbox is hidden in `PersonalizationScreen` on web.
- [ ] Up to 3 photos can be added per transaction.
- [ ] "Take photo" opens the device camera after permission is granted.
- [ ] "Add from gallery" opens the device gallery/file picker.
- [ ] Each photo is displayed as a thumbnail in the `PhotoSection` (80×80, rounded corners).
- [ ] "+" button appears when fewer than 3 photos exist.
- [ ] "×" button on each photo opens a delete confirmation modal.
- [ ] Confirmation modal has Cancel and Delete buttons.
- [ ] Deleting a photo removes it from the array and deletes the file.
- [ ] Photo files are copied from cache to `documentDirectory` (persists across app restarts).
- [ ] Photos are stored as JSON array string in `transactions.photo` column.
- [ ] `TransactionDetailsScreen` shows multiple photo thumbnails when photos exist (not on web).
- [ ] Tapping a thumbnail in details opens a full-screen viewer with close button.
- [ ] `ModifyTransactionScreen` preloads existing photos and allows adding/removing.
- [ ] Deleting a transaction deletes all its photo files from `documentDirectory`.
- [ ] All texts are multilingual (en/es/ca).
- [ ] The screen respects the active theme (dark/light).
- [ ] The screen respects the configured text size.
- [ ] Existing single-photo transactions are parsed correctly (backwards compatible).
