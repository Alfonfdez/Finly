import { type ComponentProps, type ReactNode } from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { SECTION_GAP } from '../componentStyles';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  title: string;
  icon: IconName;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function FormSectionHeader({ title, icon, right, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={[styles.row, style]}>
      <Ionicons
        name={icon}
        size={16}
        color={c.text}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SECTION_GAP,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
});
