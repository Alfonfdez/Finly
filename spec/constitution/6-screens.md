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
const { categories, accounts, tags, refreshCategories, refreshAccounts, refreshTags } = useApp();
```

## Navigation Patterns

### Drawer Menu Button

Primary tab screens (HomeScreen, AccountsScreen, CategoriesScreen, AllTransactionsScreen, TagsScreen) show a hamburger menu button:

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

### Sub-screens (Create, Modify, Detail)

Rely on React Navigation's default header with back button. Never call `setOptions` for `headerLeft`.

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

### Android KeyboardSpacer

```jsx
{Platform.OS === 'android' && <View style={styles.keyboardSpacer} />}
```

**Style:** `{ height: 200 }`

Place at the bottom of scrollable content in Create/Modify screens.

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

```jsx
<Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
  {value.length}/{MAX_LENGTH}
</Text>
```

**Counter style:** `{ textAlign: 'right', marginTop: 4, marginBottom: 4 }`

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

**Button style:** `{ marginTop: 16, paddingVertical: 14, borderRadius: 10, alignItems: 'center' }`
**Button text style:** `{ fontWeight: '600' }`

### Delete Button (Modify screens)

```jsx
<TouchableOpacity
  style={[styles.deleteButton, { borderColor: c.red }]}
  onPress={() => setDeleteModalVisible(true)}
>
  <Ionicons name="trash-outline" size={18} color={c.red} />
  <Text style={[styles.deleteButtonText, { color: c.red, fontSize: fs(15) }]}>
    {labels.delete_button}
  </Text>
</TouchableOpacity>
```

**Delete button style:** `{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12, marginTop: 24 }`

## Export Pattern

All screens use:
```typescript
export default function ScreenName() {
```

Never use arrow functions or `export default` on a variable assignment.

## Screen Categories

| Category | Examples | Key Features |
|----------|----------|--------------|
| Tab/List | HomeScreen, AccountsScreen, TagsScreen | SafeAreaView, FAB, FlatList, empty states |
| Form/Create | CreateAccountScreen, CreateCategoryScreen, CreateTagScreen | SafeAreaView + ScrollView, input validation, icon/color grids, Android keyboardSpacer |
| Form/Modify | ModifyAccountScreen, ModifyCategoryScreen, ModifyTagScreen | Same as Create + pre-populated data, delete button + modal |
| Transaction Form | AddTransactionScreen, ModifyTransactionScreen | Complex: TypeTabs, calculator, category grid, tags, comment, photo |
| Detail | TransactionDetailsScreen | Read-only data display, action buttons (delete, edit) |
