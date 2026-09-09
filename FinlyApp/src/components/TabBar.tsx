import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { TRANSACTION_TYPES, type TransactionType } from '../constants/types';
import { CARD_BORDER_RADIUS, BUTTON_BORDER_RADIUS } from './componentStyles';

interface TypeTab {
  key: TransactionType;
  label: string;
  accessibilityLabel: string;
}

export function typeTabs(labels: {
  tab_expenses: string;
  tab_income: string;
  a11y_show_expenses: string;
  a11y_show_income: string;
}): TypeTab[] {
  return [
    { key: TRANSACTION_TYPES.expense, label: labels.tab_expenses, accessibilityLabel: labels.a11y_show_expenses },
    { key: TRANSACTION_TYPES.income, label: labels.tab_income, accessibilityLabel: labels.a11y_show_income },
  ];
}

interface Tab<T extends string> {
  key: T;
  label: string;
  accessibilityLabel?: string;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
}

export default function TabBar<T extends string>({ tabs, active, onChange }: Props<T>) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active === tab.key && { backgroundColor: c.background }]}
          onPress={() => onChange(tab.key)}
          accessibilityLabel={tab.accessibilityLabel}
        >
          <Text
            style={[
              styles.text,
              { color: active === tab.key ? c.text : c.textSecondary, fontSize: fs(15) },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: CARD_BORDER_RADIUS,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  text: {
    fontWeight: '600',
  },
});
