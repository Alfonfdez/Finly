# Implementation plan — 010 App logo

## Architecture

### Assets (no structural changes)

Only the existing files in `FinlyApp/assets/` are replaced:

```
FinlyApp/assets/
├── icon.png                  ← Replace (1024×1024)
├── android-icon-foreground.png ← Replace (1024×1024)
├── android-icon-background.png ← Replace (1024×1024, solid color)
├── android-icon-monochrome.png ← Replace (1024×1024, monochrome)
├── favicon.png               ← Replace (48×48)
└── splash-icon.png           ← Replace (1284×2778)
```

### Modified files

- **`app.json`**: Add `expo.splash` section with `image`, `resizeMode` and `backgroundColor`.
- **`FinlyApp/assets/*`**: Replace the 6 PNG files.
- **`src/navigation/AppNavigator.tsx`**: Add logo (Image) in the Drawer header alongside the text "Finly".
- **`App.tsx`**: Add `SplashScreen` component with logo + text + loader, and replace the previous loading state.

---

## Workflow

1. Design/export the logo from the design tool (Figma, Illustrator, etc.).
2. Generate the 6 PNGs with the exact dimensions.
3. Copy the files to `FinlyApp/assets/` overwriting the existing ones.
4. Update `app.json` with the splash configuration.
5. Verify on web (`npx expo start --web`) that favicon and splash look correct.
6. Verify on mobile (Expo Go) that the app icon and splash look correct.

---

## Estimate

- **Tasks**: 4 tasks in 2 phases
- **Estimated time**: 30-60 min (depending on the design tool)
