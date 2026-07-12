import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, obtenerNombreCategoria } from '../i18n';
import SearchBar from '../components/SearchBar';
import { RootStackParamList } from '../constants/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddCategory'>;
type AddCategoryRouteProp = RouteProp<RootStackParamList, 'AddCategory'>;

export default function AddCategoryScreen() {
  const { coloresActivos: c } = useConfig();
  const { categorias } = useApp();
  const fs = useFontSize();
  const texto = t();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddCategoryRouteProp>();

  const tipo = route.params.tipo;

  const [busquedaActiva, setBusquedaActiva] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setBusquedaActiva(!busquedaActiva);
            setTextoBusqueda('');
          }}
          style={styles.searchButton}
        >
          <Ionicons name="search-outline" size={22} color={c.texto} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, busquedaActiva, c.texto]);

  const categoriasPorTipo = useMemo(() => {
    return categorias.filter((cat) => cat.tipo === tipo);
  }, [categorias, tipo]);

  const categoriasFiltradas = useMemo(() => {
    if (!textoBusqueda.trim()) return categoriasPorTipo;

    const terminos = textoBusqueda.toLowerCase().split(/\s+/).filter(Boolean);
    return categoriasPorTipo.filter((cat) => {
      const nombre = (obtenerNombreCategoria(cat.id) || cat.nombre).toLowerCase();
      return terminos.every((termino) => nombre.includes(termino));
    });
  }, [categoriasPorTipo, textoBusqueda]);

  const handleSelectCategoria = (categoriaId: number) => {
    navigation.navigate('AddTransaction', { categoriaId });
  };

  const renderCategoria = (cat: typeof categorias[0]) => {
    const nombre = obtenerNombreCategoria(cat.id) || cat.nombre;

    return (
      <TouchableOpacity
        key={cat.id}
        style={[styles.item, { backgroundColor: c.fondoAlto }]}
        onPress={() => handleSelectCategoria(cat.id)}
        accessibilityLabel={`${texto.a11y_category} ${nombre}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: cat.color + '22' }]}>
          <Ionicons name={cat.icono as any} size={24} color={cat.color} />
        </View>
        <Text
          style={[styles.nombre, { color: c.texto, fontSize: fs(11) }]}
          numberOfLines={1}
        >
          {nombre}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCreateButton = () => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: c.fondoAlto }]}
      onPress={() => {}}
      accessibilityLabel={texto.add_cat_create}
    >
      <View style={[styles.iconContainer, { backgroundColor: c.textoSuave + '22' }]}>
        <Ionicons name="add" size={24} color={c.textoSuave} />
      </View>
      <Text
        style={[styles.nombre, { color: c.textoSuave, fontSize: fs(11) }]}
        numberOfLines={1}
      >
        {texto.add_cat_create}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.fondo }]} edges={['bottom']}>
      <View style={styles.content}>
        {busquedaActiva && (
          <SearchBar
            placeholder={texto.add_cat_search}
            value={textoBusqueda}
            onChangeText={setTextoBusqueda}
            onClose={() => {
              setBusquedaActiva(false);
              setTextoBusqueda('');
            }}
          />
        )}

        {categoriasFiltradas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={c.textoSuave} />
            <Text style={[styles.emptyText, { color: c.textoSuave, fontSize: fs(16) }]}>
              {texto.add_cat_no_results}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.grid}>
              {categoriasFiltradas.map(renderCategoria)}
              {renderCreateButton()}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  nombre: {
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontWeight: '500',
  },
  searchButton: {
    marginRight: 8,
    padding: 4,
  },
});
