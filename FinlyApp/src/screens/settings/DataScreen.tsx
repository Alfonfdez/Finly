import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { transactionRepository, accountRepository, categoryRepository, tagRepository } from '../../database';
import { resetDatabase } from '../../database/database';
import ConfirmationModal from '../../components/ConfirmationModal';
import SettingsRow from '../../components/settings/SettingsRow';
import { settingsStyles } from '../../components/settings/settingsStyles';
import { DELETE_ALL_CONFIRMATION } from '../../constants/types';

export default function DataScreen() {
  const { activeColors: c } = useConfig();
  const { resetAll } = useApp();
  const fs = useFontSize();
  const labels = t();

  const [deleteTransactionsModal, setDeleteTransactionsModal] = useState(false);
  const [deleteAllModal1, setDeleteAllModal1] = useState(false);
  const [deleteAllModal2, setDeleteAllModal2] = useState(false);
  const [deleteAllText, setDeleteAllText] = useState('');

  const closeDeleteAll = () => {
    setDeleteAllModal1(false);
    setDeleteAllModal2(false);
    setDeleteAllText('');
  };

  const handleDeleteTransactions = async () => {
    try {
      await transactionRepository.deleteAllTransactions();
      await resetAll();
    } catch (error) {
      console.error('Failed to delete all transactions:', error);
      Alert.alert(labels.settings_delete_transactions_error_title, labels.settings_delete_transactions_error_message);
    }
    setDeleteTransactionsModal(false);
  };

  const handleDeleteAll = async () => {
    try {
      await transactionRepository.deleteAllTransactions();
      await accountRepository.deleteAll();
      await categoryRepository.deleteAll();
      await tagRepository.deleteAll();
      await resetDatabase();
      await resetAll();
    } catch (error) {
      console.error('Failed to delete all data:', error);
      Alert.alert(labels.settings_delete_data_error_title, labels.settings_delete_data_error_message);
    }
    closeDeleteAll();
  };

  const canDeleteAll = deleteAllText.toUpperCase() === DELETE_ALL_CONFIRMATION;

  return (
    <ScrollView style={[settingsStyles.container, { backgroundColor: c.background }]} contentContainerStyle={settingsStyles.content}>
      <SettingsRow
        icon="trash-outline"
        iconColor={c.red}
        label={labels.settings_delete_all_transactions}
        labelColor={c.red}
        onPress={() => setDeleteTransactionsModal(true)}
      />

      <SettingsRow
        icon="warning-outline"
        iconColor={c.red}
        label={labels.settings_delete_all_data}
        labelColor={c.red}
        onPress={() => setDeleteAllModal1(true)}
      />

      <ConfirmationModal
        visible={deleteTransactionsModal}
        title={labels.settings_delete_transactions_confirm_title}
        message={labels.settings_delete_transactions_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={handleDeleteTransactions}
        onCancel={() => setDeleteTransactionsModal(false)}
      />

      <ConfirmationModal
        visible={deleteAllModal1}
        title={labels.settings_delete_data_confirm_title}
        message={labels.settings_delete_data_confirm_message}
        confirmLabel={labels.settings_delete_confirm}
        cancelLabel={labels.cancel}
        onConfirm={() => setDeleteAllModal2(true)}
        onCancel={() => setDeleteAllModal1(false)}
      />

      <ConfirmationModal
        visible={deleteAllModal2}
        title={labels.settings_delete_data_confirm_title2}
        message={labels.settings_delete_data_confirm_message2}
        confirmLabel={labels.settings_delete_confirm}
        cancelLabel={labels.cancel}
        onConfirm={handleDeleteAll}
        onCancel={closeDeleteAll}
        confirmDisabled={!canDeleteAll}
      >
        <TextInput
          style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border, fontSize: fs(14) }]}
          placeholder={labels.settings_delete_data_confirm_placeholder}
          placeholderTextColor={c.textSecondary}
          value={deleteAllText}
          onChangeText={setDeleteAllText}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </ConfirmationModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
});
