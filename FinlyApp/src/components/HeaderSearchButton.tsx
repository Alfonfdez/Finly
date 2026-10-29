import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { HEADER_BUTTONS } from './componentStyles';
import { t } from '../i18n';

interface Props {
  active: boolean;
  onPress: () => void;
}

export default function HeaderSearchButton({ active, onPress }: Props) {
  const { activeColors: c } = useConfig();
  const labels = t();

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={8}
      style={HEADER_BUTTONS}
      accessibilityRole="button"
      accessibilityLabel={labels.a11y_search}
    >
      <Ionicons name="search-outline" size={22} color={active ? c.primary : c.text} />
    </TouchableOpacity>
  );
}
