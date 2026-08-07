---
name: verification-loop
description: Browser verification loop (Playwright MCP) against a feature's acceptance criteria in its spec. Use whenever a task says "verification" or when all tasks of a feature are complete.
---
The loop:

1. Read the acceptance criteria from the 1-spec.md of the active feature.
2. Run `npm run test:all` (from FinlyApp/) first. If it is not green, stop and fix it before doing any browser work.
3. Boot the web app: start `npx expo start --web` (from FinlyApp/) in the background and wait until `http://localhost:8081` responds with HTML. Use a fresh browser context.
4. Open `http://localhost:8081` with the Playwright MCP.
5. Check the criteria one by one by interacting for real: type in fields, press buttons, inspect the DOM and resulting styles.
6. If a criterion fails: fix the code and re-check that criterion (and any others the change may affect).
7. Finish when all criteria pass. If the same criterion fails after 3 attempts, stop and explain what is blocking — do not keep iterating blindly.
8. Close the browser and terminate the Expo dev server you started.

When done, report the checklist criterion by criterion with [] or [x] and a comment if needed. If everything passes, mark the verification task as done.

Rules:
- Criteria live in the spec: do not invent, skip, or reinterpret them. If one cannot be checked, say so.
- The web build persists data in localStorage. Before each feature run, clear localStorage (or start from a fresh browser context) so state from previous checks never leaks into the next one.
- When a criterion mentions responsive or mobile, check it with the viewport at 375px (or 1280px for large screens).
- Criteria that only make sense on a native device (camera/photo capture, native pickers, file system access) are reported as "not checkable on web" — never silently marked done.
- Do not mark any feature as closed (or the verification task as done) with any criterion pending.

Expo web specifics:
- The dev server is `npx expo start --web` on port 8081 (`npm run web` is an alias). Start it in the background, poll the URL until it serves HTML, and kill exactly the process you started (or free port 8081) when finished. Do not leave it running between verifications.
- First paint can be slow on web (Metro bundling). After navigating, wait for the UI element you assert on instead of relying on fixed sleeps.
- The web build persists data in localStorage, so a "fresh install" means a cleared localStorage before the run.

## Mobile mode (Android emulator via Maestro)

For native-only criteria (camera/photo capture, native pickers, file system) and for
native parity checks, run the **Maestro** flows in `FinlyApp/.maestro/` instead of (or in
addition to) the web loop:

1. Boot the emulator: `emulator -avd finly_test` (Pixel 7, API 35). Wait for
   `adb shell getprop sys.boot_completed` to return `1`.
2. Build/install the dev-client APK if needed: `cd FinlyApp && npx expo run:android`
   (or install the existing `android/app/build/outputs/apk/debug/app-debug.apk` with
   `adb install -r`). The dev-client package id is `com.anonymous.FinlyApp`.
3. Start the dev server: `npx expo start` (port 8081). Set up the tunnel:
   `adb reverse tcp:8081 tcp:8081`.
4. The dev-client does NOT register the `exp://` scheme, so flows launch the activity
   directly via the `helpers/state-reset.yaml` subflow (`launchApp` + `clearState`), which
   also resets the SQLite DB to the seeded state before each run.
5. Run a flow: `maestro test FinlyApp/.maestro/<flow>.yaml`. Available flows:
   `flow-smoke`, `flow-004-add-transaction`, `flow-007-amount-calculator`,
   `flow-008-categories`, `flow-015-all-transactions`, `flow-016-transaction-details`,
   `flow-017-modify-transaction`, `flow-021-category-filter`, `flow-022-total-account`,
   `flow-023-photo-attachment` (all prefixed with a state reset).
6. Camera capture and gallery picking open system UIs Maestro cannot drive reliably on an
   emulator; `flow-023` verifies those criteria at the modal level and the full capture
   path is reported "not automatable on emulator".

Rules for mobile: same as the web loop — criteria live in the spec, never mark a criterion
done that the flow could not actually exercise, and keep `npm run test:all` green.

