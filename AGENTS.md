# AGENTS.md — Finly
- Project built using Specification-Driven Development (SDD). The spec/ folder is the single source of truth.

## IMPORTANT RULES
- Apply project skills (.agents/skills/).
- If asked about the code, only respond: take no action and make no changes.
- Do not paint code in the terminal while generating code.
- Work only within that folder.
- English content, English code.
- The agent always communicates in English.
- If asked for a commit message, the agent only returns the summary in standard git format. Never executes commit, push, pull, or fetch — the developer does it manually.

## TECH STACK
- React Native 0.81.5 + Expo SDK 54
- TypeScript 5.9
- React Navigation 7 (Drawer + Native Stack)
- SQLite (native) / sql.js WASM (web)
- react-native-svg, reanimated-color-picker
- Context API for global state
- Platforms: iOS, Android, Web (web runs the same SQLite schema via sql.js WASM, persisted to IndexedDB)

## ENVIRONMENT
- Host: Windows, PowerShell 5.1 shell. There is NO ripgrep in the shell — use the grep/glob/read tools for searching.
- Web verification uses the Playwright MCP browser against the Expo web dev server at `http://localhost:8081`.
- Dev-server lifecycle: start `npx expo start --web` (port 8081) in the background, poll the URL until it serves HTML, and always terminate it when done (free port 8081). Concrete commands are in `docs/harnesses.md` and the `verification-loop` skill.

## GIT WORKFLOW
- `main` — stable releases only, merged from `develop`
- `develop` — active development branch
- Feature branches: `feature/NNN-description` off `develop`, merge back via PR
- Never commit directly to `main`
- The agent always suggests a branch name for each implementation (e.g., `fix/db-cleanup-bugs`, `feature/018-transactions-filter`)
- The agent never creates or switches branches — the developer does. If the developer explicitly says "do not create a branch" for a task, follow that instruction.

## COMMIT CONVENTION
Conventional Commits format:
```
<type>(<scope>): <description>
```
Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
- Scope is optional (e.g., `feat(accounts):`, `fix(home):`)
- Description in English, imperative mood, lowercase, no period
- Max 50 chars for subject line

## RUN
```bash
cd FinlyApp
npx expo start
```

## LINT
```bash
npx expo lint
```

## VERIFICATION
- A change is only "done" when `npm run test:all` passes (typecheck + lint + tests).
- Changes to `src/utils/` or `src/database/` logic must include or update tests (Phase A/B harnesses).
- A feature's "verification" task is done only via the `verification-loop` skill: run `test:all`, boot `npx expo start --web`, then check the spec's acceptance criteria in a real browser (viewport 375px for mobile criteria).
- Criteria that cannot be checked on web (e.g. camera capture) are reported as "not checkable on web", never marked done. Web photo *gallery* picking IS checkable (file picker → base64 data URI in the sql.js/IndexedDB DB); only camera capture stays native-only.
- Spec-docs convention: a code change updates only `spec/features/<NNN>/1-spec.md` (requirement bullets) + `spec/constitution/3-roadmap.md` (entry + Status), and flips the feature's acceptance criteria `[ ]` → `[x]` after verification. Never edit `2-plan.md` or `3-tasks.md` for feature updates.

## DATABASE
- 3 idempotent migrations in `src/database/migrations/`: `001_initial` (schema), `002_seed` (seed data), `003_config` (config defaults)
- Version counter: `src/database/database.ts` runs migrations from `PRAGMA user_version` (`SCHEMA_VERSION = 3`), applying each step (schema -> seed data -> config defaults) once inside a transaction
- SQLite for native, sql.js (WASM) for web — one `DatabaseHandle` interface, same migrations and repositories on both platforms; web persists the database bytes to IndexedDB
- 5 repositories: account, category, tag, transaction, config

## I18N
- Languages: English, Spanish, Catalan
- `t()` returns full language object
- All UI strings go through `src/i18n/`

## PROJECT STRUCTURE
```
FinlyApp/
  src/
    components/    — Reusable UI components
    constants/     — Themes, types, colors, icons
    context/       — AppContext, ConfigContext (global state)
    database/      — SQLite/sql.js repos, migrations, types
    hooks/         — Custom hooks (useFontSize, useTransactionFilters)
    i18n/          — Translations (en, es, ca)
    navigation/    — AppNavigator (Drawer + Stack)
    screens/       — Screen components (PascalCase)
    utils/         — Formatters, calculator, platform.ts, language.ts
```

## UTILS
- `src/utils/platform.ts` — Centralized platform checks (isWeb, isNative, isIOS, isAndroid)
- `src/utils/language.ts` — Centralized language type and checks (Language, isSpanish, isEnglish, isCatalan)

## NAMING CONVENTIONS
- Screens: `PascalCaseScreen.tsx` (e.g., `AddTransactionScreen.tsx`)
- Components: `PascalCase.tsx` (e.g., `AccountModal.tsx`)
- Repositories: `camelCaseRepo.ts` (e.g., `accountRepo.ts`)
- Hooks: `useHookName.ts`
- i18n keys: `lowercase.with.dots`