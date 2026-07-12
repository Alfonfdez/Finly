import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Rect, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useConfig, Configuracion } from '../context/ConfigContext';
import { SettingsScreenProps } from '../constants/types';
import { escalarFontSize } from '../utils/formatters';
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
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
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

function DayCircleIcon({ letter, size = 16, colores }: { letter: string; size?: number; colores: ReturnType<typeof useConfig>['coloresActivos'] }) {
  const isWide = letter.length > 1;
  const w = isWide ? size * 1.3 : size;
  return (
    <View style={{ width: w, height: size, borderRadius: size / 2, backgroundColor: colores.primario, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * (isWide ? 0.4 : 0.55), color: colores.fondo, fontWeight: '700' }}>{letter}</Text>
    </View>
  );
}

type Opcion<T = string> = { label: string; value: T; icon?: ReactNode };

function SelectorInline<T extends string>({
  opciones,
  seleccionado,
  onSelect,
  colores,
  tamanoTexto,
}: {
  opciones: Opcion<T>[];
  seleccionado: T;
  onSelect: (v: T) => void;
  colores: ReturnType<typeof useConfig>['coloresActivos'];
  tamanoTexto: Configuracion['tamanoTexto'];
}) {
  const fs = (s: number) => escalarFontSize(s, tamanoTexto);
  return (
    <View style={styles.opciones}>
      {opciones.map(op => (
        <TouchableOpacity
          key={String(op.value)}
          style={[styles.opcion, { backgroundColor: seleccionado === op.value ? colores.primario + '20' : colores.fondoAlto }]}
          onPress={() => onSelect(op.value)}
        >
          {op.icon && <View style={styles.iconWrap}>{op.icon}</View>}
          <Text style={[styles.opcionTexto, { color: seleccionado === op.value ? colores.primario : colores.texto, fontSize: fs(14) }]}>
            {op.label}
          </Text>
          {seleccionado === op.value && (
            <Text style={[styles.check, { color: colores.primario, fontSize: fs(14) }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { config, coloresActivos, actualizarConfig } = useConfig();
  const c = coloresActivos;
  const texto = t();
  const fs = (size: number) => escalarFontSize(size, config.tamanoTexto);

  const TEMAS: Opcion<Configuracion['tema']>[] = [
    { label: texto.theme_dark, value: 'oscuro', icon: <Ionicons name="moon" size={16} color={c.texto} /> },
    { label: texto.theme_light, value: 'claro', icon: <Ionicons name="sunny" size={16} color={c.texto} /> },
    { label: texto.theme_system, value: 'sistema', icon: <Ionicons name="phone-portrait-outline" size={16} color={c.texto} /> },
  ];

  const PRIMER_DIA: Opcion[] = [
    { label: texto.day_monday, value: '1', icon: <DayCircleIcon letter={texto.day_mon_letter} size={16} colores={c} /> },
    { label: texto.day_sunday, value: '0', icon: <DayCircleIcon letter={texto.day_sun_letter} size={16} colores={c} /> },
  ];

  const DIVISAS: Opcion[] = [
    { label: texto.currency_euro, value: '€', icon: <Text style={[styles.currencyIcon, { color: c.texto, fontSize: fs(16) }]}>€</Text> },
    { label: texto.currency_dollar, value: '$', icon: <Text style={[styles.currencyIcon, { color: c.texto, fontSize: fs(16) }]}>$</Text> },
    { label: texto.currency_pound, value: '£', icon: <Text style={[styles.currencyIcon, { color: c.texto, fontSize: fs(16) }]}>£</Text> },
    { label: texto.currency_yen, value: '¥', icon: <Text style={[styles.currencyIcon, { color: c.texto, fontSize: fs(16) }]}>¥</Text> },
  ];

  const SEPARADORES: Opcion<Configuracion['separadorDecimal']>[] = [
    { label: texto.sep_comma, value: ',', icon: <Text style={[styles.currencyIcon, { color: c.texto, fontSize: fs(16) }]}>,</Text> },
    { label: texto.sep_dot, value: '.', icon: <Text style={[styles.currencyIcon, { color: c.texto, fontSize: fs(16) }]}>.</Text> },
  ];

  const IDIOMAS: Opcion<Configuracion['idioma']>[] = [
    { label: texto.lang_en, value: 'en', icon: <FlagIcon code="en" size={16} /> },
    { label: texto.lang_es, value: 'es', icon: <FlagIcon code="es" size={16} /> },
    { label: texto.lang_ca, value: 'ca', icon: <FlagIcon code="ca" size={16} /> },
  ];

  const TAMANOS: Opcion<Configuracion['tamanoTexto']>[] = [
    { label: texto.size_small, value: 'pequeño', icon: <Text style={[styles.sizeIcon, { color: c.texto, fontSize: 11 }]}>A</Text> },
    { label: texto.size_medium, value: 'mediano', icon: <Text style={[styles.sizeIcon, { color: c.texto, fontSize: 15 }]}>A</Text> },
    { label: texto.size_large, value: 'grande', icon: <Text style={[styles.sizeIcon, { color: c.texto, fontSize: 19 }]}>A</Text> },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.fondo }]} contentContainerStyle={styles.content}>
      <Text style={[styles.seccion, { color: c.textoSuave, fontSize: fs(12) }]}>{texto.settings_appearance}</Text>
      <View style={[styles.card, { backgroundColor: c.fondoAlto }]}>
        <Text style={[styles.label, { color: c.texto, fontSize: fs(15) }]}>{texto.settings_theme}</Text>
        <SelectorInline opciones={TEMAS} seleccionado={config.tema} onSelect={(v) => actualizarConfig({ tema: v })} colores={c} tamanoTexto={config.tamanoTexto} />
      </View>

      <Text style={[styles.seccion, { color: c.textoSuave, fontSize: fs(12) }]}>{texto.settings_calendar}</Text>
      <View style={[styles.card, { backgroundColor: c.fondoAlto }]}>
        <Text style={[styles.label, { color: c.texto, fontSize: fs(15) }]}>{texto.settings_first_day}</Text>
        <SelectorInline opciones={PRIMER_DIA} seleccionado={String(config.primerDiaSemana)} onSelect={(v) => actualizarConfig({ primerDiaSemana: Number(v) as 0 | 1 })} colores={c} tamanoTexto={config.tamanoTexto} />
      </View>

      <Text style={[styles.seccion, { color: c.textoSuave, fontSize: fs(12) }]}>{texto.settings_money}</Text>
      <View style={[styles.card, { backgroundColor: c.fondoAlto }]}>
        <Text style={[styles.label, { color: c.texto, fontSize: fs(15) }]}>{texto.settings_currency}</Text>
        <SelectorInline opciones={DIVISAS} seleccionado={config.divisa} onSelect={(v) => actualizarConfig({ divisa: v })} colores={c} tamanoTexto={config.tamanoTexto} />
      </View>
      <View style={[styles.card, { backgroundColor: c.fondoAlto }]}>
        <Text style={[styles.label, { color: c.texto, fontSize: fs(15) }]}>{texto.settings_decimal_sep}</Text>
        <SelectorInline opciones={SEPARADORES} seleccionado={config.separadorDecimal} onSelect={(v) => actualizarConfig({ separadorDecimal: v })} colores={c} tamanoTexto={config.tamanoTexto} />
      </View>

      <Text style={[styles.seccion, { color: c.textoSuave, fontSize: fs(12) }]}>{texto.settings_language}</Text>
      <View style={[styles.card, { backgroundColor: c.fondoAlto }]}>
        <SelectorInline opciones={IDIOMAS} seleccionado={config.idioma} onSelect={(v) => actualizarConfig({ idioma: v })} colores={c} tamanoTexto={config.tamanoTexto} />
      </View>

      <Text style={[styles.seccion, { color: c.textoSuave, fontSize: fs(12) }]}>{texto.settings_text}</Text>
      <View style={[styles.card, { backgroundColor: c.fondoAlto }]}>
        <Text style={[styles.label, { color: c.texto, fontSize: fs(15) }]}>{texto.settings_text_size}</Text>
        <SelectorInline opciones={TAMANOS} seleccionado={config.tamanoTexto} onSelect={(v) => actualizarConfig({ tamanoTexto: v })} colores={c} tamanoTexto={config.tamanoTexto} />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  seccion: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: { borderRadius: 12, padding: 16, marginBottom: 8 },
  label: { fontWeight: '600', marginBottom: 10 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcion: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  opcionTexto: { fontWeight: '500' },
  check: { fontWeight: '700' },
  iconWrap: { justifyContent: 'center', alignItems: 'center' },
  currencyIcon: { fontWeight: '700' },
  sizeIcon: { fontWeight: '700' },
});
