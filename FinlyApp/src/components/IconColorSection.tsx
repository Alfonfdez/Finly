import { useState } from 'react';
import type { ConfigIconShape, IconName } from '../constants/types';
import IconGrid from './IconGrid';
import ColorGrid from './ColorGrid';
import ColorPickerModal from './ColorPickerModal';
import SectionTitle from './form/SectionTitle';

interface IconColorSectionProps {
  icons: readonly IconName[];
  shape: ConfigIconShape;
  symbolTitle: string;
  colorTitle: string;
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
  selectedIcon,
  onSelectIcon,
  selectedColor,
  customColor,
  onSelectColor,
}: IconColorSectionProps) {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  return (
    <>
      <SectionTitle text={symbolTitle} />
      <IconGrid
        icons={icons}
        selectedIcon={selectedIcon}
        selectedColor={selectedColor}
        shape={shape}
        onSelect={onSelectIcon}
      />

      <SectionTitle text={colorTitle} />
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
