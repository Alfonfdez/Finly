import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Tag {
  id: number;
  name: string;
}

interface Props {
  tags: Tag[];
  selectedTags: number[];
  onToggle: (id: number) => void;
  onCreate: (nombre: string) => void;
}

export default function TagSection({ tags, selectedTags, onToggle, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (newTag.trim().length > 0) {
      onCreate(newTag.trim());
      setNewTag('');
      setModalVisible(false);
    }
  };

  const handleCancel = () => {
    setNewTag('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>
          {labels.add_tags}
        </Text>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          accessibilityLabel={labels.add_tag_search}
        >
          <Ionicons name="search-outline" size={20} color={c.primary} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: c.surface, color: c.text, fontSize: fs(14) }]}
            placeholder={labels.add_tag_search}
            placeholderTextColor={c.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={styles.searchClose}
            onPress={() => {
              setSearch('');
              setShowSearch(false);
            }}
          >
            <Ionicons name="close" size={16} color={c.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tagsContainer}>
        {filteredTags.map(tag => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tag,
              { backgroundColor: selectedTags.includes(tag.id) ? c.primary : c.surface },
            ]}
            onPress={() => onToggle(tag.id)}
          >
            <Text
              style={[
                styles.tagText,
                { color: selectedTags.includes(tag.id) ? c.background : c.text, fontSize: fs(13) },
              ]}
            >
              {tag.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.tag, { backgroundColor: c.surface }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.tagText, { color: c.primary, fontSize: fs(13) }]}>
            + {labels.add_tag_new}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: c.background }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(18) }]}>
              {labels.add_tag_modal_title}
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: c.surface, color: c.text, fontSize: fs(14) }]}
              placeholder={labels.add_tag_name_placeholder}
              placeholderTextColor={c.textSecondary}
              value={newTag}
              onChangeText={setNewTag}
              maxLength={20}
            />
            <Text style={[styles.modalCounter, { color: c.textSecondary, fontSize: fs(12) }]}>
              {newTag.length}/20
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.surface }]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, { color: c.textSecondary, fontSize: fs(14) }]}>
                  {labels.cal_cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.primary }]}
                onPress={handleCreate}
              >
                <Text style={[styles.modalButtonText, { color: c.background, fontSize: fs(14) }]}>
                  {labels.add_submit}
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
  title: {
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchClose: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
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
