import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig, Config } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { t, getDisplayAccountName, getDefaultEnglishAccountName, getAccountName, getDefaultAccountIdByName, getDisplayAccountDescription, getDefaultEnglishAccountDescription, getAccountDescription } from '../i18n';
import { isAndroid } from '../utils/platform';
import { accountRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import { Account } from '../database/types';
import { RootStackParamList, MAX_ACCOUNT_NAME_LENGTH, MAX_NOTE_LENGTH } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import { WHITE } from '../constants/themes';
import IconGrid from '../components/IconGrid';
import ColorGrid, { QUICK_COLORS } from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModifyAccount'>;
type ModifyAccountRouteProp = RouteProp<RootStackParamList, 'ModifyAccount'>;

export default function ModifyAccountScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const { accounts, refreshAccounts } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ModifyAccountRouteProp>();
  const { accountId } = route.params;

  const [account, setAccount] = useState<Account | null>(null);

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

  useEffect(() => {
    accountRepository.getById(accountId).then((found) => {
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
      const defaultId = getDefaultAccountIdByName(value.trim());
      if (defaultId !== null) {
        const englishName = getDefaultEnglishAccountName(defaultId);
        if (englishName) {
          const defaultExists = await accountRepository.existsByName(englishName, accountId);
          if (defaultExists) {
            setNameError(labels.modify_account_error_duplicate);
            return;
          }
        }
      }
      const exists = await accountRepository.existsByName(value.trim(), accountId);
      setNameError(exists ? labels.modify_account_error_duplicate : null);
    } catch {
      setNameError(null);
    } finally {
      setCheckingName(false);
    }
  }, [accountId, labels.modify_account_error_duplicate]);

  const debouncedCheck = useUniqueNameCheck(checkNameDuplicate);

  const handleNameChange = (value: string) => {
    setName(value);
    setNameTouched(true);
    setNameError(null);
    debouncedCheck(value);
  };

  const isTotal = account ? isTotalAccount(account) : false;

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
    if (selectedIcon === null || selectedColor === null) return;
    const trimmedDescription = description.trim();
    const englishDescDefault = getDefaultEnglishAccountDescription(account.id);
    const displayDescDefault = getAccountDescription(account.id);
    const updateData: { icon: string; color: string; description: string; name?: string } = {
      icon: selectedIcon,
      color: selectedColor,
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
        const remaining = accounts.filter(a => a.id !== accountId && !isTotalAccount(a));
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
        <EmptyState message={labels.accounts_empty} />
      </SafeAreaView>
    );
  }

  const hintText = getHintText();
  const isLastAccount = accounts.length <= 1;

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
                    borderColor: nameError || (nameTouched && name.trim().length === 0) ? c.red : c.border,
                    fontSize: fs(14),
                  },
                ]}
                value={name}
                onChangeText={handleNameChange}
                maxLength={MAX_ACCOUNT_NAME_LENGTH}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
                {name.length}/{MAX_ACCOUNT_NAME_LENGTH}
              </Text>
            </>
          )}

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_account_symbols}
          </Text>
          <IconGrid
            icons={ACCOUNT_ICONS}
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            shape={config.accountIconShape}
            onSelect={setSelectedIcon}
          />

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
            <Text style={[styles.hint, { color: c.red, fontSize: fs(12) }]}>
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
                    : { borderColor: c.red },
                ]}
                onPress={() => !isLastAccount && setDeleteModalVisible(true)}
                disabled={isLastAccount}
                accessibilityState={{ disabled: isLastAccount }}
              >
                <Ionicons name="trash-outline" size={18} color={isLastAccount ? c.textSecondary : c.red} />
                <Text style={[styles.deleteButtonText, { color: isLastAccount ? c.textSecondary : c.red, fontSize: fs(15) }]}>
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
              { backgroundColor: canSave ? c.primary : c.textSecondary },
            ]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={[styles.buttonText, { color: WHITE, fontSize: fs(15) }]}>
              {labels.modify_account_save}
            </Text>
          </TouchableOpacity>

          {isAndroid && <View style={styles.keyboardSpacer} />}
        </ScrollView>
      </View>
    </SafeAreaView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.modify_account_delete_confirm_title(getDisplayAccountName(account))}
        message={labels.modify_account_delete_confirm_message}
        confirmLabel={labels.modify_account_delete_confirm_delete}
        cancelLabel={labels.modify_account_delete_confirm_cancel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
      />
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
});
