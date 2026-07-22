import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig, Config } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { scaleFontSize } from '../../utils/formatters';
import { t } from '../../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../constants/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SettingsAppearance'>;
};

type Option<T = string> = { label: string; value: T; icon?: React.ReactNode };

function SelectorInline<T extends string>({
  options,
  selected,
  onSelect,
  colors,
  textSize,
}: {
  options: Option<T>[];
  selected: T;
  onSelect: (v: T) => void;
  colors: ReturnType<typeof useConfig>['activeColors'];
  textSize: Config['textSize'];
}) {
  const fs = (s: number) => scaleFontSize(s, textSize);
  return (
    <View style={styles.options}>
      {options.map(op => (
        <TouchableOpacity
          key={String(op.value)}
          style={[styles.option, { backgroundColor: selected === op.value ? colors.primary + '20' : colors.surface }]}
          onPress={() => onSelect(op.value)}
        >
          {op.icon && <View style={styles.iconWrap}>{op.icon}</View>}
          <Text style={[styles.optionText, { color: selected === op.value ? colors.primary : colors.text, fontSize: fs(14) }]}>
            {op.label}
          </Text>
          {selected === op.value && (
            <Text style={[styles.check, { color: colors.primary, fontSize: fs(14) }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function AppearanceScreen({ navigation }: Props) {
  const { config, activeColors: c, updateConfig } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const THEMES: Option<Config['theme']>[] = [
    { label: labels.theme_dark, value: 'dark', icon: <Ionicons name="moon" size={16} color={c.text} /> },
    { label: labels.theme_light, value: 'light', icon: <Ionicons name="sunny" size={16} color={c.text} /> },
    { label: labels.theme_system, value: 'system', icon: <Ionicons name="phone-portrait-outline" size={16} color={c.text} /> },
  ];

  const SIZES: Option<Config['textSize']>[] = [
    { label: labels.size_small, value: 'small', icon: <Text style={[styles.sizeIcon, { color: c.text, fontSize: 11 }]}>A</Text> },
    { label: labels.size_medium, value: 'medium', icon: <Text style={[styles.sizeIcon, { color: c.text, fontSize: 15 }]}>A</Text> },
    { label: labels.size_large, value: 'large', icon: <Text style={[styles.sizeIcon, { color: c.text, fontSize: 19 }]}>A</Text> },
  ];

  const SHAPES: Option<Config['categoryIconShape']>[] = [
    { label: labels.shape_square, value: 'square', icon: <Ionicons name="square-outline" size={16} color={c.text} /> },
    { label: labels.shape_circle, value: 'circle', icon: <Ionicons name="ellipse-outline" size={16} color={c.text} /> },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_theme}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={THEMES} selected={config.theme} onSelect={(v) => updateConfig({ theme: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_text_size}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SIZES} selected={config.textSize} onSelect={(v) => updateConfig({ textSize: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_account_icon_shape}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SHAPES} selected={config.accountIconShape} onSelect={(v) => updateConfig({ accountIconShape: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_category_icon_shape}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SHAPES} selected={config.categoryIconShape} onSelect={(v) => updateConfig({ categoryIconShape: v })} colors={c} textSize={config.textSize} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: { borderRadius: 12, padding: 16, marginBottom: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  optionText: { fontWeight: '500' },
  check: { fontWeight: '700' },
  iconWrap: { justifyContent: 'center', alignItems: 'center' },
  sizeIcon: { fontWeight: '700' },
});
