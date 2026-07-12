import { ComponentProps } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scrollbarFlatList } from '../constants/platformStyles';
import { CategoriaConTotal } from '../constants/types';
import { formatearMoneda } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  categorias: CategoriaConTotal[];
  total: number;
  divisa?: string;
  separador?: ',' | '.';
  onPress?: (categoria: CategoriaConTotal) => void;
}

export default function CategoryList({ categorias, total, divisa = '€', separador = ',', onPress }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();

  return (
    <FlatList
      style={scrollbarFlatList}
      data={categorias}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: c.borde }]}
          onPress={() => onPress?.(item)}
          accessibilityLabel={`Categoría ${item.nombre}, ${item.porcentaje.toFixed(1)}%`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={[styles.icono, { backgroundColor: item.color + '30' }]}>
            <Ionicons name={item.icono as ComponentProps<typeof Ionicons>['name']} size={20} color={item.color} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.nombre, { color: c.texto, fontSize: fs(14) }]}>{item.nombre}</Text>
            <View style={[styles.barraFondo, { backgroundColor: c.fondoAlto }]}>
              <View style={[styles.barraRelleno, { width: `${Math.min(item.porcentaje, 100)}%`, backgroundColor: item.color }]} />
            </View>
          </View>
          <View style={styles.montos}>
            <Text style={[styles.total, { color: c.texto, fontSize: fs(14) }]}>{formatearMoneda(item.total, divisa, separador)}</Text>
            <Text style={[styles.porcentaje, { color: c.textoSuave, fontSize: fs(12) }]}>{item.porcentaje.toFixed(1)}%</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1, marginRight: 12 },
  nombre: { fontWeight: '500', marginBottom: 6 },
  barraFondo: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barraRelleno: { height: '100%', borderRadius: 2 },
  montos: { alignItems: 'flex-end' },
  total: { fontWeight: '600' },
  porcentaje: { marginTop: 2 },
});
