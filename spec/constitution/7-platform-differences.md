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
- **Persistence**: the engine writes the exported SQLite bytes after committed
  transactions, coalescing pending snapshots (retried once on failure). A final failure
  shows a one-time alert so the user can export a backup; it does not reject the already
  committed SQLite operation or roll back UI state. `flush()` waits for the queue.
- **Fail closed:** an IndexedDB open/read error aborts startup (the app shows the DB
  error) instead of booting an empty database that would overwrite the unreadable data.
  A rejected WASM init promise and closed/blocked IndexedDB handles are reset so a retry
  can reopen them.
- **Single tab:** each tab holds the full snapshot and last writer wins. The app holds a Web Locks `finly-db` lock for its lifetime; a second tab is blocked with a Try again action until the first closes. A retry from the owning tab stays acquired instead of reporting itself blocked. Older browsers without Web Locks keep the previous single-tab behaviour.
- **Impact**: photos are viable on web (feature 024). Picked images are stored as base64
  data URIs in the `transactions.photo` column, which the engine persists to IndexedDB —
  no separate blob store needed at the app's scale (max 3 photos, `quality: 0.7`).

---

## Feature availability matrix

| Feature | iOS / Android | Web | Rationale |
|---------|--------------|-----|-----------|
| SQLite storage | ✅ | ✅ | Native: `expo-sqlite`; web: sql.js WASM persisted to IndexedDB (same schema, migrations and repos) |
| Camera / gallery (photo) | ✅ | ⚠️ gallery only | `expo-image-picker` web opens a file picker; camera capture (`capture="camera"`) is native-only |
| Photo section in Add/Modify | ✅ | ✅ | Rendered on all platforms when `config.addShowPhoto` is true |
| Photo setting checkbox | ✅ | ✅ | Visible in PersonalizationScreen on all platforms |
| Photo row in Transaction Details | ✅ | ✅ | Rendered on all platforms; base64 data URIs render in react-native-web |
| Photo persistence | ✅ file URI | ✅ data URI in DB | Native: copied to `documentDirectory`; web: base64 in `transactions.photo` column (survives reloads via sql.js/IndexedDB) |
| File system (copy/cache) | ✅ | ❌ | `expo-file-system` for URI persistence |
| Flag icons (emoji) | ✅ | ❌ | Web uses SVG flags (`FLAG_WEB`) instead of emoji |
| Keyboard spacer (Android) | ✅ (Android) | ❌ | Android-specific `keyboardVerticalOffset` spacer |
| Theme picker (system) | ✅ | ❌ (system option hidden) | Web has no "system" theme concept |
| Data reset (full reseed) | ✅ | ✅ | Single path: `resetDatabase()` reseeds on all platforms |
| Data export / import (backup) | ✅ | ✅ | Same JSON snapshot format on all platforms. Android: saved to the public Downloads folder (`MediaStore` via the local `finly-share` module) with an optional Share sheet opened on demand (share outcome is not reported, since Android targets return no reliable result). iOS: written to `documentDirectory` and shared via the `finly-share` share sheet (truthful outcome). Import via `expo-document-picker`. Web: browser download (`Blob` + `<a download>`) and file-input import (`FileReader`) |
| Recurring transactions (rules + materialization) | ✅ | ✅ | Rules stored and materialized through the shared `DatabaseHandle` on both engines; reconciliation runs on app start, on foreground and via a midnight timer while the app is open |
| Recurring catch-up while the app is closed | ❌ (v1) | ❌ | No OS background task in v1; a closed app materializes every missed occurrence on the next open |
| Notifications / haptics | Planned | ❌ | Native-only APIs, not yet implemented |

---

### Recurring transactions (feature 028)

| Aspect | Decision |
|--------|----------|
| **Storage** | Rules in `recurring_rules` / `recurring_rule_tags` on the shared engine (native + web); generated transactions carry `recurring_rule_id` + `recurrence_date` |
| **Materialization trigger** | App start (`AppContext` after DB init), `AppState` → `active` on foreground, and a `setTimeout` scheduled to the next due instant while the app is open — all platforms |
| **Closed-app execution** | Out of scope for v1: no `expo-background-task` / `expo-task-manager`. A closed app back-fills every missed occurrence on the next open, each dated on its real scheduled day |
| **Idempotency** | Partial unique index on `(recurring_rule_id, recurrence_date)`; reconciliation is transactional and bounded per rule |
| **Web nuance** | react-native-web maps `AppState` to page visibility; the midnight timer runs while the tab stays open |
| **Native-only verification** | AppState background/foreground transitions on a real device are reported as "not checkable on web"; the web loop covers creation, catch-up, edit scope, pause/delete and backup round-trip |

---

## Platform guard conventions

### Pattern

Platform checks are centralized in `src/utils/platform.ts` (`isWeb`, `isNative`, `isIOS`, `isAndroid`) — prefer these over `Platform.OS` directly.

```tsx
import { isWeb, isAndroid } from '../utils/platform';

// Hide native-only UI on web (camera capture, notifications)
{!isWeb && <CameraButton />}

// Web-specific fallback (e.g., flag icons use SVG on web instead of emoji)
if (isWeb) {
  // FLAG_WEB SVG rendering
} else {
  // emoji rendering
}

// Android-only layout adjustment
{isAndroid && <View style={styles.keyboardSpacer} />}
```

### Rules

1. **Use `!isWeb`** to hide native-only UI (camera capture, notifications).
2. **Use `isWeb`** to render web-specific fallbacks (e.g., SVG flags). Storage logic no longer branches by platform — both use the same `DatabaseHandle`.
3. **Use `isAndroid`** only for Android-specific layout adjustments (keyboard spacer).
4. **Never assume a feature is web-available** without checking the quota/storage implications.
5. **Document every guard** in this file when adding a new platform-dependent feature.
6. **Overflow on web** — never hide a scroll indicator on web (the visible scrollbar is the mouse affordance; the wheel cannot scroll horizontal overflow). Suppress indicators only on native via `{isWeb}`. See "Scrolling" below.

### Scrolling (native vs web)

Scrolling works differently by platform, and every overflowing scroller must stay usable on both:

| | Native (iOS/Android) | Web (react-native-web) |
|---|---|---|
| **How you scroll** | Touch drag | Mouse wheel, trackpad, or dragging the scrollbar |
| **Scrollbar** | Not persistent — RN flashes the indicator while scrolling, and hides it entirely when the app sets `shows*ScrollIndicator={false}` | Always rendered by the browser, styled globally (6px, primary-tinted) by `ConfigContext` |
| **Vertical overflow without a scrollbar** | Reachable (drag) | Reachable (the wheel still scrolls) |
| **Horizontal overflow without a scrollbar** | Reachable (drag) | **Not reachable** — the wheel scrolls vertically; only the scrollbar (or shift+wheel) moves sideways |

Ruling:

1. **Never hide a scroll indicator on web.** If you suppress it, do it only on native: `showsHorizontalScrollIndicator={isWeb}` / `showsVerticalScrollIndicator={isWeb}` (`src/utils/platform.ts`). On web the visible scrollbar is the mouse affordance for overflow.
2. **Horizontal scrollers must show the scrollbar on web** (the wheel cannot scroll them); vertical scrollers are safe either way.
3. For horizontal rows, add a web-only content `paddingBottom` (~8px) so the 6px scrollbar has room.
4. Reference implementations: `TagFilterBar` and the transaction-list controls rows (All transactions, Transactions).

---

## Photo feature decision (Features 023 + 024)

| Aspect | Decision |
|--------|----------|
| **Native (023)** | Camera or gallery via `expo-image-picker`; file copied to `documentDirectory` via `expo-file-system` for persistence |
| **Web (024)** | Gallery/file-picker only (camera stays native-only). Picked image read as a base64 data URI (`FileReader`) and stored in `transactions.photo`; persisted via the sql.js/IndexedDB engine, so it survives reloads |
| **Storage** | Native: file URI in `transactions.photo` (TEXT, nullable, JSON array). Web: data URIs in the same column |
| **Cleanup** | Native: file deleted from disk only when no remaining transaction references the URI. Web: `deletePhotoFile` no-ops on `data:` URIs — removal happens by deleting the string/row |
| **Setting** | `add_show_photo` config key controls section visibility on all platforms |
| **Camera on web** | Out of scope: `capture="camera"` only works on mobile browsers and cannot be verified in a desktop browser at 375px |

---

## App data and OS-level backup

| Platform | Behaviour |
|----------|-----------|
| Android | **OS auto-backup is disabled** (`expo.android.allowBackup: false` in `app.json`; prebuild emits `android:allowBackup="false"` in the packaged manifest). The database lives in the app's private folder (`files/SQLite/Finly.db`), so with Android's default `allowBackup="true"` the OS cloud backup copied it and **restored it when the app was installed again** — including a snapshot older than an in-app Factory Reset, which resurrected deleted accounts, rules, tags and transactions. `false` disables cloud backup and restore (and `adb backup`); device-to-device transfer on API 31+ is out of scope (it only happens when migrating to a new phone). |
| iOS | No equivalent flag: reinstalling an app never restores its data (only a full device restore does), so the container stays untouched. |
| Web | The data lives in the browser origin's IndexedDB; the app has no control over it. |

Data is moved between installs or devices **only** through the in-app JSON export/import (feature 025).

---

## Adding a new platform-dependent feature

Before merging any feature with platform guards:

1. **Check this file** — is the API available on all target platforms?
2. **Update the matrix** — add a row with status and rationale.
3. **Add the guard** — use the conventions above.
4. **Update the spec** — the feature's `1-spec.md` must state platform scope explicitly.
5. **Test both paths** — verify on native AND web (even if just confirming the element is hidden).
