import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig, Config } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { useFontSize } from '../../hooks/useFontSize';
import { scaleFontSize } from '../../utils/formatters';
import { t, getDisplayAccountName } from '../../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Period } from '../../constants/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SettingsPersonalization'>;
};

type Option<T = string> = { label: string; value: T };

function SelectorRadio<T extends string>({
  options,
  selected,
  onSelect,
  colors,
  textSize,
}: {
  options: Option<T>[];
  selected: T;
  onSelect: (v: T) => void;
  colors: ReturnType<typeof useConfig>['activeColors'];
  textSize: Config['textSize'];
}) {
  const fs = (s: number) => scaleFontSize(s, textSize);
  return (
    <View style={styles.options}>
      {options.map(op => (
        <TouchableOpacity
          key={String(op.value)}
          style={[styles.option, { backgroundColor: selected === op.value ? colors.primary + '20' : colors.surface }]}
          onPress={() => onSelect(op.value)}
        >
          <Text style={[styles.optionText, { color: selected === op.value ? colors.primary : colors.text, fontSize: fs(14) }]}>
            {op.label}
          </Text>
          {selected === op.value && (
            <Text style={[styles.check, { color: colors.primary, fontSize: fs(14) }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Checkbox({
  checked,
  onToggle,
  colors,
  textSize,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useConfig>['activeColors'];
  textSize: Config['textSize'];
  label: string;
}) {
  const fs = (s: number) => scaleFontSize(s, textSize);
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? colors.primary : colors.textSecondary}
      />
      <Text style={[styles.checkboxLabel, { color: colors.text, fontSize: fs(14) }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function PersonalizationScreen({ navigation }: Props) {
  const { config, activeColors: c, updateConfig } = useConfig();
  const { accounts } = useApp();
  const fs = useFontSize();
  const labels = t();

  const allAccounts = accounts.filter(a => a.is_total === 1).concat(
    accounts.filter(a => a.is_total !== 1).sort((a, b) => a.name.localeCompare(b.name))
  );

  const homeAccounts: Option<string>[] = [
    { label: labels.account_total, value: 'total' },
    ...allAccounts.filter(a => a.is_total !== 1).map(a => ({ label: getDisplayAccountName(a), value: String(a.id) })),
  ];

  const addAccounts: Option<string>[] = [
    { label: labels.settings_not_selected, value: 'null' },
    ...allAccounts.filter(a => a.is_total !== 1).sort((a, b) => a.name.localeCompare(b.name)).map(a => ({ label: getDisplayAccountName(a), value: String(a.id) })),
  ];

  const PERIODS: Option<Period>[] = [
    { label: labels.settings_home_default_period_day, value: 'day' },
    { label: labels.settings_home_default_period_week, value: 'week' },
    { label: labels.settings_home_default_period_month, value: 'month' },
    { label: labels.settings_home_default_period_year, value: 'year' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_home_screen}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_default_account}</Text>
        <SelectorRadio
          options={homeAccounts}
          selected={config.homeDefaultAccountId === null ? 'total' : String(config.homeDefaultAccountId)}
          onSelect={(v) => updateConfig({ homeDefaultAccountId: v === 'total' ? null : Number(v) })}
          colors={c}
          textSize={config.textSize}
        />
      </View>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_default_period}</Text>
        <SelectorRadio
          options={PERIODS}
          selected={config.homeDefaultPeriod}
          onSelect={(v) => updateConfig({ homeDefaultPeriod: v as Config['homeDefaultPeriod'] })}
          colors={c}
          textSize={config.textSize}
        />
      </View>

      <Text style={[styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_add_transaction}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_default_account}</Text>
        <SelectorRadio
          options={addAccounts}
          selected={config.addDefaultAccountId === null ? 'null' : String(config.addDefaultAccountId)}
          onSelect={(v) => updateConfig({ addDefaultAccountId: v === 'null' ? null : Number(v) })}
          colors={c}
          textSize={config.textSize}
        />
      </View>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_optional_fields}</Text>
        <Checkbox
          checked={config.addShowLabels}
          onToggle={() => updateConfig({ addShowLabels: !config.addShowLabels })}
          colors={c}
          textSize={config.textSize}
          label={labels.settings_labels}
        />
        <Checkbox
          checked={config.addShowComments}
          onToggle={() => updateConfig({ addShowComments: !config.addShowComments })}
          colors={c}
          textSize={config.textSize}
          label={labels.settings_comments}
        />
        {Platform.OS !== 'web' && (
          <Checkbox
            checked={config.addShowPhoto}
            onToggle={() => updateConfig({ addShowPhoto: !config.addShowPhoto })}
            colors={c}
            textSize={config.textSize}
            label={labels.settings_photo}
          />
        )}
      </View>

      <Text style={[styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_privacy}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <TouchableOpacity style={styles.toggleRow} onPress={() => updateConfig({ hideBalances: !config.hideBalances })}>
          <Text style={[styles.toggleLabel, { color: c.text, fontSize: fs(14) }]}>{labels.settings_hide_balances}</Text>
          <Ionicons
            name={config.hideBalances ? 'toggle' : 'toggle-outline'}
            size={32}
            color={config.hideBalances ? c.primary : c.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: { borderRadius: 12, padding: 16, marginBottom: 8 },
  label: { fontWeight: '600', marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  optionText: { fontWeight: '500' },
  check: { fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkboxLabel: { fontWeight: '500' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontWeight: '500' },
});
