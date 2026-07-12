import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import TypeTabs from '../components/TypeTabs';
import AccountModal from '../components/AccountModal';
import CategoryGrid from '../components/CategoryGrid';
import DaySelector from '../components/DaySelector';
import TagSection from '../components/TagSection';
import CommentInput from '../components/CommentInput';
import PhotoSection from '../components/PhotoSection';
import CalendarModal from '../components/CalendarModal';
import { TipoTransaccion, RootStackParamList } from '../constants/types';
import { esMismoDia } from '../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
type AddTransactionRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

interface Etiqueta {
  id: number;
  nombre: string;
}

const GRID_ROWS = 2;
const GRID_COLS = 4;
const MAX_VISIBLE_CATEGORIES = GRID_ROWS * GRID_COLS - 1;

export default function AddTransactionScreen() {
  const { coloresActivos: c, config } = useConfig();
  const { tipoActivo, periodoActivo, fechaPersonalizada, fechaSeleccionada, cuentas, categorias, cuentasConSaldo, cuentaActiva } = useApp();
  const fs = useFontSize();
  const texto = t();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddTransactionRouteProp>();

  const [tipo, setTipo] = useState<TipoTransaccion>(tipoActivo);
  const [cantidad, setCantidad] = useState('');
  const [cuentaId, setCuentaId] = useState(cuentaActiva?.id ?? 1);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [reorderedCategory, setReorderedCategory] = useState<number | null>(null);
  const diaInicial = (() => {
    if (periodoActivo === 'periodo') {
      const esUnDia = esMismoDia(fechaPersonalizada.inicio, fechaPersonalizada.fin);
      if (esUnDia) return fechaPersonalizada.inicio;
    }
    return fechaSeleccionada;
  })();
  const [dia, setDia] = useState(diaInicial);

  const prevTipo = useRef(tipo);

  useEffect(() => {
    if (route.params?.tipo) {
      setTipo(route.params.tipo);
    }
    if (route.params?.categoriaId) {
      setCategoriaId(route.params.categoriaId);
      const targetTipo = route.params?.tipo ?? tipo;
      const allByType = categorias.filter(c => c.tipo === targetTipo);
      const isVisible = allByType.slice(0, MAX_VISIBLE_CATEGORIES).some(c => c.id === route.params!.categoriaId);
      if (!isVisible) {
        setReorderedCategory(route.params.categoriaId);
      } else {
        setReorderedCategory(null);
      }
    }
  }, [route.params?.categoriaId, route.params?.tipo]);

  useEffect(() => {
    if (prevTipo.current !== tipo) {
      prevTipo.current = tipo;
      setCategoriaId(null);
      setReorderedCategory(null);
    }
  }, [tipo]);

  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<number[]>([]);
  const [comentario, setComentario] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const [modalCuentaVisible, setModalCuentaVisible] = useState(false);
  const [modalCalendarioVisible, setModalCalendarioVisible] = useState(false);

  const [etiquetasDisponibles] = useState<Etiqueta[]>([
    { id: 1, nombre: 'Urgente' },
    { id: 2, nombre: 'Recurrente' },
    { id: 3, nombre: 'Personal' },
  ]);

  const cantidadInvalida = cantidad.length > 0 && !/^\d*\.?\d{0,2}$/.test(cantidad);

  const handleCantidadChange = (texto: string) => {
    const limpio = texto.replace(/[^0-9.]/g, '');
    const partes = limpio.split('.');
    if (partes.length > 2) return;
    if (partes[1] && partes[1].length > 2) return;
    setCantidad(limpio);
  };

  const handleToggleEtiqueta = (id: number) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleCrearEtiqueta = (nombre: string) => {
    const nuevaId = etiquetasDisponibles.length + 1;
    etiquetasDisponibles.push({ id: nuevaId, nombre });
  };

  const handleSelectCuenta = (cuenta: typeof cuentasConSaldo[0]) => {
    setCuentaId(cuenta.id);
    setModalCuentaVisible(false);
  };

  const handleSelectFecha = (fecha: Date) => {
    setDia(fecha);
    setModalCalendarioVisible(false);
  };

  const handleTakePhoto = () => {
    // TODO: implement camera
  };

  const handlePickFromGallery = () => {
    // TODO: implement gallery
  };

  const handleSubmit = () => {
    // TODO: save transaction
    console.log({
      tipo,
      cantidad: parseFloat(cantidad) || 0,
      cuentaId,
      categoriaId,
      dia,
      etiquetasSeleccionadas,
      comentario,
      fotoUri,
    });
  };

  const categoriesByType = categorias.filter(c => c.tipo === tipo);
  const totalByType = categoriesByType.length;
  const hasMore = totalByType > MAX_VISIBLE_CATEGORIES;

  const visibleCategories = useMemo(() => {
    if (reorderedCategory) {
      const selected = categoriesByType.find(c => c.id === reorderedCategory);
      if (selected) {
        return [selected, ...categoriesByType.filter(c => c.id !== reorderedCategory)].slice(0, MAX_VISIBLE_CATEGORIES);
      }
    }
    return categoriesByType.slice(0, MAX_VISIBLE_CATEGORIES);
  }, [categoriesByType, reorderedCategory]);

  const selectedAccount = cuentas.find(c => c.id === cuentaId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.fondo }]}>
      <ScrollView style={[styles.container, { backgroundColor: c.fondo }]}>
        <TypeTabs activo={tipo} onChange={setTipo} />

        <View style={[styles.cantidadContainer, { backgroundColor: c.fondoAlto }]}>
          <TextInput
            style={[
              styles.cantidadInput,
              { color: c.texto, fontSize: fs(24) },
              cantidadInvalida && { color: '#F87171' },
            ]}
            placeholder={texto.add_amount_placeholder}
            placeholderTextColor={c.textoSuave}
            value={cantidad}
            onChangeText={handleCantidadChange}
            keyboardType="numeric"
          />
          <Text style={[styles.currencySymbol, { color: c.textoSuave, fontSize: fs(18) }]}>
            {config.divisa}
          </Text>
          <TouchableOpacity style={styles.calculadoraButton}>
            <Ionicons name="calculator-outline" size={24} color={c.primario} />
          </TouchableOpacity>
        </View>
        {cantidadInvalida && (
          <Text style={[styles.errorText, { color: '#F87171', fontSize: fs(12) }]}>
            {texto.add_amount_error}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.cuentaContainer, { backgroundColor: c.fondoAlto }]}
          onPress={() => setModalCuentaVisible(true)}
        >
          <Text style={[styles.cuentaLabel, { color: c.textoSuave, fontSize: fs(12) }]}>
            {texto.add_account}
          </Text>
          <Text style={[styles.cuentaNombre, { color: c.texto, fontSize: fs(15) }]}>
            {selectedAccount?.nombre ?? ''}
          </Text>
        </TouchableOpacity>

        <CategoryGrid
          categorias={visibleCategories}
          categoriaSeleccionada={categoriaId}
          onSelect={setCategoriaId}
          onAddMore={() => navigation.navigate('AddCategory', { tipo })}
          showAddMore={hasMore}
        />

        <DaySelector
          diaSeleccionado={dia}
          onSelect={setDia}
          onOpenCalendar={() => setModalCalendarioVisible(true)}
        />

        <TagSection
          etiquetas={etiquetasDisponibles}
          etiquetasSeleccionadas={etiquetasSeleccionadas}
          onToggle={handleToggleEtiqueta}
          onCrear={handleCrearEtiqueta}
        />

        <CommentInput
          comentario={comentario}
          onChange={setComentario}
        />

        <PhotoSection
          fotoUri={fotoUri}
          onTakePhoto={handleTakePhoto}
          onPickFromGallery={handlePickFromGallery}
        />

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: c.primario }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, { color: c.fondo, fontSize: fs(16) }]}>
            {texto.add_submit}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AccountModal
        visible={modalCuentaVisible}
        cuentas={cuentasConSaldo}
        onSelect={handleSelectCuenta}
        onClose={() => setModalCuentaVisible(false)}
      />

      <CalendarModal
        visible={modalCalendarioVisible}
        periodo="dia"
        fecha={dia}
        onSelectFecha={handleSelectFecha}
        onClose={() => setModalCalendarioVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  cantidadInput: {
    flex: 1,
    paddingVertical: 16,
    fontWeight: '700',
  },
  currencySymbol: {
    marginRight: 8,
    fontWeight: '600',
  },
  calculadoraButton: {
    padding: 8,
  },
  errorText: {
    marginBottom: 8,
  },
  cuentaContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  cuentaLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  cuentaNombre: {
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    fontWeight: '700',
  },
});
