import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import ListItemRow from './ListItemRow';
import SearchBar from './SearchBar';
import ModalFooter from './ModalFooter';
import type { Option } from './SelectorInline';

interface Props<T extends string> {
  visible: boolean;
  title: string;
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  searchable?: boolean;
}

export default function OptionPickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  searchable,
}: Props<T>) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [tempLabel, setTempLabel] = useState('');
  const [search, setSearch] = useState('');

  const isSearchable = searchable ?? options.length > 10;

  useEffect(() => {
    if (visible) {
      const match = options.find(op => op.value === selected);
      setTempLabel(match?.label ?? '');
      setSearch('');
    }
  }, [visible, selected, options]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter(op => op.label.toLowerCase().includes(lower));
  }, [options, search]);

  const handleConfirm = useCallback(() => {
    const match = options.find(op => op.label === tempLabel);
    if (match) onSelect(match.value);
    onClose();
  }, [options, tempLabel, onSelect, onClose]);

  const renderItem = useCallback(({ item }: { item: Option<T> }) => {
    const isSelected = item.label === tempLabel;
    const radio = (
      <View style={[styles.radio, { borderColor: isSelected ? c.primary : c.textSecondary }]}>
        {isSelected && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
      </View>
    );
    return (
      <ListItemRow
        title={item.label}
        leading={
          <View style={styles.leadingRow}>
            {radio}
            {item.icon && <View style={styles.iconWrap}>{item.icon}</View>}
          </View>
        }
        divider
        style={styles.row}
        onPress={() => setTempLabel(item.label)}
      />
    );
  }, [tempLabel, c]);

  const keyExtractor = useCallback((item: Option<T>) => item.label, []);

  return (
    <ModalShell visible={visible} onClose={onClose} maxHeight="85%">
      <ModalHeader title={title} />
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
        cancelLabel={labels.transactions_cancel}
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
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  iconWrap: { justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', paddingVertical: 24 },
});
