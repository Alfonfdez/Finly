import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Alert, type TextStyle } from 'react-native';
import ScreenShell from '../../components/ScreenShell';
import { useConfig } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { isAndroidPlatform, isWeb } from '../../utils/platform';
import {
  transactionRepository,
  configRepository,
  exportBackup,
  importBackup,
  BackupValidationError,
  BACKUP_VALIDATION_CODES,
} from '../../database';
import { clearDataKeepSettingsWithCleanup, resetDatabaseWithCleanup } from '../../database/maintenance';
import { saveBackupFile, pickBackupFile, saveBackupToDownloads } from '../../utils/backupIO';
import { ERROR_PREFIXES, alertError, alertInfo, logError } from '../../utils/errors';
import { BACKUP_ERRORS } from '../../constants/backup';
import { ShareResult } from '../../constants/shareResult';
import ConfirmationModal from '../../components/ConfirmationModal';
import SettingsRow from '../../components/settings/SettingsRow';
import { BUTTON_BORDER_RADIUS } from '../../components/componentStyles';
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
  busy?: boolean;
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
  busy = false,
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
      busy={busy}
    >
      <TextInput
        style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border, fontSize: fs(14) }, webInputFocusReset]}
        placeholder={labels.settings_delete_data_confirm_placeholder}
        placeholderTextColor={c.textSecondary}
        value={text}
        onChangeText={onTextChange}
        editable={!busy}
        accessibilityLabel={labels.settings_delete_data_confirm_placeholder}
        autoCapitalize="characters"
        autoCorrect={false}
      />
    </ConfirmationModal>
  );
}

const PENDING_DATA_ACTIONS = {
  transactions: 'transactions',
  all: 'all',
  factory: 'factory',
  import: 'import',
} as const;

type PendingDataAction = keyof typeof PENDING_DATA_ACTIONS | null;

export default function DataScreen() {
  const { activeColors: c, updateConfig } = useConfig();
  const { resetAll, setDataRefreshing } = useApp();
  const labels = t();

  const [deleteTransactionsModal1, setDeleteTransactionsModal1] = useState(false);
  const [deleteTransactionsModal2, setDeleteTransactionsModal2] = useState(false);
  const [deleteTransactionsText, setDeleteTransactionsText] = useState('');
  const [deleteAllModal1, setDeleteAllModal1] = useState(false);
  const [deleteAllModal2, setDeleteAllModal2] = useState(false);
  const [deleteAllText, setDeleteAllText] = useState('');
  const [factoryResetModal1, setFactoryResetModal1] = useState(false);
  const [factoryResetModal2, setFactoryResetModal2] = useState(false);
  const [factoryResetText, setFactoryResetText] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingDataAction>(null);

  const handleExport = async () => {
    try {
      const json = await exportBackup();
      if (isAndroidPlatform()) {
        const savedToDownloads = await saveBackupToDownloads(json);
        if (!savedToDownloads) {
          await runShareFlow(json);
          return;
        }
        Alert.alert(labels.settings_export_downloaded_title, labels.settings_export_downloaded_message, [
          {
            text: labels.settings_export_share_action,
            onPress: () => {
              runShareFlow(json).catch((error) => {
                logError(ERROR_PREFIXES.backupShare, error);
                alertError(labels.settings_export_error_title, labels.settings_export_error_message);
              });
            },
          },
          { text: labels.settings_export_done_action },
        ]);
        return;
      }
      await runShareFlow(json);
    } catch (error) {
      logError(ERROR_PREFIXES.backupExport, error);
      alertError(labels.settings_export_error_title, labels.settings_export_error_message);
    }
  };

  const runShareFlow = async (json: string) => {
    const result = await saveBackupFile(json);
    if (result === ShareResult.SAVED) {
      alertInfo(labels.settings_export_success_title, labels.settings_export_success_message);
    }
  };

  const handlePickImport = async () => {
    try {
      const json = await pickBackupFile();
      if (json === null) return;
      setPendingImport(json);
      setImportModalVisible(true);
    } catch (error) {
      logError(ERROR_PREFIXES.backupRead, error);
      if (error instanceof BackupValidationError) {
        alertError(labels.settings_import_invalid_title, labels.settings_import_invalid_message);
      } else {
        alertError(labels.settings_import_error_title, labels.settings_import_error_message);
      }
    }
  };

  const handleConfirmImport = async () => {
    if (pendingImport === null || pendingAction !== null) return;
    setPendingAction(PENDING_DATA_ACTIONS.import);
    setDataRefreshing(true);
    let applied = false;
    try {
      await importBackup(pendingImport);
      applied = true;
    } catch (error) {
      logError(ERROR_PREFIXES.backupImport, error);
      if (error instanceof BackupValidationError) {
        if (error.code === BACKUP_VALIDATION_CODES.newerVersion) {
          alertError(labels.settings_import_newer_title, labels.settings_import_newer_message);
        } else if (error.code === BACKUP_VALIDATION_CODES.incomplete) {
          alertError(labels.settings_import_incomplete_title, labels.settings_import_incomplete_message);
        } else {
          alertError(labels.settings_import_invalid_title, labels.settings_import_invalid_message);
        }
      } else {
        alertError(labels.settings_import_error_title, labels.settings_import_error_message);
      }
    }
    if (applied) {
      try {
        const persistedConfig = await configRepository.get();
        const configSaved = await updateConfig(persistedConfig, { notifyOnError: false });
        const dataRefreshed = await resetAll({ notifyOnError: false });
        if (configSaved === false || dataRefreshed === false) {
          throw new Error(BACKUP_ERRORS.refreshFailed);
        }
        alertInfo(labels.settings_import_success_title, labels.settings_import_success_message);
      } catch (error) {
        logError(ERROR_PREFIXES.backupImport, error);
        alertError(
          labels.settings_import_refresh_error_title,
          labels.settings_import_refresh_error_message,
        );
      }
    }
    setPendingAction(null);
    setDataRefreshing(false);
    setImportModalVisible(false);
    setPendingImport(null);
  };

  const hideDeleteTransactions = () => {
    setDeleteTransactionsModal1(false);
    setDeleteTransactionsModal2(false);
    setDeleteTransactionsText('');
  };

  const hideDeleteAll = () => {
    setDeleteAllModal1(false);
    setDeleteAllModal2(false);
    setDeleteAllText('');
  };

  const hideFactoryReset = () => {
    setFactoryResetModal1(false);
    setFactoryResetModal2(false);
    setFactoryResetText('');
  };

  // User-initiated closes are blocked while a wipe/import is in flight.
  const closeDeleteTransactions = () => {
    if (pendingAction !== null) return;
    hideDeleteTransactions();
  };

  const closeDeleteAll = () => {
    if (pendingAction !== null) return;
    hideDeleteAll();
  };

  const closeFactoryReset = () => {
    if (pendingAction !== null) return;
    hideFactoryReset();
  };

  const handleDeleteTransactions = async () => {
    if (pendingAction !== null) return;
    setPendingAction(PENDING_DATA_ACTIONS.transactions);
    try {
      await transactionRepository.deleteAllTransactions();
      await resetAll();
    } catch (error) {
      logError(ERROR_PREFIXES.transactionsDeleteAll, error);
      alertError(labels.settings_delete_transactions_error_title, labels.settings_delete_transactions_error_message);
    } finally {
      setPendingAction(null);
    }
    hideDeleteTransactions();
  };

  const handleDeleteAll = async () => {
    if (pendingAction !== null) return;
    setPendingAction(PENDING_DATA_ACTIONS.all);
    setDataRefreshing(true);
    try {
      await clearDataKeepSettingsWithCleanup();
      await updateConfig(await configRepository.get());
      await resetAll();
    } catch (error) {
      logError(ERROR_PREFIXES.dataDeleteAll, error);
      alertError(labels.settings_delete_data_error_title, labels.settings_delete_data_error_message);
    } finally {
      setPendingAction(null);
      setDataRefreshing(false);
    }
    hideDeleteAll();
  };

  const handleFactoryReset = async () => {
    if (pendingAction !== null) return;
    setPendingAction(PENDING_DATA_ACTIONS.factory);
    setDataRefreshing(true);
    try {
      await resetDatabaseWithCleanup();
      await updateConfig(await configRepository.get());
      await resetAll();
    } catch (error) {
      logError(ERROR_PREFIXES.factoryReset, error);
      alertError(labels.settings_delete_data_error_title, labels.settings_delete_data_error_message);
    } finally {
      setPendingAction(null);
      setDataRefreshing(false);
    }
    hideFactoryReset();
  };

  return (
    <ScreenShell>
      <ScrollView
        style={[settingsStyles.container, { backgroundColor: c.background }]}
        contentContainerStyle={settingsStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsRow
          icon="share-outline"
          iconColor={c.primary}
          label={labels.settings_export_data}
          onPress={handleExport}
        />

        <SettingsRow
          icon="download-outline"
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
          onPress={() => setDeleteTransactionsModal1(true)}
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
          visible={deleteTransactionsModal1}
          title={labels.settings_delete_transactions_confirm_title}
          message={labels.settings_delete_transactions_confirm_message}
          confirmLabel={labels.delete}
          cancelLabel={labels.cancel}
          onConfirm={() => setDeleteTransactionsModal2(true)}
          onCancel={() => setDeleteTransactionsModal1(false)}
        />

        <ConfirmWithTextModal
          visible={deleteTransactionsModal2}
          title={labels.settings_delete_data_confirm_title2}
          message={labels.settings_delete_data_confirm_message2}
          confirmLabel={labels.settings_delete_confirm}
          cancelLabel={labels.cancel}
          text={deleteTransactionsText}
          onTextChange={setDeleteTransactionsText}
          onConfirm={handleDeleteTransactions}
          onCancel={closeDeleteTransactions}
          busy={pendingAction === PENDING_DATA_ACTIONS.transactions}
        />

        <ConfirmationModal
          visible={importModalVisible}
          title={labels.settings_import_confirm_title}
          message={labels.settings_import_confirm_message}
          confirmLabel={labels.settings_delete_confirm}
          cancelLabel={labels.cancel}
          onConfirm={handleConfirmImport}
          onCancel={() => {
            if (pendingAction !== null) return;
            setImportModalVisible(false);
            setPendingImport(null);
          }}
          busy={pendingAction === PENDING_DATA_ACTIONS.import}
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
          busy={pendingAction === PENDING_DATA_ACTIONS.all}
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
          busy={pendingAction === PENDING_DATA_ACTIONS.factory}
        />
      </ScrollView>
    </ScreenShell>
  );
}

const webInputFocusReset = isWeb ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    padding: 12,
    marginBottom: 16,
  },
});
