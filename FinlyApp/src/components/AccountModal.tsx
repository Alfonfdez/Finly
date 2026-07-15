import { ComponentProps } from 'react';
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
  visible: boolean;
  accounts: AccountWithBalance[];
  onSelect: (account: AccountWithBalance) => void;
  onClose: () => void;
}

export default function AccountModal({ visible, accounts, onSelect, onClose }: Props) {
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const round = config.accountIconShape === 'circle';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: c.surface }]}>
          <Text style={[styles.title, { color: c.text, fontSize: fs(18) }]}>{labels.account_select}</Text>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: c.border }]}
                onPress={() => onSelect(item)}
                accessibilityLabel={`${labels.a11y_select_account} ${item.name}`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.icon, { backgroundColor: item.color + '30', borderRadius: round ? 22 : 10 }]}>
                  <Ionicons name={item.icon as ComponentProps<typeof Ionicons>['name']} size={22} color={item.color} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: c.text, fontSize: fs(16) }]}>{item.name}</Text>
                  <Text style={[styles.balance, { color: c.textSecondary, fontSize: fs(14) }]}>{formatCurrency(item.saldo, config.currency, config.decimalSeparator)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={[styles.closeText, { color: c.primary, fontSize: fs(16) }]}>{labels.account_close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  title: { fontWeight: '700', marginBottom: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: {},
  balance: { marginTop: 2 },
  close: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  closeText: { fontWeight: '600' },
});
