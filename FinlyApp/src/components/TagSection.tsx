import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Etiqueta {
  id: number;
  nombre: string;
}

interface Props {
  etiquetas: Etiqueta[];
  etiquetasSeleccionadas: number[];
  onToggle: (id: number) => void;
  onCrear: (nombre: string) => void;
}

export default function TagSection({ etiquetas, etiquetasSeleccionadas, onToggle, onCrear }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  const etiquetasFiltradas = etiquetas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrear = () => {
    if (nuevaEtiqueta.trim().length > 0) {
      onCrear(nuevaEtiqueta.trim());
      setNuevaEtiqueta('');
      setModalVisible(false);
    }
  };

  const handleCancelar = () => {
    setNuevaEtiqueta('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: c.texto, fontSize: fs(15) }]}>
          {texto.add_tags}
        </Text>
        <TouchableOpacity
          onPress={() => setMostrarBusqueda(!mostrarBusqueda)}
          accessibilityLabel={texto.add_tag_search}
        >
          <Ionicons name="search-outline" size={20} color={c.primario} />
        </TouchableOpacity>
      </View>

      {mostrarBusqueda && (
        <View style={styles.busquedaContainer}>
          <TextInput
            style={[styles.busquedaInput, { backgroundColor: c.fondoAlto, color: c.texto, fontSize: fs(14) }]}
            placeholder={texto.add_tag_search}
            placeholderTextColor={c.textoSuave}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <TouchableOpacity
            style={styles.busquedaClose}
            onPress={() => {
              setBusqueda('');
              setMostrarBusqueda(false);
            }}
          >
            <Ionicons name="close" size={16} color={c.textoSuave} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.etiquetasContainer}>
        {etiquetasFiltradas.map(etiqueta => (
          <TouchableOpacity
            key={etiqueta.id}
            style={[
              styles.etiqueta,
              { backgroundColor: etiquetasSeleccionadas.includes(etiqueta.id) ? c.primario : c.fondoAlto },
            ]}
            onPress={() => onToggle(etiqueta.id)}
          >
            <Text
              style={[
                styles.etiquetaTexto,
                { color: etiquetasSeleccionadas.includes(etiqueta.id) ? c.fondo : c.texto, fontSize: fs(13) },
              ]}
            >
              {etiqueta.nombre}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.etiqueta, { backgroundColor: c.fondoAlto }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.etiquetaTexto, { color: c.primario, fontSize: fs(13) }]}>
            + {texto.add_tag_new}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCancelar}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: c.fondo }]}>
            <Text style={[styles.modalTitle, { color: c.texto, fontSize: fs(18) }]}>
              {texto.add_tag_modal_title}
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: c.fondoAlto, color: c.texto, fontSize: fs(14) }]}
              placeholder={texto.add_tag_name_placeholder}
              placeholderTextColor={c.textoSuave}
              value={nuevaEtiqueta}
              onChangeText={setNuevaEtiqueta}
              maxLength={20}
            />
            <Text style={[styles.modalCounter, { color: c.textoSuave, fontSize: fs(12) }]}>
              {nuevaEtiqueta.length}/20
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.fondoAlto }]}
                onPress={handleCancelar}
              >
                <Text style={[styles.modalButtonText, { color: c.textoSuave, fontSize: fs(14) }]}>
                  {texto.cal_cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.primario }]}
                onPress={handleCrear}
              >
                <Text style={[styles.modalButtonText, { color: c.fondo, fontSize: fs(14) }]}>
                  {texto.add_submit}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontWeight: '600',
  },
  busquedaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  busquedaInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  busquedaClose: {
    padding: 8,
  },
  etiquetasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  etiqueta: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  etiquetaTexto: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    padding: 16,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalCounter: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    fontWeight: '600',
  },
});
