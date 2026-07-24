import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Modal, StyleSheet, Keyboard, LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName, getDefaultEnglishName, getDefaultCategoryIdByName } from '../i18n';
import { isAndroid } from '../utils/platform';
import { colors } from '../constants/colors';
import { categoryRepository, transactionRepository } from '../database';
import { RootStackParamList } from '../constants/types';
import { CATEGORY_ICONS } from '../components/IconGrid';
import ColorGrid, { QUICK_COLORS } from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModifyCategory'>;
type ModifyCategoryRouteProp = RouteProp<RootStackParamList, 'ModifyCategory'>;

const MAX_NAME_LENGTH = 30;
const GRID_COLS = 4;
const GRID_GAP = 12;

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

  const [cellSize, setCellSize] = useState(0);

  const onGridLayout = (e: LayoutChangeEvent) => {
    const gridWidth = e.nativeEvent.layout.width;
    setCellSize(Math.floor((gridWidth - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS));
  };

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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (category) {
      setName(getDisplayCategoryName(category));
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
      if (!QUICK_COLORS.includes(category.color)) {
        setCustomColor(category.color);
      }
      userEditedRef.current = false;
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

  const handleNameChange = (value: string) => {
    userEditedRef.current = true;
    setName(value);
    setNameError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkNameDuplicate(value), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const validationError = name.trim().length === 0 ? labels.create_cat_error_name_empty : nameError;
  const canSave = name.trim().length > 0 && !nameError && !checkingName;
  const round = config.categoryIconShape === 'circle';

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
    const defaultName = getDefaultEnglishName(category.id);
    const finalName = !userEditedRef.current && defaultName ? defaultName : name.trim();
    try {
      await categoryRepository.update(categoryId, {
        name: finalName,
        icon: selectedIcon!,
        color: selectedColor!,
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
            <View style={[styles.previewIcon, { backgroundColor: (selectedColor || category.color) + '22', borderRadius: round ? 24 : 12 }]}>
              <Ionicons
                name={(selectedIcon || category.icon) as any}
                size={28}
                color={selectedColor || category.color}
              />
            </View>
            <View style={styles.nameInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.surface,
                    color: c.text,
                    borderColor: nameError ? colors.red : c.border,
                    fontSize: fs(14),
                  },
                ]}
                placeholder={labels.create_cat_name_placeholder}
                placeholderTextColor={c.textSecondary}
                value={name}
                onChangeText={handleNameChange}
                maxLength={MAX_NAME_LENGTH}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
                {name.length}/{MAX_NAME_LENGTH}
              </Text>
              {validationError && (
                <Text style={[styles.errorText, { color: colors.red, fontSize: fs(12) }]}>
                  {validationError}
                </Text>
              )}
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.modify_cat_type}
          </Text>
          <Text style={[styles.typeText, { color: c.textSecondary, fontSize: fs(14) }]}>
            {category.type === 'expense' ? labels.tab_expenses : labels.tab_income}
          </Text>

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_cat_symbols}
          </Text>
          <View style={styles.grid} onLayout={onGridLayout}>
            {cellSize > 0 && CATEGORY_ICONS.map((icon) => {
              const isSelected = selectedIcon === icon;
              const iconColor = isSelected && selectedColor ? selectedColor : (isSelected ? c.primary : colors.textSecondary);
              const bgColor = isSelected && selectedColor ? selectedColor + '33' : (isSelected ? c.primary + '33' : c.surface);
              const borderColor = isSelected ? (selectedColor || c.primary) : 'transparent';
              return (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.gridItem,
                    { width: cellSize, height: cellSize, borderRadius: round ? 999 : 12 },
                    { backgroundColor: bgColor },
                    isSelected && { borderWidth: 2, borderColor },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                  accessibilityLabel={icon}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Ionicons name={icon as any} size={24} color={iconColor} />
                </TouchableOpacity>
              );
            })}
          </View>

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
            style={[styles.deleteButton, { borderColor: colors.red }]}
            onPress={handleDeletePress}
          >
            <Ionicons name="trash-outline" size={18} color={colors.red} />
            <Text style={[styles.deleteButtonText, { color: colors.red, fontSize: fs(15) }]}>
              {labels.modify_cat_delete}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: canSave ? c.primary : colors.disabled },
            ]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={[styles.buttonText, { color: colors.white, fontSize: fs(15) }]}>
              {labels.modify_cat_save}
            </Text>
          </TouchableOpacity>

          {isAndroid && <View style={styles.keyboardSpacer} />}
        </ScrollView>
      </View>

      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>
              {labels.modify_cat_delete_confirm_title(getDisplayCategoryName(category))}
            </Text>
            <Text style={[styles.modalMessage, { color: c.textSecondary, fontSize: fs(14) }]}>
              {deleteHasTransactions
                ? labels.modify_cat_delete_confirm_message
                : labels.modify_cat_delete_confirm_message_empty}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonFull, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>
                  {labels.modify_cat_delete_confirm_cancel}
                </Text>
              </TouchableOpacity>
              <View style={styles.modalButtonRow}>
                {deleteHasTransactions && (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: c.primary }]}
                    onPress={handleMoveTransactions}
                  >
                    <Text style={[styles.modalButtonText, { color: c.background, fontSize: fs(14) }]}>
                      {labels.modify_cat_delete_confirm_move}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.red }]}
                  onPress={handlePermanentDelete}
                >
                  <Text style={[styles.modalButtonText, { color: colors.white, fontSize: fs(14) }]}>
                    {labels.modify_cat_delete_confirm_delete}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

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
                      <View style={[styles.selectIcon, { backgroundColor: cat.color + '33', borderRadius: round ? 18 : 8 }]}>
                        <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                      </View>
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
                  { backgroundColor: targetCategoryId !== null ? c.primary : colors.disabled },
                ]}
                onPress={handleSelectTarget}
                disabled={targetCategoryId === null}
              >
                <Text style={[styles.modalButtonText, { color: colors.white, fontSize: fs(14) }]}>
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
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonFull: {
    width: '100%',
    flex: 0,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: 10,
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
