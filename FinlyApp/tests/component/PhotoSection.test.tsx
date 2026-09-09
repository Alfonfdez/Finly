import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import PhotoSection from '../../src/components/PhotoSection';

const { platform } = vi.hoisted(() => ({
  platform: { isWeb: false, isNative: true, isAndroid: false },
}));

vi.mock('../../src/utils/platform', () => platform);

const onTakePhoto = vi.fn();
const onPickFromGallery = vi.fn();
const onRemovePhoto = vi.fn();

async function renderSection() {
  return await render(
    <PhotoSection
      photos={[]}
      onTakePhoto={onTakePhoto}
      onPickFromGallery={onPickFromGallery}
      onRemovePhoto={onRemovePhoto}
    />
  );
}

async function openSourceModal() {
  const view = await renderSection();
  await fireEvent.press(view.getByLabelText('Photo'));
  return view;
}

describe('PhotoSection', () => {
  beforeEach(() => {
    resetStub();
    platform.isWeb = false;
    platform.isNative = true;
    onTakePhoto.mockClear();
    onPickFromGallery.mockClear();
    onRemovePhoto.mockClear();
  });

  it('offers both camera and gallery on native', async () => {
    const view = await openSourceModal();

    expect(view.getByText('Take photo')).toBeTruthy();
    expect(view.getByText('Add from gallery')).toBeTruthy();
  });

  it('hides the camera option on web and keeps gallery', async () => {
    platform.isWeb = true;
    platform.isNative = false;

    const view = await openSourceModal();

    expect(view.queryByText('Take photo')).toBeNull();
    expect(view.getByText('Add from gallery')).toBeTruthy();
  });

  it('fires the gallery callback on web when the gallery option is tapped', async () => {
    platform.isWeb = true;
    platform.isNative = false;

    const view = await openSourceModal();
    await fireEvent.press(view.getByText('Add from gallery'));

    expect(onPickFromGallery).toHaveBeenCalledTimes(1);
    expect(onTakePhoto).not.toHaveBeenCalled();
  });

  it('renders a remove button per existing photo and confirms deletion', async () => {
    const view = await render(
      <PhotoSection
        photos={['data:image/jpeg;base64,AAAA']}
        onTakePhoto={onTakePhoto}
        onPickFromGallery={onPickFromGallery}
        onRemovePhoto={onRemovePhoto}
      />
    );

    await fireEvent.press(view.getByLabelText('Remove photo'));
    expect(view.getByText('Delete photo')).toBeTruthy();
    expect(view.getByText('Are you sure you want to delete this photo?')).toBeTruthy();

    await fireEvent.press(view.getByText('Delete'));
    expect(onRemovePhoto).toHaveBeenCalledWith('data:image/jpeg;base64,AAAA');
  });
});
