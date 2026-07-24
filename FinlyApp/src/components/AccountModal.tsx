import { useState, useEffect, ComponentProps } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../database/types';
import { formatCurrency } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayAccountName } from '../i18n';
import { colors } from '../constants/colors';
import EyeToggle from './EyeToggle';

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
  const round = config.accountIconShape === 'circle';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.surface }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>{labels.account_select}</Text>
            <EyeToggle isHidden={isBalanceHidden} onToggle={() => setIsRevealed(prev => !prev)} color={c.textSecondary} />
          </View>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = item.id === tempId;
              return (
                <TouchableOpacity
                  style={[styles.row, { borderBottomColor: c.border }]}
                  onPress={() => setTempId(item.id)}
                >
                  <View style={[styles.radio, { borderColor: isSelected ? c.primary : c.textSecondary }]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: c.primary }]} />}
                  </View>
                  <View style={[styles.icon, { backgroundColor: item.color + '30', borderRadius: round ? 18 : 8 }]}>
                    <Ionicons name={item.icon as ComponentProps<typeof Ionicons>['name']} size={20} color={item.color} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: c.text, fontSize: fs(14) }]}>{getDisplayAccountName(item)}</Text>
                    <Text style={[styles.balance, { color: c.textSecondary, fontSize: fs(12) }]}>
                      {isBalanceHidden ? '\u2022\u2022\u2022\u2022\u2022' : formatCurrency(item.balance, config.currency, config.decimalSeparator)}
                    </Text>
                  </View>
                </TouchableOpacity>
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
              <Text style={[styles.btnText, { color: colors.white, fontSize: fs(14) }]}>{labels.transactions_confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    maxHeight: '70%',
  },
  title: { fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontWeight: '500' },
  balance: { marginTop: 2 },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnText: { fontWeight: '600' },
});
