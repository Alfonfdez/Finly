# Design System

## Colors

### ColorPalette Interface
```typescript
interface ColorPalette {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  green: string;
  red: string;
  border: string;
}
```

### Dark Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0F172A` | Page background |
| `surface` | `#1E293B` | Cards, headers, elevations |
| `text` | `#E2E8F0` | Primary text |
| `textSecondary` | `#94A3B8` | Secondary text, labels |
| `primary` | `#22D3EE` | Accents, buttons, links, charts |
| `accent` | `#A78BFA` | Details, highlights, hover |
| `green` | `#34D399` | Positive values, income |
| `red` | `#F87171` | Negative values, errors, delete |
| `border` | `#334155` | Input borders, dividers |

### Light Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FFFFFF` | Page background |
| `surface` | `#F1F5F9` | Cards, headers, elevations |
| `text` | `#1E293B` | Primary text |
| `textSecondary` | `#64748B` | Secondary text, labels |
| `primary` | `#0891B2` | Accents, buttons, links, charts |
| `accent` | `#7C3AED` | Details, highlights, hover |
| `green` | `#059669` | Positive values, income |
| `red` | `#DC2626` | Negative values, errors, delete |
| `border` | `#E2E8F0` | Input borders, dividers |

### Usage Rules
- Always use tokens via `useConfig()` → `activeColors` (`c.background`, `c.primary`, etc.).
- Never hardcode hex values in components.
- Theme switchable from Settings (Dark / Light / System) with real-time switching.

## Typography

### Scaling System
- `useFontSize()` hook returns `fs(size)` that scales based on user preference.
- Factors: Small = x0.85, Medium = x1.0, Large = x1.15.
- All font sizes in the app must use `fs()` — never hardcoded values.
- The function rounds to the nearest integer to avoid sub-pixels.

### Font Sizes by Element

| fs(N) | Usage | Examples |
|-------|-------|----------|
| `fs(11)` | Auxiliary text, chart labels | BarChart labels, tag chips |
| `fs(12)` | Badges, metadata, secondary labels | AccountSelector balance, TransactionGroup date, error messages, summary labels |
| `fs(13)` | Period tabs, sort labels, tag chips | PeriodTabs, SortToggle, TagSection |
| `fs(14)` | **Standard** — body text, names, buttons, summary amounts | AccountSelector trigger, CategoryList, modals, HomeScreen income/expenses |
| `fs(15)` | List item names, search input | AccountScreen names, SearchBar, TypeTabs |
| `fs(16)` | Screen titles, modal titles | Modal titles, TransactionsScreen header |
| `fs(17)` | Stack navigator header titles | All `headerTitle` in AppNavigator.tsx |
| `fs(18)` | Modal totals, chart center text | DonutChart total, CalculatorModal display |
| `fs(20)` | Calculator display (result) | CalculatorModal result |
| `fs(22)` | Screen totals (balance, category total) | AccountsScreen total, TransactionsScreen categoryTotal |
| `fs(24)` | Large screen titles | AddTransactionScreen title |
| `fs(28)` | HomeScreen main total | HomeScreen totalText |

### Font Weights

| fontWeight | Usage | Examples |
|------------|-------|----------|
| `'500'` | Normal body text, item names | AccountSelector modal names, CategoryList |
| `'600'` | **Most used** — names, buttons, trigger text, headers | AccountSelector trigger, SortToggle, TypeTabs, headerTitle |
| `'700'` | Monetary totals, modal titles, active labels, HomeScreen total | Modal titles, categoryTotal, DayPicker selected, HomeScreen totalText |

### Currency Format Conventions
- All totals and balances show a `+` (positive) or `-` (negative) prefix.
- Color: green (`c.green`) for positive, red (`c.red`) for negative.
- Format: `formatCurrency()` with max 2 decimals.
- Exception: individual transaction amounts use type (`income` -> `+`, `expense` -> `-`) instead of the value sign.

### Account Name Conventions
- **HomeScreen header:** `fs(14)`, `'600'`, color `textSecondary`, circular icon 24x24 + chevron-down.
- **AccountSelector trigger:** `fs(14)`, `'600'`, color `text`, circular icon 28x28 + chevron-down.
- **AccountScreen list:** `fs(15)`, `'600'`, color `text`, circular icon 44x44.

## Icons
- **Library:** `@expo/vector-icons` (Ionicons)
- **Usage:** `Ionicons` used throughout the app.
- **Category icons:** defined in `components/IconGrid.tsx` (`CATEGORY_ICONS`).
- **Account icons:** defined in `constants/accountIcons.ts` (`ACCOUNT_ICONS`).

## Layout & Spacing
- **Screen padding:** `paddingHorizontal: 16`
- **Section spacing:** `marginTop: 16` between sections
- **Border radius:** `10` for inputs/buttons, `12` for cards, `16` for modals, `999` for pill/circle
- **Grid gap:** `12` for icon/color grids

## Header
- All stack navigator header titles are centered (`headerTitleAlign: 'center'` in `screenOptions`).
- Custom `headerTitle` renderers use an icon + text row.

## No External UI Library
- Styles using React Native's `StyleSheet.create()`.
- No Tailwind, no NativeBase, no React Native Paper.
