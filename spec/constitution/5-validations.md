# Validations & User Feedback

## Core Principles
- All user-facing validation messages use the translation system (`i18n/`).
- Validation errors are displayed **inline** below the input field — never via `Alert.alert()`.
- Use **theme tokens** (`c.red`, `c.surface`, `c.textSecondary`) — never hardcoded colors.
- Every validation rule must have a corresponding i18n key in `en.ts`, `es.ts`, and `ca.ts`.

## Error Display Pattern

### Inline Error Text
```tsx
{error && (
  <Text style={[styles.error, { color: c.red, fontSize: fs(12) }]}>
    {error}
  </Text>
)}
```

### Input Border on Error
```tsx
style={[styles.input, { borderColor: error ? c.red : c.border }]}
```

### Button Disabled State
```tsx
style={[styles.button, { backgroundColor: isDisabled ? c.surface : c.primary }]}
style={[styles.buttonText, { color: isDisabled ? c.textSecondary : c.background }]}
disabled={isDisabled}
```

| Element | Error/Disabled | Normal |
|---------|----------------|--------|
| Input border | `c.red` | `c.border` |
| Error text | `c.red`, `fs(12)`, `fontWeight: '500'` | hidden |
| Button bg | `c.surface` | `c.primary` |
| Button text | `c.textSecondary` | `c.background` |

## Validation Timing

### Real-Time Validation (300ms debounce)
- Used for **duplicate name checks** (tags, categories, accounts).
- 300ms debounce after last keystroke.
- Clears error immediately when input changes.
- Checks against database on submit AND real-time.

```tsx
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleNameChange = (text: string) => {
  setName(text);
  setError(null); // Clear immediately on change
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    checkDuplicate(text);
  }, 300);
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, []);
```

### On-Submit Validation
- Always check for empty input on submit.
- Always check for duplicate on submit.
- Button disabled when input is empty OR error exists OR checking is in progress.

```tsx
const isDisabled = !name.trim() || !!error || checkingName;

const handleSubmit = async () => {
  if (isDisabled) return;
  // ... proceed
};
```

## Validation Rules by Screen Type

### Create / Modify Entity (Tag, Category, Account)

| Rule | Real-time | On-submit | Error Key |
|------|-----------|-----------|-----------|
| Empty name | - | `if (!trimmed)` | `*_error_empty` |
| Duplicate name | 300ms debounce | `if (exists)` | `*_error_duplicate` |
| Missing icon | - | `if (!selectedIcon)` | `*_error_icon` |
| Missing color | - | `if (!selectedColor)` | `*_error_color` |
| Checking in progress | - | `if (checkingName)` | - |

### Transaction Form
- Category: required, validated on submit.
- Amount: required, positive, validated on submit.
- Date: required, validated on submit.

## Error Message Formatting

### Style Rules
- Font size: `fs(12)`
- Color: `c.red`
- Weight: `'500'`
- Placement: directly below the input field, with small margin.
- Maximum 1 error message visible at a time.

### Text Rules
- Lowercase start (no capitalization).
- No period at end.
- Imperative mood ("Enter a name", "Name already exists").
- Max 40 characters.

## Debounce Cleanup
- **Always** clean up debounce timers in `useEffect` return.
- Prevents memory leaks and stale state updates.

```tsx
useEffect(() => {
  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, []);
```

## Confirmation Modals
- Used for destructive actions (delete account, delete category).
- Use `<Modal>` component, not `Alert.alert()`.
- Overlay: `rgba(0,0,0,0.6)`.
- Content: title (`fs(16)`, `'700'`), message (`fs(14)`, `textSecondary`).
- Buttons (three styles):
  - **Cancel**: surface bg, `c.border` border, `c.text` text. Neutral/dismiss action.
  - **Primary action**: `c.primary` bg, `c.background` text. Used for the safe/recommended alternative (e.g. "Move transactions first" when deleting a category that has transactions).
  - **Destructive/Confirm**: red bg (`#F87171`), white text. Used for the irreversible action (delete, permanent delete).
- When more than two buttons are needed, lay them out as a column: Cancel on its own full-width row, then a two-button row with the remaining actions below it.
- Max width: `360`, border radius: `16`, padding: `24`.

## Accessibility
- Input fields: `autoCapitalize="words"`, `autoCorrect={false}` for names.
- Buttons: `disabled` prop prevents interaction and changes visual state.
- Error text: linked to input via position (no `aria-describedby` needed in React Native).
