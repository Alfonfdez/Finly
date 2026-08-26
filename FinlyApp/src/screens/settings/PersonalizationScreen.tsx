import { View, Text, ScrollView } from 'react-native';
import { useConfig, type Config } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t, getDisplayAccountName } from '../../i18n';
import { isTotalAccount } from '../../database/helpers';
import { type Option } from '../../components/SelectorInline';
import IconBadge from '../../components/IconBadge';
import { badgeShapeFor } from '../../utils/badgeShape';
import CheckboxRow from '../../components/settings/CheckboxRow';
import ToggleRow from '../../components/settings/ToggleRow';
import SettingsSelectRow from '../../components/settings/SettingsSelectRow';
import SettingsPickerRow from '../../components/settings/SettingsPickerRow';
import { settingsStyles } from '../../components/settings/settingsStyles';
import type { Period } from '../../constants/types';

export default function PersonalizationScreen() {
  const { config, activeColors: c, updateConfig } = useConfig();
  const { accounts } = useApp();
  const fs = useFontSize();
  const labels = t();

  const allAccounts = accounts.filter(a => isTotalAccount(a)).concat(
    accounts.filter(a => !isTotalAccount(a)).sort((a, b) => a.name.localeCompare(b.name))
  );

  const homeAccounts: Option<string>[] = [
    { label: labels.account_total, value: 'total' },
    ...allAccounts.filter(a => !isTotalAccount(a)).map(a => ({
      label: getDisplayAccountName(a),
      value: String(a.id),
      icon: <IconBadge icon={a.icon} color={a.color} shape={badgeShapeFor(config, 'account')} size={24} iconSize={14} />,
    })),
  ];

  const addAccounts: Option<string>[] = [
    { label: labels.settings_not_selected, value: 'null' },
    ...allAccounts.filter(a => !isTotalAccount(a)).sort((a, b) => a.name.localeCompare(b.name)).map(a => ({
      label: getDisplayAccountName(a),
      value: String(a.id),
      icon: <IconBadge icon={a.icon} color={a.color} shape={badgeShapeFor(config, 'account')} size={24} iconSize={14} />,
    })),
  ];

  const homeSelected =
    config.homeDefaultAccountId !== null && homeAccounts.some(o => o.value === String(config.homeDefaultAccountId))
      ? String(config.homeDefaultAccountId)
      : 'total';

  const addSelected =
    config.addDefaultAccountId !== null && addAccounts.some(o => o.value === String(config.addDefaultAccountId))
      ? String(config.addDefaultAccountId)
      : 'null';

  const PERIOD_OPTIONS: Option<Period>[] = [
    { label: labels.settings_home_default_period_day, value: 'day' },
    { label: labels.settings_home_default_period_week, value: 'week' },
    { label: labels.settings_home_default_period_month, value: 'month' },
    { label: labels.settings_home_default_period_year, value: 'year' },
  ];

  return (
    <ScrollView style={[settingsStyles.container, { backgroundColor: c.background }]} contentContainerStyle={settingsStyles.content}>
      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_home_screen}</Text>
      <SettingsPickerRow
        label={labels.settings_default_account}
        options={homeAccounts}
        selected={homeSelected}
        onSelect={(v) => updateConfig({ homeDefaultAccountId: v === 'total' ? null : Number(v) })}
        title={labels.settings_default_account}
      />
      <SettingsSelectRow
        label={labels.settings_default_period}
        options={PERIOD_OPTIONS}
        selected={config.homeDefaultPeriod}
        onSelect={(v) => updateConfig({ homeDefaultPeriod: v as Config['homeDefaultPeriod'] })}
      />

      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_add_transaction}</Text>
      <SettingsPickerRow
        label={labels.settings_default_account}
        options={addAccounts}
        selected={addSelected}
        onSelect={(v) => updateConfig({ addDefaultAccountId: v === 'null' ? null : Number(v) })}
        title={labels.settings_default_account}
      />
      <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
        <Text style={[settingsStyles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_optional_fields}</Text>
        <CheckboxRow
          checked={config.addShowLabels}
          onToggle={() => updateConfig({ addShowLabels: !config.addShowLabels })}
          label={labels.settings_labels}
        />
        <CheckboxRow
          checked={config.addShowComments}
          onToggle={() => updateConfig({ addShowComments: !config.addShowComments })}
          label={labels.settings_comments}
        />
        <CheckboxRow
          checked={config.addShowPhoto}
          onToggle={() => updateConfig({ addShowPhoto: !config.addShowPhoto })}
          label={labels.settings_photo}
        />
      </View>

      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_privacy}</Text>
      <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
        <ToggleRow
          checked={config.hideBalances}
          onToggle={() => updateConfig({ hideBalances: !config.hideBalances })}
          label={labels.settings_hide_balances}
        />
      </View>
    </ScrollView>
  );
}
