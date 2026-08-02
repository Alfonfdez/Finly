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
- SQLite (native) / localStorage (web)
- react-native-svg, reanimated-color-picker
- Context API for global state
- Platforms: iOS, Android, Web (web uses localStorage fallback)

## GIT WORKFLOW
- `main` — stable releases only, merged from `develop`
- `develop` — active development branch
- Feature branches: `feature/NNN-description` off `develop`, merge back via PR
- Never commit directly to `main`
- The agent always suggests a branch name for each implementation (e.g., `fix/db-cleanup-bugs`, `feature/018-transactions-filter`)

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

## DATABASE
- 3 idempotent migrations in `src/database/migrations/`: `001_initial` (schema), `002_seed` (seed data), `003_config` (config defaults)
- No version counter; all statements use `CREATE TABLE/INDEX IF NOT EXISTS`
- SQLite for native, localStorage for web
- 5 repositories: user, account, category, transaction, config

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
    database/      — SQLite/localStorage repos, migrations, types
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