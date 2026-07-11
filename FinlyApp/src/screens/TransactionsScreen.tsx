import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colores } from '../constants/colors';
import { scrollbarFlatList } from '../constants/platformStyles';
import { useApp } from '../context/AppContext';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { useMemo } from 'react';
import { RootStackParamList } from '../constants/types';

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const { transacciones, categorias } = useApp();
  const categoriaId = route.params?.categoriaId;

  const filtradas = useMemo(() => {
    let lista = transacciones;
    if (categoriaId) {
      lista = lista.filter(t => t.categoriaId === categoriaId);
    }
    return [...lista].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [transacciones, categoriaId]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Transacciones</Text>
        <FlatList
          style={scrollbarFlatList}
          data={filtradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const cat = categorias.find(c => c.id === item.categoriaId);
            return (
              <View style={styles.item}>
                <View style={styles.info}>
                  <Text style={styles.descripcion}>{item.descripcion}</Text>
                  <Text style={styles.categoria}>{cat?.nombre ?? ''}</Text>
                  <Text style={styles.fecha}>{formatearFecha(new Date(item.fecha))}</Text>
                </View>
                <Text style={[styles.cantidad, item.tipo === 'ingreso' ? styles.ingreso : styles.gasto]}>
                  {item.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(item.cantidad)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay transacciones</Text>
          }
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
    padding: 16,
  },
  titulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  info: {
    flex: 1,
  },
  descripcion: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '500',
  },
  categoria: {
    color: colores.textoSuave,
    fontSize: 12,
    marginTop: 2,
  },
  fecha: {
    color: colores.textoSuave,
    fontSize: 11,
    marginTop: 1,
  },
  cantidad: {
    fontSize: 16,
    fontWeight: '700',
  },
  ingreso: {
    color: colores.verde,
  },
  gasto: {
    color: colores.rojo,
  },
  vacio: {
    color: colores.textoSuave,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
