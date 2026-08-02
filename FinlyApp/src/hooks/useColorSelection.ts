import { useState, useCallback } from 'react';
import { QUICK_COLORS } from '../components/ColorGrid';

export function useColorSelection(initialColor?: string | null) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialColor ?? null
  );
  const [customColor, setCustomColor] = useState<string | null>(
    initialColor && !QUICK_COLORS.includes(initialColor) ? initialColor : null
  );

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    if (!QUICK_COLORS.includes(color)) {
      setCustomColor(color);
    }
  }, []);

  const setSelectedColorStable = useCallback(
    (color: string | null) => setSelectedColor(color),
    []
  );
  const setCustomColorStable = useCallback(
    (color: string | null) => setCustomColor(color),
    []
  );

  return { selectedColor, customColor, setSelectedColor: setSelectedColorStable, setCustomColor: setCustomColorStable, handleColorSelect };
}
