import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { t, getDefaultCategoryIdByName, getDefaultEnglishName } from '../i18n';
import { isAndroid } from '../utils/platform';
import { categoryRepository } from '../database';
import { RootStackParamList, TRANSACTION_TYPES, MAX_CATEGORY_NAME_LENGTH, type TransactionType, USER_ID } from '../constants/types';
import { WHITE } from '../constants/themes';
import { setPendingCategory } from './AddTransactionScreen';
import IconGrid, { CATEGORY_ICONS } from '../components/IconGrid';
import ColorGrid, { QUICK_COLORS } from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateCategory'>;
type CreateCategoryRouteProp = RouteProp<RootStackParamList, 'CreateCategory'>;

export default function CreateCategoryScreen() {
  const { activeColors: c, config } = useConfig();
  const { refreshCategories } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateCategoryRouteProp>();

  const initialType = route.params?.type ?? TRANSACTION_TYPES.expense;

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>(initialType);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const checkNameDuplicate = useCallback(async (value: string) => {
    if (!value.trim()) {
      setNameError(null);
      setCheckingName(false);
      return;
    }
    setCheckingName(true);
    try {
      const defaultId = getDefaultCategoryIdByName(value.trim());
      if (defaultId !== null) {
        const englishName = getDefaultEnglishName(defaultId);
        if (englishName) {
          const defaultExists = await categoryRepository.existsByName(englishName);
          if (defaultExists) {
            setNameError(labels.create_cat_error_name_duplicate);
            return;
          }
        }
      }
      const exists = await categoryRepository.existsByName(value.trim());
      setNameError(exists ? labels.create_cat_error_name_duplicate : null);
    } catch {
      setNameError(null);
    } finally {
      setCheckingName(false);
    }
  }, [labels.create_cat_error_name_duplicate]);

  const debouncedCheck = useUniqueNameCheck(checkNameDuplicate);

  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(null);
    debouncedCheck(value);
  };

  const canCreate = name.trim().length > 0 && !nameError && !checkingName && selectedIcon !== null && selectedColor !== null;

  const getHintText = (): string | null => {
    if (name.trim().length === 0) return labels.create_cat_error_name_empty;
    if (nameError) return nameError;
    if (!selectedIcon && !selectedColor) return labels.create_cat_hint_icon_color;
    if (!selectedIcon) return labels.create_cat_hint_icon;
    if (!selectedColor) return labels.create_cat_hint_color;
    return null;
  };

  const handleCreate = async () => {
    if (!canCreate || selectedIcon === null || selectedColor === null) return;
    try {
      const created = await categoryRepository.create({
        user_id: USER_ID,
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type,
      });
      await refreshCategories();
      setPendingCategory(created.id, type);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const hintText = getHintText();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_cat_name}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: c.surface,
                color: c.text,
                borderColor: nameError ? c.red : c.border,
                fontSize: fs(14),
              },
            ]}
            placeholder={labels.create_cat_name_placeholder}
            placeholderTextColor={c.textSecondary}
            value={name}
            onChangeText={handleNameChange}
            maxLength={MAX_CATEGORY_NAME_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
            {name.length}/{MAX_CATEGORY_NAME_LENGTH}
          </Text>

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_cat_type}
          </Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.radio,
                { borderColor: type === TRANSACTION_TYPES.expense ? c.primary : c.border },
              ]}
              onPress={() => setType(TRANSACTION_TYPES.expense)}
            >
              {type === TRANSACTION_TYPES.expense && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
            </TouchableOpacity>
            <Text style={[styles.radioLabel, { color: c.text, fontSize: fs(14) }]}>
              {labels.create_cat_expense}
            </Text>

            <TouchableOpacity
              style={[
                styles.radio,
                { borderColor: type === TRANSACTION_TYPES.income ? c.primary : c.border },
              ]}
              onPress={() => setType(TRANSACTION_TYPES.income)}
            >
              {type === TRANSACTION_TYPES.income && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
            </TouchableOpacity>
            <Text style={[styles.radioLabel, { color: c.text, fontSize: fs(14) }]}>
              {labels.create_cat_income}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_cat_symbols}
          </Text>
          <IconGrid
            icons={CATEGORY_ICONS}
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            shape={config.categoryIconShape}
            onSelect={setSelectedIcon}
          />

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_cat_color}
          </Text>
          <ColorGrid
            selectedColor={selectedColor}
            customColor={customColor}
            onSelect={setSelectedColor}
            onOpenPicker={() => setColorPickerVisible(true)}
          />

          <ColorPickerModal
            visible={colorPickerVisible}
            selectedColor={selectedColor}
            onSelect={(color) => {
              setSelectedColor(color);
              if (!QUICK_COLORS.includes(color)) {
                setCustomColor(color);
              }
            }}
            onClose={() => setColorPickerVisible(false)}
          />

          {hintText && (
            <Text style={[styles.hint, { color: c.red, fontSize: fs(12) }]}>
              {hintText}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: canCreate ? c.primary : c.textSecondary },
            ]}
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={[styles.buttonText, { color: WHITE, fontSize: fs(15) }]}>
              {labels.create_cat_add}
            </Text>
          </TouchableOpacity>

          {isAndroid && <View style={styles.keyboardSpacer} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  counter: {
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    marginRight: 12,
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  keyboardSpacer: {
    height: 200,
  },
});
