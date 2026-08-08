# Finly

[Español](README.es.md) · [Català](README.ca.md)

A personal finance app for tracking income and expenses with multiple accounts, customizable categories, period filters, and visual charts.

![App preview](images/excalidraw/Finly_v2.png)

## Methodology

**Specification-Driven Development (SDD).** Specs live in `spec/` and are the single source of truth. What to build is defined first, then implemented.

## Stack

| Layer | Technology |
|---|---|
| Framework | React Native with Expo (SDK 54) |
| Language | TypeScript |
| Navigation | React Navigation (Stack + Drawer) |
| Icons | @expo/vector-icons (Ionicons) |
| Charts | react-native-svg |
| Color picker | reanimated-color-picker |
| Persistence | SQLite (expo-sqlite) on native, sql.js (WASM) + IndexedDB on web |
| Web | react-native-web |
| State | Context API (AppContext + ConfigContext) |
| i18n | Custom system (English, Spanish, Catalan) |

## Getting Started

### Requirements

- Node.js 18+
- npm
- Expo Go (free mobile app) to preview on your phone

### First time after cloning

```bash
cd FinlyApp
npm install
npx expo start
```

This starts Metro Bundler. Then:

| To view on… | Do this |
|---|---|
| **Browser** | Open [http://localhost:8081](http://localhost:8081) or run `npx expo start --web` |
| **Mobile (Expo Go)** | Press **`s`** in the terminal and scan the QR code with Expo Go |

> If `expo` is not recognized as a command, use `npx expo ...` or `npm run web`.

### Important notes

- This project uses **Expo SDK 54** for Expo Go compatibility. Do not update the SDK or run `npm audit fix --force` (it breaks versions).
- If scanning the QR code in Expo Go does nothing, make sure you pressed **`s`** to switch to Expo Go mode (the message should say "Scan the QR code to open in Expo Go").
- If you get a `TurboModule method "installTurboModule"` error, run:
  ```bash
  npx expo install react-native-worklets@0.5.1
  ```

### Other commands

| Command | Description |
|---|---|
| `npm start` | Start Expo in dev mode |
| `npm run web` | Start and open in browser |
| `npm run android` | Start on Android emulator |
| `npm run ios` | Start on iOS simulator (macOS only) |

### USB Development (no shared network)

Useful when PC and phone are not on the same network (e.g., in class).

**Prerequisites:**
- Enable USB debugging on the phone: Settings → About phone → tap "Build number" 7 times → Settings → Developer options → enable "USB debugging"
- Download `adb` (Android Debug Bridge):
  ```bash
  Invoke-WebRequest -Uri "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -OutFile "$env:TEMP\platform-tools.zip"
  Expand-Archive -Path "$env:TEMP\platform-tools.zip" -DestinationPath "C:\platform-tools" -Force
  ```
- Restart the terminal after installation for `adb` to be available globally.

**Steps:**
1. Connect the phone to the PC via USB
2. Forward the port with adb:
   ```bash
   C:\platform-tools\adb.exe reverse tcp:8081 tcp:8081
   ```
3. Start Expo:
   ```bash
   npx expo start
   ```
4. In Expo Go: shake the phone → "Enter URL manually" → type:
   ```
   exp://localhost:8081
   ```

### USB Tethering Development (no ADB, no shared network)

Alternative when ADB does not detect the phone (e.g., drivers not installed, cable without data).

**Requirement:** Mobile data active on the phone.

**Steps:**
1. Connect the phone to the PC via USB
2. On the phone: **Settings → Connections → Mobile Hotspot and Tethering → enable "USB tethering"**
3. On the PC, start Expo:
   ```bash
   npx expo start
   ```
4. Press **`s`** to switch to Expo Go mode and scan the QR code

The PC browses through the phone's data, so both devices are on the same virtual network. No ADB or `adb reverse` required.

### Tunnel Development (no shared network, no cable)

```bash
npx expo start --tunnel
```
Requires `@expo/ngrok` installed globally (`npm install -g @expo/ngrok`). Works from any network but is slower.

## Generating an Android APK

To build an installable APK for phones without Expo Go, use **EAS Build** (Expo Application Services).

### Requirements

- Free account at [expo.dev](https://expo.dev)
- Install EAS CLI:
  ```bash
  npm install -g eas-cli
  ```
- Log in:
  ```bash
  eas login
  ```

### Build the APK

```bash
cd FinlyApp
eas build --platform android --profile preview
```

The `preview` profile in `eas.json` is configured with `"distribution": "internal"`, which generates an **APK** (instead of AAB). The process takes a few minutes in the cloud.

When done, EAS returns a **download link**. Open it from the phone to download the APK.

### Install the APK on the phone

1. Download the `.apk` file from the EAS link
2. Open it from the phone's file manager
3. If prompted, enable **"Install from unknown sources"** in Settings → Security
4. Open the app from the app drawer

### Notes

- The `preview` APK is for **internal testing**, not for publishing on Google Play.
- To publish on Google Play, you need a `production` profile with AAB: `eas build --platform android --profile production`.
- The app uses **native SQLite** on Android. Data is not shared between the APK and Expo Go (each has its own database).
- If the APK shows a black screen on launch, check that database migrations do not fail. Errors are displayed on screen during development.

## Features

- Multiple account management (create, edit, delete)
- Income and expense tracking by category
- Custom category listing and editing with icon and color
- Period filters: Day, Week, Month, Year, Custom period
- Interactive date selector (DateTimePicker)
- Donut chart and horizontal stacked bar chart
- Category breakdown with percentages
- Reusable account selector with balance calculation
- Transaction sorting by date or amount
- All transactions screen with combined filters
- Transaction details screen with delete and edit
- Modify transaction screen with preloaded data
- Settings screen: theme, currency, language, calendar, text size
- Dark and light theme with real-time switching
- Multilingual support: Spanish, English, Catalan
- Text scaling based on user preferences
- Drawer navigation
- Built-in basic calculator

## Screenshots

![App flow](images/screenshots/app-flow.gif)<br>*Full app walkthrough: home screen, drawer menu, transactions, settings, and more.*<br><br>

![Splash animation](images/screenshots/000-Splash_animation.png)<br>*Loading animation with the Finly logo and progress bar.*<br><br>
![Home screen](images/screenshots/001-Home_screen.png)<br>*Home screen with account selector, total balance, donut chart, and category breakdown.*<br><br>
![Hamburger menu](images/screenshots/002-Hamburguer-menu.png)<br>*Drawer menu with access to Home, Settings, Transactions, Categories, and Accounts.*<br><br>
![Account selector modal](images/screenshots/003-Choose_accounts.png)<br>*Account selection modal with icon, name, and available balance.*<br><br>
![Add transaction](images/screenshots/004-Add_transaction.png)<br>*Form to add an expense or income with amount, account, categories, day, tags, and comment.*<br><br>
![Create category](images/screenshots/005-Create_category.png)<br>*Screen to create a custom category with icon, color, and name.*<br><br>
![Categories list](images/screenshots/006-Categories.png)<br>*Category listing organized by type (expenses/income) in a 4×N grid.*<br><br>
![All transactions](images/screenshots/007-All_transactions.png)<br>*Full transaction list with account selector, sorting, and day grouping.*<br><br>
![Settings](images/screenshots/008-Settings.png)<br>*Settings screen with theme, currency, language, text size, and icon shape configuration.*<br><br>
![Calendar period selection](images/screenshots/009-calendar_period_selection.png)<br>*Custom period selector with calendar for choosing a date range.*
