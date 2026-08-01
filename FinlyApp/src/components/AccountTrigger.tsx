import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../database/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { getDisplayAccountName } from '../i18n';
import { BADGE_SHAPES } from '../constants/types';
import IconBadge from './IconBadge';

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
        <IconBadge
          icon={account.icon}
          color={account.color}
          shape={config.accountIconShape === BADGE_SHAPES.circle ? BADGE_SHAPES.circle : BADGE_SHAPES.rounded}
          size={28}
          iconSize={18}
          roundedRadius={6}
        />
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
  accountTriggerName: { fontWeight: '600', maxWidth: 100 },
});
