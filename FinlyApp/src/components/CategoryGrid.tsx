import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, obtenerNombreCategoria } from '../i18n';

interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  color: string;
}

interface Props {
  categorias: Categoria[];
  categoriaSeleccionada: number | null;
  onSelect: (id: number) => void;
  onAddMore: () => void;
}

export default function CategoryGrid({ categorias, categoriaSeleccionada, onSelect, onAddMore }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  const renderCategoria = (cat: Categoria, index: number) => {
    const isSelected = cat.id === categoriaSeleccionada;
    const nombre = obtenerNombreCategoria(cat.id) || cat.nombre;

    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.item,
          { backgroundColor: isSelected ? cat.color + '33' : c.fondoAlto },
          isSelected && { borderWidth: 2, borderColor: cat.color },
        ]}
        onPress={() => onSelect(cat.id)}
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

  const renderAddMore = () => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: c.fondoAlto }]}
      onPress={onAddMore}
      accessibilityLabel={texto.add_more}
    >
      <View style={[styles.iconContainer, { backgroundColor: c.textoSuave + '22' }]}>
        <Ionicons name="add" size={24} color={c.textoSuave} />
      </View>
      <Text
        style={[styles.nombre, { color: c.textoSuave, fontSize: fs(11) }]}
        numberOfLines={1}
      >
        {texto.add_more}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: c.texto, fontSize: fs(15) }]}>
        {texto.add_categories}
      </Text>
      <View style={styles.grid}>
        {categorias.map((cat, index) => renderCategoria(cat, index))}
        {renderAddMore()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titulo: {
    fontWeight: '600',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});
