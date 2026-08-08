import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { isWeb } from '../utils/platform';
import { deletePhotoFile } from '../utils/photoUtils';

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
      const dest = Paths.document.uri + `photo_${Date.now()}.jpg`;
      const srcFile = new File(src);
      const destFile = new File(dest);
      srcFile.copy(destFile);
      setPhotos(prev => [...prev, dest]);
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
      const dest = Paths.document.uri + `photo_${Date.now()}.jpg`;
      const srcFile = new File(src);
      const destFile = new File(dest);
      srcFile.copy(destFile);
      setPhotos(prev => [...prev, dest]);
    }
  }, []);

  const handleRemovePhoto = useCallback(async (uri: string) => {
    await deletePhotoFile(uri);
    setPhotos(prev => prev.filter(p => p !== uri));
  }, []);

  return { photos, handleTakePhoto, handlePickFromGallery, handleRemovePhoto };
}
