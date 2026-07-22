import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isHidden: boolean;
  onToggle: () => void;
  color?: string;
}

export default function EyeToggle({ isHidden, onToggle, color }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} hitSlop={8}>
      <Ionicons
        name={isHidden ? 'eye-outline' : 'eye-off-outline'}
        size={18}
        color={color}
      />
    </TouchableOpacity>
  );
}
