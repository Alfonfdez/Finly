import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet, Keyboard, ActivityIndicator } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useDeferredRefresh } from '../hooks/useDeferredRefresh';
import { useBusyGuard } from '../hooks/useBusyGuard';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { useColorSelection } from '../hooks/useColorSelection';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { useIsDirty } from '../hooks/useIsDirty';
import { t, getDisplayAccountName, getDefaultEnglishAccountName, getAccountName, getDefaultAccountIdByName, getDisplayAccountDescription, getDefaultEnglishAccountDescription, getAccountDescription } from '../i18n';
import { accountRepository } from '../database';
import { sanitizeDefaultAccounts } from '../database/configDefaults';
import { isTotalAccount } from '../database/helpers';
import type { Account } from '../database/types';
import type { RootStackParamList, NavigationProp, IconName } from '../constants/types';
import { USER_ID } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import { QUICK_COLORS } from '../constants/colors';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import LoadErrorState from '../components/LoadErrorState';
import AccountForm from '../components/AccountForm';
import ModalEntitySubject from '../components/ModalEntitySubject';
import { getNameHintText } from '../utils/formHints';
import { badgeShapeFor } from '../utils/badgeShape';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
import { parseAmountValue } from '../utils/amountInput';

type ModifyAccountRouteProp = RouteProp<RootStackParamList, 'ModifyAccount'>;

export default function ModifyAccountScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const { accounts, refreshAccounts } = useApp();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'ModifyAccount'>>();
  const route = useRoute<ModifyAccountRouteProp>();
  const { accountId } = route.params;

  const deferredRefreshAccounts = useDeferredRefresh(refreshAccounts);
  const { busy, run } = useBusyGuard();

  const {
    data: account, loading, error, retry,
  } = useFocusLoad(
    () => accountRepository.getById(accountId),
    null as Account | null,
  );

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [initialBalanceRaw, setInitialBalanceRaw] = useState('');
  const { selectedColor, customColor, setSelectedColor, setCustomColor, handleColorSelect } = useColorSelection();
  // The account is refetched on focus; once the user has touched anything that
  // refetch must not overwrite their input.
  const userEditedRef = useRef(false);
  const markEdited = useCallback(() => { userEditedRef.current = true; }, []);

  useEffect(() => {
    if (!account || userEditedRef.current) return;
    setName(getDisplayAccountName(account));
    setSelectedIcon(account.icon);
    setSelectedColor(account.color);
    setDescription(getDisplayAccountDescription(account));
    setInitialBalanceRaw(String(account.initial_balance ?? 0));
    if (!QUICK_COLORS.includes(account.color)) {
      setCustomColor(account.color);
    }
  }, [account, setCustomColor, setSelectedColor]);

  const { nameError, checkingName, handleNameChange } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => accountRepository.existsByName(USER_ID, value, excludeId),
    resolveDefaultEnglishName: (value) => {
      const defaultId = getDefaultAccountIdByName(value);
      return defaultId !== null ? getDefaultEnglishAccountName(defaultId) : null;
    },
    duplicateErrorKey: labels.create_account_error_duplicate,
    checkErrorKey: labels.error_generic,
    excludeId: accountId,
  });

  const isTotal = account ? isTotalAccount(account) : false;
  const initialBalanceError = initialBalanceRaw.length > 0 && initialBalanceRaw !== '-' && parseAmountValue(initialBalanceRaw) === null;

  /** The values the form opened with; a re-focus refetch must not move the baseline. */
  const baseline = useMemo(() => (account ? {
    name: getDisplayAccountName(account).trim(),
    icon: account.icon,
    color: account.color,
    description: getDisplayAccountDescription(account).trim(),
    balance: account.initial_balance ?? 0,
  } : null), [account]);

  const { isDirty, resetBaseline } = useIsDirty(baseline, {
    name: name.trim(),
    icon: selectedIcon,
    color: selectedColor,
    description: description.trim(),
    balance: parseAmountValue(initialBalanceRaw) ?? 0,
  });

  useEffect(() => {
    if (!account || userEditedRef.current) return;
    resetBaseline(baseline);
  }, [account, baseline, resetBaseline]);

  const canSave = (isTotal
    ? !checkingName
    : name.trim().length > 0 && !nameError && !checkingName && initialBalanceError === false) && isDirty;

  const hintText = getNameHintText(name, nameError, labels.create_account_error_empty);

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!canSave || !account) return;
    if (selectedIcon === null || selectedColor === null) return;
    const trimmedDescription = description.trim();
    const englishDescDefault = getDefaultEnglishAccountDescription(account.id);
    const displayDescDefault = getAccountDescription(account.id);
    const updateData: { icon: string; color: string; description: string; name?: string; initial_balance?: number } = {
      icon: selectedIcon,
      color: selectedColor,
      description: englishDescDefault && trimmedDescription === displayDescDefault ? englishDescDefault : trimmedDescription,
    };
    if (!isTotal) {
      const trimmedName = name.trim();
      const englishDefault = getDefaultEnglishAccountName(account.id);
      const displayDefault = getAccountName(account.id);
      updateData.name = englishDefault && trimmedName === displayDefault ? englishDefault : trimmedName;
      updateData.initial_balance = parseAmountValue(initialBalanceRaw) ?? 0;
    }
    await run(async () => {
      await runWithErrorAlert(async () => {
        await accountRepository.update(accountId, updateData);
        navigation.goBack();
        deferredRefreshAccounts();
      }, ERROR_PREFIXES.accountUpdate);
    });
  };

  const {
    visible: deleteModalVisible, busy: deleting, open: openDeleteModal,
    close: closeDeleteModal, confirm: confirmDelete,
  } = useDeleteConfirmation({
    deleteFn: async () => {
      await accountRepository.delete(accountId);

      const remaining = accounts.filter(a => a.id !== accountId);
      const updates = sanitizeDefaultAccounts(config, remaining);
      if (Object.keys(updates).length > 0) {
        updateConfig(updates);
      }
    },
    onSuccess: async () => {
      navigation.goBack();
      deferredRefreshAccounts();
    },
    errorPrefix: ERROR_PREFIXES.accountDelete,
  });

  if (error && !loading) {
    return (
      <ScreenShell>
        <LoadErrorState onRetry={retry} />
      </ScreenShell>
    );
  }

  if (loading && !account) {
    return (
      <ScreenShell>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </ScreenShell>
    );
  }

  if (!account) {
    return (
      <ScreenShell>
        <EmptyState message={labels.accounts_empty} />
      </ScreenShell>
    );
  }

  const isLastAccount = accounts.filter(a => !isTotalAccount(a)).length <= 1;

  return (
    <>
      <ScreenShell>
        <View style={styles.content}>
          <AccountForm
            nameLabel={labels.form_name}
            namePlaceholder={labels.modify_account_name}
            showNameField
            nameDisabled={isTotal}
            name={name}
            onNameChange={(v) => { markEdited(); handleNameChange(v, setName); }}
            nameError={nameError}
            nameEmptyError={labels.create_account_error_empty}
            icons={ACCOUNT_ICONS}
            iconShape={config.accountIconShape}
            symbolTitle={labels.create_account_symbols}
            colorTitle={labels.create_account_color}
            selectedIcon={selectedIcon}
            onSelectIcon={(icon) => { markEdited(); setSelectedIcon(icon); }}
            selectedColor={selectedColor}
            customColor={customColor}
            onSelectColor={(color) => { markEdited(); handleColorSelect(color); }}
            showInitialBalance={!isTotal}
            initialBalanceLabel={labels.modify_account_initial_balance}
            initialBalanceA11yLabel={labels.a11y_initial_balance}
            initialBalanceRaw={initialBalanceRaw}
            onInitialBalanceChange={(value) => { markEdited(); setInitialBalanceRaw(value); }}
            noteLabel={labels.modify_account_note}
            description={description}
            onDescriptionChange={(value) => { markEdited(); setDescription(value); }}
            hintText={hintText}
            submitLabel={labels.modify_account_save}
            isSubmitDisabled={!canSave || busy}
            onSubmit={handleSave}
            deleteLabel={isTotal ? undefined : labels.delete}
            onDeletePress={isTotal ? undefined : openDeleteModal}
            deleteDisabled={isLastAccount || deleting}
            deleteLastHint={isLastAccount ? labels.modify_account_delete_last : null}
          />
        </View>
      </ScreenShell>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.accounts_bulk_delete_confirm_title(1)}
        icon="trash-outline"
        subject={(
          <ModalEntitySubject
            name={getDisplayAccountName(account)}
            icon={account.icon as IconName}
            color={account.color}
            shape={badgeShapeFor(config, 'account')}
          />
        )}
        message={labels.modify_account_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        busy={deleting}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
