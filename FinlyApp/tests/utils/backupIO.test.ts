import { describe, it, expect, beforeEach, vi } from 'vitest';
import { t } from '../../src/i18n';
import { backupFileName } from '../../src/utils/formatters';
import { ShareResult } from '../../src/constants/shareResult';
import { MAX_BACKUP_BYTES } from '../../src/constants/types';

const files = new Map<string, string>();
const mockWrite = vi.fn(async (uri: string, data: string) => {
  files.set(uri, data);
});

vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' } },
  File: class MockFile {
    uri: string;

    constructor(base: { uri: string } | string, name?: string) {
      this.uri = typeof base === 'string' ? base : `${base.uri}${name ?? ''}`;
    }

    async write(data: string) {
      await mockWrite(this.uri, data);
    }

    async text() {
      return files.get(this.uri) ?? '';
    }
  },
}));

const mockIsAvailable = vi.fn(async () => true);
vi.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailable(),
}));

const mockShareFile = vi.fn(async (_uri: string, _mime: string, _title: string) => ShareResult.SAVED);
const mockSaveToDownloads = vi.fn(async (_name: string, _json: string) => true);
vi.mock('../../modules/finly-share/src/index', () => ({
  shareFileAsync: (uri: string, mime: string, title: string) => mockShareFile(uri, mime, title),
  saveToDownloadsAsync: (name: string, json: string) => mockSaveToDownloads(name, json),
}));

const mockPick = vi.fn(async () => ({ canceled: true, assets: [] as { uri: string; size?: number }[] }));
vi.mock('expo-document-picker', () => ({
  getDocumentAsync: () => mockPick(),
}));

const platformFlags = { isAndroid: true };
vi.mock('../../src/utils/platform', () => ({
  get isAndroid() {
    return platformFlags.isAndroid;
  },
  isNative: true,
  isWeb: false,
  isIOS: false,
}));

describe('backupIO (native)', () => {
  beforeEach(() => {
    files.clear();
    mockWrite.mockClear();
    mockIsAvailable.mockReset().mockResolvedValue(true);
    mockShareFile.mockClear();
    mockSaveToDownloads.mockClear();
    mockPick.mockReset().mockResolvedValue({ canceled: true, assets: [] });
    platformFlags.isAndroid = true;
  });

  it('writes the JSON to the document directory and shares the file', async () => {
    const { saveBackupFile } = await import('../../src/utils/backupIO');

    const result = await saveBackupFile('{"version":1}');

    const uri = `file:///doc/${backupFileName()}`;
    expect(mockWrite).toHaveBeenCalledWith(uri, '{"version":1}');
    expect(mockShareFile).toHaveBeenCalledWith(uri, 'application/json', t().backup_dialog_title);
    expect(result).toBe(ShareResult.SAVED);
  });

  it('reports a saved file when the share sheet is unavailable', async () => {
    mockIsAvailable.mockResolvedValue(false);
    const { saveBackupFile } = await import('../../src/utils/backupIO');

    expect(await saveBackupFile('{}')).toBe(ShareResult.SAVED);
    expect(mockShareFile).not.toHaveBeenCalled();
  });

  it('saves to Downloads on Android and refuses elsewhere', async () => {
    const { saveBackupToDownloads } = await import('../../src/utils/backupIO');

    expect(await saveBackupToDownloads('{"a":1}')).toBe(true);
    expect(mockSaveToDownloads).toHaveBeenCalledWith(backupFileName(), '{"a":1}');

    platformFlags.isAndroid = false;
    expect(await saveBackupToDownloads('{"a":1}')).toBe(false);
    expect(mockSaveToDownloads).toHaveBeenCalledTimes(1);
  });

  it('reads the picked file', async () => {
    files.set('file:///picked.json', '{"picked":true}');
    mockPick.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///picked.json' }] });
    const { pickBackupFile } = await import('../../src/utils/backupIO');

    expect(await pickBackupFile()).toBe('{"picked":true}');
  });

  it('rejects an oversized picked file before reading it', async () => {
    mockPick.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///big.json', size: MAX_BACKUP_BYTES + 1 }],
    });
    const { pickBackupFile } = await import('../../src/utils/backupIO');

    await expect(pickBackupFile()).rejects.toMatchObject({ code: 'invalid_format' });
  });

  it('returns null when the picker is cancelled or returns no asset', async () => {
    const { pickBackupFile } = await import('../../src/utils/backupIO');

    expect(await pickBackupFile()).toBeNull();

    mockPick.mockResolvedValue({ canceled: false, assets: [] });
    expect(await pickBackupFile()).toBeNull();
  });
});
