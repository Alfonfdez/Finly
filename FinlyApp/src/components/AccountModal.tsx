import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import type { Account } from '../database/types';
import { formatCurrency, HIDDEN_BALANCE } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayAccountName } from '../i18n';
import { WHITE, TRANSPARENT } from '../constants/themes';
import { badgeShapeFor } from '../utils/badgeShape';
import EyeToggle from './EyeToggle';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import ModalShell from './ModalShell';
import ListItemRow from './ListItemRow';

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

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>{labels.account_select}</Text>
        <EyeToggle isHidden={isBalanceHidden} onToggle={() => setIsRevealed(prev => !prev)} color={c.textSecondary} />
      </View>
      <FlatList
            data={accounts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = item.id === tempId;
              const radio = (
                <View style={[styles.radio, { borderColor: isSelected ? c.primary : c.textSecondary }]}>
                  {isSelected && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
                </View>
              );
              return (
                <ListItemRow
                  title={getDisplayAccountName(item)}
                  subtitle={isBalanceHidden ? HIDDEN_BALANCE : formatCurrency(item.balance, config.currency, config.decimalSeparator)}
                  leading={radio}
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
            }}
          />
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: c.text, fontSize: fs(14) }]}>{labels.transactions_cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: c.primary }]} onPress={() => { if (tempId != null) onSelect(tempId); }}>
              <Text style={[styles.btnText, { color: WHITE, fontSize: fs(14) }]}>{labels.transactions_confirm}</Text>
            </TouchableOpacity>
          </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  row: {
    paddingHorizontal: 0,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TRANSPARENT,
  },
  btnText: { fontWeight: '600' },
});
