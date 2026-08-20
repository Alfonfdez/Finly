import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../i18n';

interface Props {
  isHidden: boolean;
  onToggle: () => void;
  color?: string;
}

export default function EyeToggle({ isHidden, onToggle, color }: Props) {
  const labels = t();
  return (
    <TouchableOpacity onPress={onToggle} hitSlop={8} accessibilityLabel={isHidden ? labels.a11y_show_balances : labels.a11y_hide_balances}>
      <Ionicons
        name={isHidden ? 'eye-outline' : 'eye-off-outline'}
        size={18}
        color={color}
      />
    </TouchableOpacity>
  );
}
