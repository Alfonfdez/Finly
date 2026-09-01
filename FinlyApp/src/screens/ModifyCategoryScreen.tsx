import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, TextInput,
  StyleSheet, Keyboard,
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useDeferredRefresh } from '../hooks/useDeferredRefresh';
import { useColorSelection } from '../hooks/useColorSelection';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { t, getDisplayCategoryName, getDefaultEnglishName, getDefaultCategoryIdByName } from '../i18n';
import { categoryRepository, transactionRepository } from '../database';
import { type RootStackParamList, type NavigationProp, TRANSACTION_TYPES, MAX_CATEGORY_NAME_LENGTH } from '../constants/types';
import { badgeShapeFor } from '../utils/badgeShape';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
import { CATEGORY_ICONS } from '../components/IconGrid';
import { QUICK_COLORS } from '../constants/colors';
import IconBadge from '../components/IconBadge';
import IconColorSection from '../components/IconColorSection';
import ConfirmationModal from '../components/ConfirmationModal';
import CategoryTransferModal from '../components/CategoryTransferModal';
import SectionTitle from '../components/form/SectionTitle';
import PrimaryButton from '../components/form/PrimaryButton';
import DeleteButton from '../components/form/DeleteButton';
import FormScrollView from '../components/form/FormScrollView';

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

  const { nameError, checkingName, handleNameChange } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => categoryRepository.existsByName(value, excludeId),
    resolveDefaultEnglishName: (value) => {
      const defaultId = getDefaultCategoryIdByName(value);
      return defaultId !== null ? getDefaultEnglishName(defaultId) : null;
    },
    duplicateErrorKey: labels.create_cat_error_name_duplicate,
    excludeId: categoryId,
  });

  const deferredRefreshCategories = useDeferredRefresh(refreshCategories);
  const deferredRefresh = useDeferredRefresh(refresh);

  const handleNameChangeLocal = (value: string) => {
    userEditedRef.current = true;
    handleNameChange(value, setName);
  };

  const validationError = name.trim().length === 0 ? labels.create_cat_error_name_empty : nameError;
  const canSave = name.trim().length > 0 && !nameError && !checkingName;

  const sameTypeCategories = useMemo(() => {
    if (!category) return [];
    return categories.filter(cat => cat.type === category.type && cat.id !== category.id);
  }, [categories, category]);

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!canSave || !category) return;
    if (selectedIcon === null || selectedColor === null) return;
    const defaultName = getDefaultEnglishName(category.id);
    const finalName = !userEditedRef.current && defaultName ? defaultName : name.trim();
    await runWithErrorAlert(async () => {
      await categoryRepository.update(categoryId, {
        name: finalName,
        icon: selectedIcon,
        color: selectedColor,
      });
      navigation.goBack();
      deferredRefreshCategories();
    }, ERROR_PREFIXES.categoryUpdate);
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
    await runWithErrorAlert(async () => {
      await categoryRepository.delete(category.id);
      navigation.goBack();
      deferredRefreshCategories();
      deferredRefresh();
    }, ERROR_PREFIXES.categoryDelete);
  };

  const handleSelectTarget = async () => {
    if (targetCategoryId === null || !category) return;
    await runWithErrorAlert(async () => {
      await categoryRepository.reassignAndDelete(categoryId, targetCategoryId);
      setSelectModalVisible(false);
      navigation.goBack();
      deferredRefreshCategories();
      deferredRefresh();
    }, ERROR_PREFIXES.categoryDelete);
  };

  if (!category) {
    return (
      <ScreenShell>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: c.textSecondary, fontSize: fs(16) }}>
            {labels.add_cat_no_results}
          </Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
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
                onChangeText={handleNameChangeLocal}
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

      <CategoryTransferModal
        visible={selectModalVisible}
        title={labels.modify_cat_select_title}
        categories={sameTypeCategories}
        selectedId={targetCategoryId}
        confirmLabel={labels.modify_cat_select_confirm}
        cancelLabel={labels.modify_cat_select_cancel}
        onSelect={(id) => {
          if (typeof id === 'number') setTargetCategoryId(id);
        }}
        onConfirm={handleSelectTarget}
        onCancel={() => setSelectModalVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  typeText: {
    marginLeft: 4,
  },
  button: {
    marginTop: 12,
  },
  deleteButton: {
    marginTop: 16,
  },
});
