import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Rect, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useConfig, Config } from '../context/ConfigContext';
import { SettingsScreenProps } from '../constants/types';
import { scaleFontSize } from '../utils/formatters';
import { t } from '../i18n';

function SenyeraIcon({ size = 16 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size * 0.75, borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ flex: 1, backgroundColor: '#FCDD09' }} />
      <View style={{ height: 1, backgroundColor: '#DA2919' }} />
      <View style={{ flex: 1, backgroundColor: '#FCDD09' }} />
      <View style={{ height: 1, backgroundColor: '#DA2919' }} />
      <View style={{ flex: 1, backgroundColor: '#FCDD09' }} />
      <View style={{ height: 1, backgroundColor: '#DA2919' }} />
      <View style={{ flex: 1, backgroundColor: '#FCDD09' }} />
    </View>
  );
}

function UKFlagWeb({ size = 16 }: { size?: number }) {
  const w = size;
  const h = size * 0.75;
  const sw = h * 0.15;
  const dw = h * 0.075;
  return (
    <Svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h}>
      <Rect width={w} height={h} fill="#012169" />
      <Line x1={0} y1={0} x2={w} y2={h} stroke="#fff" strokeWidth={dw * 2.5} />
      <Line x1={w} y1={0} x2={0} y2={h} stroke="#fff" strokeWidth={dw * 2.5} />
      <Line x1={0} y1={0} x2={w} y2={h} stroke="#C8102E" strokeWidth={dw} />
      <Line x1={w} y1={0} x2={0} y2={h} stroke="#C8102E" strokeWidth={dw} />
      <Rect x={0} y={h / 2 - sw / 2} width={w} height={sw} fill="#fff" />
      <Rect x={w / 2 - sw / 2} y={0} width={sw} height={h} fill="#fff" />
      <Rect x={0} y={h / 2 - sw / 3} width={w} height={sw * 0.66} fill="#C8102E" />
      <Rect x={w / 2 - sw / 3} y={0} width={sw * 0.66} height={h} fill="#C8102E" />
    </Svg>
  );
}

function SpainFlagWeb({ size = 16 }: { size?: number }) {
  const h = size * 0.75;
  return (
    <View style={{ width: size, height: h, borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ flex: 1, backgroundColor: '#AA151B' }} />
      <View style={{ flex: 2, backgroundColor: '#F1BF00' }} />
      <View style={{ flex: 1, backgroundColor: '#AA151B' }} />
    </View>
  );
}

const FLAG_WEB: Record<string, ReactNode> = {
  en: <UKFlagWeb size={16} />,
  es: <SpainFlagWeb size={16} />,
  ca: <SenyeraIcon size={16} />,
};

const FLAG_EMOJI: Record<string, string> = {
  en: '\u{1F1EC}\u{1F1E7}',
  es: '\u{1F1EA}\u{1F1F8}',
  ca: '\u{1F1F5}\u{1F1F8}',
};

function FlagIcon({ code, size = 16 }: { code: string; size?: number }) {
  if (code === 'ca') {
    return <SenyeraIcon size={size} />;
  }
  if (Platform.OS === 'web') {
    return <>{FLAG_WEB[code] ?? null}</>;
  }
  return <Text style={{ fontSize: size }}>{FLAG_EMOJI[code] ?? ''}</Text>;
}

function DayCircleIcon({ letter, size = 16, colors }: { letter: string; size?: number; colors: ReturnType<typeof useConfig>['activeColors'] }) {
  const isWide = letter.length > 1;
  const w = isWide ? size * 1.3 : size;
  return (
    <View style={{ width: w, height: size, borderRadius: size / 2, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * (isWide ? 0.4 : 0.55), color: colors.background, fontWeight: '700' }}>{letter}</Text>
    </View>
  );
}

type Option<T = string> = { label: string; value: T; icon?: ReactNode };

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

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { config, activeColors, updateConfig } = useConfig();
  const c = activeColors;
  const labels = t();
  const fs = (size: number) => scaleFontSize(size, config.textSize);

  const THEMES: Option<Config['theme']>[] = [
    { label: labels.theme_dark, value: 'dark', icon: <Ionicons name="moon" size={16} color={c.text} /> },
    { label: labels.theme_light, value: 'light', icon: <Ionicons name="sunny" size={16} color={c.text} /> },
    { label: labels.theme_system, value: 'system', icon: <Ionicons name="phone-portrait-outline" size={16} color={c.text} /> },
  ];

  const PRIMER_DIA: Option[] = [
    { label: labels.day_monday, value: '1', icon: <DayCircleIcon letter={labels.day_mon_letter} size={16} colors={c} /> },
    { label: labels.day_sunday, value: '0', icon: <DayCircleIcon letter={labels.day_sun_letter} size={16} colors={c} /> },
  ];

  const DIVISAS: Option[] = [
    { label: labels.currency_euro, value: '\u20AC', icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>{'\u20AC'}</Text> },
    { label: labels.currency_dollar, value: '$', icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>$</Text> },
    { label: labels.currency_pound, value: '\u00A3', icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>{'\u00A3'}</Text> },
    { label: labels.currency_yen, value: '\u00A5', icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>{'\u00A5'}</Text> },
  ];

  const SEPARATORS: Option<Config['decimalSeparator']>[] = [
    { label: labels.sep_comma, value: ',', icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>,</Text> },
    { label: labels.sep_dot, value: '.', icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>.</Text> },
  ];

  const LANGUAGES: Option<Config['language']>[] = [
    { label: labels.lang_en, value: 'en', icon: <FlagIcon code="en" size={16} /> },
    { label: labels.lang_es, value: 'es', icon: <FlagIcon code="es" size={16} /> },
    { label: labels.lang_ca, value: 'ca', icon: <FlagIcon code="ca" size={16} /> },
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
      <Text style={[  styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_appearance}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_theme}</Text>
        <SelectorInline options={THEMES} selected={config.theme} onSelect={(v) => updateConfig({ theme: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[  styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_calendar}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_first_day}</Text>
        <SelectorInline options={PRIMER_DIA} selected={String(config.firstDayOfWeek)} onSelect={(v) => updateConfig({ firstDayOfWeek: Number(v) as 0 | 1 })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[  styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_money}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_currency}</Text>
        <SelectorInline options={DIVISAS} selected={config.currency} onSelect={(v) => updateConfig({ currency: v })} colors={c} textSize={config.textSize} />
      </View>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_decimal_sep}</Text>
        <SelectorInline options={SEPARATORS} selected={config.decimalSeparator} onSelect={(v) => updateConfig({ decimalSeparator: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[  styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_language}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={LANGUAGES} selected={config.language} onSelect={(v) => updateConfig({ language: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[  styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_text}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.label, { color: c.text, fontSize: fs(15) }]}>{labels.settings_text_size}</Text>
        <SelectorInline options={SIZES} selected={config.textSize} onSelect={(v) => updateConfig({ textSize: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[  styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_account_icon_shape}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SHAPES} selected={config.accountIconShape} onSelect={(v) => updateConfig({ accountIconShape: v })} colors={c} textSize={config.textSize} />
      </View>

      <Text style={[  styles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_category_icon_shape}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <SelectorInline options={SHAPES} selected={config.categoryIconShape} onSelect={(v) => updateConfig({ categoryIconShape: v })} colors={c} textSize={config.textSize} />
      </View>

      <View style={{ height: 40 }} />
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
  label: { fontWeight: '600', marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  optionText: { fontWeight: '500' },
  check: { fontWeight: '700' },
  iconWrap: { justifyContent: 'center', alignItems: 'center' },
  currencyIcon: { fontWeight: '700' },
  sizeIcon: { fontWeight: '700' },
});
