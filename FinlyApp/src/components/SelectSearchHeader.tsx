import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { HEADER_BUTTONS } from './componentStyles';
import SelectToggleButton from './SelectToggleButton';

interface Props {
  selectMode: boolean;
  onToggleSelect: () => void;
  onToggleSearch: () => void;
}

export default function SelectSearchHeader({ selectMode, onToggleSelect, onToggleSearch }: Props) {
  const { activeColors: c } = useConfig();

  return (
    <View style={HEADER_BUTTONS}>
      <SelectToggleButton active={selectMode} onToggle={onToggleSelect} color={c.primary} />
      <TouchableOpacity onPress={onToggleSearch} style={HEADER_BUTTONS}>
        <Ionicons name="search-outline" size={22} color={c.text} />
      </TouchableOpacity>
    </View>
  );
}
