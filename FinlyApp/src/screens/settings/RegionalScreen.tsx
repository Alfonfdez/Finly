import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Rect, Line } from 'react-native-svg';
import { useConfig, type Config } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { isWeb } from '../../utils/platform';
import { LANGUAGES, isCatalan, type Language } from '../../utils/language';
import { flagColors } from '../../constants/flagColors';
import { CURRENCY_OPTIONS } from '../../constants/currencies';
import { DECIMAL_SEPARATORS, FIRST_DAYS, type FirstDay } from '../../constants/types';
import type { Option } from '../../components/SelectorInline';
import SettingsSelectRow from '../../components/settings/SettingsSelectRow';
import SettingsPickerRow from '../../components/settings/SettingsPickerRow';
import { settingsStyles } from '../../components/settings/settingsStyles';

function SenyeraIcon({ size = 16 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size * 0.75, borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ flex: 1, backgroundColor: flagColors.senyeraYellow }} />
      <View style={{ height: 1, backgroundColor: flagColors.senyeraRed }} />
      <View style={{ flex: 1, backgroundColor: flagColors.senyeraYellow }} />
      <View style={{ height: 1, backgroundColor: flagColors.senyeraRed }} />
      <View style={{ flex: 1, backgroundColor: flagColors.senyeraYellow }} />
      <View style={{ height: 1, backgroundColor: flagColors.senyeraRed }} />
      <View style={{ flex: 1, backgroundColor: flagColors.senyeraYellow }} />
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
      <View style={{ flex: 1, backgroundColor: flagColors.spainRed }} />
      <View style={{ flex: 2, backgroundColor: flagColors.spainYellow }} />
      <View style={{ flex: 1, backgroundColor: flagColors.spainRed }} />
    </View>
  );
}

function VerticalTricolorWeb({ size = 16, colors }: { size?: number; colors: string[] }) {
  const h = size * 0.75;
  return (
    <View style={{ width: size, height: h, borderRadius: 2, overflow: 'hidden', flexDirection: 'row' }}>
      {colors.map((color, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}

function HorizontalTricolorWeb({ size = 16, colors }: { size?: number; colors: string[] }) {
  const h = size * 0.75;
  return (
    <View style={{ width: size, height: h, borderRadius: 2, overflow: 'hidden' }}>
      {colors.map((color, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}

function FranceFlagWeb({ size = 16 }: { size?: number }) {
  return <VerticalTricolorWeb size={size} colors={['#0055A4', '#FFFFFF', '#EF4135']} />;
}

function ItalyFlagWeb({ size = 16 }: { size?: number }) {
  return <VerticalTricolorWeb size={size} colors={['#009246', '#FFFFFF', '#CE2B37']} />;
}

function GermanyFlagWeb({ size = 16 }: { size?: number }) {
  return <HorizontalTricolorWeb size={size} colors={['#000000', '#DD0000', '#FFCE00']} />;
}

function PortugalFlagWeb({ size = 16 }: { size?: number }) {
  return <VerticalTricolorWeb size={size} colors={['#046A38', '#DA291C']} />;
}

const FLAG_WEB: Record<string, ReactNode> = {
  [LANGUAGES.en]: <UKFlagWeb size={16} />,
  [LANGUAGES.es]: <SpainFlagWeb size={16} />,
  [LANGUAGES.ca]: <SenyeraIcon size={16} />,
  [LANGUAGES.fr]: <FranceFlagWeb size={16} />,
  [LANGUAGES.de]: <GermanyFlagWeb size={16} />,
  [LANGUAGES.pt]: <PortugalFlagWeb size={16} />,
  [LANGUAGES.it]: <ItalyFlagWeb size={16} />,
};

const FLAG_EMOJI: Record<string, string> = {
  [LANGUAGES.en]: '\u{1F1EC}\u{1F1E7}',
  [LANGUAGES.es]: '\u{1F1EA}\u{1F1F8}',
  [LANGUAGES.ca]: '\u{1F1F5}\u{1F1F8}',
  [LANGUAGES.fr]: '\u{1F1EB}\u{1F1F7}',
  [LANGUAGES.de]: '\u{1F1E9}\u{1F1EA}',
  [LANGUAGES.pt]: '\u{1F1F5}\u{1F1F9}',
  [LANGUAGES.it]: '\u{1F1EE}\u{1F1F9}',
};

function FlagIcon({ code, size = 16 }: { code: Language; size?: number }) {
  if (isCatalan(code)) {
    return <SenyeraIcon size={size} />;
  }
  if (isWeb) {
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

export default function RegionalScreen() {
  const { config, activeColors: c, updateConfig } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const LANGUAGE_OPTIONS: Option<Config['language']>[] = [
    { label: labels.lang_en, value: LANGUAGES.en, icon: <FlagIcon code={LANGUAGES.en} size={16} /> },
    { label: labels.lang_es, value: LANGUAGES.es, icon: <FlagIcon code={LANGUAGES.es} size={16} /> },
    { label: labels.lang_ca, value: LANGUAGES.ca, icon: <FlagIcon code={LANGUAGES.ca} size={16} /> },
    { label: labels.lang_fr, value: LANGUAGES.fr, icon: <FlagIcon code={LANGUAGES.fr} size={16} /> },
    { label: labels.lang_de, value: LANGUAGES.de, icon: <FlagIcon code={LANGUAGES.de} size={16} /> },
    { label: labels.lang_pt, value: LANGUAGES.pt, icon: <FlagIcon code={LANGUAGES.pt} size={16} /> },
    { label: labels.lang_it, value: LANGUAGES.it, icon: <FlagIcon code={LANGUAGES.it} size={16} /> },
  ];

  const CURRENCIES: Option<Config['currency']>[] = CURRENCY_OPTIONS.map(option => ({
    label: labels[option.labelKey],
    value: option.labelKey as Config['currency'],
    icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>{option.symbol}</Text>,
  }));

  const SEPARATORS: Option<Config['decimalSeparator']>[] = [
    { label: labels.sep_comma, value: DECIMAL_SEPARATORS.comma, icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>{DECIMAL_SEPARATORS.comma}</Text> },
    { label: labels.sep_dot, value: DECIMAL_SEPARATORS.dot, icon: <Text style={[styles.currencyIcon, { color: c.text, fontSize: fs(16) }]}>{DECIMAL_SEPARATORS.dot}</Text> },
  ];

  const FIRST_DAY_OPTIONS: Option[] = [
    { label: labels.day_monday, value: String(FIRST_DAYS.monday), icon: <DayCircleIcon letter={labels.day_mon_letter} size={16} colors={c} /> },
    { label: labels.day_sunday, value: String(FIRST_DAYS.sunday), icon: <DayCircleIcon letter={labels.day_sun_letter} size={16} colors={c} /> },
  ];

  return (
    <ScrollView style={[settingsStyles.container, { backgroundColor: c.background }]} contentContainerStyle={settingsStyles.content}>
      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_language}</Text>
      <SettingsPickerRow
        label={labels.settings_language}
        options={LANGUAGE_OPTIONS}
        selected={config.language}
        onSelect={(v) => updateConfig({ language: v })}
        title={labels.settings_language}
      />

      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_money}</Text>
      <SettingsPickerRow
        label={labels.settings_currency}
        options={CURRENCIES}
        selected={config.currency}
        onSelect={(v) => updateConfig({ currency: v })}
        title={labels.settings_currency}
        searchable
      />
      <SettingsSelectRow
        label={labels.settings_decimal_sep}
        options={SEPARATORS}
        selected={config.decimalSeparator}
        onSelect={(v) => updateConfig({ decimalSeparator: v })}
      />

      <Text style={[settingsStyles.section, { color: c.textSecondary, fontSize: fs(12) }]}>{labels.settings_calendar}</Text>
      <SettingsSelectRow
        label={labels.settings_first_day}
        options={FIRST_DAY_OPTIONS}
        selected={String(config.firstDayOfWeek)}
        onSelect={(v) => updateConfig({ firstDayOfWeek: Number(v) as FirstDay })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  currencyIcon: { fontWeight: '700' },
});
