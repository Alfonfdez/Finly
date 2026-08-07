import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useColorSelection } from '../hooks/useColorSelection';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { t, getDisplayCategoryName, getDefaultEnglishName, getDefaultCategoryIdByName } from '../i18n';
import { categoryRepository, transactionRepository } from '../database';
import { type RootStackParamList, type NavigationProp, TRANSACTION_TYPES, MAX_CATEGORY_NAME_LENGTH } from '../constants/types';
import { badgeShapeFor } from '../utils/badgeShape';
import { WHITE, TRANSPARENT } from '../constants/themes';
import { CATEGORY_ICONS } from '../components/IconGrid';
import { QUICK_COLORS } from '../constants/colors';
import IconBadge from '../components/IconBadge';
import IconColorSection from '../components/IconColorSection';
import ConfirmationModal from '../components/ConfirmationModal';
import ModalShell from '../components/ModalShell';
import ModalHeader from '../components/ModalHeader';
import RadioButton from '../components/RadioButton';
import ListItemRow from '../components/ListItemRow';
import SectionTitle from '../components/form/SectionTitle';
import PrimaryButton from '../components/form/PrimaryButton';
import DeleteButton from '../components/form/DeleteButton';
import KeyboardSpacer from '../components/form/KeyboardSpacer';
import FormScrollView from '../components/form/FormScrollView';
import { BUTTON_BORDER_RADIUS } from '../components/componentStyles';

type ModifyCategoryRouteProp = RouteProp<RootStackParamList, 'ModifyCategory'>;

export default function ModifyCategoryScreen() {
  const { activeColors: c, config } = useConfig();
  const { categories, refreshCategories, refresh } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'ModifyCategory'>>();
  const route = useRoute<ModifyCategoryRouteProp>();
  const { categoryId } = route.params;

  const category = useMemo(
    () => categories.find(cat => cat.id === categoryId),
    [categories, categoryId]
  );

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const userEditedRef = useRef(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);
  const [deleteHasTransactions, setDeleteHasTransactions] = useState(false);
  const { selectedColor, customColor, setSelectedColor, setCustomColor, handleColorSelect } = useColorSelection();

  useEffect(() => {
    if (category && !userEditedRef.current) {
      setName(getDisplayCategoryName(category));
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
      if (!QUICK_COLORS.includes(category.color)) {
        setCustomColor(category.color);
      }
    }
  }, [category, setCustomColor, setSelectedColor]);

  const { nameError, checkingName, clearNameError, debouncedCheck } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => categoryRepository.existsByName(value, excludeId),
    resolveDefaultEnglishName: (value) => {
      const defaultId = getDefaultCategoryIdByName(value);
      return defaultId !== null ? getDefaultEnglishName(defaultId) : null;
    },
    duplicateErrorKey: labels.create_cat_error_name_duplicate,
    excludeId: categoryId,
  });

  const handleNameChange = (value: string) => {
    userEditedRef.current = true;
    setName(value);
    clearNameError();
    debouncedCheck(value);
  };

  const validationError = name.trim().length === 0 ? labels.create_cat_error_name_empty : nameError;
  const canSave = name.trim().length > 0 && !nameError && !checkingName;

  const sameTypeCategories = useMemo(() => {
    if (!category) return [];
    return categories.filter(cat => cat.type === category.type && cat.id !== category.id);
  }, [categories, category]);

  const handleSave = async () => {
    if (!canSave || !category) return;
    if (selectedIcon === null || selectedColor === null) return;
    const defaultName = getDefaultEnglishName(category.id);
    const finalName = !userEditedRef.current && defaultName ? defaultName : name.trim();
    try {
      await categoryRepository.update(categoryId, {
        name: finalName,
        icon: selectedIcon,
        color: selectedColor,
      });
      await refreshCategories();
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  const handleDeletePress = async () => {
    if (!category) return;
    try {
      const linkedTransactions = await transactionRepository.list({ category_id: category.id });
      const canMove = sameTypeCategories.length > 0;
      setDeleteHasTransactions(linkedTransactions.length > 0 && canMove);
    } catch {
      setDeleteHasTransactions(true);
    }
    setDeleteModalVisible(true);
  };

  const handleMoveTransactions = () => {
    setDeleteModalVisible(false);
    setTargetCategoryId(null);
    setSelectModalVisible(true);
  };

  const handlePermanentDelete = async () => {
    if (!category) return;
    setDeleteModalVisible(false);
    try {
      await categoryRepository.delete(category.id);
      await refreshCategories();
      await refresh();
      navigation.goBack();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleSelectTarget = async () => {
    if (targetCategoryId === null || !category) return;
    try {
      await categoryRepository.reassignAndDelete(categoryId, targetCategoryId);
      await refreshCategories();
      await refresh();
      setSelectModalVisible(false);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  if (!category) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: c.textSecondary, fontSize: fs(16) }}>
            {labels.add_cat_no_results}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <FormScrollView>
          <View style={styles.nameRow}>
            <IconBadge
              icon={selectedIcon || category.icon}
              color={selectedColor || category.color}
                        shape={badgeShapeFor(config, 'category')}
              size={48}
              iconSize={28}
              roundedRadius={12}
              backgroundAlpha={13}
              style={styles.previewIcon}
            />
            <View style={styles.nameInputWrapper}>
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
              {validationError && (
                <Text style={[styles.errorText, { color: c.red, fontSize: fs(12) }]}>
                  {validationError}
                </Text>
              )}
            </View>
          </View>

          <SectionTitle text={labels.modify_cat_type} />
          <Text style={[styles.typeText, { color: c.textSecondary, fontSize: fs(14) }]}>
            {category.type === TRANSACTION_TYPES.expense ? labels.tab_expenses : labels.tab_income}
          </Text>

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

          <DeleteButton label={labels.modify_cat_delete} onPress={handleDeletePress} style={styles.deleteButton} />

          <PrimaryButton
            label={labels.modify_cat_save}
            onPress={handleSave}
            disabled={!canSave}
            style={styles.button}
          />

          <KeyboardSpacer />
        </FormScrollView>
      </View>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.modify_cat_delete_confirm_title(getDisplayCategoryName(category))}
        message={deleteHasTransactions
          ? labels.modify_cat_delete_confirm_message
          : labels.modify_cat_delete_confirm_message_empty}
        confirmLabel={labels.modify_cat_delete_confirm_delete}
        cancelLabel={labels.modify_cat_delete_confirm_cancel}
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteModalVisible(false)}
        moveLabel={deleteHasTransactions ? labels.modify_cat_delete_confirm_move : undefined}
        onMove={deleteHasTransactions ? handleMoveTransactions : undefined}
      />

      <ModalShell visible={selectModalVisible} onClose={() => setSelectModalVisible(false)}>
        <ModalHeader title={labels.modify_cat_select_title} size={16} />
        <ScrollView style={styles.selectList}>
          {sameTypeCategories.length === 0 ? (
            <Text style={[styles.emptySelect, { color: c.textSecondary, fontSize: fs(14) }]}>
              {labels.add_cat_no_results}
            </Text>
          ) : (
            sameTypeCategories.map((cat) => {
              const isSelected = targetCategoryId === cat.id;
              const radio = <RadioButton selected={isSelected} />;
              return (
                <ListItemRow
                  key={cat.id}
                  title={getDisplayCategoryName(cat)}
                  leading={radio}
                  icon={cat.icon}
                  color={cat.color}
                  shape={badgeShapeFor(config, 'category')}
                  badgeSize={36}
                  badgeIconSize={20}
                  badgeRadius={8}
                  badgeAlpha={20}
                  badgeGap={12}
                  style={[styles.selectItem, { backgroundColor: isSelected ? c.background : TRANSPARENT }]}
                  onPress={() => setTargetCategoryId(cat.id)}
                  accessibilityLabel={getDisplayCategoryName(cat)}
                  accessibilityState={{ selected: isSelected }}
                />
              );
            })
          )}
        </ScrollView>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => setSelectModalVisible(false)}
          >
            <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>
              {labels.modify_cat_select_cancel}
            </Text>
          </TouchableOpacity>
          <PrimaryButton
            label={labels.modify_cat_select_confirm}
            onPress={handleSelectTarget}
            disabled={targetCategoryId === null}
            disabledBg={c.textSecondary}
            enabledTextColor={WHITE}
            style={styles.modalButton}
          />
        </View>
      </ModalShell>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  previewIcon: {
    marginTop: 4,
    marginRight: 12,
  },
  nameInputWrapper: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  counter: {
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 2,
  },
  errorText: {
    marginTop: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 16,
  },
  typeText: {
    marginLeft: 4,
  },
  button: {
    marginTop: 12,
  },
  deleteButton: {
    marginTop: 16,
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  selectList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  selectItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  emptySelect: {
    textAlign: 'center',
    paddingVertical: 24,
  },
});
