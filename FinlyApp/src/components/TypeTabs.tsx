import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransactionType } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  active: TransactionType;
  onChange: (type: TransactionType) => void;
}

export default function TypeTabs({ active, onChange }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <TouchableOpacity
        style={[styles.tab, active === 'expense' && { backgroundColor: c.background }]}
        onPress={() => onChange('expense')}
        accessibilityLabel={labels.a11y_show_expenses}
      >
        <Text style={[styles.text, { color: active === 'expense' ? c.text : c.textSecondary, fontSize: fs(15) }]}>{labels.tab_expenses}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, active === 'income' && { backgroundColor: c.background }]}
        onPress={() => onChange('income')}
        accessibilityLabel={labels.a11y_show_income}
      >
        <Text style={[styles.text, { color: active === 'income' ? c.text : c.textSecondary, fontSize: fs(15) }]}>{labels.tab_income}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  text: {
    fontWeight: '600',
  },
});
