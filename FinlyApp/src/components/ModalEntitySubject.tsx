import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { TEST_IDS } from '../constants/testIds';
import type { BadgeShape, IconName } from '../constants/types';
import IconBadge from './IconBadge';

interface Props {
  name: string;
  icon: IconName;
  color?: string;
  shape?: BadgeShape;
  subtitle?: string;
}

export default function ModalEntitySubject({ name, icon, color, shape, subtitle }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={styles.row} testID={TEST_IDS.modalEntitySubject}>
      {color && shape ? (
        <IconBadge
          icon={icon}
          color={color}
          shape={shape}
          size={36}
          iconSize={20}
          roundedRadius={8}
          backgroundAlpha={20}
        />
      ) : (
        <View style={[styles.plainBadge, { backgroundColor: c.surface }]}>
          <Ionicons name={icon} size={20} color={c.primary} accessible={false} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.name, { color: c.text, fontSize: fs(15) }]} numberOfLines={2}>
          {name}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: fs(12) }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  plainBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  name: {
    fontWeight: '600',
    textAlign: 'left',
  },
  subtitle: {
    marginTop: 2,
    textAlign: 'left',
  },
});
