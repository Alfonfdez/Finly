import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransactionType } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

type AllType = 'all' | TransactionType;

interface Props {
  active: AllType;
  onChange: (type: AllType) => void;
}

export default function AllTypeTabs({ active, onChange }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const tabs: { key: AllType; label: string }[] = [
    { key: 'all', label: labels.tab_all },
    { key: 'expense', label: labels.tab_expenses },
    { key: 'income', label: labels.tab_income },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active === tab.key && { backgroundColor: c.background }]}
          onPress={() => onChange(tab.key)}
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
