import { memo } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import IconBadge from './IconBadge';
import SelectionCheckbox from './SelectionCheckbox';
import DateIcon from './DateIcon';
import { DISABLED_CONTROL_OPACITY, switchColors } from './componentStyles';
import { BADGE_SHAPES, RECURRING_STATUSES, TRANSACTION_TYPES } from '../constants/types';
import { formatAmount, formatDateLong, parseDbDate } from '../utils/formatters';
import { fromDateOnly, recurringStatus } from '../utils/recurrence';
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
  /** The pause/resume write is in flight: keep the switch from firing again. */
  busy?: boolean;
  selectMode?: boolean;
  selected?: boolean;
}

function RecurringRow({ rule, category, count, today, onPress, onToggleActive, busy = false, selectMode, selected }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const isIncome = rule.type === TRANSACTION_TYPES.income;
  const status = recurringStatus(rule, today);
  const active = status === RECURRING_STATUSES.active;
  const ended = status === RECURRING_STATUSES.ended;
  const created = parseDbDate(rule.created_at);
  const createdText = `${created.getDate()} ${labels.months_short[created.getMonth()]} ${created.getFullYear()}`;

  return (
    <View style={[styles.row, { borderBottomColor: c.border }]}>
      <TouchableOpacity
        style={styles.left}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={rule.name}
        accessibilityState={selectMode ? { selected } : undefined}
      >
        {selectMode && (
          <View style={styles.checkbox}>
            <SelectionCheckbox selected={!!selected} />
          </View>
        )}
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
        <View style={styles.info}>
          <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]} numberOfLines={2}>
            {rule.name}
          </Text>
          <Text
            style={[styles.subtitle, { color: c.primary, fontSize: fs(12) }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {recurrenceSummary(rule, config.language)}
          </Text>
          <View style={styles.dateRow}>
            <DateIcon kind="calendar" size={12} />
            <Text
              style={[styles.dateText, { color: ended ? c.textSecondary : c.text, fontSize: fs(11) }]}
              numberOfLines={1}
            >
              {ended
                ? labels.recurring_ended
                : labels.recurring_next_due(formatDateLong(fromDateOnly(rule.next_due), config.language))}
            </Text>
          </View>
          <Text style={[styles.meta, { color: c.textSecondary, fontSize: fs(11) }]} numberOfLines={1}>
            {category ? `${getDisplayCategoryName(category)} · ` : ''}
            {labels.recurring_transactions_count(count)}
          </Text>
          <View style={styles.dateRow}>
            <DateIcon kind="time" size={11} />
            <Text style={[styles.dateText, { color: c.textSecondary, fontSize: fs(11) }]} numberOfLines={1}>
              {labels.recurring_created_on(createdText)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? c.green : c.red, fontSize: fs(15) }]}>
          {isIncome ? '+' : '-'}{formatAmount(rule.amount, config)}
        </Text>
        <View style={styles.activeRow}>
          <Text style={[styles.activeLabel, { color: c.textSecondary, fontSize: fs(11) }]}>
            {ended ? labels.recurring_ended : active ? labels.recurring_active : labels.recurring_paused}
          </Text>
          {!selectMode && (
            <Switch
              value={ended ? false : active}
              onValueChange={onToggleActive}
              disabled={ended || busy}
              accessibilityLabel={ended ? labels.recurring_ended : active ? labels.recurring_active : labels.recurring_paused}
              accessibilityState={{ disabled: ended || busy }}
              style={ended || busy ? styles.switchDisabled : undefined}
              {...switchColors(c)}
            />
          )}
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
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginRight: 12,
  },
  checkbox: {
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    flexShrink: 1,
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
    opacity: DISABLED_CONTROL_OPACITY,
  },
  amount: {
    fontWeight: '700',
  },
});
