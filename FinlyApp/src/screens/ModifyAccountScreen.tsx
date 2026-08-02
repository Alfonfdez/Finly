import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig, Config } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { useColorSelection } from '../hooks/useColorSelection';
import { t, getDisplayAccountName, getDefaultEnglishAccountName, getAccountName, getDefaultAccountIdByName, getDisplayAccountDescription, getDefaultEnglishAccountDescription, getAccountDescription } from '../i18n';
import { accountRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import { Account } from '../database/types';
import { RootStackParamList, MAX_ACCOUNT_NAME_LENGTH, MAX_NOTE_LENGTH } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import IconGrid from '../components/IconGrid';
import ColorGrid, { QUICK_COLORS } from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import SectionTitle from '../components/form/SectionTitle';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormError from '../components/form/FormError';
import DeleteButton from '../components/form/DeleteButton';
import KeyboardSpacer from '../components/form/KeyboardSpacer';
import FormScrollView from '../components/form/FormScrollView';

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
  const [description, setDescription] = useState('');
  const [checkingName, setCheckingName] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { selectedColor, customColor, setSelectedColor, setCustomColor, handleColorSelect } = useColorSelection();

  useEffect(() => {
    let active = true;
    accountRepository.getById(accountId).then((found) => {
      if (!active || !found) return;
      setAccount(found);
      setName(getDisplayAccountName(found));
      setSelectedIcon(found.icon);
      setSelectedColor(found.color);
      setDescription(getDisplayAccountDescription(found));
      if (!QUICK_COLORS.includes(found.color)) {
        setCustomColor(found.color);
      }
    });
    return () => { active = false; };
  }, [accountId, setCustomColor, setSelectedColor]);

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

  const handleDeleteConfirm = async () => {    try {
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
        <FormScrollView>
          {!isTotal && (
            <LabeledTextField
              label={labels.modify_account_name}
              placeholder={labels.modify_account_name}
              value={name}
              onChangeText={handleNameChange}
              maxLength={MAX_ACCOUNT_NAME_LENGTH}
              autoCapitalize="words"
              autoCorrect={false}
              error={(nameError || (nameTouched && name.trim().length === 0)) ? (nameError ?? ' ') : null}
              showCounter
            />
          )}

          <SectionTitle text={labels.create_account_symbols} />
          <IconGrid
            icons={ACCOUNT_ICONS}
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            shape={config.accountIconShape}
            onSelect={setSelectedIcon}
          />

          <SectionTitle text={labels.create_account_color} />
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

          <LabeledTextField
            label={labels.modify_account_note}
            value={description}
            onChangeText={(value) => {
              if (value.length <= MAX_NOTE_LENGTH) setDescription(value);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={MAX_NOTE_LENGTH}
            showCounter
          />

          <FormError message={hintText} fontSize={fs(12)} style={styles.hint} />

          {!isTotal && (
            <>
              <DeleteButton
                label={labels.modify_account_delete}
                onPress={() => !isLastAccount && setDeleteModalVisible(true)}
                disabled={isLastAccount}
                style={styles.deleteButton}
              />

              {isLastAccount && (
                <Text style={[styles.hint, { color: c.textSecondary, fontSize: fs(12) }]}>
                  {labels.modify_account_delete_last}
                </Text>
              )}
            </>
          )}

          <PrimaryButton
            label={labels.modify_account_save}
            onPress={handleSave}
            disabled={!canSave}
            style={styles.button}
          />

          <KeyboardSpacer />
        </FormScrollView>
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
  hint: {
    marginTop: 16,
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  button: {
    marginTop: 12,
  },
});
