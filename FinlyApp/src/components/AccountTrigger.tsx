import { ComponentProps } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../database/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { getDisplayAccountName } from '../i18n';

interface Props {
  accountId: number;
  accounts: (Account & { balance: number })[];
  onPress: () => void;
}

export default function AccountTrigger({ accountId, accounts, onPress }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const account = accounts.find(x => x.id === accountId);

  return (
    <TouchableOpacity style={styles.accountTrigger} onPress={onPress}>
      {account && (
        <View style={[styles.accountTriggerIcon, { backgroundColor: account.color + '30', borderRadius: config.accountIconShape === 'circle' ? 14 : 6 }]}>
          <Ionicons name={account.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={account.color} />
        </View>
      )}
      <Text style={[styles.accountTriggerName, { color: c.text, fontSize: fs(14) }]} numberOfLines={1}>
        {account ? getDisplayAccountName(account) : ''}
      </Text>
      <Ionicons name="chevron-down" size={16} color={c.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  accountTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountTriggerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTriggerName: { fontWeight: '600', maxWidth: 100 },
});
