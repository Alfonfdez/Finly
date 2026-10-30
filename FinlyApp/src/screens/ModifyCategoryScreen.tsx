import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import { useBusyGuard } from '../hooks/useBusyGuard';
import { useColorSelection } from '../hooks/useColorSelection';
import { useIsDirty } from '../hooks/useIsDirty';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { t, getDefaultCategoryName, getDisplayCategoryName, getDefaultEnglishName, getDefaultCategoryIdByName } from '../i18n';
import { categoryRepository, recurringRepository, transactionRepository } from '../database';
import { type RootStackParamList, type NavigationProp, type IconName, TRANSACTION_TYPES, MAX_CATEGORY_NAME_LENGTH, USER_ID } from '../constants/types';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
import { badgeShapeFor } from '../utils/badgeShape';
import { BUTTON_BORDER_RADIUS } from '../components/componentStyles';
import { CATEGORY_ICONS } from '../components/IconGrid';
import { QUICK_COLORS } from '../constants/colors';
import IconColorSection from '../components/IconColorSection';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ModalEntitySubject from '../components/ModalEntitySubject';
import CategoryTransferModal from '../components/CategoryTransferModal';
import FormSectionHeader from '../components/form/FormSectionHeader';
import PrimaryButton from '../components/form/PrimaryButton';
import FormActions from '../components/form/FormActions';
import CharCounter from '../components/form/CharCounter';
import FormScrollView from '../components/form/FormScrollView';
import { formStyles } from '../components/form/formStyles';

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
    [categories, categoryId],
  );

  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const userEditedRef = useRef(false);
  const markEdited = useCallback(() => { userEditedRef.current = true; }, []);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);
  const [deleteCounts, setDeleteCounts] = useState<{ tx: number; rules: number } | null>(null);
  const [deleteCountsUnknown, setDeleteCountsUnknown] = useState(false);
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
    existsByName: (value, excludeId) => categoryRepository.existsByName(USER_ID, value, excludeId),
    resolveDefaultEnglishName: (value) => {
      const defaultId = getDefaultCategoryIdByName(value);
      return defaultId !== null ? getDefaultEnglishName(defaultId) : null;
    },
    duplicateErrorKey: labels.create_cat_error_name_duplicate,
    checkErrorKey: labels.error_generic,
    excludeId: categoryId,
  });

  const deferredRefreshCategories = useDeferredRefresh(refreshCategories);
  const deferredRefresh = useDeferredRefresh(refresh);
  const { busy, run } = useBusyGuard();

  const handleNameChangeLocal = (value: string) => {
    markEdited();
    setNameTouched(true);
    handleNameChange(value, setName);
  };

  const validationError = name.trim().length === 0 ? labels.create_cat_error_name_empty : nameError;

  /** The values the form opened with; a refetch must not move the baseline. */
  const baseline = useMemo(() => (category ? {
    name: getDisplayCategoryName(category).trim(),
    icon: category.icon,
    color: category.color,
  } : null), [category]);

  const { isDirty, resetBaseline } = useIsDirty(baseline, {
    name: name.trim(),
    icon: selectedIcon,
    color: selectedColor,
  });

  useEffect(() => {
    if (!category || userEditedRef.current) return;
    resetBaseline(baseline);
  }, [category, baseline, resetBaseline]);

  const canSave = name.trim().length > 0 && !nameError && !checkingName && isDirty;

  const sameTypeCategories = useMemo(() => {
    if (!category) return [];
    return categories.filter(cat => cat.type === category.type && cat.id !== category.id);
  }, [categories, category]);

  /** The last category of its type can't be deleted (an income/expense needs one). */
  const isLastOfType = sameTypeCategories.length === 0;
  const deleteHasTransactions = deleteCountsUnknown || (deleteCounts?.tx ?? 0) > 0;
  const deleteHasRules = deleteCountsUnknown || (deleteCounts?.rules ?? 0) > 0;
  const deleteRemovesData = deleteHasTransactions || deleteHasRules;
  const deleteSubjectSubtitle = deleteCounts
    ? labels.categories_bulk_move_data(deleteCounts.tx, deleteCounts.rules) || undefined
    : undefined;

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!canSave || !category) return;
    if (selectedIcon === null || selectedColor === null) return;
    // Still showing the localized default? Persist the canonical English name so the
    // category keeps following the app language (same rule as the account screen).
    const trimmedName = name.trim();
    const englishDefault = getDefaultEnglishName(category.id);
    const localizedDefault = getDefaultCategoryName(category.id);
    const finalName = englishDefault && trimmedName === localizedDefault ? englishDefault : trimmedName;
    await run(async () => {
      await runWithErrorAlert(async () => {
        await categoryRepository.update(categoryId, {
          name: finalName,
          icon: selectedIcon,
          color: selectedColor,
        });
        navigation.goBack();
        deferredRefreshCategories();
      }, ERROR_PREFIXES.categoryUpdate);
    });
  };

  const handleDeletePress = async () => {
    if (!category || isLastOfType) return;
    try {
      const [linkedTransactions, ruleCounts] = await Promise.all([
        transactionRepository.list({ category_id: category.id }),
        recurringRepository.countByCategoryIds([category.id]),
      ]);
      setDeleteCounts({
        tx: linkedTransactions.length,
        rules: ruleCounts[category.id] ?? 0,
      });
      setDeleteCountsUnknown(false);
    } catch {
      setDeleteCounts(null);
      setDeleteCountsUnknown(true);
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
    await run(async () => {
      await runWithErrorAlert(async () => {
        await categoryRepository.delete(category.id);
        navigation.goBack();
        deferredRefreshCategories();
        deferredRefresh();
      }, ERROR_PREFIXES.categoryDelete);
    });
  };

  const handleSelectTarget = async () => {
    if (targetCategoryId === null || !category) return;
    await run(async () => {
      await runWithErrorAlert(async () => {
        await categoryRepository.reassignAndDelete(categoryId, targetCategoryId);
        setSelectModalVisible(false);
        navigation.goBack();
        deferredRefreshCategories();
        deferredRefresh();
      }, ERROR_PREFIXES.categoryDelete);
    });
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
          <FormSectionHeader
            title={labels.form_name}
            icon="id-card-outline"
            style={formStyles.firstSection}
            right={<CharCounter value={name.length} maxLength={MAX_CATEGORY_NAME_LENGTH} />}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: c.surface,
                color: c.text,
                borderColor: nameTouched && validationError ? c.red : c.border,
                fontSize: fs(14),
              },
            ]}
            placeholder={labels.create_cat_name_placeholder}
            placeholderTextColor={c.textSecondary}
            value={name}
            onChangeText={handleNameChangeLocal}
            onBlur={() => setNameTouched(true)}
            maxLength={Math.max(MAX_CATEGORY_NAME_LENGTH, name.length)}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <FormSectionHeader title={labels.modify_cat_type} icon="swap-horizontal-outline" />
          <Text style={[styles.typeText, { color: c.textSecondary, fontSize: fs(14) }]}>
            {category.type === TRANSACTION_TYPES.expense ? labels.tab_expenses : labels.tab_income}
          </Text>

          <IconColorSection
            icons={CATEGORY_ICONS}
            shape={config.categoryIconShape}
            symbolTitle={labels.create_cat_symbols}
            colorTitle={labels.create_cat_color}
            selectedIcon={selectedIcon}
            onSelectIcon={(icon) => { markEdited(); setSelectedIcon(icon); }}
            selectedColor={selectedColor}
            customColor={customColor}
            onSelectColor={(color) => { markEdited(); handleColorSelect(color); }}
          />

          <FormActions
            deleteLabel={labels.delete}
            onDeletePress={handleDeletePress}
            deleteDisabled={isLastOfType || busy}
            deleteHint={isLastOfType ? labels.modify_cat_delete_last : null}
            saveHint={validationError}
          >
            <PrimaryButton label={labels.modify_cat_save} onPress={handleSave} disabled={!canSave || busy} />
          </FormActions>
        </FormScrollView>
      </View>

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        title={labels.categories_bulk_delete_confirm_title(1)}
        subject={(
          <ModalEntitySubject
            name={getDisplayCategoryName(category)}
            icon={category.icon as IconName}
            color={category.color}
            shape={badgeShapeFor(config, 'category')}
            subtitle={deleteSubjectSubtitle}
          />
        )}
        message={deleteHasTransactions && deleteHasRules
          ? labels.modify_cat_delete_confirm_message_tx_rules
          : deleteHasTransactions
            ? labels.modify_cat_delete_confirm_message
            : deleteHasRules
              ? labels.modify_cat_delete_confirm_message_rules
              : labels.modify_cat_delete_confirm_message_empty}
        confirmLabel={labels.modify_cat_delete_confirm_delete}
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteModalVisible(false)}
        moveLabel={deleteRemovesData ? labels.modify_cat_delete_confirm_move : undefined}
        onMove={deleteRemovesData ? handleMoveTransactions : undefined}
        busy={busy}
      />

      <CategoryTransferModal
        visible={selectModalVisible}
        title={labels.categories_bulk_move_title}
        sourceCategory={category}
        sourceSubtitle={deleteSubjectSubtitle}
        categories={sameTypeCategories}
        selectedId={targetCategoryId}
        confirmLabel={labels.categories_bulk_move_confirm}
        cancelLabel={labels.cancel}
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
  input: {
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    padding: 12,
  },
  typeText: {
    marginLeft: 4,
  },
});
