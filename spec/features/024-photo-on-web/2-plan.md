# Plan — 024 Photo Attachment on Web

## Architecture

Web photo persistence uses the existing `transactions.photo` column with **base64 data URIs**:

1. **Pick (web):** `expo-image-picker`'s web implementation returns the browser `File` on the asset (`asset.file`). The hook reads it with `FileReader.readAsDataURL()` → a `data:image/...;base64,...` URI.
2. **Store:** the data URI goes into the same JSON-array string as native file URIs; `TransactionForm` already serializes `JSON.stringify(photos)`.
3. **Persist:** the column lives in the sql.js database, which `database.ts` commits to IndexedDB once per transaction — so reloads restore the data URI.
4. **Display:** `<Image source={{ uri }}>` renders data URIs on react-native-web with no changes.
5. **Cleanup:** `deletePhotoFile` no-ops on `data:` URIs (web photos are removed by deleting the string/row, not a file).

Camera capture is not offered on web (native-only `capture="camera"` cannot be verified in a desktop browser).

## Libraries

- `expo-image-picker` — already installed; web implementation used as-is.
- `expo-file-system` — native only (unchanged); not called on web.

## Data flow

```
[web] Add/Modify screen
  └─ PhotoSection "+" → modal (gallery only)
      └─ usePhotos.handlePickFromGallery
          ├─ launchImageLibraryAsync({ mediaTypes:['images'], quality:0.7 })
          ├─ isWeb → FileReader.readAsDataURL(asset.file) → data URI
          │  (native: copy cache → documentDirectory, store file URI)
          └─ setPhotos([...prev, uri])
  → TransactionForm serializes photo: JSON.stringify(photos)
  → transactionRepo.create/update stores the JSON string
  → sql.js engine persists DB bytes to IndexedDB on commit
```

## Modified files

| File | Change |
|---|---|
| `src/hooks/usePhotos.ts` | Add `isWeb` branch in `handlePickFromGallery` (FileReader → data URI); web-safe `handleTakePhoto` (unreachable, kept native). |
| `src/utils/photoUtils.ts` | `deletePhotoFile` returns early for `data:` URIs. |
| `src/components/PhotoSection.tsx` | Import `isNative`; render the camera modal option only when `isNative`. |
| `src/components/TransactionForm.tsx` | Drop `isNative &&` from the PhotoSection render guard (and the unused import). |
| `src/screens/TransactionDetailsScreen.tsx` | Drop `isNative &&` from the photo row guard (and the unused import). |
| `src/screens/settings/PersonalizationScreen.tsx` | Show the "Show photo" checkbox on all platforms (drop `isNative` wrapper + import). |
| `tests/utils/photoUtils.test.ts` | **New:** data-URI parse round-trips; `deletePhotoFile` no-op on `data:`. |
| `tests/component/PhotoSection.test.tsx` | **New:** web mode hides camera option, shows gallery option. |

## Platform guards

All three 023 web gates are removed:

```diff
- {config.addShowPhoto && isNative && (
+ {config.addShowPhoto && (
     <PhotoSection ... />
   )}

- {parsedPhotos.length > 0 && isNative && (
+ {parsedPhotos.length > 0 && (
     <DataRow label={labels.details_photo} ...>...</DataRow>
   )}

- {isNative && (
-   <CheckboxRow ... label={labels.settings_photo} />
- )}
+ <CheckboxRow ... label={labels.settings_photo} />
```

The camera gate moves **into** `PhotoSection`:

```tsx
{isNative && (
  <TouchableOpacity ... onPress={() => handleSourceOption(onTakePhoto)}>
    <Ionicons name="camera-outline" ... />
    <Text ...>{labels.add_photo_camera}</Text>
  </TouchableOpacity>
)}
```

## Dependencies

- None. `expo-image-picker` (~17.0.11) and `expo-file-system` (~19.0.23) are already installed.

## Tasks → see `3-tasks.md`
