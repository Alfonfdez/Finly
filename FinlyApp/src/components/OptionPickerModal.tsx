import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { WHITE, TRANSPARENT } from '../constants/themes';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import ListItemRow from './ListItemRow';
import SearchBar from './SearchBar';
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
  const [tempValue, setTempValue] = useState(selected);
  const [search, setSearch] = useState('');

  const isSearchable = searchable ?? options.length > 10;

  useEffect(() => {
    if (visible) {
      setTempValue(selected);
      setSearch('');
    }
  }, [visible, selected]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter(op => op.label.toLowerCase().includes(lower));
  }, [options, search]);

  const renderItem = useCallback(({ item }: { item: Option<T> }) => {
    const isSelected = item.value === tempValue;
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
        onPress={() => setTempValue(item.value)}
      />
    );
  }, [tempValue, c]);

  const keyExtractor = useCallback((item: Option<T>) => String(item.value), []);

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
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={onClose}
        >
          <Text style={[styles.btnText, { color: c.text, fontSize: fs(14) }]}>{labels.transactions_cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: c.primary }]}
          onPress={() => { onSelect(tempValue); onClose(); }}
        >
          <Text style={[styles.btnText, { color: WHITE, fontSize: fs(14) }]}>{labels.transactions_confirm}</Text>
        </TouchableOpacity>
      </View>
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
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TRANSPARENT,
  },
  btnText: { fontWeight: '600' },
});
