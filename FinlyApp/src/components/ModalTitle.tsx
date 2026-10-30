import { Text, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import type { IconName } from '../constants/types';

interface Props {
  title: string;
  icon?: IconName;
  align?: 'center' | 'left';
  style?: StyleProp<TextStyle>;
}

export default function ModalTitle({ title, icon, align = 'center', style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const size = 18;

  return (
    <Text
      accessibilityRole="header"
      style={[styles.title, { color: c.text, fontSize: fs(size), textAlign: align }, style]}
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
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '700',
  },
});
