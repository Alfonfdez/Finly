import { useConfig } from '../context/ConfigContext';
import { escalarFontSize } from '../utils/formatters';

export function useFontSize() {
  const { config } = useConfig();
  const fs = (size: number) => escalarFontSize(size, config.tamanoTexto);
  return fs;
}
