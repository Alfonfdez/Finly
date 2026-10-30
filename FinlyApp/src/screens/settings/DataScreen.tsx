import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import ScreenShell from '../../components/ScreenShell';
import { useConfig } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';
import { isAndroidPlatform } from '../../utils/platform';
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
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import SettingsRow from '../../components/settings/SettingsRow';
import ConfirmWithTextModal from '../../components/settings/ConfirmWithTextModal';
import { settingsStyles } from '../../components/settings/settingsStyles';
import { useTwoStepConfirmation } from '../../hooks/useTwoStepConfirmation';

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

  const [importModalVisible, setImportModalVisible] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingDataAction>(null);
  const deleteTransactionsConfirm = useTwoStepConfirmation({ canClose: pendingAction === null });
  const deleteAllConfirm = useTwoStepConfirmation({ canClose: pendingAction === null });
  const factoryResetConfirm = useTwoStepConfirmation({ canClose: pendingAction === null });

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
    deleteTransactionsConfirm.reset();
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
    deleteAllConfirm.reset();
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
    factoryResetConfirm.reset();
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
          onPress={deleteTransactionsConfirm.open}
        />

        <SettingsRow
          icon="warning-outline"
          iconColor={c.red}
          label={labels.settings_delete_all_data}
          description={labels.settings_delete_all_data_description}
          labelColor={c.red}
          onPress={deleteAllConfirm.open}
        />

        <SettingsRow
          icon="refresh-outline"
          iconColor={c.red}
          label={labels.settings_factory_reset}
          description={labels.settings_factory_reset_description}
          labelColor={c.red}
          onPress={factoryResetConfirm.open}
        />

        <DeleteConfirmationModal
          visible={deleteTransactionsConfirm.firstVisible}
          title={labels.settings_delete_transactions_confirm_title}
          message={labels.settings_delete_transactions_confirm_message}
          onConfirm={deleteTransactionsConfirm.advance}
          onCancel={deleteTransactionsConfirm.cancelFirst}
        />

        <ConfirmWithTextModal
          visible={deleteTransactionsConfirm.secondVisible}
          title={labels.settings_delete_data_confirm_title2}
          icon="trash-outline"
          message={labels.settings_delete_data_confirm_message2}
          confirmLabel={labels.delete}
          cancelLabel={labels.cancel}
          text={deleteTransactionsConfirm.text}
          onTextChange={deleteTransactionsConfirm.setText}
          onConfirm={handleDeleteTransactions}
          onCancel={deleteTransactionsConfirm.cancelSecond}
          busy={pendingAction === PENDING_DATA_ACTIONS.transactions}
        />

        <ConfirmationModal
          visible={importModalVisible}
          title={labels.settings_import_confirm_title}
          icon="cloud-download-outline"
          message={labels.settings_import_confirm_message}
          confirmLabel={labels.settings_import_confirm}
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
          visible={deleteAllConfirm.firstVisible}
          title={labels.settings_delete_data_confirm_title}
          icon="warning-outline"
          message={labels.settings_delete_data_confirm_message}
          confirmLabel={labels.settings_delete_all_data_confirm}
          cancelLabel={labels.cancel}
          onConfirm={deleteAllConfirm.advance}
          onCancel={deleteAllConfirm.cancelFirst}
        />

        <ConfirmWithTextModal
          visible={deleteAllConfirm.secondVisible}
          title={labels.settings_delete_data_confirm_title2}
          message={labels.settings_delete_data_confirm_message2}
          confirmLabel={labels.settings_delete_all_data_confirm}
          cancelLabel={labels.cancel}
          text={deleteAllConfirm.text}
          onTextChange={deleteAllConfirm.setText}
          onConfirm={handleDeleteAll}
          onCancel={deleteAllConfirm.cancelSecond}
          busy={pendingAction === PENDING_DATA_ACTIONS.all}
        />

        <ConfirmationModal
          visible={factoryResetConfirm.firstVisible}
          title={labels.settings_factory_reset_confirm_title}
          icon="warning-outline"
          message={labels.settings_factory_reset_confirm_message}
          confirmLabel={labels.settings_factory_reset_confirm}
          cancelLabel={labels.cancel}
          onConfirm={factoryResetConfirm.advance}
          onCancel={factoryResetConfirm.cancelFirst}
        />

        <ConfirmWithTextModal
          visible={factoryResetConfirm.secondVisible}
          title={labels.settings_delete_data_confirm_title2}
          message={labels.settings_delete_data_confirm_message2}
          confirmLabel={labels.settings_factory_reset_confirm}
          cancelLabel={labels.cancel}
          text={factoryResetConfirm.text}
          onTextChange={factoryResetConfirm.setText}
          onConfirm={handleFactoryReset}
          onCancel={factoryResetConfirm.cancelSecond}
          busy={pendingAction === PENDING_DATA_ACTIONS.factory}
        />
      </ScrollView>
    </ScreenShell>
  );
}

