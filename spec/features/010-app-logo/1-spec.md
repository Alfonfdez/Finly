# 010 — App logo (application icon)

- **Objective**
  Replace the generic Expo icons with the custom Finly logo in all formats and platforms: app icon (iOS/Android), adaptive icon (Android), favicon (web), splash screen and drawer header.

---

## Functional requirements

### 1. Format and dimensions

- The original logo is provided in an editable format (PNG or SVG).
- From the original, 6 PNG files are generated in `FinlyApp/assets/`:

| File | Dimensions (px) | Usage |
|---|---|---|
| `icon.png` | 1024 × 1024 | Main app icon (iOS home screen, Android non-adaptive, Expo manifest) |
| `android-icon-foreground.png` | 1024 × 1024 | Foreground layer of the Android adaptive icon |
| `android-icon-background.png` | 1024 × 1024 | Background layer of the Android adaptive icon (solid color) |
| `android-icon-monochrome.png` | 1024 × 1024 | Monochrome version for Android themed icons (API 33+) |
| `favicon.png` | 1024 × 1024 | Browser tab icon (Expo downsizes to 16/32/48 px at export) |
| `splash-icon.png` | 1024 × 1024 | Central icon of the splash screen (square; centered via `contain`) |

> Note: `splash-icon.png` is automatically centered on a colored background. The background color is configured in `app.json`.

### 2. Logo design

- **Icon**: The logo must be recognizable even at small sizes (48 px).
- **Adaptive background**: `android-icon-background.png` must be a solid color that contrasts with the foreground.
- **Monochrome**: `android-icon-monochrome.png` must be a single-color version (white on transparent background) that maintains the recognizable silhouette.
- **Splash**: The centered icon on the splash screen must be the same as `icon.png` or a simplified version.

### 3. Configuration in app.json

- `expo.icon` → `"./assets/icon.png"`
- `expo.android.adaptiveIcon.foregroundImage` → `"./assets/android-icon-foreground.png"`
- `expo.android.adaptiveIcon.backgroundImage` → `"./assets/android-icon-background.png"`
- `expo.android.adaptiveIcon.monochromeImage` → `"./assets/android-icon-monochrome.png"`
- `expo.web.favicon` → `"./assets/favicon.png"`
- `expo.splash`:
  - `image` → `"./assets/splash-icon.png"`
  - `resizeMode` → `"contain"`
  - `backgroundColor` → background color that matches the logo design.
  - Note: the splash in `app.json` only works natively (Expo Go / builds). On web, a custom component is used (`SplashScreen` in `App.tsx`).

### 3b. Web splash screen

- On web, the native Expo splash does not work. A `SplashScreen` component is implemented in `App.tsx` that is displayed only while the database initializes.
- The component shows:
  - Logo (`icon.png`) centered, 80×80 px, borderRadius 20.
- **Animations**:
  - **Logo entrance**: fade-in (800ms) + spring scale-up (0.8 → 1.0, friction 5, tension 60).
  - **Exit**: fade-out + scale-up (1.0 → 1.1) in 400ms when the app is ready.
- Background: #0F172A (same as the dark theme).
- The splash is duration-driven: it exits as soon as the database is ready (`initDatabase` resolves). There is no artificial minimum hold time, no progress bar, and no text on the splash.

### 4. Drawer header

- The Drawer header (in `AppNavigator.tsx`) displays the logo (`icon.png`) on the left and the text "Finly" on the right, in a centered horizontal row.
- The logo is displayed at 36×36 px with rounded corners (borderRadius 10).

---

## Non-functional requirements

- **Format**: All files must be PNG with transparent background where applicable.
- **Quality**: No visible quality loss. Use PNG-24 or PNG-32.
- **Compatibility**: The files must be readable by Expo's build system (EAS Build and expo publish).
- **Size**: Each file must not exceed 1 MB.

---

## Acceptance criteria

- [ ] `assets/icon.png` is displayed as the app icon on the device home screen (iOS and Android).
- [ ] `assets/android-icon-foreground.png` + `assets/android-icon-background.png` form the adaptive icon correctly on Android 8+.
- [ ] `assets/android-icon-monochrome.png` is displayed correctly on Android devices with themed icons (API 33+).
- [x] `assets/favicon.png` is displayed in the browser tab when opening the app on web.
- [ ] `assets/splash-icon.png` appears centered on the splash screen when launching the app.
- [ ] The native splash screen (app.json) is displayed when launching the app natively (Expo Go).
- [x] On web, the SplashScreen component with the logo is displayed while the app loads and exits as soon as the app is ready (no artificial delay, no progress bar).
- [x] All files are correctly referenced in `app.json`.
- [x] The drawer header displays the logo (icon.png) alongside the text "Finly".
- [x] The favicon is displayed in the browser tab (may require clearing `dist/` and restarting the server).
