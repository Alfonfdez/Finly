import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Alert, type TextStyle } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { isWeb } from '../../utils/platform';
import {
  transactionRepository,
  configRepository,
  exportBackup,
  importBackup,
  BackupValidationError,
} from '../../database';
import { clearDataKeepSettings, resetDatabase } from '../../database/database';
import { saveBackupFile, pickBackupFile } from '../../utils/backupIO';
import ConfirmationModal from '../../components/ConfirmationModal';
import SettingsRow from '../../components/settings/SettingsRow';
import { settingsStyles } from '../../components/settings/settingsStyles';
import { DELETE_ALL_CONFIRMATION } from '../../constants/types';

interface ConfirmWithTextModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  text: string;
  onTextChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmWithTextModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  text,
  onTextChange,
  onConfirm,
  onCancel,
}: ConfirmWithTextModalProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmDisabled={text.toUpperCase() !== DELETE_ALL_CONFIRMATION}
    >
      <TextInput
        style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border, fontSize: fs(14) }, webInputFocusReset]}
        placeholder={labels.settings_delete_data_confirm_placeholder}
        placeholderTextColor={c.textSecondary}
        value={text}
        onChangeText={onTextChange}
        autoCapitalize="characters"
        autoCorrect={false}
      />
    </ConfirmationModal>
  );
}

export default function DataScreen() {
  const { activeColors: c, updateConfig } = useConfig();
  const { resetAll } = useApp();
  const labels = t();

  const [deleteTransactionsModal, setDeleteTransactionsModal] = useState(false);
  const [deleteAllModal1, setDeleteAllModal1] = useState(false);
  const [deleteAllModal2, setDeleteAllModal2] = useState(false);
  const [deleteAllText, setDeleteAllText] = useState('');
  const [factoryResetModal1, setFactoryResetModal1] = useState(false);
  const [factoryResetModal2, setFactoryResetModal2] = useState(false);
  const [factoryResetText, setFactoryResetText] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const json = await exportBackup();
      await saveBackupFile(json);
      Alert.alert(labels.settings_export_success_title, labels.settings_export_success_message);
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert(labels.settings_export_error_title, labels.settings_export_error_message);
    }
  };

  const handlePickImport = async () => {
    try {
      const json = await pickBackupFile();
      if (json === null) return;
      setPendingImport(json);
      setImportModalVisible(true);
    } catch (error) {
      console.error('Failed to read backup file:', error);
      Alert.alert(labels.settings_import_error_title, labels.settings_import_error_message);
    }
  };

  const handleConfirmImport = async () => {
    if (pendingImport === null) return;
    try {
      await importBackup(pendingImport);
      await resetAll();
      updateConfig(await configRepository.get());
      Alert.alert(labels.settings_import_success_title, labels.settings_import_success_message);
    } catch (error) {
      console.error('Failed to import data:', error);
      if (error instanceof BackupValidationError) {
        Alert.alert(labels.settings_import_invalid_title, labels.settings_import_invalid_message);
      } else {
        Alert.alert(labels.settings_import_error_title, labels.settings_import_error_message);
      }
    }
    setImportModalVisible(false);
    setPendingImport(null);
  };

  const closeDeleteAll = () => {
    setDeleteAllModal1(false);
    setDeleteAllModal2(false);
    setDeleteAllText('');
  };

  const closeFactoryReset = () => {
    setFactoryResetModal1(false);
    setFactoryResetModal2(false);
    setFactoryResetText('');
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
      await clearDataKeepSettings();
      await resetAll();
      updateConfig(await configRepository.get());
    } catch (error) {
      console.error('Failed to delete all data:', error);
      Alert.alert(labels.settings_delete_data_error_title, labels.settings_delete_data_error_message);
    }
    closeDeleteAll();
  };

  const handleFactoryReset = async () => {
    try {
      await resetDatabase();
      await resetAll();
      updateConfig(await configRepository.get());
    } catch (error) {
      console.error('Failed to reset to factory state:', error);
      Alert.alert(labels.settings_delete_data_error_title, labels.settings_delete_data_error_message);
    }
    closeFactoryReset();
  };

  return (
    <ScrollView style={[settingsStyles.container, { backgroundColor: c.background }]} contentContainerStyle={settingsStyles.content}>
      <SettingsRow
        icon="download-outline"
        iconColor={c.primary}
        label={labels.settings_export_data}
        onPress={handleExport}
      />

      <SettingsRow
        icon="cloud-upload-outline"
        iconColor={c.primary}
        label={labels.settings_import_data}
        onPress={handlePickImport}
      />

      <SettingsRow
        icon="trash-outline"
        iconColor={c.red}
        label={labels.settings_delete_all_transactions}
        description={labels.settings_delete_all_transactions_description}
        labelColor={c.red}
        onPress={() => setDeleteTransactionsModal(true)}
      />

      <SettingsRow
        icon="warning-outline"
        iconColor={c.red}
        label={labels.settings_delete_all_data}
        description={labels.settings_delete_all_data_description}
        labelColor={c.red}
        onPress={() => setDeleteAllModal1(true)}
      />

      <SettingsRow
        icon="refresh-outline"
        iconColor={c.red}
        label={labels.settings_factory_reset}
        description={labels.settings_factory_reset_description}
        labelColor={c.red}
        onPress={() => setFactoryResetModal1(true)}
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
        visible={importModalVisible}
        title={labels.settings_import_confirm_title}
        message={labels.settings_import_confirm_message}
        confirmLabel={labels.settings_delete_confirm}
        cancelLabel={labels.cancel}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setImportModalVisible(false);
          setPendingImport(null);
        }}
      />

      <ConfirmationModal
        visible={deleteAllModal1}
        title={labels.settings_delete_data_confirm_title}
        message={labels.settings_delete_data_confirm_message}
        confirmLabel={labels.settings_delete_all_data_confirm}
        cancelLabel={labels.cancel}
        onConfirm={() => setDeleteAllModal2(true)}
        onCancel={() => setDeleteAllModal1(false)}
      />

      <ConfirmWithTextModal
        visible={deleteAllModal2}
        title={labels.settings_delete_data_confirm_title2}
        message={labels.settings_delete_data_confirm_message2}
        confirmLabel={labels.settings_delete_confirm}
        cancelLabel={labels.cancel}
        text={deleteAllText}
        onTextChange={setDeleteAllText}
        onConfirm={handleDeleteAll}
        onCancel={closeDeleteAll}
      />

      <ConfirmationModal
        visible={factoryResetModal1}
        title={labels.settings_factory_reset_confirm_title}
        message={labels.settings_factory_reset_confirm_message}
        confirmLabel={labels.settings_factory_reset_confirm}
        cancelLabel={labels.cancel}
        onConfirm={() => setFactoryResetModal2(true)}
        onCancel={() => setFactoryResetModal1(false)}
      />

      <ConfirmWithTextModal
        visible={factoryResetModal2}
        title={labels.settings_delete_data_confirm_title2}
        message={labels.settings_delete_data_confirm_message2}
        confirmLabel={labels.settings_delete_confirm}
        cancelLabel={labels.cancel}
        text={factoryResetText}
        onTextChange={setFactoryResetText}
        onConfirm={handleFactoryReset}
        onCancel={closeFactoryReset}
      />
    </ScrollView>
  );
}

const webInputFocusReset = isWeb ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
});
