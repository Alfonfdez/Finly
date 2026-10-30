import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { usePhotos } from '../../src/hooks/usePhotos';

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
  Directory: class MockDirectory {
    uri: string;
    create = vi.fn();
    constructor(...parts: (string | { uri: string })[]) {
      const [first, ...rest] = parts;
      const base = typeof first === 'string' ? first : first.uri;
      this.uri = `${base}${rest.join('/')}/`;
    }
  },
  File: class MockFile {
    uri: string;
    copy = mockCopy;
    exists = false;
    delete = vi.fn();
    constructor(...parts: (string | { uri: string })[]) {
      const [first, ...rest] = parts;
      const base = typeof first === 'string' ? first : first.uri;
      this.uri = rest.length > 0 ? `${base}${rest.join('/')}` : base;
      mockFile(this.uri);
    }
  },
}));

vi.mock('../../src/utils/photoUtils', () => ({
  deletePhotoFile: (...args: unknown[]) => mockDeletePhotoFile(...args),
}));

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
    mockCopy.mockReset().mockResolvedValue(undefined);
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
    expect(result.current.photos[0]).toMatch(/\/photos\/photo_\d+_0\.jpg$/);
  });

  it('waits for the file copy before appending the photo', async () => {
    setPermission('camera', true);
    (ImagePicker.launchCameraAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/snap.jpg' }],
    });
    let resolveCopy: (() => void) | undefined;
    mockCopy.mockImplementationOnce(() => new Promise<void>((resolve) => { resolveCopy = resolve; }));
    const { result } = await renderHook(() => usePhotos());

    const action = result.current.handleTakePhoto();
    await waitFor(() => expect(mockCopy).toHaveBeenCalled());
    expect(result.current.photos).toEqual([]);

    await act(async () => {
      resolveCopy?.();
      await action;
    });
    expect(result.current.photos).toHaveLength(1);
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

  it('leaves an existing photo file for the repository to clean up', async () => {
    const { result } = await renderHook(() => usePhotos(['x.jpg', 'y.jpg']));
    await act(() => result.current.handleRemovePhoto('x.jpg'));
    expect(result.current.photos).toEqual(['y.jpg']);

    await act(() => result.current.finalizePhotos());
    expect(mockDeletePhotoFile).not.toHaveBeenCalled();
  });

  it('deletes a newly added photo that is removed before save', async () => {
    setPermission('camera', true);
    (ImagePicker.launchCameraAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/snap.jpg' }],
    });
    const { result } = await renderHook(() => usePhotos());
    await act(() => result.current.handleTakePhoto());
    const created = result.current.photos[0];

    await act(() => result.current.handleRemovePhoto(created));
    await act(() => result.current.finalizePhotos());
    expect(mockDeletePhotoFile).toHaveBeenCalledWith(created);
  });

  it('deletes unsaved new photos when the form unmounts', async () => {
    setPermission('camera', true);
    (ImagePicker.launchCameraAsync as ReturnType<typeof vi.fn>).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/snap.jpg' }],
    });
    const { result, unmount } = await renderHook(() => usePhotos());
    await act(() => result.current.handleTakePhoto());
    expect(result.current.photos).toHaveLength(1);
    const created = result.current.photos[0];

    await unmount();
    expect(mockDeletePhotoFile).toHaveBeenCalledWith(created);
  });
});
