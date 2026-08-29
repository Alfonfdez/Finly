import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import type { Account } from '../database/types';
import { formatCurrency, HIDDEN_BALANCE } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayAccountName } from '../i18n';
import { badgeShapeFor } from '../utils/badgeShape';
import EyeToggle from './EyeToggle';
import ModalShell from './ModalShell';
import ListItemRow from './ListItemRow';
import ModalFooter from './ModalFooter';
import RadioButton from './RadioButton';

interface AccountWithBalance extends Account {
  balance: number;
}

interface Props {
  visible: boolean;
  accounts: AccountWithBalance[];
  selectedId?: number;
  onSelect: (id: number) => void;
  onClose: () => void;
}

export default function AccountModal({ visible, accounts, selectedId, onSelect, onClose }: Props) {
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [tempId, setTempId] = useState(selectedId);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (visible) {
      setTempId(selectedId);
      setIsRevealed(false);
    }
  }, [visible, selectedId]);

  const isBalanceHidden = config.hideBalances !== isRevealed;

  const renderItem = useCallback(({ item }: { item: AccountWithBalance }) => {
    const isSelected = item.id === tempId;
    return (
      <ListItemRow
        title={getDisplayAccountName(item)}
        subtitle={isBalanceHidden ? HIDDEN_BALANCE : formatCurrency(item.balance, config.currency, config.decimalSeparator)}
        leading={<RadioButton selected={isSelected} size={20} borderColor={c.textSecondary} />}
        icon={item.icon}
        color={item.color}
        shape={badgeShapeFor(config, 'account')}
        badgeSize={36}
        badgeIconSize={20}
        badgeRadius={8}
        divider
        style={styles.row}
        onPress={() => setTempId(item.id)}
      />
    );
  }, [tempId, isBalanceHidden, c, config]);

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>{labels.account_select}</Text>
        <EyeToggle isHidden={isBalanceHidden} onToggle={() => setIsRevealed(prev => !prev)} color={c.textSecondary} />
      </View>
      <FlatList
            data={accounts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
          <ModalFooter
            cancelLabel={labels.transactions_cancel}
            confirmLabel={labels.transactions_confirm}
            onCancel={onClose}
            onConfirm={() => { if (tempId != null) onSelect(tempId); }}
          />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  row: {
    paddingHorizontal: 0,
  },
});
