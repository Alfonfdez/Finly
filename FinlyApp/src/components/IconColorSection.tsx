import { useState } from 'react';
import type { ConfigIconShape, IconName } from '../constants/types';
import IconGrid from './IconGrid';
import ColorGrid from './ColorGrid';
import ColorPickerModal from './ColorPickerModal';
import FormSectionHeader from './form/FormSectionHeader';

interface IconColorSectionProps {
  icons: readonly IconName[];
  shape: ConfigIconShape;
  symbolTitle: string;
  colorTitle: string;
  symbolIcon?: IconName;
  colorIcon?: IconName;
  selectedIcon: string | null;
  onSelectIcon: (icon: string) => void;
  selectedColor: string | null;
  customColor: string | null;
  onSelectColor: (color: string) => void;
}

export default function IconColorSection({
  icons,
  shape,
  symbolTitle,
  colorTitle,
  symbolIcon = 'shapes-outline',
  colorIcon = 'color-palette-outline',
  selectedIcon,
  onSelectIcon,
  selectedColor,
  customColor,
  onSelectColor,
}: IconColorSectionProps) {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  return (
    <>
      <FormSectionHeader title={symbolTitle} icon={symbolIcon} />
      <IconGrid
        icons={icons}
        selectedIcon={selectedIcon}
        selectedColor={selectedColor}
        shape={shape}
        onSelect={onSelectIcon}
      />

      <FormSectionHeader title={colorTitle} icon={colorIcon} />
      <ColorGrid
        selectedColor={selectedColor}
        customColor={customColor}
        onSelect={onSelectColor}
        onOpenPicker={() => setColorPickerVisible(true)}
      />

      <ColorPickerModal
        visible={colorPickerVisible}
        selectedColor={selectedColor}
        onSelect={onSelectColor}
        onClose={() => setColorPickerVisible(false)}
      />
    </>
  );
}
