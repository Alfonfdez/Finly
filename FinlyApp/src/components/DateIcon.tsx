import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';

export const DATE_ICON_KINDS = {
  calendar: 'calendar-outline',
  time: 'time-outline',
  updated: 'refresh-outline',
} as const;

export type DateIconKind = keyof typeof DATE_ICON_KINDS;

interface Props {
  kind: DateIconKind;
  size?: number;
  color?: string;
}

/** Decorative icon for date labels: calendar for scheduled dates, time for history. */
export default function DateIcon({ kind, size = 12, color }: Props) {
  const { activeColors: c } = useConfig();
  return (
    <Ionicons
      name={DATE_ICON_KINDS[kind]}
      size={size}
      color={color ?? c.textSecondary}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
