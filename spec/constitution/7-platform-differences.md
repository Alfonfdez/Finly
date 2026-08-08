# 7 — Platform differences

Defines which features behave differently across **iOS**, **Android**, and **Web**, and the rationale behind each decision.

---

## Storage layer

| Platform | Engine | File |
|----------|--------|------|
| iOS / Android | `expo-sqlite` (async) | `src/database/repositories/*.ts` |
| Web | sql.js WASM (async API, `DatabaseHandle`) persisted to IndexedDB | `src/database/repositories/*.ts` (same set) |

Both platforms run the **same** migrations, repositories, and `DatabaseHandle` interface.
The engine is resolved by platform in `src/database/engine.ts` (native → `openDatabaseSync`)
and `src/database/engine.web.ts` (web → `SqlJsDatabase` + IndexedDB storage); there is no
platform fork of the repository layer.

### IndexedDB limits

- **Typical quota**: ~50 MB+ per origin (browser-dependent, far above the old 5 MB
  `localStorage` ceiling).
- **Persistence**: the engine writes the exported SQLite bytes once per committed
  transaction.
- **Impact**: photos would now be viable on web, but that remains out of scope; the photo
  feature stays hidden on web (unchanged decision).

---

## Feature availability matrix

| Feature | iOS / Android | Web | Rationale |
|---------|--------------|-----|-----------|
| SQLite storage | ✅ | ✅ | Native: `expo-sqlite`; web: sql.js WASM persisted to IndexedDB (same schema, migrations and repos) |
| Camera / gallery (photo) | ✅ | ❌ | `expo-image-picker` is native-only; photo on web still out of scope |
| Photo section in Add/Modify | ✅ | ❌ | Hidden via `Platform.OS !== 'web'` |
| Photo setting checkbox | ✅ | ❌ | Hidden in PersonalizationScreen |
| Photo row in Transaction Details | ✅ | ❌ | Hidden via platform guard |
| File system (copy/cache) | ✅ | ❌ | `expo-file-system` for URI persistence |
| Flag icons (emoji) | ✅ | ❌ | Web uses SVG flags (`FLAG_WEB`) instead of emoji |
| Keyboard spacer (Android) | ✅ (Android) | ❌ | Android-specific `keyboardVerticalOffset` spacer |
| Theme picker (system) | ✅ | ❌ (system option hidden) | Web has no "system" theme concept |
| Data reset (full reseed) | ✅ | ✅ | Single path: `resetDatabase()` reseeds on all platforms |
| Notifications / haptics | Planned | ❌ | Native-only APIs, not yet implemented |

---

## Platform guard conventions

### Pattern

```tsx
import { Platform } from 'react-native';

// Hide entire section on web
{Platform.OS !== 'web' && <PhotoSection />}

// Web-specific fallback (e.g., flag icons use SVG on web instead of emoji)
if (Platform.OS === 'web') {
  // FLAG_WEB SVG rendering
} else {
  // emoji rendering
}

// Android-only spacer
{Platform.OS === 'android' && <View style={styles.keyboardSpacer} />}
```

### Rules

1. **Use `Platform.OS !== 'web'`** to hide native-only UI (camera, photo section, notifications).
2. **Use `Platform.OS === 'web'`** to render web-specific fallbacks (e.g., SVG flags). Storage logic no longer branches by platform — both use the same `DatabaseHandle`.
3. **Use `Platform.OS === 'android'`** only for Android-specific layout adjustments (keyboard spacer).
4. **Never assume a feature is web-available** without checking the quota/storage implications.
5. **Document every guard** in this file when adding a new platform-dependent feature.

---

## Photo feature decision (Feature 023)

| Aspect | Decision |
|--------|----------|
| **Why hidden on web** | Photo on web is out of scope (IndexedDB now has the quota for it; revisit later) |
| **Native behavior** | Camera or gallery via `expo-image-picker`; file copied to `documentDirectory` via `expo-file-system` for persistence |
| **Storage on native** | File URI stored in `transactions.photo` column (TEXT, nullable) |
| **Cleanup** | File deleted from disk on transaction delete, photo replace, or manual remove |
| **Setting** | `add_show_photo` config key controls section visibility; checkbox hidden on web too |
| **Future consideration** | Photo on web may become viable now that web storage runs on IndexedDB (sql.js engine) |

---

## Adding a new platform-dependent feature

Before merging any feature with platform guards:

1. **Check this file** — is the API available on all target platforms?
2. **Update the matrix** — add a row with status and rationale.
3. **Add the guard** — use the conventions above.
4. **Update the spec** — the feature's `1-spec.md` must state platform scope explicitly.
5. **Test both paths** — verify on native AND web (even if just confirming the element is hidden).
