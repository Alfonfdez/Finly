import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  active: boolean;
  onToggle: () => void;
  color?: string;
}

export default function SelectToggleButton({ active, onToggle, color }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} hitSlop={8}>
      <Ionicons
        name={active ? 'close-outline' : 'checkbox-outline'}
        size={22}
        color={color}
      />
    </TouchableOpacity>
  );
}
