import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import type { IconName } from '../constants/types';
import ModalTitle from './ModalTitle';

interface ModalHeaderProps {
  title: string;
  icon?: IconName;
  right?: ReactNode;
}

export default function ModalHeader({ title, icon, right }: ModalHeaderProps) {
  return (
    <View style={styles.row}>
      <ModalTitle title={title} icon={icon} />
      {right != null && <View style={styles.right}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    minHeight: 24,
    marginBottom: 12,
    justifyContent: 'center',
  },
  right: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
