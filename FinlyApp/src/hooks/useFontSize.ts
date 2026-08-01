import { useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { scaleFontSize } from '../utils/formatters';

export function useFontSize() {
  const { config } = useConfig();
  return useCallback(
    (size: number) => scaleFontSize(size, config.textSize),
    [config.textSize]
  );
}
