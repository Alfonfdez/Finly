import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useResetOnOpen } from '../hooks/useResetOnOpen';
import { t } from '../i18n';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import ListItemRow from './ListItemRow';
import SearchBar from './SearchBar';
import ModalFooter from './ModalFooter';
import RadioButton from './RadioButton';
import type { Option } from './SelectorInline';
import type { IconName } from '../constants/types';

interface Props<T extends string> {
  visible: boolean;
  title: string;
  icon?: IconName;
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  searchable?: boolean;
}

export default function OptionPickerModal<T extends string>({
  visible,
  title,
  icon = 'options-outline',
  options,
  selected,
  onSelect,
  onClose,
  searchable,
}: Props<T>) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [tempValue, setTempValue] = useState<T | null>(null);
  const [search, setSearch] = useState('');

  const isSearchable = searchable ?? options.length > 10;

  const resetOnOpen = useCallback(() => {
    setTempValue(selected);
    setSearch('');
  }, [selected]);
  useResetOnOpen(visible, resetOnOpen);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter(op => op.label.toLowerCase().includes(lower));
  }, [options, search]);

  const handleConfirm = useCallback(() => {
    if (tempValue !== null) onSelect(tempValue);
    onClose();
  }, [tempValue, onSelect, onClose]);

  const renderItem = useCallback(({ item }: { item: Option<T> }) => {
    const isSelected = item.value === tempValue;
    return (
      <ListItemRow
        title={item.label}
        leading={
          <View style={styles.leadingRow}>
            <RadioButton selected={isSelected} size={20} borderColor={c.textSecondary} />
            {item.icon && <View style={styles.iconWrap}>{item.icon}</View>}
          </View>
        }
        divider
        style={styles.row}
        onPress={() => setTempValue(item.value)}
      />
    );
  }, [tempValue, c]);

  const keyExtractor = useCallback((item: Option<T>) => String(item.value), []);

  return (
    <ModalShell visible={visible} onClose={onClose} maxHeight="85%">
      <ModalHeader title={title} icon={icon} />
      {isSearchable && (
        <SearchBar
          placeholder={labels.settings_picker_search}
          value={search}
          onChangeText={setSearch}
          onClose={() => setSearch('')}
          autoFocus
        />
      )}
      {filtered.length === 0 ? (
        <Text style={[styles.empty, { color: c.textSecondary, fontSize: fs(14) }]}>
          {labels.settings_picker_no_results}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      )}
      <ModalFooter
        cancelLabel={labels.cancel}
        confirmLabel={labels.transactions_confirm}
        onCancel={onClose}
        onConfirm={handleConfirm}
      />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 0 },
  leadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', paddingVertical: 24 },
});
