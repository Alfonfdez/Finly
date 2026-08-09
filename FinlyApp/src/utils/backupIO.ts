import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

function backupFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `finly-backup-${stamp}.json`;
}

export async function saveBackupFile(json: string): Promise<void> {
  const file = new File(Paths.document, backupFileName());
  await file.write(json);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Finly backup',
    });
  }
}

export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return null;
  const file = new File(result.assets[0].uri);
  return file.text();
}
