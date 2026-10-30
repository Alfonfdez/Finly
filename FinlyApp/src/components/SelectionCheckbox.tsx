import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';

interface Props {
  selected: boolean;
}

/** The standard list-selection indicator: first element on the left of a row. */
function SelectionCheckbox({ selected }: Props) {
  const { activeColors: c } = useConfig();
  return (
    <Ionicons
      name={selected ? 'checkbox' : 'checkbox-outline'}
      size={22}
      color={selected ? c.primary : c.textSecondary}
    />
  );
}

export default memo(SelectionCheckbox);
