import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Modal, StyleSheet, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { t, getDisplayCategoryName, getDefaultEnglishName, getDefaultCategoryIdByName } from '../i18n';
import { isAndroid } from '../utils/platform';
import { categoryRepository, transactionRepository } from '../database';
import { RootStackParamList, BADGE_SHAPES, CONFIG_ICON_SHAPES, TRANSACTION_TYPES, MAX_CATEGORY_NAME_LENGTH } from '../constants/types';
import { WHITE } from '../constants/themes';
import IconGrid, { CATEGORY_ICONS } from '../components/IconGrid';
import ColorGrid, { QUICK_COLORS } from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';
import IconBadge from '../components/IconBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { OVERLAY_BG, MODAL_MAX_WIDTH, MODAL_BORDER_RADIUS, MODAL_PADDING, BUTTON_BORDER_RADIUS } from '../components/componentStyles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModifyCategory'>;
type ModifyCategoryRouteProp = RouteProp<RootStackParamList, 'ModifyCategory'>;

export default function ModifyCategoryScreen() {
  const { activeColors: c, config } = useConfig();
  const { categories, refreshCategories, refresh } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ModifyCategoryRouteProp>();
  const { categoryId } = route.params;

  const category = useMemo(
    () => categories.find(cat => cat.id === categoryId),
    [categories, categoryId]
  );

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const userEditedRef = useRef(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);
  const [deleteHasTransactions, setDeleteHasTransactions] = useState(false);

  useEffect(() => {
    if (category && !userEditedRef.current) {
      setName(getDisplayCategoryName(category));
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
      if (!QUICK_COLORS.includes(category.color)) {
        setCustomColor(category.color);
      }
    }
  }, [category]);

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
          const defaultExists = await categoryRepository.existsByName(englishName, categoryId);
          if (defaultExists) {
            setNameError(labels.create_cat_error_name_duplicate);
            return;
          }
        }
      }
      const exists = await categoryRepository.existsByName(value.trim(), categoryId);
      setNameError(exists ? labels.create_cat_error_name_duplicate : null);
    } catch {
      setNameError(null);
    } finally {
      setCheckingName(false);
    }
  }, [categoryId, labels.create_cat_error_name_duplicate]);

  const debouncedCheck = useUniqueNameCheck(checkNameDuplicate);

  const handleNameChange = (value: string) => {
    userEditedRef.current = true;
    setName(value);
    setNameError(null);
    debouncedCheck(value);
  };

  const validationError = name.trim().length === 0 ? labels.create_cat_error_name_empty : nameError;
  const canSave = name.trim().length > 0 && !nameError && !checkingName;
  const round = config.categoryIconShape === CONFIG_ICON_SHAPES.circle;

  const sameTypeCategories = useMemo(() => {
    if (!category) return [];
    return categories.filter(cat => cat.type === category.type && cat.id !== category.id);
  }, [categories, category]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (!QUICK_COLORS.includes(color)) {
      setCustomColor(color);
    }
  };

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
      await transactionRepository.reassignCategory(categoryId, targetCategoryId);
      await categoryRepository.delete(categoryId);
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <View style={styles.nameRow}>
            <IconBadge
              icon={selectedIcon || category.icon}
              color={selectedColor || category.color}
                        shape={round ? BADGE_SHAPES.circle : BADGE_SHAPES.rounded}
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

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.modify_cat_type}
          </Text>
          <Text style={[styles.typeText, { color: c.textSecondary, fontSize: fs(14) }]}>
            {category.type === TRANSACTION_TYPES.expense ? labels.tab_expenses : labels.tab_income}
          </Text>

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
            onSelect={handleColorSelect}
            onOpenPicker={() => setColorPickerVisible(true)}
          />

          <ColorPickerModal
            visible={colorPickerVisible}
            selectedColor={selectedColor}
            onSelect={handleColorSelect}
            onClose={() => setColorPickerVisible(false)}
          />

          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: c.red }]}
            onPress={handleDeletePress}
          >
            <Ionicons name="trash-outline" size={18} color={c.red} />
            <Text style={[styles.deleteButtonText, { color: c.red, fontSize: fs(15) }]}>
              {labels.modify_cat_delete}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: canSave ? c.primary : c.textSecondary },
            ]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={[styles.buttonText, { color: WHITE, fontSize: fs(15) }]}>
              {labels.modify_cat_save}
            </Text>
          </TouchableOpacity>

          {isAndroid && <View style={styles.keyboardSpacer} />}
        </ScrollView>
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

      <Modal visible={selectModalVisible} transparent animationType="fade" onRequestClose={() => setSelectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>
              {labels.modify_cat_select_title}
            </Text>
            <ScrollView style={styles.selectList}>
              {sameTypeCategories.length === 0 ? (
                <Text style={[styles.emptySelect, { color: c.textSecondary, fontSize: fs(14) }]}>
                  {labels.add_cat_no_results}
                </Text>
              ) : (
                sameTypeCategories.map((cat) => {
                  const isSelected = targetCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.selectItem, { backgroundColor: isSelected ? c.background : 'transparent' }]}
                      onPress={() => setTargetCategoryId(cat.id)}
                      accessibilityLabel={getDisplayCategoryName(cat)}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={[styles.radio, { borderColor: isSelected ? c.primary : c.border }]}>
                        {isSelected && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
                      </View>
                      <IconBadge
                        icon={cat.icon}
                        color={cat.color}
              shape={round ? BADGE_SHAPES.circle : BADGE_SHAPES.rounded}
                        size={36}
                        iconSize={20}
                        roundedRadius={8}
                        backgroundAlpha={20}
                        style={styles.selectIcon}
                      />
                      <Text style={[styles.selectName, { color: c.text, fontSize: fs(14) }]}>
                        {getDisplayCategoryName(cat)}
                      </Text>
                    </TouchableOpacity>
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
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: targetCategoryId !== null ? c.primary : c.textSecondary },
                ]}
                onPress={handleSelectTarget}
                disabled={targetCategoryId === null}
              >
                <Text style={[styles.modalButtonText, { color: WHITE, fontSize: fs(14) }]}>
                  {labels.modify_cat_select_confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontWeight: '600',
  },
  button: {
    marginTop: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: OVERLAY_BG,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    borderRadius: MODAL_BORDER_RADIUS,
    padding: MODAL_PADDING,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
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
  selectIcon: {
    marginHorizontal: 12,
  },
  selectName: {
    flex: 1,
    fontWeight: '500',
  },
  emptySelect: {
    textAlign: 'center',
    paddingVertical: 24,
  },
});
