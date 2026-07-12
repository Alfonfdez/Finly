import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { scrollbarFlatList } from '../constants/platformStyles';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { useMemo } from 'react';
import { RootStackParamList } from '../constants/types';
import { t } from '../i18n';

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const { transacciones, categorias } = useApp();
  const { config, coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();
  const categoriaId = route.params?.categoriaId;

  const filtradas = useMemo(() => {
    let lista = transacciones;
    if (categoriaId) {
      lista = lista.filter(t => t.categoria_id === categoriaId);
    }
    return [...lista].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [transacciones, categoriaId]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.fondo }]}>
      <View style={[styles.container, { backgroundColor: c.fondo }]}>
        <Text style={[styles.titulo, { color: c.texto, fontSize: fs(20) }]}>{texto.transactions_title}</Text>
        <FlatList
          style={scrollbarFlatList}
          data={filtradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const cat = categorias.find(ct => ct.id === item.categoria_id);
            return (
              <View style={[styles.item, { borderBottomColor: c.borde }]}>
                <View style={styles.info}>
                  <Text style={[styles.descripcion, { color: c.texto, fontSize: fs(15) }]}>{item.descripcion}</Text>
                  <Text style={[styles.categoria, { color: c.textoSuave, fontSize: fs(12) }]}>{cat?.nombre ?? ''}</Text>
                  <Text style={[styles.fecha, { color: c.textoSuave, fontSize: fs(11) }]}>{formatearFecha(new Date(item.fecha))}</Text>
                </View>
                <Text style={[styles.cantidad, { color: item.tipo === 'ingreso' ? c.verde : c.rojo, fontSize: fs(16) }]}>
                  {item.tipo === 'ingreso' ? '+' : '-'}{formatearMoneda(item.cantidad, config.divisa, config.separadorDecimal)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.vacio, { color: c.textoSuave, fontSize: fs(14) }]}>{texto.transactions_empty}</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  info: { flex: 1 },
  descripcion: { fontSize: 15, fontWeight: '500' },
  categoria: { fontSize: 12, marginTop: 2 },
  fecha: { fontSize: 11, marginTop: 1 },
  cantidad: { fontSize: 16, fontWeight: '700' },
  vacio: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
