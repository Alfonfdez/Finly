import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import type { IconName } from '../constants/types';
import ModalTitle from './ModalTitle';

interface Props {
  title: string;
  icon?: IconName;
  right?: ReactNode;
}

export default function FullScreenModalHeader({ title, icon, right }: Props) {
  const { activeColors: c } = useConfig();

  return (
    <View style={[styles.header, { borderBottomColor: c.border }]}>
      <ModalTitle
        title={title}
        icon={icon}
        style={right != null ? styles.titleWithRight : undefined}
      />
      {right != null && <View style={styles.right}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleWithRight: {
    paddingHorizontal: 44,
  },
  right: {
    position: 'absolute',
    top: 0,
    right: 16,
    bottom: 0,
    justifyContent: 'center',
  },
});
