import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig, Config } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { CONFIG_ICON_SHAPES, TEXT_SIZES, THEMES } from '../../constants/types';
import SelectorInline, { Option } from '../../components/SelectorInline';
import { settingsStyles } from './settingsStyles';

export default function AppearanceScreen() {
  const { config, activeColors: c, updateConfig } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const THEME_OPTIONS: Option<Config['theme']>[] = [
    { label: labels.theme_dark, value: THEMES.dark, icon: <Ionicons name="moon" size={16} color={c.text} /> },
    { label: labels.theme_light, value: THEMES.light, icon: <Ionicons name="sunny" size={16} color={c.text} /> },
    { label: labels.theme_system, value: THEMES.system, icon: <Ionicons name="phone-portrait-outline" size={16} color={c.text} /> },
  ];

  const SIZES: Option<Config['textSize']>[] = [
    { label: labels.size_small, value: TEXT_SIZES.small, icon: <Text style={[styles.sizeIcon, { color: c.text, fontSize: 11 }]}>A</Text> },
    { label: labels.size_medium, value: TEXT_SIZES.medium, icon: <Text style={[styles.sizeIcon, { color: c.text, fontSize: 15 }]}>A</Text> },
    { label: labels.size_large, value: TEXT_SIZES.large, icon: <Text style={[styles.sizeIcon, { color: c.text, fontSize: 19 }]}>A</Text> },
  ];

  const SHAPES: Option<Config['categoryIconShape']>[] = [
    { label: labels.shape_square, value: CONFIG_ICON_SHAPES.square, icon: <Ionicons name="square-outline" size={16} color={c.text} /> },
    { label: labels.shape_circle, value: CONFIG_ICON_SHAPES.circle, icon: <Ionicons name="ellipse-outline" size={16} color={c.text} /> },
  ];

  return (
    <ScrollView style={[settingsStyles.container, { backgroundColor: c.background }]} contentContainerStyle={settingsStyles.content}>
      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_theme}</Text>
      <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={THEME_OPTIONS} selected={config.theme} onSelect={(v) => updateConfig({ theme: v })} />
      </View>

      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_text_size}</Text>
      <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SIZES} selected={config.textSize} onSelect={(v) => updateConfig({ textSize: v })} />
      </View>

      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_account_icon_shape}</Text>
      <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SHAPES} selected={config.accountIconShape} onSelect={(v) => updateConfig({ accountIconShape: v })} />
      </View>

      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_category_icon_shape}</Text>
      <View style={[settingsStyles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SHAPES} selected={config.categoryIconShape} onSelect={(v) => updateConfig({ categoryIconShape: v })} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sizeIcon: { fontWeight: '700' },
});
