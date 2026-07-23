# 023 — Photo Attachment

- **Goal**
Allow users to attach a photo (receipt, invoice, etc.) to a transaction. The photo can be captured via camera or selected from the device gallery. Available on iOS and Android only; hidden on web due to localStorage 5 MB quota limitations.

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
- An 80×80 dashed-border square with a "+" icon (existing `PhotoSection` layout).
- When a photo is selected, the square displays the image thumbnail instead of the "+" icon.
- When tapped, a modal opens with two options:

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
- The permanent URI is stored in state and displayed as a thumbnail in the `PhotoSection`.
- If permission is denied, no action is taken (the modal closes silently).

### 4. Gallery selection

- Tapping "Add from gallery" opens `ImagePicker.launchImageLibraryAsync()` with:
  - `mediaTypes: ['images']`
  - `quality: 0.7`
  - `allowsEditing: false`
- No permission request is needed for the gallery on iOS/Android (handled by the system).
- The selected image URI (cache directory) is copied to `documentDirectory` with a unique filename.
- The permanent URI is stored in state and displayed as a thumbnail.

### 5. Photo thumbnail in PhotoSection

- When a photo is selected, the 80×80 square shows the image thumbnail (filled, `borderRadius: 12`) instead of the "+" icon.
- A small "×" button (top-right corner overlay) allows removing the selected photo (sets URI to `null`).
- Tapping the thumbnail opens the modal again (user can replace the photo by choosing camera or gallery again).

### 6. Photo persistence

- The photo file URI (in `documentDirectory`) is stored in the `transactions.photo` column as a `TEXT` string.
- On native, the URI persists until the app is uninstalled or the user explicitly deletes it.
- No base64 encoding — the URI path is stored directly.

### 7. Photo display in TransactionDetailsScreen

- A "Photo" row (i18n key `details_photo`) appears after the Tags row, but only if the transaction has a photo (`transaction.photo` is not null) and the platform is not web.
- Shows a tappable thumbnail (max width 200, aspect ratio preserved).
- Tapping opens a full-screen image viewer: a `<Modal>` with black background, the image displayed with `resizeMode: 'contain'`, and a close button ("×" icon) in the top-right corner (i18n key `photo_viewer_close`).
- If no photo, the row is hidden entirely (not showing "—").

### 8. Photo in ModifyTransactionScreen

- When editing a transaction that has an existing photo, the thumbnail is preloaded from `transaction.photo`.
- The user can replace it (camera or gallery — same flow as Add) or remove it (× button).
- If the user replaces the photo, the old file is deleted from `documentDirectory`.

### 9. File cleanup

- **Delete transaction**: when a transaction with a photo is deleted (`TransactionDetailsScreen`), the photo file is also deleted from `documentDirectory`.
- **Replace photo**: when a photo is replaced in `ModifyTransactionScreen`, the old file is deleted.
- **Remove photo**: when the user removes a photo (× button) in `ModifyTransactionScreen`, the file is deleted.
- Cleanup uses `FileSystem.getInfoAsync()` to check existence before `FileSystem.deleteAsync()`.
- Errors during cleanup are silently caught (non-critical).

### 10. Visibility setting

- The `config.addShowPhoto` checkbox controls `PhotoSection` visibility on iOS/Android.
- On web, the checkbox is hidden in `PersonalizationScreen` and the `PhotoSection` is always hidden.

---

## Non-functional requirements

- **Storage**: photos are stored in `documentDirectory` (permanent, not cache).
- **File naming**: `photo_{Date.now()}.jpg` to avoid collisions.
- **Compression**: quality 0.7 to balance visual quality and storage size.
- **Permissions**: camera permission requested only when "Take photo" is tapped; no upfront permission request.
- **Cleanup**: old photo files are deleted when transaction is deleted, photo is replaced, or photo is removed.
- **Multilingual**: all visible texts use `t()` from the i18n system (en/es/ca).
- **Theme**: uses `useConfig().activeColors` for colors (not hardcoded).
- **Text**: uses `useFontSize()` for text scaling.

---

## Acceptance criteria

- [ ] `PhotoSection` is visible on iOS/Android when `config.addShowPhoto` is true.
- [ ] `PhotoSection` is hidden on web regardless of config.
- [ ] "Show photo" checkbox is hidden in `PersonalizationScreen` on web.
- [ ] "Take photo" opens the device camera after permission is granted.
- [ ] "Add from gallery" opens the device gallery/file picker.
- [ ] Selected photo is displayed as a thumbnail in the `PhotoSection` (80×80, rounded corners).
- [ ] "×" button removes the selected photo.
- [ ] Photo file is copied from cache to `documentDirectory` (persists across app restarts).
- [ ] Photo URI is stored in the `transactions.photo` column.
- [ ] `TransactionDetailsScreen` shows the photo thumbnail when a photo exists (not on web).
- [ ] Tapping the thumbnail in details opens a full-screen viewer with close button.
- [ ] `ModifyTransactionScreen` preloads existing photo and allows replacement/removal.
- [ ] Deleting a transaction deletes its photo file from `documentDirectory`.
- [ ] Replacing a photo in modify screen deletes the old file.
- [ ] Removing a photo in modify screen deletes the file.
- [ ] All texts are multilingual (en/es/ca).
- [ ] The screen respects the active theme (dark/light).
- [ ] The screen respects the configured text size.
