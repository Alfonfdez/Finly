import { ComponentProps } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

export type SortBy = 'date' | 'amount';
export type SortDirection = 'asc' | 'desc';

interface Props {
  sortBy: SortBy;
  direction: SortDirection;
  onToggleSort: (field: SortBy) => void;
  onToggleDirection: () => void;
}

export default function SortToggle({ sortBy, direction, onToggleSort, onToggleDirection }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const arrowIcon: ComponentProps<typeof Ionicons>['name'] = direction === 'desc' ? 'arrow-down' : 'arrow-up';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => onToggleSort('date')}
        accessibilityLabel={labels.transactions_sort_date}
      >
        <Text style={[
          styles.label,
          { color: sortBy === 'date' ? c.primary : c.textSecondary, fontSize: fs(13) },
        ]}>
          {labels.transactions_sort_date}
        </Text>
        {sortBy === 'date' && (
          <TouchableOpacity onPress={onToggleDirection} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={arrowIcon} size={14} color={c.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => onToggleSort('amount')}
        accessibilityLabel={labels.transactions_sort_amount}
      >
        <Text style={[
          styles.label,
          { color: sortBy === 'amount' ? c.primary : c.textSecondary, fontSize: fs(13) },
        ]}>
          {labels.transactions_sort_amount}
        </Text>
        {sortBy === 'amount' && (
          <TouchableOpacity onPress={onToggleDirection} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={arrowIcon} size={14} color={c.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontWeight: '600',
  },
});
