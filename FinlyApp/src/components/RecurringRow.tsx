import { memo } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import IconBadge from './IconBadge';
import { switchColors } from './componentStyles';
import { BADGE_SHAPES, TRANSACTION_TYPES } from '../constants/types';
import { formatAmount, formatDateLong, parseDbDate } from '../utils/formatters';
import { fromDateOnly, isRecurrenceEnded } from '../utils/recurrence';
import { recurrenceSummary } from '../utils/recurrenceSummary';
import type { Category, RecurringRule } from '../database/types';

interface Props {
  rule: RecurringRule;
  category?: Category;
  count: number;
  /** Today as a date-only string (shared by the list to avoid recomputing per row). */
  today: string;
  onPress: () => void;
  onToggleActive: (value: boolean) => void;
}

function RecurringRow({ rule, category, count, today, onPress, onToggleActive }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const isIncome = rule.type === TRANSACTION_TYPES.income;
  const active = rule.active === 1;
  const ended = isRecurrenceEnded(rule, rule.next_due, today);
  const created = parseDbDate(rule.created_at);
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
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={rule.name}
      >
        <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]} numberOfLines={1}>
          {rule.name}
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: fs(12) }]} numberOfLines={1}>
          {recurrenceSummary(rule, config.language)}
        </Text>
        <Text
          style={[styles.nextDue, { color: ended ? c.textSecondary : c.primary, fontSize: fs(11) }]}
          numberOfLines={1}
        >
          {ended
            ? labels.recurring_ended
            : labels.recurring_next_due(formatDateLong(fromDateOnly(rule.next_due), config.language))}
        </Text>
        <Text style={[styles.meta, { color: c.textSecondary, fontSize: fs(11) }]} numberOfLines={1}>
          {category ? `${getDisplayCategoryName(category)} · ` : ''}
          {labels.recurring_created_on(createdText)}
          {' · '}
          {labels.recurring_transactions_count(count)}
        </Text>
      </TouchableOpacity>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? c.green : c.red, fontSize: fs(15) }]}>
          {isIncome ? '+' : '-'}{formatAmount(rule.amount, config)}
        </Text>
        <View style={styles.activeRow}>
          <Text style={[styles.activeLabel, { color: c.textSecondary, fontSize: fs(11) }]}>
            {ended ? labels.recurring_ended : active ? labels.recurring_active : labels.recurring_paused}
          </Text>
          <Switch
            value={ended ? false : active}
            onValueChange={onToggleActive}
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
}

export default memo(RecurringRow);

const styles = StyleSheet.create({
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
});
