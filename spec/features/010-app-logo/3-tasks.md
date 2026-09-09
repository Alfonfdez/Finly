# Tasks — 010 App logo
Execution order. Check off each task when completed.

---

### Phase 1 — Asset generation

[x] T1 — Export/create the 6 PNG files from the original logo design:
  - `icon.png` (1024×1024)
  - `android-icon-foreground.png` (1024×1024)
  - `android-icon-background.png` (1024×1024, solid color)
  - `android-icon-monochrome.png` (1024×1024, monochrome)
  - `favicon.png` (48×48)
  - `splash-icon.png` (1284×2778)

[x] T2 — Copy the 6 files to `FinlyApp/assets/`, overwriting the existing ones.

---

### Phase 2 — Configuration

[x] T3 — Update `FinlyApp/app.json`:
  - Verify that `expo.icon`, `expo.android.adaptiveIcon` and `expo.web.favicon` point to the correct files.
  - Add `expo.splash` section with `image`, `resizeMode: "contain"` and `backgroundColor`.

[x] T3c — Update `App.tsx`:
  - Create `SplashScreen` component with logo (80×80, borderRadius 20), "Finly" text (primary color, fontWeight 800) and linear progress bar.
  - Entrance animation: logo fade-in (800ms) + spring scale-up, text fade-in (600ms) with 500ms delay.
  - Progress bar: 120px × 2px, gray track, cyan fill, fills at 80% of the minimum time.
  - Exit animation: fade-out + scale-up (400ms) before showing the app.
  - MIN_SPLASH_MS = 3000ms. Replace the two `loading` blocks with `<SplashScreen />`.

[x] T3b — Update `src/navigation/AppNavigator.tsx`:
  - Add `Image` import from `react-native`.
  - Add `<Image source={require('../../assets/icon.png')}>` in the drawer header alongside the text "Finly".
  - Add `drawerLogo` style (36×36, borderRadius 10).
  - FlexDirection row, alignItems center, gap 12 in `drawerHeader`.

---

### Verification

[ ] T4 — Visual verification:
  - `npx expo start --web`: check favicon in tab and splash on load.
  - `npx expo start`: check icon in Expo Go and splash screen on app launch.
  - On Android: verify that the adaptive icon renders correctly (foreground + background).
