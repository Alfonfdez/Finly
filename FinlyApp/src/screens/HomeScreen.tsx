import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colores } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { formatearMoneda } from '../utils/formatters';
import AccountModal from '../components/AccountModal';
import TypeTabs from '../components/TypeTabs';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import CategoryList from '../components/CategoryList';

type ChartType = 'donut' | 'bar';

export default function HomeScreen() {
  const navigation: any = useNavigation();
  const {
    cuentaActiva, tipoActivo, periodoActivo, fechaSeleccionada, cuentasConSaldo, categoriasActivas,
    totalIngresos, totalGastos, totalIngresosGlobal, totalGastosGlobal, seleccionarCuenta, cambiarTipo,
    cambiarPeriodo, setFechaSeleccionada, setFechaPersonalizada,
  } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('donut');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [inicioRango, setInicioRango] = useState(() => new Date(new Date().getFullYear(), 0, 1));
  const [finRango, setFinRango] = useState(new Date());

  const total = totalIngresosGlobal - totalGastosGlobal;
  const totalActivo = tipoActivo === 'gasto' ? totalGastos : totalIngresos;
  const colorTotal = total >= 0 ? colores.verde : colores.rojo;

  const handleCategoriaPress = useCallback((categoria: any) => {
    navigation.navigate('Transactions', { categoriaId: categoria.id, tipo: tipoActivo });
  }, [navigation, tipoActivo]);

  const handlePeriodChange = useCallback((periodo: any) => {
    cambiarPeriodo(periodo);
    if (periodo === 'periodo') setCalendarVisible(true);
  }, [cambiarPeriodo]);

  const handleFechaChange = useCallback((d: Date) => {
    setFechaSeleccionada(d);
    setCalendarVisible(false);
  }, [setFechaSeleccionada]);

  const handleRangoChange = useCallback((inicio: Date, fin: Date) => {
    const finDia = new Date(fin);
    finDia.setHours(23, 59, 59, 999);
    const inicioDia = new Date(inicio);
    inicioDia.setHours(0, 0, 0, 0);
    setInicioRango(inicioDia);
    setFinRango(finDia);
    setFechaPersonalizada({ inicio: inicioDia, fin: finDia });
  }, [setFechaPersonalizada]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            accessibilityLabel="Abrir menú"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu-outline" size={26} color={colores.texto} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.totalBoton} onPress={() => setModalVisible(true)}>
            <View style={styles.cuentaRow}>
              <Text style={styles.labelCuenta}>{cuentaActiva.nombre}</Text>
              <Ionicons name="chevron-down-outline" size={14} color={colores.textoSuave} />
            </View>
            <Text style={[styles.totalTexto, { color: colorTotal }]}>
              {formatearMoneda(total)}
            </Text>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenItem}>
                <Text style={{ color: colores.verde }}>+{formatearMoneda(totalIngresosGlobal)}</Text>
                <Text style={styles.resumenLabel}> Ingresos</Text>
              </Text>
              <Text style={styles.resumenItem}>
                <Text style={{ color: colores.rojo }}>-{formatearMoneda(totalGastosGlobal)}</Text>
                <Text style={styles.resumenLabel}> Gastos</Text>
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions')}
            accessibilityLabel="Ver transacciones"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="stats-chart-outline" size={24} color={colores.texto} />
          </TouchableOpacity>
        </View>

        <TypeTabs activo={tipoActivo} onChange={cambiarTipo} />
        <PeriodTabs activo={periodoActivo} onChange={handlePeriodChange} />
        <CalendarPicker
          periodo={periodoActivo}
          fecha={fechaSeleccionada}
          onFechaChange={handleFechaChange}
          onRangoChange={handleRangoChange}
          inicioRango={inicioRango}
          finRango={finRango}
          visible={calendarVisible}
          onAbrir={() => setCalendarVisible(true)}
          onClose={() => setCalendarVisible(false)}
        />

        <TouchableOpacity
          style={styles.chartContainer}
          onPress={() => setChartType(chartType === 'donut' ? 'bar' : 'donut')}
          activeOpacity={0.7}
        >
          {chartType === 'donut' ? (
            <DonutChart datos={categoriasActivas} total={totalActivo} />
          ) : (
            <BarChart datos={categoriasActivas} />
          )}
        </TouchableOpacity>

        <CategoryList
          categorias={categoriasActivas}
          total={totalActivo}
          onPress={handleCategoriaPress}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddTransaction')}
          accessibilityLabel="Añadir gasto o ingreso"
        >
          <Text style={styles.fabTexto}>+</Text>
        </TouchableOpacity>

        <AccountModal
          visible={modalVisible}
          cuentas={cuentasConSaldo}
          onSelect={(c) => { seleccionarCuenta(c); setModalVisible(false); }}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  container: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colores.fondoAlto,
  },
  totalBoton: {
    alignItems: 'center',
    flex: 1,
  },
  cuentaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelCuenta: {
    color: colores.textoSuave,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resumenRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resumenItem: {
    fontSize: 12,
  },
  resumenLabel: {
    color: colores.textoSuave,
    fontSize: 11,
  },
  totalTexto: {
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 2,
  },

  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(34, 211, 238, 0.3)' },
      default: {
        elevation: 6,
        shadowColor: colores.primario,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  fabTexto: {
    color: colores.fondo,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
});
