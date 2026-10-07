import { useCallback } from 'react';
import { View, Text, Switch, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenShell from '../components/ScreenShell';
import IconBadge from '../components/IconBadge';
import Fab from '../components/Fab';
import { switchColors } from '../components/componentStyles';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { t, getDisplayCategoryName } from '../i18n';
import { BADGE_SHAPES, TRANSACTION_TYPES, USER_ID, type RootStackParamList } from '../constants/types';
import { formatAmount, formatDateLong, parseDbDate } from '../utils/formatters';
import { fromDateOnly, isRecurrenceEnded, todayDateOnly } from '../utils/recurrence';
import { recurrenceSummary } from '../utils/recurrenceSummary';
import { recurringRepository } from '../database';
import { resumeRecurringRule } from '../database/recurringService';
import type { RecurringRule } from '../database/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recurring'>;

export default function RecurringScreen() {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const { categoriesById, refresh } = useApp();

  const loadRules = useCallback(async () => {
    const rules = await recurringRepository.list(USER_ID);
    const counts = await recurringRepository.countOccurrencesByRuleIds(rules.map(r => r.id));
    return { rules, counts };
  }, []);
  const { data, setData, loading } = useFocusLoad(
    loadRules,
    { rules: [] as RecurringRule[], counts: new Map<number, number>() },
  );
  const { rules, counts } = data;
  const today = todayDateOnly();

  const handleToggleActive = useCallback(async (rule: RecurringRule, value: boolean) => {
    // An ended rule has no occurrence left to generate — it cannot be resumed.
    if (isRecurrenceEnded(rule, rule.next_due, todayDateOnly())) return;
    if (value) {
      // Resume: skip the occurrences missed while paused, then materialize the current one.
      await resumeRecurringRule(rule.id);
      setData(await loadRules());
      refresh();
    } else {
      await recurringRepository.setActive(rule.id, false);
      setData(prev => ({ ...prev, rules: prev.rules.map(r => (r.id === rule.id ? { ...r, active: 0 } : r)) }));
    }
  }, [setData, refresh, loadRules]);

  if (loading && rules.length === 0) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <FlatList
        data={rules}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={rules.length === 0 ? styles.emptyContent : styles.listContent}
        renderItem={({ item }) => {
          const category = categoriesById.get(item.category_id);
          const isIncome = item.type === TRANSACTION_TYPES.income;
          const active = item.active === 1;
          const ended = isRecurrenceEnded(item, item.next_due, today);
          const created = parseDbDate(item.created_at);
          const createdText = `${created.getDate()} ${labels.months_short[created.getMonth()]} ${created.getFullYear()}`;
          return (
            <View style={[styles.row, { borderBottomColor: c.border }]}>
              {category && (
                <IconBadge
                  icon={category.icon}
                  color={category.color}
                  shape={BADGE_SHAPES.circle}
                  size={36}
                  iconSize={18}
                  backgroundAlpha={19}
                  style={styles.badge}
                />
              )}
              <TouchableOpacity
                style={styles.info}
                onPress={() => navigation.navigate('ModifyRecurring', { ruleId: item.id })}
                accessibilityRole="button"
                accessibilityLabel={item.name}
              >
                <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: fs(12) }]} numberOfLines={1}>
                  {recurrenceSummary(item, config.language)}
                </Text>
                <Text
                  style={[styles.nextDue, { color: ended ? c.textSecondary : c.primary, fontSize: fs(11) }]}
                  numberOfLines={1}
                >
                  {ended
                    ? labels.recurring_ended
                    : labels.recurring_next_due(formatDateLong(fromDateOnly(item.next_due), config.language))}
                </Text>
                <Text style={[styles.meta, { color: c.textSecondary, fontSize: fs(11) }]} numberOfLines={1}>
                  {category ? `${getDisplayCategoryName(category)} · ` : ''}
                  {labels.recurring_created_on(createdText)}
                  {' · '}
                  {labels.recurring_transactions_count(counts.get(item.id) ?? 0)}
                </Text>
              </TouchableOpacity>
              <View style={styles.right}>
                <Text style={[styles.amount, { color: isIncome ? c.green : c.red, fontSize: fs(15) }]}>
                  {isIncome ? '+' : '-'}{formatAmount(item.amount, config)}
                </Text>
                <View style={styles.activeRow}>
                  <Text style={[styles.activeLabel, { color: c.textSecondary, fontSize: fs(11) }]}>
                    {ended ? labels.recurring_ended : active ? labels.recurring_active : labels.recurring_paused}
                  </Text>
                  <Switch
                    value={ended ? false : active}
                    onValueChange={value => handleToggleActive(item, value)}
                    disabled={ended}
                    accessibilityLabel={ended ? labels.recurring_ended : active ? labels.recurring_active : labels.recurring_paused}
                    accessibilityState={{ disabled: ended }}
                    style={ended ? styles.switchDisabled : undefined}
                    {...switchColors(c)}
                  />
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="repeat-outline" size={64} color={c.textSecondary} />
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
              {labels.recurring_empty}
            </Text>
          </View>
        }
      />
      <Fab onPress={() => navigation.navigate('CreateRecurring')} accessibilityLabel={labels.recurring_add} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  listContent: {
    paddingBottom: 128,
  },
  emptyContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  badge: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 2,
  },
  nextDue: {
    marginTop: 2,
  },
  meta: {
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 8,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeLabel: {
    fontWeight: '500',
  },
  switchDisabled: {
    opacity: 0.5,
  },
  amount: {
    fontWeight: '700',
  },
  emptyText: {
    fontWeight: '500',
  },
});
