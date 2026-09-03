import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import DataScreen from '../../src/screens/settings/DataScreen';
import { buildAppMock, getAppStub, resetAppStub } from '../component/helpers/appStub';
import { resetStub, setConfig } from '../component/helpers/configStub';
import type { Config } from '../../src/context/ConfigContext';

const deleteAllTransactions = vi.fn(async () => undefined);
const clearDataKeepSettings = vi.fn(async () => undefined);
const resetDatabase = vi.fn(async () => undefined);
const configGet = vi.fn(async () => ({}) as Config);
const exportBackup = vi.fn(async () => '{}');
const importBackup = vi.fn(async () => undefined);
const saveBackupFile = vi.fn(async () => undefined);
const pickBackupFile = vi.fn(async () => null);

vi.mock('../../src/database', () => ({
  transactionRepository: { deleteAllTransactions: () => deleteAllTransactions() },
  configRepository: { get: () => configGet() },
  exportBackup: () => exportBackup(),
  importBackup: () => importBackup(),
  BackupValidationError: class BackupValidationError extends Error {},
}));

vi.mock('../../src/database/database', () => ({
  clearDataKeepSettings: () => clearDataKeepSettings(),
  resetDatabase: () => resetDatabase(),
}));

vi.mock('../../utils/backupIO', () => ({
  saveBackupFile: () => saveBackupFile(),
  pickBackupFile: () => pickBackupFile(),
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

describe('DataScreen', () => {
  beforeEach(() => {
    deleteAllTransactions.mockReset().mockResolvedValue(undefined);
    clearDataKeepSettings.mockReset().mockResolvedValue(undefined);
    resetDatabase.mockReset().mockResolvedValue(undefined);
    configGet.mockReset().mockResolvedValue({} as Config);
    exportBackup.mockReset().mockResolvedValue('{}');
    importBackup.mockReset().mockResolvedValue(undefined);
    saveBackupFile.mockReset().mockResolvedValue(undefined);
    pickBackupFile.mockReset().mockResolvedValue(null);
    setConfig({ language: 'en' });
  });

  afterEach(() => {
    resetAppStub();
    resetStub();
  });

  it('renders the four data actions', async () => {
    const view = await render(<DataScreen />);
    expect(view.getByText('Export data')).toBeTruthy();
    expect(view.getByText('Import data')).toBeTruthy();
    expect(view.getByText('Delete all transactions')).toBeTruthy();
    expect(view.getByText('Delete all data')).toBeTruthy();
    expect(view.getByText('Reset to factory state')).toBeTruthy();
  });

  it('confirms deleting all transactions and refreshes', async () => {
    const view = await render(<DataScreen />);
    const ue = userEvent.setup();
    fireEvent.press(view.getByText('Delete all transactions'));
    const confirm = await view.findByRole('button', { name: 'Delete' });
    await ue.press(confirm);
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
});
