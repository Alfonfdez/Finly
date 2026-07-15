import { useState, ComponentProps } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../database/types';
import { formatCurrency } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface AccountWithBalance extends Account {
  saldo: number;
}

interface Props {
  accounts: AccountWithBalance[];
  selectedId: number;
  onSelect: (id: number) => void;
}

export default function AccountSelector({ accounts, selectedId, onSelect }: Props) {
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [visible, setVisible] = useState(false);
  const [tempId, setTempId] = useState(selectedId);

  const selected = accounts.find(a => a.id === selectedId);

  const handleOpen = () => {
    setTempId(selectedId);
    setVisible(true);
  };

  const handleConfirm = () => {
    onSelect(tempId);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={handleOpen} accessibilityLabel={selected?.name}>
        {selected && (
          <View style={[styles.triggerIcon, { backgroundColor: selected.color + '30' }]}>
            <Ionicons name={selected.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={selected.color} />
          </View>
        )}
        <Text style={[styles.triggerName, { color: c.text, fontSize: fs(14) }]} numberOfLines={1}>
          {selected?.name ?? ''}
        </Text>
        <Ionicons name="chevron-down" size={16} color={c.textSecondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: c.surface }]}>
            <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>
              {labels.transactions_select_account}
            </Text>
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
                    <View style={[styles.icon, { backgroundColor: item.color + '30' }]}>
                      <Ionicons name={item.icon as ComponentProps<typeof Ionicons>['name']} size={20} color={item.color} />
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.name, { color: c.text, fontSize: fs(14) }]}>{item.name}</Text>
                      <Text style={[styles.balance, { color: c.textSecondary, fontSize: fs(12) }]}>
                        {formatCurrency(item.saldo, config.currency, config.decimalSeparator)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => setVisible(false)}
              >
                <Text style={[styles.btnText, { color: c.text, fontSize: fs(14) }]}>{labels.transactions_cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: c.primary }]} onPress={handleConfirm}>
                <Text style={[styles.btnText, { color: '#FFFFFF', fontSize: fs(14) }]}>{labels.transactions_confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerName: { fontWeight: '600', maxWidth: 100 },
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
