import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { isWeb } from '../utils/platform';
import { deletePhotoFile } from '../utils/photoUtils';
import { t } from '../i18n';
import { showErrorAlert } from '../utils/errors';

let photoCounter = 0;

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image'));
    reader.readAsDataURL(blob);
  });
}

async function webPhotoUri(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  if (asset.file) return readAsDataUrl(asset.file);
  const blob = await fetch(asset.uri).then((r) => r.blob());
  return readAsDataUrl(blob);
}

export function usePhotos(initialPhotos: string[] = []) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const src = result.assets[0].uri;
      const dest = Paths.document.uri + `photo_${Date.now()}_${photoCounter++}.jpg`;
      try {
        const srcFile = new File(src);
        const destFile = new File(dest);
        srcFile.copy(destFile);
        setPhotos(prev => [...prev, dest]);
      } catch (err) {
        console.error('Failed to copy photo:', err);
        showErrorAlert(t());
      }
    }
  }, []);

  const handlePickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (isWeb) {
        const dataUri = await webPhotoUri(asset);
        setPhotos(prev => [...prev, dataUri]);
        return;
      }
      const src = asset.uri;
      const dest = Paths.document.uri + `photo_${Date.now()}_${photoCounter++}.jpg`;
      try {
        const srcFile = new File(src);
        const destFile = new File(dest);
        srcFile.copy(destFile);
        setPhotos(prev => [...prev, dest]);
      } catch (err) {
        console.error('Failed to copy photo:', err);
        showErrorAlert(t());
      }
    }
  }, []);

  const handleRemovePhoto = useCallback(async (uri: string) => {
    try {
      await deletePhotoFile(uri);
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
    setPhotos(prev => prev.filter(p => p !== uri));
  }, []);

  return { photos, handleTakePhoto, handlePickFromGallery, handleRemovePhoto };
}
