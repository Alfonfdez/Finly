import { useConfig } from '../context/ConfigContext';
import { scaleFontSize } from '../utils/formatters';

export function useFontSize() {
  const { config } = useConfig();
  const fs = (size: number) => scaleFontSize(size, config.textSize);
  return fs;
}
