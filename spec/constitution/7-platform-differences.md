# 7 — Platform differences

Defines which features behave differently across **iOS**, **Android**, and **Web**, and the rationale behind each decision.

---

## Storage layer

| Platform | Engine | File |
|----------|--------|------|
| iOS / Android | `expo-sqlite` (async) | `src/database/repositories/*.ts` |
| Web | `localStorage` (sync) | `src/database/webStorage.ts` |

The repository selector lives in `src/database/index.ts`: a single `isWeb` flag swaps all five repositories at import time.

### localStorage limits

- **Typical quota**: ~5 MB per origin (browser-dependent).
- **Base64 image cost**: a 1 MB photo becomes ~1.33 MB in base64.
- **Impact**: storing multiple receipt photos would exhaust the quota quickly.
- **Decision**: photo attachment is **hidden on web entirely** (section, setting, details row).

---

## Feature availability matrix

| Feature | iOS / Android | Web | Rationale |
|---------|--------------|-----|-----------|
| SQLite storage | ✅ | ❌ | Uses `expo-sqlite` native module |
| localStorage storage | ❌ | ✅ | Web fallback |
| Camera / gallery (photo) | ✅ | ❌ | `expo-image-picker` is native-only; localStorage quota |
| Photo section in Add/Modify | ✅ | ❌ | Hidden via `Platform.OS !== 'web'` |
| Photo setting checkbox | ✅ | ❌ | Hidden in PersonalizationScreen |
| Photo row in Transaction Details | ✅ | ❌ | Hidden via platform guard |
| File system (copy/cache) | ✅ | ❌ | `expo-file-system` for URI persistence |
| Flag icons (emoji) | ✅ | ❌ | Web uses SVG flags (`FLAG_WEB`) instead of emoji |
| Keyboard spacer (Android) | ✅ (Android) | ❌ | Android-specific `keyboardVerticalOffset` spacer |
| Theme picker (system) | ✅ | ❌ (system option hidden) | Web has no "system" theme concept |
| Data reset (full reseed) | ✅ | ✅ | Both paths reseed; web additionally calls `localStorage.clear()` |
| Notifications / haptics | Planned | ❌ | Native-only APIs, not yet implemented |

---

## Platform guard conventions

### Pattern

```tsx
import { Platform } from 'react-native';

// Hide entire section on web
{Platform.OS !== 'web' && <PhotoSection />}

// Web-specific fallback
if (Platform.OS === 'web') {
  // localStorage path
} else {
  // SQLite path
}

// Android-only spacer
{Platform.OS === 'android' && <View style={styles.keyboardSpacer} />}
```

### Rules

1. **Use `Platform.OS !== 'web'`** to hide native-only UI (camera, photo section, notifications).
2. **Use `Platform.OS === 'web'`** to branch storage logic or render web-specific fallbacks.
3. **Use `Platform.OS === 'android'`** only for Android-specific layout adjustments (keyboard spacer).
4. **Never assume a feature is web-available** without checking the quota/storage implications.
5. **Document every guard** in this file when adding a new platform-dependent feature.

---

## Photo feature decision (Feature 023)

| Aspect | Decision |
|--------|----------|
| **Why hidden on web** | localStorage 5 MB quota cannot reliably store base64 images alongside app data |
| **Native behavior** | Camera or gallery via `expo-image-picker`; file copied to `documentDirectory` via `expo-file-system` for persistence |
| **Storage on native** | File URI stored in `transactions.photo` column (TEXT, nullable) |
| **Cleanup** | File deleted from disk on transaction delete, photo replace, or manual remove |
| **Setting** | `add_show_photo` config key controls section visibility; checkbox hidden on web too |
| **Future consideration** | If web storage migrates to IndexedDB or cloud sync is added, photo on web may become viable |

---

## Adding a new platform-dependent feature

Before merging any feature with platform guards:

1. **Check this file** — is the API available on all target platforms?
2. **Update the matrix** — add a row with status and rationale.
3. **Add the guard** — use the conventions above.
4. **Update the spec** — the feature's `1-spec.md` must state platform scope explicitly.
5. **Test both paths** — verify on native AND web (even if just confirming the element is hidden).
