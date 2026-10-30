# Assets — Finly

All image assets live in `FinlyApp/assets/`. Expo reads them from `app.json` and uses them across platforms.

## Asset reference

| File | Purpose | Dimensions | Safe zone / Notes |
|---|---|---|---|
| `icon.png` | Primary app icon (iOS home screen, Android non-adaptive, Expo manifest) | 1024 × 1024 px | Full square, do not add rounded corners — the OS applies its own mask. Glyph on a flat `#FFFFFF` background |
| `android-icon-background.png` | Bottom layer of Android adaptive icon | 1024 × 1024 px | Full bleed. Flat `#FFFFFF` (matches `android.adaptiveIcon.backgroundColor`) |
| `android-icon-foreground.png` | Top layer of Android adaptive icon | 1024 × 1024 px | Transparent background, glyph centered in a 500 px box inside the **675 × 675 px** safe zone (Android crops edges) |
| `android-icon-monochrome.png` | Android 13+ Material You wallpaper-themed icon | 1024 × 1024 px | Single-color white glyph on transparent background, inside the center **675 × 675 px** safe zone |
| `favicon.png` | Browser tab icon (web / PWA) | 1024 × 1024 px (Expo downsizes at export) | Same artwork as `icon.png` |
| `splash-icon.png` | Centered logo during app boot (native splash) | 1024 × 1024 px | Transparent background, Finly glyph only (no text), ~760 px tall, centered. Background color configured in `app.json` |

## app.json mapping

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundColor": "#FFFFFF",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@react-native-community/datetimepicker",
      "expo-sqlite",
      [
        "expo-splash-screen",
        {
          "image": "./assets/splash-icon.png",
          "resizeMode": "contain",
          "backgroundColor": "#0F172A"
        }
      ],
      "expo-sharing"
    ]
  }
}
```

## Format requirements

- **Format**: PNG with transparent background where applicable.
- **Quality**: PNG-24 or PNG-32, no visible quality loss.
- **Size**: Each file must not exceed 1 MB.
- **Compatibility**: Files must be readable by Expo's build system (EAS Build and expo publish).

## Regenerating branded PNGs

All six PNGs are derived from `assets/splash-icon.png` by
`FinlyApp/scripts/gen-finly-assets.mjs` (uses `sharp`, a devDependency).
`splash-icon.png` is the source of truth for the mark — the transparent glyph. The generator
trims it to its alpha bounds and composites it centered, so re-running is idempotent:

- `icon.png` — glyph in a 634 px box on a flat `#FFFFFF` background (opaque).
- `favicon.png` — a copy of `icon.png` (Expo downsizes it at export).
- `android-icon-background.png` — flat `#FFFFFF`, full bleed (the Android launcher background).
- `android-icon-foreground.png` — glyph within a 500 px box (safely inside the 675 px safe zone), transparent canvas.
- `android-icon-monochrome.png` — same silhouette filled solid white, transparent canvas.
- `splash-icon.png` — glyph within a 760 px box, transparent canvas (idempotent re-place).

Run it inside `FinlyApp/`:

```bash
node scripts/gen-finly-assets.mjs
# preview into another folder without touching assets/:
node scripts/gen-finly-assets.mjs --out ../tmp-assets
```

Outputs are palette-quantized where they carry a gradient and validated at 1024 × 1024 under
the 1 MB cap. After changing `assets/`, run
`npx expo prebuild --platform android` before the next native build, otherwise the APK keeps
the stale icons/splash.

## Web splash screen

The native Expo splash (`expo-splash-screen` plugin in `app.json`) only works on native builds. On web, an in-app `SplashScreen` component in `App.tsx` handles the loading screen:

- Logo (`icon.png`) centered, 80 × 80 px, borderRadius 20.
- Background: `#0F172A`.
- Logo fades in and springs to scale on mount; the screen exits with a 400 ms fade/scale-out once the database is ready.
