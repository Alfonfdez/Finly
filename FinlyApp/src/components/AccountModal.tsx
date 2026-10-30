import { useState, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { Account } from '../database/types';
import { formatAmount, HIDDEN_BALANCE } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useResetOnOpen } from '../hooks/useResetOnOpen';
import { t, getDisplayAccountName } from '../i18n';
import { badgeShapeFor } from '../utils/badgeShape';
import EyeToggle from './EyeToggle';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
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
  const labels = t();
  const [tempId, setTempId] = useState(selectedId);
  const [isRevealed, setIsRevealed] = useState(false);

  const resetOnOpen = useCallback(() => {
    setTempId(selectedId);
    setIsRevealed(false);
  }, [selectedId]);
  useResetOnOpen(visible, resetOnOpen);

  const isBalanceHidden = config.hideBalances !== isRevealed;

  const renderItem = useCallback(({ item }: { item: AccountWithBalance }) => {
    const isSelected = item.id === tempId;
    return (
      <ListItemRow
        title={getDisplayAccountName(item)}
        subtitle={isBalanceHidden ? HIDDEN_BALANCE : formatAmount(item.balance, config)}
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
      <ModalHeader
        title={labels.account_select}
        icon="wallet-outline"
        right={(
          <EyeToggle
            isHidden={isBalanceHidden}
            onToggle={() => setIsRevealed(prev => !prev)}
            color={c.textSecondary}
          />
        )}
      />
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <ModalFooter
        cancelLabel={labels.cancel}
        confirmLabel={labels.transactions_confirm}
        onCancel={onClose}
        onConfirm={() => { if (tempId != null) onSelect(tempId); }}
      />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 0,
  },
});
