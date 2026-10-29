import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import type { IconName } from '../constants/types';

interface ModalHeaderProps {
  title: string;
  size?: number;
  icon?: IconName;
  right?: ReactNode;
}

export default function ModalHeader({ title, size = 18, icon, right }: ModalHeaderProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        {icon != null && (
          <Ionicons
            name={icon}
            size={fs(size)}
            color={c.text}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        )}
        <Text style={[styles.title, { color: c.text, fontSize: fs(size) }]}>
          {title}
        </Text>
      </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  right: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
