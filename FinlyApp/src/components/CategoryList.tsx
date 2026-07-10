import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../constants/colors';
import { formatearMoneda } from '../utils/formatters';

interface CategoriaItem {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  total: number;
  porcentaje: number;
}

interface Props {
  categorias: CategoriaItem[];
  total: number;
  divisa?: string;
  onPress?: (categoria: CategoriaItem) => void;
}

export default function CategoryList({ categorias, total, divisa = '€', onPress }: Props) {
  return (
    <FlatList
      style={Platform.select({
        web: { scrollbarWidth: 'thin', scrollbarColor: `${colores.primario}40 ${colores.fondoAlto}` } as any,
        default: {},
      })}
      data={categorias}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => onPress?.(item)}
          accessibilityLabel={`Categoría ${item.nombre}, ${item.porcentaje.toFixed(1)}%`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={[styles.icono, { backgroundColor: item.color + '30' }]}>
            <Ionicons name={item.icono as any} size={20} color={item.color} />
          </View>
          <View style={styles.info}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <View style={styles.barraFondo}>
              <View style={[styles.barraRelleno, { width: `${Math.min(item.porcentaje, 100)}%`, backgroundColor: item.color }]} />
            </View>
          </View>
          <View style={styles.montos}>
            <Text style={styles.total}>{formatearMoneda(item.total, divisa)}</Text>
            <Text style={styles.porcentaje}>{item.porcentaje.toFixed(1)}%</Text>
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
    borderBottomColor: colores.borde,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  nombre: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  barraFondo: {
    height: 4,
    backgroundColor: colores.fondoAlto,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 2,
  },
  montos: {
    alignItems: 'flex-end',
  },
  total: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '600',
  },
  porcentaje: {
    color: colores.textoSuave,
    fontSize: 12,
    marginTop: 2,
  },
});
