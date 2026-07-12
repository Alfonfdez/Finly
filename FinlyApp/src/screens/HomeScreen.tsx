import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { Cuenta } from '../database/types';
import { formatearMoneda } from '../utils/formatters';
import { RootStackParamList, Periodo } from '../constants/types';
import { t } from '../i18n';
import AccountModal from '../components/AccountModal';
import TypeTabs from '../components/TypeTabs';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import CategoryList from '../components/CategoryList';

type ChartType = 'donut' | 'bar';
type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const {
    cuentaActiva, tipoActivo, periodoActivo, fechaSeleccionada, fechaPersonalizada, cuentasConSaldo, categoriasActivas,
    totalIngresos, totalGastos, totalIngresosGlobal, totalGastosGlobal, seleccionarCuenta, cambiarTipo,
    cambiarPeriodo, setFechaSeleccionada, setFechaPersonalizada, cargando,
  } = useApp();
  const { config, coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  const [modalVisible, setModalVisible] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('donut');
  const [calendarVisible, setCalendarVisible] = useState(false);

  const total = totalIngresosGlobal - totalGastosGlobal;
  const totalActivo = tipoActivo === 'gasto' ? totalGastos : totalIngresos;
  const colorTotal = total >= 0 ? c.verde : c.rojo;

  const handleCategoriaPress = useCallback((categoria: { id: number }) => {
    navigation.navigate('Transactions', { categoriaId: categoria.id, tipo: tipoActivo });
  }, [navigation, tipoActivo]);

  const handlePeriodChange = useCallback((periodo: Periodo) => {
    cambiarPeriodo(periodo);
    if (periodo === 'periodo') setCalendarVisible(true);
  }, [cambiarPeriodo]);

  const handleFechaChange = useCallback((d: Date) => {
    setFechaSeleccionada(d);
    setCalendarVisible(false);
  }, [setFechaSeleccionada]);

  const handleCuentaSelect = useCallback((cu: Cuenta) => {
    seleccionarCuenta(cu);
    setModalVisible(false);
  }, [seleccionarCuenta]);

  const handleRangoChange = useCallback((inicio: Date, fin: Date) => {
    const finDia = new Date(fin);
    finDia.setHours(23, 59, 59, 999);
    const inicioDia = new Date(inicio);
    inicioDia.setHours(0, 0, 0, 0);
    setFechaPersonalizada({ inicio: inicioDia, fin: finDia });
  }, [setFechaPersonalizada]);

  if (cargando || !cuentaActiva) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.fondo }]}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: c.fondo }]}>
          <ActivityIndicator size="large" color={c.primario} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.fondo }]}>
      <View style={[styles.container, { backgroundColor: c.fondo }]}>
        <View style={[styles.header, { backgroundColor: c.fondoAlto }]}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            accessibilityLabel="Abrir menú"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu-outline" size={26} color={c.texto} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.totalBoton} onPress={() => setModalVisible(true)}>
            <View style={styles.cuentaRow}>
              <Text style={[styles.labelCuenta, { color: c.textoSuave, fontSize: fs(12) }]}>{cuentaActiva.nombre}</Text>
              <Ionicons name="chevron-down-outline" size={14} color={c.textoSuave} />
            </View>
            <Text style={[styles.totalTexto, { color: colorTotal, fontSize: fs(28) }]}>
              {formatearMoneda(total, config.divisa, config.separadorDecimal)}
            </Text>
            <View style={styles.resumenRow}>
              <Text style={[styles.resumenItem, { fontSize: fs(12) }]}>
                <Text style={{ color: c.verde }}>+{formatearMoneda(totalIngresosGlobal, config.divisa, config.separadorDecimal)}</Text>
                <Text style={[styles.resumenLabel, { color: c.textoSuave, fontSize: fs(11) }]}> {texto.home_income}</Text>
              </Text>
              <Text style={[styles.resumenItem, { fontSize: fs(12) }]}>
                <Text style={{ color: c.rojo }}>-{formatearMoneda(totalGastosGlobal, config.divisa, config.separadorDecimal)}</Text>
                <Text style={[styles.resumenLabel, { color: c.textoSuave, fontSize: fs(11) }]}> {texto.home_expenses}</Text>
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions')}
            accessibilityLabel="Ver transacciones"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="stats-chart-outline" size={24} color={c.texto} />
          </TouchableOpacity>
        </View>

        <TypeTabs activo={tipoActivo} onChange={cambiarTipo} />
        <PeriodTabs activo={periodoActivo} onChange={handlePeriodChange} />
        <CalendarPicker
          periodo={periodoActivo}
          fecha={fechaSeleccionada}
          onFechaChange={handleFechaChange}
          onRangoChange={handleRangoChange}
          inicioRango={fechaPersonalizada.inicio}
          finRango={fechaPersonalizada.fin}
          visible={calendarVisible}
          onAbrir={() => setCalendarVisible(true)}
          onClose={() => setCalendarVisible(false)}
          primerDia={config.primerDiaSemana}
        />

        <TouchableOpacity
          style={styles.chartContainer}
          onPress={() => setChartType(chartType === 'donut' ? 'bar' : 'donut')}
          activeOpacity={0.7}
        >
          {chartType === 'donut' ? (
            <DonutChart datos={categoriasActivas} total={totalActivo} divisa={config.divisa} separador={config.separadorDecimal} />
          ) : (
            <BarChart datos={categoriasActivas} total={totalActivo} divisa={config.divisa} separador={config.separadorDecimal} />
          )}
        </TouchableOpacity>

        <CategoryList
          categorias={categoriasActivas}
          total={totalActivo}
          divisa={config.divisa}
          separador={config.separadorDecimal}
          onPress={handleCategoriaPress}
        />

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: c.primario }]}
          onPress={() => navigation.navigate('AddTransaction')}
          accessibilityLabel={texto.home_add}
        >
          <Text style={[styles.fabTexto, { color: c.fondo, fontSize: fs(28) }]}>+</Text>
        </TouchableOpacity>

        <AccountModal
          visible={modalVisible}
          cuentas={cuentasConSaldo}
          onSelect={handleCuentaSelect}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalBoton: { alignItems: 'center', flex: 1 },
  cuentaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  labelCuenta: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  resumenRow: { flexDirection: 'row', gap: 12 },
  resumenItem: { fontSize: 12 },
  resumenLabel: { fontSize: 11 },
  totalTexto: { fontSize: 28, fontWeight: '800', marginVertical: 2 },
  chartContainer: { alignItems: 'center', marginVertical: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(34, 211, 238, 0.3)' },
      default: { elevation: 6, shadowColor: '#22D3EE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    }),
  },
  fabTexto: { fontSize: 28, fontWeight: '600', lineHeight: 30 },
});
