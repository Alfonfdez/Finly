import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig, type Config } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { useColorSelection } from '../hooks/useColorSelection';
import { t, getDisplayAccountName, getDefaultEnglishAccountName, getAccountName, getDefaultAccountIdByName, getDisplayAccountDescription, getDefaultEnglishAccountDescription, getAccountDescription } from '../i18n';
import { accountRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import type { Account } from '../database/types';
import type { RootStackParamList, NavigationProp } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import { QUICK_COLORS } from '../constants/colors';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import AccountForm from '../components/AccountForm';
import { getNameHintText } from '../utils/formHints';

type ModifyAccountRouteProp = RouteProp<RootStackParamList, 'ModifyAccount'>;

export default function ModifyAccountScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const { accounts, refreshAccounts } = useApp();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'ModifyAccount'>>();
  const route = useRoute<ModifyAccountRouteProp>();
  const { accountId } = route.params;

  const [account, setAccount] = useState<Account | null>(null);

  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [description, setDescription] = useState('');
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

  const { nameError, checkingName, clearNameError, debouncedCheck } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => accountRepository.existsByName(value, excludeId),
    resolveDefaultEnglishName: (value) => {
      const defaultId = getDefaultAccountIdByName(value);
      return defaultId !== null ? getDefaultEnglishAccountName(defaultId) : null;
    },
    duplicateErrorKey: labels.modify_account_error_duplicate,
    excludeId: accountId,
  });

  const handleNameChange = (value: string) => {
    setName(value);
    setNameTouched(true);
    clearNameError();
    debouncedCheck(value);
  };

  const isTotal = account ? isTotalAccount(account) : false;

  const canSave = isTotal
    ? !checkingName
    : name.trim().length > 0 && !nameError && !checkingName;

  const hintText = getNameHintText(name, nameError, labels.modify_account_error_empty);

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

  const isLastAccount = accounts.filter(a => !isTotalAccount(a)).length <= 1;

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
        <View style={styles.content}>
          <AccountForm
            nameLabel={labels.modify_account_name}
            showNameField
            nameDisabled={isTotal}
            name={name}
            onNameChange={handleNameChange}
            nameErrorDisplay={(nameError || (nameTouched && name.trim().length === 0)) ? (nameError ?? ' ') : null}
            icons={ACCOUNT_ICONS}
            iconShape={config.accountIconShape}
            symbolTitle={labels.create_account_symbols}
            colorTitle={labels.create_account_color}
            selectedIcon={selectedIcon}
            onSelectIcon={setSelectedIcon}
            selectedColor={selectedColor}
            customColor={customColor}
            onSelectColor={handleColorSelect}
            noteLabel={labels.modify_account_note}
            description={description}
            onDescriptionChange={setDescription}
            hintText={hintText}
            submitLabel={labels.modify_account_save}
            isSubmitDisabled={!canSave}
            onSubmit={handleSave}
            deleteLabel={isTotal ? undefined : labels.modify_account_delete}
            onDeletePress={isTotal ? undefined : () => setDeleteModalVisible(true)}
            deleteDisabled={isLastAccount}
            deleteLastHint={isLastAccount ? labels.modify_account_delete_last : null}
          />
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
});
