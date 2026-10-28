import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import type { ReactNode } from 'react';
import DataScreen from '../../src/screens/settings/DataScreen';
import { buildAppMock, getAppStub, resetAppStub } from '../component/helpers/appStub';
import { resetStub, setConfig } from '../component/helpers/configStub';
import type { Config } from '../../src/context/ConfigContext';
import { ShareResult, type ShareResultValue } from '../../src/constants/shareResult';
import { en as t } from '../../src/i18n/en';
import { ERROR_PREFIXES } from '../../src/utils/errors';

const deleteAllTransactions = vi.fn(async () => undefined);
const clearDataKeepSettings = vi.fn(async () => undefined);
const resetDatabase = vi.fn(async () => undefined);
const configGet = vi.fn(async () => ({}) as Config);
const exportBackup = vi.fn(async () => '{}');
const importBackup = vi.fn(async () => undefined);
const saveBackupFile = vi.fn<() => Promise<ShareResultValue>>(async () => ShareResult.SAVED);
const saveBackupToDownloads = vi.fn<() => Promise<boolean>>(async () => false);
const pickBackupFile = vi.fn<() => Promise<string | null>>(async () => null);

const validationMocks = vi.hoisted(() => {
  class BackupValidationError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.name = 'BackupValidationError';
      this.code = code;
    }
  }
  return {
    BackupValidationError,
    BACKUP_VALIDATION_CODES: {
      invalidJson: 'invalid_json',
      invalidFormat: 'invalid_format',
      newerVersion: 'newer_version',
      incomplete: 'incomplete',
    },
  };
});

vi.mock('../../src/database', () => ({
  transactionRepository: { deleteAllTransactions: () => deleteAllTransactions() },
  configRepository: { get: () => configGet() },
  exportBackup: () => exportBackup(),
  importBackup: () => importBackup(),
  BackupValidationError: validationMocks.BackupValidationError,
  BACKUP_VALIDATION_CODES: validationMocks.BACKUP_VALIDATION_CODES,
}));

vi.mock('../../src/database/maintenance', () => ({
  clearDataKeepSettingsWithCleanup: () => clearDataKeepSettings(),
  resetDatabaseWithCleanup: () => resetDatabase(),
}));

vi.mock('../../src/utils/backupIO', () => ({
  saveBackupFile: () => saveBackupFile(),
  pickBackupFile: () => pickBackupFile(),
  saveBackupToDownloads: () => saveBackupToDownloads(),
}));

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

const mockFsFile = vi.fn();
vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' } },
  File: class MockFile {
    uri: string;
    copy = vi.fn();
    exists = false;
    delete = vi.fn();
    constructor(uri: string) {
      this.uri = uri;
      mockFsFile(uri);
    }
  },
}));

vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn(async () => true),
  shareAsync: vi.fn(),
  Sharing: {},
}));

vi.mock('expo-document-picker', () => ({
  getDocumentAsync: vi.fn(),
}));

describe('DataScreen', () => {
  beforeEach(() => {
    deleteAllTransactions.mockReset().mockResolvedValue(undefined);
    clearDataKeepSettings.mockReset().mockResolvedValue(undefined);
    resetDatabase.mockReset().mockResolvedValue(undefined);
    configGet.mockReset().mockResolvedValue({} as Config);
    exportBackup.mockReset().mockResolvedValue('{}');
    importBackup.mockReset().mockResolvedValue(undefined);
    saveBackupFile.mockReset().mockResolvedValue(ShareResult.SAVED);
    saveBackupToDownloads.mockReset().mockResolvedValue(false);
    pickBackupFile.mockReset().mockResolvedValue(null);
    setConfig({ language: 'en' });
  });

  afterEach(() => {
    resetAppStub();
    resetStub();
    vi.restoreAllMocks();
  });

  it('renders the four data actions', async () => {
    const view = await render(<DataScreen />);
    expect(view.getByText('Export data')).toBeTruthy();
    expect(view.getByText('Import data')).toBeTruthy();
    expect(view.getByText('Delete all transactions')).toBeTruthy();
    expect(view.getByText('Delete all data')).toBeTruthy();
    expect(view.getByText('Reset to factory state')).toBeTruthy();
  });

  it('requires typing DELETE before confirming "delete all transactions"', async () => {
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();
    fireEvent.press(view.getByText('Delete all transactions'));
    const step1 = await view.findByRole('button', { name: 'Delete' });
    await ue.press(step1);
    const input = await view.findByPlaceholderText('Type DELETE here');
    await ue.type(input, 'no');
    await ue.press(view.getByText('Confirm'));
    expect(deleteAllTransactions).not.toHaveBeenCalled();
    await fireEvent.changeText(input, 'DELETE');
    await ue.press(view.getByText('Confirm'));
    expect(deleteAllTransactions).toHaveBeenCalledTimes(1);
    expect(getAppStub().resetAll).toHaveBeenCalled();
  });

  it('requires typing DELETE before confirming "delete all data"', async () => {
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();
    fireEvent.press(view.getByText('Delete all data'));
    const step1 = await view.findByRole('button', { name: 'Delete all' });
    await ue.press(step1);
    const input = await view.findByPlaceholderText('Type DELETE here');
    await ue.type(input, 'no');
    await ue.press(view.getByText('Confirm'));
    expect(clearDataKeepSettings).not.toHaveBeenCalled();
    await fireEvent.changeText(input, 'DELETE');
    await ue.press(view.getByText('Confirm'));
    expect(clearDataKeepSettings).toHaveBeenCalledTimes(1);
    expect(getAppStub().resetAll).toHaveBeenCalled();
  });

  it('keeps the factory-reset dialog open and disabled while the reset runs', async () => {
    let release!: () => void;
    resetDatabase.mockImplementationOnce(() => new Promise<undefined>((resolve) => {
      release = () => resolve(undefined);
    }));
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();

    fireEvent.press(view.getByText('Reset to factory state'));
    await ue.press(await view.findByRole('button', { name: 'Reset' }));
    const input = await view.findByPlaceholderText('Type DELETE here');
    await fireEvent.changeText(input, 'DELETE');
    await ue.press(view.getByText('Confirm'));

    // In flight: spinner state, no second confirm, no cancel, read-only input.
    const confirm = view.getByRole('button', { name: 'Confirm' });
    expect(confirm).toBeDisabled();
    expect(confirm.props.accessibilityState?.busy).toBe(true);
    // The first (still mounted) step also has a Cancel; the busy modal is the last one.
    const cancels = view.getAllByRole('button', { name: 'Cancel' });
    expect(cancels[cancels.length - 1]).toBeDisabled();
    expect(view.getByPlaceholderText('Type DELETE here').props.editable).toBe(false);
    expect(resetDatabase).toHaveBeenCalledTimes(1);

    await ue.press(confirm);
    expect(resetDatabase).toHaveBeenCalledTimes(1);

    await act(async () => {
      release();
    });
    await waitFor(() => {
      const confirms = view.getAllByRole('button', { name: 'Confirm' });
      expect(confirms.every(btn => btn.props.accessibilityState?.busy !== true)).toBe(true);
    });
    expect(getAppStub().resetAll).toHaveBeenCalled();
  });

  it('shows a success alert when the export completes the share', async () => {
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    fireEvent.press(view.getByText('Export data'));
    await waitFor(() => expect(saveBackupFile).toHaveBeenCalledTimes(1));
    expect(exportBackup).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(
      t.settings_export_success_title,
      t.settings_export_success_message,
    );
  });

  it('shows no alert when the share sheet is dismissed', async () => {
    saveBackupFile.mockResolvedValue(ShareResult.DISMISSED);
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    fireEvent.press(view.getByText('Export data'));
    await waitFor(() => expect(saveBackupFile).toHaveBeenCalledTimes(1));
    expect(exportBackup).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('shows an error alert when the export fails', async () => {
    const exportError = new Error('boom');
    saveBackupFile.mockRejectedValue(exportError);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    fireEvent.press(view.getByText('Export data'));
    await waitFor(() => expect(saveBackupFile).toHaveBeenCalledTimes(1));
    expect(alertSpy).toHaveBeenCalledWith(
      t.settings_export_error_title,
      t.settings_export_error_message,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(`${ERROR_PREFIXES.backupExport}:`, exportError);
    consoleErrorSpy.mockRestore();
  });

  it('shows no modal when the file picker is cancelled', async () => {
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    fireEvent.press(view.getByText('Import data'));
    await waitFor(() => expect(pickBackupFile).toHaveBeenCalledTimes(1));
    expect(alertSpy).not.toHaveBeenCalled();
    expect(view.queryByText(t.settings_import_confirm_title)).toBeNull();
  });

  it('imports a picked file after confirmation and shows success', async () => {
    pickBackupFile.mockResolvedValue('{"app":"Finly","kind":"backup","formatVersion":1}');
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();
    fireEvent.press(view.getByText('Import data'));
    await waitFor(() => expect(pickBackupFile).toHaveBeenCalledTimes(1));
    const confirmButton = await view.findByRole('button', { name: t.settings_delete_confirm });
    await ue.press(confirmButton);
    await waitFor(() => expect(importBackup).toHaveBeenCalledTimes(1));
    expect(alertSpy).toHaveBeenCalledWith(
      t.settings_import_success_title,
      t.settings_import_success_message,
    );
    expect(getAppStub().setDataRefreshing).toHaveBeenNthCalledWith(1, true);
    expect(getAppStub().setDataRefreshing).toHaveBeenNthCalledWith(2, false);
  });

  it('shows the refresh-failure alert when the import applied but reset failed', async () => {
    pickBackupFile.mockResolvedValue('{"app":"Finly","kind":"backup","formatVersion":1}');
    getAppStub().resetAll.mockResolvedValueOnce(false);
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();
    fireEvent.press(view.getByText('Import data'));
    await waitFor(() => expect(pickBackupFile).toHaveBeenCalledTimes(1));
    const confirmButton = await view.findByRole('button', { name: t.settings_delete_confirm });
    await ue.press(confirmButton);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(
      t.settings_import_refresh_error_title,
      t.settings_import_refresh_error_message,
    ));
    expect(alertSpy).not.toHaveBeenCalledWith(
      t.settings_import_success_title,
      t.settings_import_success_message,
    );
    expect(importBackup).toHaveBeenCalledTimes(1);
  });

  it('shows the refresh-failure alert when config reload fails after import', async () => {
    pickBackupFile.mockResolvedValue('{"app":"Finly","kind":"backup","formatVersion":1}');
    configGet.mockRejectedValueOnce(new Error('config failed'));
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();
    fireEvent.press(view.getByText('Import data'));
    await waitFor(() => expect(pickBackupFile).toHaveBeenCalledTimes(1));
    const confirmButton = await view.findByRole('button', { name: t.settings_delete_confirm });
    await ue.press(confirmButton);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(
      t.settings_import_refresh_error_title,
      t.settings_import_refresh_error_message,
    ));
    expect(getAppStub().resetAll).not.toHaveBeenCalled();
  });

  it('shows the incomplete-backup alert and leaves the data untouched', async () => {
    pickBackupFile.mockResolvedValue('{}');
    const importError = new validationMocks.BackupValidationError('incomplete');
    importBackup.mockRejectedValueOnce(importError);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();
    fireEvent.press(view.getByText('Import data'));
    await waitFor(() => expect(pickBackupFile).toHaveBeenCalledTimes(1));
    const confirmButton = await view.findByRole('button', { name: t.settings_delete_confirm });
    await ue.press(confirmButton);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(
      t.settings_import_incomplete_title,
      t.settings_import_incomplete_message,
    ));
    expect(consoleErrorSpy).toHaveBeenCalledWith(`${ERROR_PREFIXES.backupImport}:`, importError);
    expect(getAppStub().resetAll).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

function setPlatformOS(os: 'ios' | 'android') {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

describe('DataScreen export on Android', () => {
  afterEach(() => {
    // @ts-expect-error removing the own property restores the original OS getter
    delete Platform.OS;
  });

  it('saves to Downloads and shows the Downloads alert with Share/Done', async () => {
    setPlatformOS('android');
    saveBackupToDownloads.mockResolvedValue(true);
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    fireEvent.press(view.getByText('Export data'));
    await waitFor(() => expect(saveBackupToDownloads).toHaveBeenCalledTimes(1));
    expect(saveBackupFile).not.toHaveBeenCalled();
    const [title, message, buttons] = alertSpy.mock.calls[0];
    expect(title).toBe(t.settings_export_downloaded_title);
    expect(message).toBe(t.settings_export_downloaded_message);
    expect(buttons?.map((button) => button.text)).toEqual([
      t.settings_export_share_action,
      t.settings_export_done_action,
    ]);
  });

  it('opens the share sheet only when Share is pressed', async () => {
    setPlatformOS('android');
    saveBackupToDownloads.mockResolvedValue(true);
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    fireEvent.press(view.getByText('Export data'));
    await waitFor(() => expect(saveBackupToDownloads).toHaveBeenCalledTimes(1));
    const buttons = alertSpy.mock.calls[0][2] ?? [];
    const share = buttons.find((button) => button.text === t.settings_export_share_action);
    await act(() => share?.onPress?.());
    expect(saveBackupFile).toHaveBeenCalledTimes(1);
  });

  it('falls back to the share flow when saving to Downloads is not supported', async () => {
    setPlatformOS('android');
    saveBackupToDownloads.mockResolvedValue(false);
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = await render(<DataScreen />);
    fireEvent.press(view.getByText('Export data'));
    await waitFor(() => expect(saveBackupFile).toHaveBeenCalledTimes(1));
    expect(alertSpy).toHaveBeenCalledWith(
      t.settings_export_success_title,
      t.settings_export_success_message,
    );
  });
});
