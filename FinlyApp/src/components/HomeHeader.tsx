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

interface HomeHeaderProps {
  activeAccount: Account;
  isBalanceHidden: boolean;
  onToggleReveal: () => void;
  total: number;
  totalColor: string;
  totalIncomeAll: number;
  totalExpensesAll: number;
  onOpenAccountModal: () => void;
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
}: HomeHeaderProps) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <TouchableOpacity style={styles.accountRow} onPress={onOpenAccountModal} accessibilityLabel={getDisplayAccountName(activeAccount)}>
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
            <Text style={{ fontSize: fs(14) }}>
              <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{HIDDEN_BALANCE}</Text>
              <Text style={{ color: c.textSecondary, fontSize: fs(12) }}> {labels.home_income}</Text>
            </Text>
            <Text style={{ fontSize: fs(14) }}>
              <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{HIDDEN_BALANCE}</Text>
              <Text style={{ color: c.textSecondary, fontSize: fs(12) }}> {labels.home_expenses}</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: fs(14) }}>
              <Text style={{ color: c.green, fontWeight: '700' }}>+{formatCurrency(totalIncomeAll, config.currency, config.decimalSeparator)}</Text>
              <Text style={{ color: c.textSecondary, fontSize: fs(12) }}> {labels.home_income}</Text>
            </Text>
            <Text style={{ fontSize: fs(14) }}>
              <Text style={{ color: c.red, fontWeight: '700' }}>-{formatCurrency(totalExpensesAll, config.currency, config.decimalSeparator)}</Text>
              <Text style={{ color: c.textSecondary, fontSize: fs(12) }}> {labels.home_expenses}</Text>
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  totalText: { fontWeight: '700', marginVertical: 2 },
});
