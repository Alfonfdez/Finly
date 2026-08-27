import { useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { useColorSelection } from '../hooks/useColorSelection';
import { useDeferredRefresh } from '../hooks/useDeferredRefresh';
import { t, getDefaultAccountIdByName, getDefaultEnglishAccountName } from '../i18n';
import { accountRepository } from '../database';
import { type NavigationProp, USER_ID } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import { getIconColorHintText } from '../utils/formHints';
import { parseAmountValue } from '../utils/amountInput';
import { showErrorAlert } from '../utils/errors';
import AccountForm from '../components/AccountForm';

export default function CreateAccountScreen() {
  const { config } = useConfig();
  const { refreshAccounts } = useApp();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'CreateAccount'>>();

  const deferredRefreshAccounts = useDeferredRefresh(refreshAccounts);

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [initialBalanceRaw, setInitialBalanceRaw] = useState('');
  const { selectedColor, customColor, handleColorSelect } = useColorSelection();

  const { nameError, checkingName, handleNameChange } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => accountRepository.existsByName(value, excludeId),
    resolveDefaultEnglishName: (value) => {
      const defaultId = getDefaultAccountIdByName(value);
      return defaultId !== null ? getDefaultEnglishAccountName(defaultId) : null;
    },
    duplicateErrorKey: labels.create_account_error_duplicate,
  });

  const initialBalanceError = initialBalanceRaw.length > 0 && parseAmountValue(initialBalanceRaw) === null;

  const canCreate = name.trim().length > 0 && !nameError && !checkingName && selectedIcon !== null && selectedColor !== null && initialBalanceError === false;

  const hintText = getIconColorHintText(
    name,
    nameError,
    selectedIcon,
    selectedColor,
    {
      empty: labels.create_account_error_empty,
      iconColor: labels.create_account_error_icon_color,
      icon: labels.create_account_error_icon,
      color: labels.create_account_error_color,
    }
  );

  const handleCreate = async () => {
    Keyboard.dismiss();
    if (!canCreate || selectedIcon === null || selectedColor === null) return;
    try {
      await accountRepository.create({
        user_id: USER_ID,
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        initial_balance: parseAmountValue(initialBalanceRaw) ?? 0,
        description: description.trim(),
      });
      navigation.goBack();
      deferredRefreshAccounts();
    } catch (err) {
      console.error('Failed to create account:', err);
      showErrorAlert(labels);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.content}>
        <AccountForm
          nameLabel={labels.create_account_name}
          showNameField
          name={name}
          onNameChange={(v) => handleNameChange(v, setName)}
          nameErrorDisplay={nameError}
          icons={ACCOUNT_ICONS}
          iconShape={config.accountIconShape}
          symbolTitle={labels.create_account_symbols}
          colorTitle={labels.create_account_color}
          selectedIcon={selectedIcon}
          onSelectIcon={setSelectedIcon}
          selectedColor={selectedColor}
          customColor={customColor}
          onSelectColor={handleColorSelect}
          showInitialBalance
          initialBalanceLabel={labels.create_account_initial_balance}
          initialBalanceA11yLabel={labels.a11y_initial_balance}
          initialBalanceRaw={initialBalanceRaw}
          onInitialBalanceChange={setInitialBalanceRaw}
          noteLabel={labels.create_account_note}
          description={description}
          onDescriptionChange={setDescription}
          hintText={hintText}
          submitLabel={labels.create_account_button}
          isSubmitDisabled={!canCreate}
          onSubmit={handleCreate}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
