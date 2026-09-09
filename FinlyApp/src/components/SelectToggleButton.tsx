import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../i18n';

interface Props {
  active: boolean;
  onToggle: () => void;
  color?: string;
}

export default function SelectToggleButton({ active, onToggle, color }: Props) {
  const labels = t();
  return (
    <TouchableOpacity onPress={onToggle} hitSlop={8} accessibilityLabel={active ? labels.a11y_exit_select_mode : labels.a11y_select_mode}>
      <Ionicons
        name={active ? 'close-outline' : 'checkbox-outline'}
        size={22}
        color={color}
      />
    </TouchableOpacity>
  );
}
