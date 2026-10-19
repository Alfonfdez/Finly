import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { backupFileName } from '../../src/utils/formatters';
import { ShareResult } from '../../src/constants/shareResult';
import { saveBackupFile, saveBackupToDownloads, pickBackupFile } from '../../src/utils/backupIO.web';

interface FakeAnchor {
  href: string;
  download: string;
  click: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
}

describe('backupIO (web)', () => {
  let anchor: FakeAnchor;
  let createObjectUrl: ReturnType<typeof vi.fn>;
  let revokeObjectUrl: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    anchor = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return anchor as unknown as HTMLElement;
      return document.createElementNS('http://www.w3.org/1999/xhtml', tag);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(node => node as unknown as never);
    createObjectUrl = vi.fn(() => 'blob:finly');
    revokeObjectUrl = vi.fn();
    Object.assign(URL, { createObjectURL: createObjectUrl, revokeObjectURL: revokeObjectUrl });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads the JSON through an anchor', async () => {
    const result = await saveBackupFile('{"version":1}');

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(anchor.download).toBe(backupFileName());
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(anchor.remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:finly');
    expect(result).toBe(ShareResult.SAVED);
  });

  it('reports a saved file for Downloads', async () => {
    expect(await saveBackupToDownloads('{}')).toBe(true);
    expect(anchor.click).toHaveBeenCalledTimes(1);
  });

  it('resolves to null when the file dialog is dismissed', async () => {
    vi.useFakeTimers();
    try {
      const pick = pickBackupFile();
      window.dispatchEvent(new Event('focus'));
      await vi.advanceTimersByTimeAsync(400);
      expect(await pick).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
