import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { formatCurrency, formatSignedCurrency, HIDDEN_BALANCE } from '../utils/formatters';
import { badgeShapeFor } from '../utils/badgeShape';
import { t, getDisplayAccountName } from '../i18n';
import type { Account } from '../database/types';
import EyeToggle from './EyeToggle';
import IconBadge from './IconBadge';
import DrawerMenuButton from './DrawerMenuButton';

interface HomeHeaderProps {
  activeAccount: Account;
  isBalanceHidden: boolean;
  onToggleReveal: () => void;
  total: number;
  totalColor: string;
  totalIncomeAll: number;
  totalExpensesAll: number;
  onOpenAccountModal: () => void;
  onViewTransactions: () => void;
}

export default function HomeHeader({
  activeAccount,
  isBalanceHidden,
  onToggleReveal,
  total,
  totalColor,
  totalIncomeAll,
  totalExpensesAll,
  onOpenAccountModal,
  onViewTransactions,
}: HomeHeaderProps) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={[styles.header, { backgroundColor: c.surface }]}>
      <DrawerMenuButton
        size={26}
        accessibilityLabel={labels.home_open_menu}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.menuButton}
      />

      <View style={styles.totalButton}>
        <TouchableOpacity style={styles.accountRow} onPress={onOpenAccountModal}>
          <IconBadge
            icon={activeAccount.icon}
            color={activeAccount.color}
            shape={badgeShapeFor(config, 'account')}
            size={24}
            iconSize={18}
            roundedRadius={4}
          />
          <Text style={[{ color: c.textSecondary, fontSize: fs(14) }]}>{getDisplayAccountName(activeAccount)}</Text>
          <Ionicons name="chevron-down-outline" size={14} color={c.textSecondary} />
        </TouchableOpacity>
        <View style={styles.balanceRow}>
          <Text style={[styles.totalText, { color: isBalanceHidden ? c.textSecondary : totalColor, fontSize: fs(28) }]}>
            {isBalanceHidden ? HIDDEN_BALANCE : formatSignedCurrency(total, config.currency, config.decimalSeparator)}
          </Text>
          <EyeToggle isHidden={isBalanceHidden} onToggle={onToggleReveal} color={c.textSecondary} />
        </View>
        <View style={styles.summaryRow}>
          {isBalanceHidden ? (
            <>
              <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
                <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{HIDDEN_BALANCE}</Text>
                <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_income}</Text>
              </Text>
              <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
                <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{HIDDEN_BALANCE}</Text>
                <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_expenses}</Text>
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
                <Text style={{ color: c.green, fontWeight: '700' }}>+{formatCurrency(totalIncomeAll, config.currency, config.decimalSeparator)}</Text>
                <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_income}</Text>
              </Text>
              <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
                <Text style={{ color: c.red, fontWeight: '700' }}>-{formatCurrency(totalExpensesAll, config.currency, config.decimalSeparator)}</Text>
                <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_expenses}</Text>
              </Text>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={onViewTransactions}
        accessibilityLabel={labels.home_view_transactions}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="receipt-outline" size={24} color={c.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: { marginLeft: 0, padding: 0 },
  totalButton: { alignItems: 'center', flex: 1 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryItem: {},
  summaryLabel: {},
  totalText: { fontWeight: '700', marginVertical: 2 },
});
