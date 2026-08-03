export interface IconColorHintKeys {
  empty: string;
  iconColor: string;
  icon: string;
  color: string;
}

export function getIconColorHintText(
  name: string,
  nameError: string | null,
  selectedIcon: string | null,
  selectedColor: string | null,
  keys: IconColorHintKeys
): string | null {
  if (name.trim().length === 0) return keys.empty;
  if (nameError) return nameError;
  if (!selectedIcon && !selectedColor) return keys.iconColor;
  if (!selectedIcon) return keys.icon;
  if (!selectedColor) return keys.color;
  return null;
}

export function getNameHintText(
  name: string,
  nameError: string | null,
  emptyKey: string
): string | null {
  if (name.trim().length === 0) return emptyKey;
  if (nameError) return nameError;
  return null;
}
