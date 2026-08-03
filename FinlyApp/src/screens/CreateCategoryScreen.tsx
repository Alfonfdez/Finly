import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { useColorSelection } from '../hooks/useColorSelection';
import { t, getDefaultCategoryIdByName, getDefaultEnglishName } from '../i18n';
import { categoryRepository } from '../database';
import { type RootStackParamList, type NavigationProp, TRANSACTION_TYPES, MAX_CATEGORY_NAME_LENGTH, type TransactionType, USER_ID } from '../constants/types';
import { setPendingCategory } from '../utils/pendingCategory';
import { getIconColorHintText } from '../utils/formHints';
import { CATEGORY_ICONS } from '../components/IconGrid';
import IconColorSection from '../components/IconColorSection';
import RadioButton from '../components/RadioButton';
import LabeledTextField from '../components/form/LabeledTextField';
import SectionTitle from '../components/form/SectionTitle';
import PrimaryButton from '../components/form/PrimaryButton';
import FormError from '../components/form/FormError';
import KeyboardSpacer from '../components/form/KeyboardSpacer';
import FormScrollView from '../components/form/FormScrollView';

type CreateCategoryRouteProp = RouteProp<RootStackParamList, 'CreateCategory'>;

export default function CreateCategoryScreen() {
  const { activeColors: c, config } = useConfig();
  const { refreshCategories } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'CreateCategory'>>();
  const route = useRoute<CreateCategoryRouteProp>();

  const initialType = route.params?.type ?? TRANSACTION_TYPES.expense;

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const { selectedColor, customColor, handleColorSelect } = useColorSelection();

  const { nameError, checkingName, clearNameError, debouncedCheck } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => categoryRepository.existsByName(value, excludeId),
    resolveDefaultEnglishName: (value) => {
      const defaultId = getDefaultCategoryIdByName(value);
      return defaultId !== null ? getDefaultEnglishName(defaultId) : null;
    },
    duplicateErrorKey: labels.create_cat_error_name_duplicate,
  });

  const handleNameChange = (value: string) => {
    setName(value);
    clearNameError();
    debouncedCheck(value);
  };

  const canCreate = name.trim().length > 0 && !nameError && !checkingName && selectedIcon !== null && selectedColor !== null;

  const hintText = getIconColorHintText(
    name,
    nameError,
    selectedIcon,
    selectedColor,
    {
      empty: labels.create_cat_error_name_empty,
      iconColor: labels.create_cat_hint_icon_color,
      icon: labels.create_cat_hint_icon,
      color: labels.create_cat_hint_color,
    }
  );

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <FormScrollView>
          <LabeledTextField
            label={labels.create_cat_name}
            placeholder={labels.create_cat_name_placeholder}
            value={name}
            onChangeText={handleNameChange}
            maxLength={MAX_CATEGORY_NAME_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
            error={nameError}
            showCounter
          />

          <SectionTitle text={labels.create_cat_type} />
          <View style={styles.typeRow}>
            <RadioButton
              selected={type === TRANSACTION_TYPES.expense}
              onPress={() => setType(TRANSACTION_TYPES.expense)}
            />
            <Text style={[styles.radioLabel, { color: c.text, fontSize: fs(14) }]}>
              {labels.create_cat_expense}
            </Text>

            <RadioButton
              selected={type === TRANSACTION_TYPES.income}
              onPress={() => setType(TRANSACTION_TYPES.income)}
            />
            <Text style={[styles.radioLabel, { color: c.text, fontSize: fs(14) }]}>
              {labels.create_cat_income}
            </Text>
          </View>

          <IconColorSection
            icons={CATEGORY_ICONS}
            shape={config.categoryIconShape}
            symbolTitle={labels.create_cat_symbols}
            colorTitle={labels.create_cat_color}
            selectedIcon={selectedIcon}
            onSelectIcon={setSelectedIcon}
            selectedColor={selectedColor}
            customColor={customColor}
            onSelectColor={handleColorSelect}
          />

          <FormError message={hintText} fontSize={fs(12)} style={styles.hint} />

          <PrimaryButton
            label={labels.create_cat_add}
            onPress={handleCreate}
            disabled={!canCreate}
            style={styles.button}
          />

          <KeyboardSpacer />
        </FormScrollView>
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
});
