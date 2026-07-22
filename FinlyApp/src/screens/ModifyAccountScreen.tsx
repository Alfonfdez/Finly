import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Keyboard, Platform, LayoutChangeEvent, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig, Config } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayAccountName, getDefaultEnglishAccountName, getAccountName, getAllDefaultAccountNames, getDisplayAccountDescription, getDefaultEnglishAccountDescription, getAccountDescription } from '../i18n';
import { accountRepository } from '../database';
import { Account } from '../database/types';
import { RootStackParamList } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import ColorGrid, { QUICK_COLORS } from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModifyAccount'>;
type ModifyAccountRouteProp = RouteProp<RootStackParamList, 'ModifyAccount'>;

const MAX_NAME_LENGTH = 30;
const MAX_NOTE_LENGTH = 200;
const GRID_COLS = 4;
const GRID_GAP = 12;

export default function ModifyAccountScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const { accounts, refreshAccounts } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const round = config.accountIconShape === 'circle';
  const route = useRoute<ModifyAccountRouteProp>();
  const { accountId } = route.params;

  const [account, setAccount] = useState<Account | null>(null);
  const [accountCount, setAccountCount] = useState(0);
  const [cellSize, setCellSize] = useState(0);

  const onGridLayout = (e: LayoutChangeEvent) => {
    const gridWidth = e.nativeEvent.layout.width;
    setCellSize(Math.floor((gridWidth - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS));
  };

  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [checkingName, setCheckingName] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    accountRepository.list(1).then((list) => {
      setAccountCount(list.length);
      const found = list.find(a => a.id === accountId);
      if (found) {
        setAccount(found);
        setName(getDisplayAccountName(found));
        setSelectedIcon(found.icon);
        setSelectedColor(found.color);
        setDescription(getDisplayAccountDescription(found));
        if (!QUICK_COLORS.includes(found.color)) {
          setCustomColor(found.color);
        }
      }
    });
  }, [accountId]);

  const checkNameDuplicate = useCallback(async (value: string) => {
    if (!value.trim()) {
      setNameError(null);
      setCheckingName(false);
      return;
    }
    setCheckingName(true);
    try {
      const exists = await accountRepository.existsByName(value.trim(), accountId);
      const isDefaultName = getAllDefaultAccountNames().has(value.trim().toLowerCase());
      setNameError(exists || isDefaultName ? labels.modify_account_error_duplicate : null);
    } catch {
      setNameError(null);
    } finally {
      setCheckingName(false);
    }
  }, [accountId, labels.modify_account_error_duplicate]);

  const handleNameChange = (value: string) => {
    setName(value);
    setNameTouched(true);
    setNameError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkNameDuplicate(value), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isTotal = (account?.is_total ?? 0) === 1;

  const canSave = isTotal
    ? !checkingName
    : name.trim().length > 0 && !nameError && !checkingName;

  const getHintText = (): string | null => {
    if (name.trim().length === 0) return labels.modify_account_error_empty;
    if (nameError) return nameError;
    return null;
  };

  const handleSave = async () => {
    if (!canSave || !account) return;
    const trimmedDescription = description.trim();
    const englishDescDefault = getDefaultEnglishAccountDescription(account.id);
    const displayDescDefault = getAccountDescription(account.id);
    const updateData: { icon: string; color: string; description: string; name?: string } = {
      icon: selectedIcon!,
      color: selectedColor!,
      description: englishDescDefault && trimmedDescription === displayDescDefault ? englishDescDefault : trimmedDescription,
    };
    if (!isTotal) {
      const trimmedName = name.trim();
      const englishDefault = getDefaultEnglishAccountName(account.id);
      const displayDefault = getAccountName(account.id);
      updateData.name = englishDefault && trimmedName === displayDefault ? englishDefault : trimmedName;
    }
    try {
      await accountRepository.update(accountId, updateData);
      await refreshAccounts();
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update account:', err);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (!QUICK_COLORS.includes(color)) {
      setCustomColor(color);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await accountRepository.delete(accountId);
      await refreshAccounts();

      const updates: Partial<Config> = {};
      if (config.homeDefaultAccountId === accountId) {
        updates.homeDefaultAccountId = null;
      }
      if (config.addDefaultAccountId === accountId) {
        const remaining = accounts.filter(a => a.id !== accountId && a.is_total !== 1);
        updates.addDefaultAccountId = remaining.length > 0 ? remaining[0].id : null;
      }
      if (Object.keys(updates).length > 0) {
        updateConfig(updates);
      }

      navigation.goBack();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  if (!account) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: c.textSecondary, fontSize: fs(16) }}>
            {labels.accounts_empty}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const hintText = getHintText();
  const isLastAccount = accountCount <= 1;

  return (
    <>
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {!isTotal && (
            <>
              <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
                {labels.modify_account_name}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.surface,
                    color: c.text,
                    borderColor: nameError || (nameTouched && name.trim().length === 0) ? '#F87171' : c.border,
                    fontSize: fs(14),
                  },
                ]}
                value={name}
                onChangeText={handleNameChange}
                maxLength={MAX_NAME_LENGTH}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
                {name.length}/{MAX_NAME_LENGTH}
              </Text>
            </>
          )}

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_account_symbols}
          </Text>
          <View style={styles.grid} onLayout={onGridLayout}>
            {cellSize > 0 && ACCOUNT_ICONS.map((icon) => {
              const isSelected = selectedIcon === icon;
              const iconColor = isSelected && selectedColor ? selectedColor : (isSelected ? c.primary : '#94A3B8');
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
            {labels.create_account_color}
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
            onSelect={(color) => {
              handleColorSelect(color);
            }}
            onClose={() => setColorPickerVisible(false)}
          />

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.modify_account_note}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: c.surface,
                color: c.text,
                borderColor: c.border,
                fontSize: fs(14),
              },
            ]}
            value={description}
            onChangeText={(value) => {
              if (value.length <= MAX_NOTE_LENGTH) setDescription(value);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
            {description.length}/{MAX_NOTE_LENGTH}
          </Text>

          {hintText && (
            <Text style={[styles.hint, { color: '#F87171', fontSize: fs(12) }]}>
              {hintText}
            </Text>
          )}

          {!isTotal && (
            <>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  isLastAccount
                    ? { borderColor: c.border, opacity: 0.5 }
                    : { borderColor: '#F87171' },
                ]}
                onPress={() => !isLastAccount && setDeleteModalVisible(true)}
                disabled={isLastAccount}
                accessibilityState={{ disabled: isLastAccount }}
              >
                <Ionicons name="trash-outline" size={18} color={isLastAccount ? c.textSecondary : '#F87171'} />
                <Text style={[styles.deleteButtonText, { color: isLastAccount ? c.textSecondary : '#F87171', fontSize: fs(15) }]}>
                  {labels.modify_account_delete}
                </Text>
              </TouchableOpacity>

              {isLastAccount && (
                <Text style={[styles.hint, { color: c.textSecondary, fontSize: fs(12) }]}>
                  {labels.modify_account_delete_last}
                </Text>
              )}
            </>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: canSave ? c.primary : '#475569' },
            ]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: fs(15) }]}>
              {labels.modify_account_save}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'android' && <View style={styles.keyboardSpacer} />}
        </ScrollView>
      </View>
    </SafeAreaView>

      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>
              {account && labels.modify_account_delete_confirm_title(getDisplayAccountName(account))}
            </Text>
            <Text style={[styles.modalMessage, { color: c.textSecondary, fontSize: fs(14) }]}>
              {labels.modify_account_delete_confirm_message}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>
                  {labels.modify_account_delete_confirm_cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F87171' }]}
                onPress={handleDeleteConfirm}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontSize: fs(14) }]}>
                  {labels.modify_account_delete_confirm_delete}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  textArea: {
    minHeight: 80,
  },
  counter: {
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
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
  hint: {
    marginTop: 16,
    textAlign: 'center',
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
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontWeight: '600',
  },
});
