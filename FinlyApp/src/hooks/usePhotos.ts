import { useState, useEffect, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { isWeb } from '../utils/platform';
import {
  PHOTO_DIRECTORY,
  PHOTO_FILE_EXTENSION,
  PHOTO_FILE_PREFIX,
  PHOTO_QUALITY,
} from '../constants/photo';
import { deletePhotoFile } from '../utils/photoUtils';
import { t } from '../i18n';
import { ERROR_PREFIXES, logError, showErrorAlert } from '../utils/errors';

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
  const response = await fetch(asset.uri);
  if (!response.ok) throw new Error(`Failed to fetch photo: ${response.status}`);
  const blob = await response.blob();
  return readAsDataUrl(blob);
}

async function copyPhotoToStorage(src: string): Promise<string> {
  const photosDir = new Directory(Paths.document, PHOTO_DIRECTORY);
  photosDir.create({ idempotent: true, intermediates: true });
  const destFile = new File(photosDir, `${PHOTO_FILE_PREFIX}${Date.now()}_${photoCounter++}${PHOTO_FILE_EXTENSION}`);
  const srcFile = new File(src);
  await srcFile.copy(destFile);
  return destFile.uri;
}

export function usePhotos(initialPhotos: string[] = []) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const initialPhotoSet = useRef(new Set(initialPhotos));
  const removedPhotos = useRef(new Set<string>());
  const createdPhotos = useRef(new Set<string>());

  useEffect(() => () => {
    const uris = [...createdPhotos.current];
    createdPhotos.current.clear();
    for (const uri of uris) void deletePhotoFile(uri);
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: PHOTO_QUALITY });
    if (!result.canceled && result.assets[0]) {
      const src = result.assets[0].uri;
      try {
        const dest = await copyPhotoToStorage(src);
        createdPhotos.current.add(dest);
        setPhotos(prev => [...prev, dest]);
      } catch (err) {
        logError(ERROR_PREFIXES.photoCopy, err);
        showErrorAlert(t());
      }
    }
  }, []);

  const handlePickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: PHOTO_QUALITY });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (isWeb) {
        try {
          const dataUri = await webPhotoUri(asset);
          createdPhotos.current.add(dataUri);
          setPhotos(prev => [...prev, dataUri]);
        } catch (err) {
          logError(ERROR_PREFIXES.photoCopy, err);
          showErrorAlert(t());
        }
        return;
      }
      const src = asset.uri;
      try {
        const dest = await copyPhotoToStorage(src);
        createdPhotos.current.add(dest);
        setPhotos(prev => [...prev, dest]);
      } catch (err) {
        logError(ERROR_PREFIXES.photoCopy, err);
        showErrorAlert(t());
      }
    }
  }, []);

  const handleRemovePhoto = useCallback(async (uri: string) => {
    // Existing photos are still referenced by the saved row until the repository
    // update commits; only files created in this form session can be deleted here.
    if (createdPhotos.current.has(uri) && !initialPhotoSet.current.has(uri)) {
      removedPhotos.current.add(uri);
    }
    setPhotos(prev => prev.filter(p => p !== uri));
  }, []);

  const finalizePhotos = useCallback(async () => {
    const uris = [...removedPhotos.current];
    removedPhotos.current.clear();
    createdPhotos.current.clear();
    for (const uri of uris) {
      try {
        await deletePhotoFile(uri);
      } catch (err) {
        logError(ERROR_PREFIXES.photoDelete, err);
      }
    }
  }, []);

  return { photos, handleTakePhoto, handlePickFromGallery, handleRemovePhoto, finalizePhotos };
}
