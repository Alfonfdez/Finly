import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import type { IconName } from '../constants/types';

interface Props {
  title: string;
  icon?: IconName;
  right?: ReactNode;
}

export default function FullScreenModalHeader({ title, icon, right }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const size = 18;

  return (
    <View style={[styles.header, { borderBottomColor: c.border }]}>
      <Text
        accessibilityRole="header"
        style={[
          styles.title,
          { color: c.text, fontSize: fs(size) },
          right != null && styles.titleWithRight,
        ]}
      >
        {icon != null && (
          <>
            <Ionicons
              name={icon}
              size={fs(size)}
              color={c.text}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            {' '}
          </>
        )}
        {title}
      </Text>
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
  title: {
    fontWeight: '700',
    textAlign: 'center',
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
