# Screen Conventions

All screens in `FinlyApp/src/screens/` must follow these patterns.

## Screen Structure

### SafeAreaView

Every screen (except SettingsScreen) uses `SafeAreaView` as the outermost wrapper.

**Pattern A — Full safe area** (HomeScreen, AddTransactionScreen, ModifyTransactionScreen):
```jsx
<SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
```
- No `edges` prop (defaults to all edges).
- Style name: `styles.safe`.

**Pattern B — Bottom-only safe area** (all other screens):
```jsx
<SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
```
- `edges={['bottom']}` only.
- Style name: `styles.container`.

### Container / Content

```jsx
<SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: c.background }]}>
  <View style={styles.content}>
    {/* screen content */}
  </View>
</SafeAreaView>
```

| Style | Typical Value |
|-------|---------------|
| `container` | `{ flex: 1 }` |
| `content` | `{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }` |

### Background Color

Always apply `backgroundColor: c.background` from `activeColors`. Never hardcode background colors.

## Common Hooks

Every screen must declare these three hooks at the top:

```typescript
const { activeColors: c, config } = useConfig();
const fs = useFontSize();
const labels = t();
```

| Variable | Source | Naming |
|----------|--------|--------|
| `c` | `useConfig()` → `activeColors` | Always aliased as `c` |
| `fs` | `useFontSize()` | Always `fs` |
| `labels` | `t()` | Always `labels` |

### Navigation

```typescript
const navigation = useNavigation<NavigationProp>();
```

Where `NavigationProp` is typed as:
```typescript
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScreenName'>;
```

### Route (when params needed)

```typescript
const route = useRoute<RouteProp<RootStackParamList, 'ScreenName'>>();
const { param1, param2 } = route.params;
```

### App Context (when global state needed)

```typescript
const { categories, accounts, tags, refreshCategories, refreshAccounts, refreshTags, resetAll } = useApp();
```

**Refresh methods** — call after local mutations to keep AppContext state in sync:

| Method | Use case |
|--------|----------|
| `refresh()` | After adding/editing/deleting transactions |
| `refreshAccounts()` | After creating/modifying/deleting accounts |
| `refreshCategories()` | After creating/modifying/deleting categories |
| `refreshTags()` | After creating/modifying/deleting tags |
| `resetAll()` | After bulk deletions (DataScreen): re-fetches all data, re-applies home defaults from config, resets active selections |

## Navigation Patterns

### Drawer Menu Button

Primary tab screens (HomeScreen, AccountsScreen, CategoriesScreen, AllTransactionsScreen, TagsScreen, CommentsScreen, RecurringScreen) show a hamburger menu button:

```typescript
useFocusEffect(
  useCallback(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{ marginLeft: 8, padding: 4 }}
          accessibilityLabel={labels.home_open_menu}
        >
          <Ionicons name="menu-outline" size={24} color={c.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, c.text, labels.home_open_menu])
);
```

### Drawer Navigator

The drawer is a custom `DrawerContentScrollView` in `AppNavigator.tsx` with this structure:

```
┌─────────────────────────┐
│  [icon.png]  Finly      │  ← Header (logo + title)
├─────────────────────────┤
│  🏠 Home                │
│  📊 All transactions    │
│  💳 Accounts            │
│  📁 Categories          │
│  🏷️ Tags               │
│─────────────────────────│  ← Separator
│  ⚙️ Settings            │
│                         │
│       v2.2.0            │  ← Version footer (expo-constants)
└─────────────────────────┘
```

**Menu items:**

| Icon | Label key | Target screen |
|------|-----------|---------------|
| `home-outline` | `nav_home` | `Home` |
| `receipt-outline` | `nav_all_transactions` | `AllTransactions` |
| `wallet-outline` | `nav_accounts` | `Accounts` |
| `grid-outline` | `nav_categories` | `Categories` |
| `pricetag-outline` | `nav_tags` | `Tags` |
| `chatbubble-ellipses-outline` | `nav_comments` | `Comments` |
| `repeat-outline` | `nav_recurring` | `Recurring` |
| `settings-outline` | `nav_settings` | `Settings` |

**Labels:** long translations wrap to **two lines** (`numberOfLines={2}`) before ellipsizing; short labels stay on one line, so no item is clipped for a long language or a large text size. The library clamps *string* labels to one line, so `DrawerNavItem` passes a label node instead.

**Version footer:**
- Reads version from `Constants.expoConfig?.version` (expo-constants, sourced from `app.json`).
- Style: `fs(11)`, `c.textSecondary`, centered, pushed to bottom of scroll view.
- Format: `v{version}` (e.g., `v2.2.0`).

### Sub-screens (Create, Modify, Detail)

Rely on React Navigation's default header with back button. Never call `setOptions` for `headerLeft`.

### Header Title Alignment

All headers are centered via `headerTitleAlign: 'center'` in `screenOptions` (AppNavigator.tsx). No per-screen override needed.

- **Titles:** every header uses the same size (`fs(17)`, scaled only by the Settings text size - no per-language size changes). Long titles wrap to up to **2 lines** inside a bounded width and never overlap the header buttons; the tail ellipsizes only if a title would need a third line. Back-only sub-screens get a wider bound than list screens with Select/Search, so longer titles still fit within two lines.

## Loading States

### ActivityIndicator Pattern

```jsx
{loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={c.primary} />
  </View>
) : (
  // ... actual content
)}
```

**Loading container style:** `{ flex: 1, justifyContent: 'center', alignItems: 'center' }`

**List body loading:** while a list's data is still loading, render the centered `ActivityIndicator` inside the list body instead of the empty state, so users never see a "no results" flash before the data arrives (`TransactionListBody`). Do not use `removeClippedSubviews` on the transaction list: it produced blank rows on iOS.

### Loading Guard (for screens with async data)

```jsx
if (loading || !data) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    </SafeAreaView>
  );
}
```

## Empty States

### List Empty (FlatList)

```jsx
const renderEmpty = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="wallet-outline" size={64} color={c.textSecondary} />
    <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
      {labels.accounts_empty}
    </Text>
  </View>
);
```

**Consistent structure:**
- Large Ionicons icon: `size={64}`, `color={c.textSecondary}`
- Text: `color: c.textSecondary`, `fontSize: fs(16)`, `fontWeight: '500'`
- Container: `{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }`

### Not Found (Detail/Modify screens)

```jsx
if (!entity) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: c.textSecondary, fontSize: fs(16) }}>
          {labels.entity_not_found}
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

## Keyboard Handling

### ScrollView Pattern (Form screens)

```jsx
<ScrollView
  style={styles.container}
  keyboardShouldPersistTaps="handled"
  onScrollBeginDrag={() => Keyboard.dismiss()}
>
```

- `keyboardShouldPersistTaps`: always `"handled"`
- `onScrollBeginDrag`: dismiss keyboard on scroll (for form screens)

### Bottom action above the keyboard

Every form keeps its bottom action reachable while the keyboard is open, via the shared
`hooks/useKeyboardReveal.ts`:

- The **bottom-most field** — Comment in `TransactionForm`, Note in `AccountForm`, the multiline
  input in `ModifyCommentScreen` — is wired to `onBottomFieldFocus` / `onBottomFieldBlur`.
  Focusing it scrolls the form to the end (`scrollRef.current?.scrollToEnd`) after a short delay.
- The reveal is re-run on `Keyboard.addListener('keyboardDidShow')` and on the ScrollView's
  `onLayout` (the keyboard shrinks it), so it lands *after* the resize settles rather than short.
- Only that field triggers it — focusing a field higher up (recurring Name, Amount, Category)
  must **not** jump to the end.
- **Recurring Name exception:** it uses the same reveal mechanism with a custom action that
  scrolls its section header to the top on native, so the keyboard never covers the input and
  no strip of the previous section stays visible above the header.
- `FormScrollView` (Account / Category / Comment forms) wraps its `ScrollView` in a
  `KeyboardAvoidingView` and exposes `scrollRef` + `onLayout`; `TransactionForm` uses its own
  `KeyboardAvoidingView`. The content keeps `paddingBottom: 112` so the revealed button clears the
  keyboard, and `keyboardShouldPersistTaps="handled"` keeps it tappable in one tap.

### Modals and the keyboard

A native `Modal` window does not always resize with the keyboard, so `ModalShell` lifts the
centred card above it via `useKeyboardLift` (`hooks/useKeyboardInset.ts`): it measures the
keyboard and adds it as the overlay's bottom padding (also capping the card's max height to the
remaining space). The lift is **held while the modal is open** — tapping a button blurs the input
and hides the keyboard, and dropping the card at that moment would move the button out from under
the finger and swallow the tap (e.g. the typed-DELETE confirmation). It resets when the modal
closes. `ConfirmationModal`'s scroll area uses `keyboardShouldPersistTaps="handled"`.
- **Hidden modals ignore keyboard lift:** a modal that is mounted but not visible must not accumulate keyboard height. `useKeyboardLift` only grows while `visible`, so returning from a form with the keyboard open cannot push the next modal above the screen.
- **Opening a modal dismisses the underlying form input:** `ModalShell` calls `Keyboard.dismiss()` when it becomes visible, so the focused field blurs and `useKeyboardReveal` cannot scroll the form behind the modal when the modal's own input opens (e.g. Recurring Name → Tags → Add tag).

Any `ScrollView` that is an **ancestor of a modal containing a `TextInput`** must also set
`keyboardShouldPersistTaps="handled"`. With the default (`'never'`), RN's
`ScrollView._handleStartShouldSetResponderCapture` captures the first tap on a non-input target
to dismiss the keyboard, so the modal's buttons would need two taps
(e.g. `DataScreen`'s outer `ScrollView` wraps its typed-DELETE confirmation modals).

## Selection mode

List rows use the shared `SelectionCheckbox` (`components/SelectionCheckbox.tsx`): a 22px
`checkbox-outline` / `checkbox` icon, first element on the **left**, primary when selected and
secondary otherwise. The checkbox is inside the row's pressable area, so tapping the checkbox,
the row text or the row badge toggles selection. The right side keeps the row's value or action
(amount, balance, status); switches are hidden in selection mode. `SelectAllRow` uses the same
checkbox. The **Categories grid** is the documented exception: its tiles show a checkmark badge
over the icon.

## Empty lists

Render a list through the shared `ListOrEmpty` component, which **unmounts the list when it
is empty** and shows an `EmptyState` instead — never a `ListEmptyComponent` combined with a
conditional `contentContainerStyle`:

```jsx
<ListOrEmpty empty={items.length === 0} emptyState={renderEmpty()}>
  <FlatList data={items} ... contentContainerStyle={styles.list} />
</ListOrEmpty>
```

Why: when the data jumps from a list that overflows the screen to empty in a single update
(e.g. Select all → Delete), a still-mounted `FlatList` keeps the old (tall) native content
size on Android, so the emptied screen stays vertically scrollable and the empty state is
not centred. Unmounting the list forces a fresh measure.

Used by `TagsScreen`, `CommentsScreen`, `RecurringScreen`, `AccountsScreen`,
`TransactionListBody` (transactions) and `CategoriesScreen`.

`testID`s shared by a component and its test live in `src/constants/testIds.ts` (`TEST_IDS`);
the rest of the test hooks are i18n accessibility labels queried with `getByLabelText`.

## FAB (Floating Action Button)

### Shared Pattern

```jsx
<TouchableOpacity
  style={[styles.fab, { backgroundColor: c.primary }]}
  onPress={() => navigation.navigate('AddTransaction')}
  accessibilityLabel="+"
>
  <Ionicons name="add" size={28} color={c.background} />
</TouchableOpacity>
```

### FAB Style (copy to each screen)

```javascript
fab: {
  position: 'absolute',
  bottom: 56,
  alignSelf: 'center',
  width: 56,
  height: 56,
  borderRadius: 28,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
```

## Modal Pattern

### Confirmation Dialog

```jsx
<Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
      <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>
        {labels.modal_title}
      </Text>
      <Text style={[styles.modalMessage, { color: c.textSecondary, fontSize: fs(14) }]}>
        {labels.modal_message}
      </Text>
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => setModalVisible(false)}
        >
          <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>
            {labels.cancel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: c.red }]}
          onPress={handleConfirm}
        >
          <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontSize: fs(14) }]}>
            {labels.delete}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

### Modal Styles

| Style | Value |
|-------|-------|
| `modalOverlay` | `{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 }` |
| `modalContent` | `{ width: '100%', maxWidth: 360, borderRadius: 16, padding: 24 }` |
| `modalTitle` | `{ fontWeight: '700', marginBottom: 12, textAlign: 'center' }` |
| `modalMessage` | `{ marginBottom: 20, textAlign: 'center', lineHeight: 20 }` |
| `modalButtons` | `{ flexDirection: 'row', gap: 12 }` |
| `modalButton` | `{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }` |
| `modalButtonText` | `{ fontWeight: '600' }` |

### Button Colors

| Button | Background | Text |
|--------|------------|------|
| Cancel | `c.surface` + `borderColor: c.border` | `c.text` |
| Destructive | `c.red` | `'#FFFFFF'` |

## Form Patterns

### Section headers

- The transaction and recurring forms use `components/form/FormSectionHeader` for every field group: Amount, Account, Categories, Date/Start date, Recurring, Tags, Comment and Photos.
- The title is 15px/600 in `c.text`; the 16px decorative icon uses the same color and is hidden from accessibility.
- Section icon vocabulary: Amount `cash-outline`, Account `wallet-outline`, Categories `grid-outline`, Date/Start date `calendar-outline`, Recurring `repeat-outline`, Tags `pricetag-outline`, Comment `chatbubble-ellipses-outline`, Photos `image-outline`. The same glyph is used in Transaction details, drawer/screen headers and empty states where the section applies.
- Every header keeps a standard 16px top gap; preceding sections do not add extra bottom margin, so Amount, Account, Categories, Date, Recurring, Tags, Comment and Photos align consistently.
- Optional right-side actions are passed separately and keep the primary color because they are tappable (Date calendar, Tag search).
- The Account card shows only the account name plus a `chevron-down`; the section header carries the Account label.

### Accessibility

- `FormSectionHeader` exposes its title with `accessibilityRole="header"`; decorative icons are hidden from assistive technology.
- `LabeledTextField` uses its visible `label` as the input's accessible name when the caller does not provide one.
- The Account picker is a button labelled `Account: <name>`; its chevron is decorative.
- The Photos add tile is labelled **Add photo** and exposes a button role; remove and source-modal options are buttons too.
- Comment suggestions sit inside the Comment section, below its header and above the input. The panel has a bulb icon, a **Suggestions** heading, a muted **Tap to reuse** hint and 44px rows, so it is visually attached to the field and clearly actionable.
- Interactive chips/options expose selected state, disabled steppers expose disabled state and dim, and small icon actions keep a ~44px hit target via `hitSlop`.

### TextInput

```jsx
<TextInput
  style={[
    styles.input,
    {
      backgroundColor: c.surface,
      color: c.text,
      borderColor: error ? c.red : c.border,
      fontSize: fs(14),
    },
  ]}
  placeholder={labels.input_placeholder}
  placeholderTextColor={c.textSecondary}
  value={value}
  onChangeText={handleChange}
  maxLength={MAX_LENGTH}
  autoCapitalize="words"
  autoCorrect={false}
/>
```

**Input style:** `{ borderWidth: 1, borderRadius: 10, padding: 12 }`

### Character Counter

Every limited input (and the list headers that show a limit) renders `components/form/CharCounter`:

```jsx
<CharCounter value={value.length} maxLength={MAX_LENGTH} />

// A localized list header (not "n/max"): the text goes in as the child.
<CharCounter value={tags.length} maxLength={MAX_TAGS} style={COUNTER_STYLE}>
  {labels.tags_counter(tags.length, MAX_TAGS)}
</CharCounter>
```

- **Limits come from `constants/types.ts`, never a literal**: `MAX_TAG_NAME_LENGTH`, `MAX_ACCOUNT_NAME_LENGTH`, `MAX_CATEGORY_NAME_LENGTH`, `MAX_NOTE_LENGTH`, `MAX_COMMENT_LENGTH`, `MAX_TAGS`, `MAX_CATEGORIES_PER_TYPE`, `REPEAT_NAME_MAX_LENGTH`. A field whose value may already exceed the limit (legacy/imported data, e.g. a recurring rule name) passes `maxLength={Math.max(LIMIT, value.length)}` so the value is never clipped, while the counter flags it. `LabeledTextField` applies this centrally; the raw Comment and Modify Category inputs do the same.
- **One look**: `COUNTER_FONT_SIZE` (12, scaled by the text-size setting), `c.textSecondary`, `fontWeight: '500'`, right-aligned — centered for the list headers via `COUNTER_STYLE`.
- **At the limit (`value >= maxLength`) the whole counter turns red and bold**: that is the only moment the field stops accepting input, so it reads as "you can't type more" rather than "this is invalid". The same rule flags the list headers (`100 of 100 tags`, `30 of 30 categories`).
- `style` is for layout only (alignment, margins, padding); colour, weight and size always stay the component's, so a caller can never override the at-limit state.
- **Placement:** multiline fields (transaction Comment, Modify Comment, Account Note) place the counter inside the input at the bottom-right. The reserved padding is derived from the scaled counter height (app text size × OS font scale) plus its inset, so it does not overlap at Large text. Single-line name fields keep the counter below the input. `LabeledTextField` exposes `inlineCounter` for the multiline variant; it is ignored for single-line fields.
- **Counter style:** below-input counters use `{ textAlign: 'right', marginTop: 4, marginBottom: 4 }`; inline counters use `{ position: 'absolute', right: 8, bottom: 6, textAlign: 'right' }`; list headers use `{ textAlign: 'center', paddingTop: 12 }` (`COUNTER_STYLE`).

### Debounce Validation

```typescript
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleChange = (text: string) => {
  setValue(text);
  setError(null);
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    checkDuplicate(text);
  }, 300);
};

useEffect(() => {
  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, []);
```

### Save Button

```jsx
<TouchableOpacity
  style={[styles.button, { backgroundColor: isDisabled ? c.surface : c.primary }]}
  onPress={handleSave}
  disabled={isDisabled}
>
  <Text style={[styles.buttonText, { color: isDisabled ? c.textSecondary : c.background, fontSize: fs(15) }]}>
    {labels.save_button}
  </Text>
</TouchableOpacity>
```

**Button style:** `{ paddingVertical: 14, borderRadius: 10, alignItems: 'center' }` — the form's hint slot (below) owns the gap above it.
**Button text style:** `{ fontWeight: '600' }`

### Form validation & bottom action area

Every form — Create, Edit, and the transaction/recurring forms — shares one rule set:

1. **The bottom hint says why Save is disabled.** It is shown whenever the button is disabled, uses the **same wording in Create and Edit** (shared i18n keys) and is the **only** place the message appears — never duplicated under the field. The recurring form lists **every** unmet condition at once (one sentence each).
2. **Save is enabled only when the form changed *and* every rule passes.** On an **edit** screen (`editing`) the button stays disabled while the draft equals what the screen loaded — with an **empty hint band**, since "nothing changed" is not a field error: the grey button is the signal. The comparison is by **value**, so returning a field to its original value (picking the original category back, retyping the same amount, adding and removing the same tag) disables Save again; the helper is `hooks/useIsDirty.ts` (a value comparison against the first loaded baseline; the transaction/rule form reuses `useTransactionForm`'s `isDirty`). The transaction form's baseline is **what is stored right now** (derived from the row props, tags included): an external rewrite — a "Future + past" rule edit that bulk-updates this row — re-baselines it, so picking the value the rule just wrote leaves nothing to save (the draft is compared with the row, not with the row as it looked when the screen opened). **Exception:** on the rule editor, moving the "Apply changes to" scope away from its default counts as a change (that scope is what back-fills/handles the past occurrences). Create/Add screens have no baseline and keep their own rules.
3. **A field is only painted red for a value the user invalidated.** The red border is held back until the field has been **changed or blurred**, so a freshly-opened form never greets the user in red (`LabeledTextField` owns this gating; a screen with its own input, like the category name, repeats the same two-line pattern). `AmountInput` takes an optional `error` prop: an amount of **0** is flagged with a red border (the digits keep their normal color) while an account's initial balance of **0** stays valid; its red *text* is reserved for a value that is not a number at all.
**A section-level error tints the section, not just a field.** When the recurring draft would create more than the 5,000-occurrence limit, the recurring card switches from the primary tint to the red error tint (border + background) in both create and edit, and returns as soon as the draft is valid.

4. **The bottom block is one shared component** (`components/form/FormActions`), so its layout cannot drift:

   ```
   ⟨field area⟩
   [muted band]   reserved 2 lines — the "you cannot delete this" explanation, blank when there is none
   [Delete]       only in forms that can delete; label is always the generic `Delete`
   [red band]     reserved 2 lines — why the save is blocked
   [Save]
   ```

   Both bands are **reserved even when empty** (2 lines, 8/8 margins, scaling with the text size), so neither the Delete nor Save ever moves when a message appears or disappears — and the separation from the field area is identical in every screen, whether or not a hint is showing. The **muted band doubles as the standard separator above the destructive button**, which is why every delete form (not just the account, whose note uses it) reserves it. The caller passes only the messages and the Save node (each form keeps its own Save styling).
5. **The Delete button always reads the generic `Delete`.** Only the confirmation modal spells out what is being deleted.
6. Purely **informative** notes (e.g. the comment merge note) stay **below Save** — they explain, they do not block.

### Delete Button (Modify screens)

```jsx
<TouchableOpacity
  style={[styles.deleteButton, { borderColor: c.red }]}
  onPress={() => setDeleteModalVisible(true)}
>
  <Ionicons name="trash-outline" size={18} color={c.red} />
  <Text style={[styles.deleteButtonText, { color: c.red, fontSize: fs(15) }]}>
    {labels.delete}
  </Text>
</TouchableOpacity>
```

**Delete button style:** `{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12, marginTop: 24 }` (`marginTop: 8` when the muted hint sits directly above it). The shared `components/form/DeleteButton.tsx` carries `testID: TEST_IDS.formDelete`, and `components/form/FormHintSlot.tsx` is the reserved red-hint slot (`TEST_IDS.formHintSlot`).

## Calendar (date pickers)

- `CalendarModal` renders the picker; the day grid is `calendars/DayPicker`, with **year navigation** (`calendars/YearNav`) above **month navigation** (`calendars/MonthNav`) — the same two-arrow layout as `WeekPicker`, so a year can be jumped to quickly (e.g. a recurring end date 10 years ahead).
- **Modal layout:** fixed header (title + two left-aligned information lines), scrollable body, fixed Cancel/OK footer. The modal sizes to its content with a 94% height cap.
- **Navigation standard (strict A):** inside every picker, arrows only browse the visible page; the selected value changes only by tapping. The header keeps showing the selection when it is off-screen. The outer `CalendarPicker` arrows still select the previous/next period.
- **Header information:** Day/Month/Year show their selected value plus a reserved blank second line; Week shows both full start/end dates with years; Period shows its localized Desde/hasta range. Compact week labels (trigger and week rows) add both years only when the week crosses a year boundary.
- **Today refresh:** calendar components share `hooks/useToday.ts`, which refreshes at midnight and when the app/tab becomes active, so an open picker does not keep yesterday's current/future state.
- **Period picker:** quick presets are This year / 12 months / 30 days / 90 days, below the calendar, followed by the muted start/end hint. The checked preset is derived from the current range; manual edits uncheck it and a matching manual range checks it. While the picker is waiting for the end date, OK is disabled (dimmed, not pressable); tapping the same day twice creates a one-day range.
- **Month/Year:** both use a 3x4 grid; their empty Month-row spacer keeps the Year row and Calendar area aligned with Day/Week/Period. `YearGrid` pages are fixed 12-year ranges anchored at 1900 (`1900–1911`, `1912–1923`, …); tapping a year selects it without moving the page, and the previous page is disabled on the first range. `YearGrid` arrows carry Previous years / Next years accessibility labels. Month year arrows only browse.
- **WeekPicker:** always renders six row slots. A week is kept when it contains at least one day of the active month; a week entirely outside it is a completely blank, non-interactive placeholder that preserves height and spacing, so the modal never resizes. A shared week stays in the month where the user tapped it; tapping it selects the week without changing the visible month/year. Reopening shows the week's start month.
- **Date bounds:** every picker accepts optional `minDate` / `maxDate`. The minimum is always **01 January 1900** when `minDate` is omitted or `null`; `maxDate === undefined` means no future dates (end of today), while `maxDate === null` means unbounded in the future. A `Date` is an inclusive clamp. The convention lives in `resolveDateBounds(minDate, maxDate)` (`utils/calendarBounds.ts`); the day predicate is `isDateWithinBounds(date, minDate, maxDate)` (`utils/formatters.ts`). Disabled days are dimmed (`DISABLED_OPACITY`) and not pressable, and navigation disables at the bounds.
- **Reopen sync:** DayPicker, MonthGrid and YearGrid follow the `date` prop; reopening shows the month/page containing the selected value. WeekPicker opens the week's start month. While a picker is open, browsing does not change the selection.
- **Default:** the transaction date and period pickers pass no bounds, so they stay "today or past only" and cannot go before 1900 (see feature 001).
- **Recurring start date (feature 028):** in **rule mode** the transaction date picker (the recurring form's **Start date**) passes `maxDate = null`, so any date — past, present or future — can anchor the rule; outside rule mode the same picker stays "today or past only".
- **Recurring end date (feature 028):** the recurring **End date** picker passes `minDate = dayAfter(start date)` and `maxDate = null`, so the end date must be strictly after the rule's start date — it may be in the past when the start is in the past (e.g. start 01/09, end 30/09) — and `maxDate = null` keeps it open-ended.
- `MonthGrid` / `YearGrid` (month/year period grids) are **not** parameterized yet; they remain past-only.

## Export Pattern

All screens use:
```typescript
export default function ScreenName() {
```

Never use arrow functions or `export default` on a variable assignment.

## Screen Categories

| Category | Examples | Key Features |
|----------|----------|--------------|
| Tab/List | HomeScreen, AccountsScreen, TagsScreen, CommentsScreen, RecurringScreen, AllTransactionsScreen | SafeAreaView, FAB, FlatList, centered loading state, empty states |
| Form/Create | CreateAccountScreen, CreateCategoryScreen, CreateTagScreen, CreateRecurringScreen | SafeAreaView + ScrollView, input validation, icon/color grids, Android keyboardSpacer |
| Form/Modify | ModifyAccountScreen, ModifyCategoryScreen, ModifyTagScreen, ModifyRecurringScreen | Same as Create + pre-populated data, delete button + modal |
| Transaction Form | AddTransactionScreen, ModifyTransactionScreen | Complex: TypeTabs, calculator, category grid, tags, comment, photo |
| Detail | TransactionDetailsScreen | Read-only data display, action buttons (delete, edit) |
| Settings | SettingsScreen + Appearance/Regional/Personalization/Data | Section rows, pickers, toggles, privacy (hide balances), backup/import, reset flows |
| Modal/overlay | CategoryFilterModal, CalendarModal, ConfirmationModal, SelectionActionBar | Filter presets, multi-select, confirmation dialogs, bulk actions |
