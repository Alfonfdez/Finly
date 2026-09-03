import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

const mockFile = vi.fn();
const mockCopy = vi.fn();
const mockDeletePhotoFile = vi.fn(async (..._args: unknown[]) => {});

vi.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: vi.fn(),
  launchCameraAsync: vi.fn(),
  requestMediaLibraryPermissionsAsync: vi.fn(),
  launchImageLibraryAsync: vi.fn(),
}));

vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' } },
  File: class MockFile {
    uri: string;
    copy = mockCopy;
    exists = false;
    delete = vi.fn();
    constructor(uri: string) {
      this.uri = uri;
      mockFile(uri);
    }
  },
}));

vi.mock('../../src/utils/photoUtils', () => ({
  deletePhotoFile: (...args: unknown[]) => mockDeletePhotoFile(...args),
}));

import { usePhotos } from '../../src/hooks/usePhotos';

function setPermission(kind: 'camera' | 'library', granted: boolean) {
  const spy =
    kind === 'camera'
      ? (ImagePicker.requestCameraPermissionsAsync as ReturnType<typeof vi.fn>)
      : (ImagePicker.requestMediaLibraryPermissionsAsync as ReturnType<typeof vi.fn>);
  spy.mockResolvedValue({ status: granted ? 'granted' : 'denied' });
}

describe('usePhotos', () => {
  beforeEach(() => {
    mockFile.mockReset();
    mockCopy.mockReset().mockImplementation(() => {});
    const cam = ImagePicker.requestCameraPermissionsAsync as ReturnType<typeof vi.fn>;
    const lib = ImagePicker.requestMediaLibraryPermissionsAsync as ReturnType<typeof vi.fn>;
    cam.mockReset();
    lib.mockReset();
    (ImagePicker.launchCameraAsync as ReturnType<typeof vi.fn>).mockReset();
    (ImagePicker.launchImageLibraryAsync as ReturnType<typeof vi.fn>).mockReset();
    mockDeletePhotoFile.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with the provided photos', async () => {
    const { result } = await renderHook(() => usePhotos(['a.jpg', 'b.jpg']));
    expect(result.current.photos).toEqual(['a.jpg', 'b.jpg']);
  });

  it('does not take a photo when the camera permission is denied', async () => {
    setPermission('camera', false);
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handleTakePhoto());
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(result.current.photos).toEqual([]);
  });

  it('does not take a photo when the capture is canceled', async () => {
    setPermission('camera', true);
    (ImagePicker.launchCameraAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: true,
      assets: [],
    });
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handleTakePhoto());
    expect(result.current.photos).toEqual([]);
  });

  it('copies the captured photo into storage and appends it', async () => {
    setPermission('camera', true);
    (ImagePicker.launchCameraAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/snap.jpg' }],
    });
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handleTakePhoto());
    expect(mockFile).toHaveBeenCalledWith('file:///tmp/snap.jpg');
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0]).toMatch(/photo_\d+_0\.jpg$/);
  });

  it('does not pick when the media library permission is denied', async () => {
    setPermission('library', false);
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handlePickFromGallery());
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    expect(result.current.photos).toEqual([]);
  });

  it('does not pick when the gallery picker is canceled', async () => {
    setPermission('library', true);
    (ImagePicker.launchImageLibraryAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: true,
      assets: [],
    });
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handlePickFromGallery());
    expect(result.current.photos).toEqual([]);
  });

  it('copies the picked photo into storage and appends it', async () => {
    setPermission('library', true);
    (ImagePicker.launchImageLibraryAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/pick.jpg' }],
    });
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handlePickFromGallery());
    expect(mockFile).toHaveBeenCalledWith('file:///tmp/pick.jpg');
    expect(result.current.photos).toHaveLength(1);
  });

  it('handles copy failure by logging and alerting', async () => {
    setPermission('camera', true);
    (ImagePicker.launchCameraAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/snap.jpg' }],
    });
    mockCopy.mockImplementation(() => {
      throw new Error('copy failed');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handleTakePhoto());
    expect(errorSpy).toHaveBeenCalled();
    expect(result.current.photos).toEqual([]);
    errorSpy.mockRestore();
  });

  it('removes a photo and deletes its backing file', async () => {
    const { result } = await renderHook(() => usePhotos(['x.jpg', 'y.jpg']));
    await act(() => result.current.handleRemovePhoto('x.jpg'));
    expect(mockDeletePhotoFile).toHaveBeenCalledWith('x.jpg');
    expect(result.current.photos).toEqual(['y.jpg']);
  });
});
