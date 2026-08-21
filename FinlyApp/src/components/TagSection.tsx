import { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { t } from '../i18n';
import type { Tag } from '../database/types';
import { DEBOUNCE_MS, MAX_TAG_NAME_LENGTH, MAX_TAGS } from '../constants/types';
import { countAtLimit } from '../utils/limits';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import PrimaryButton from './form/PrimaryButton';

interface Props {
  tags: Tag[];
  selectedTags: number[];
  onToggle: (id: number) => void;
  onCreate: (name: string) => Promise<boolean>;
}

export default function TagSection({ tags, selectedTags, onToggle, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const filteredTags = useMemo(() => tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  ), [tags, search]);

  const checkDuplicate = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('');
      return;
    }
    const exists = tags.some(t => t.name.toLowerCase() === trimmed.toLowerCase());
    setError(exists ? labels.add_tag_error_duplicate : '');
  }, [tags, labels.add_tag_error_duplicate]);

  const debouncedCheck = useDebouncedCallback(checkDuplicate, DEBOUNCE_MS);

  const handleNameChange = (text: string) => {
    setNewTag(text);
    setError('');
    debouncedCheck(text);
  };

  const handleCreate = async () => {
    const name = newTag.trim();
    if (!name || error) return;
    const success = await onCreate(name);
    if (success) {
      setNewTag('');
      setError('');
      setModalVisible(false);
    }
  };

  const handleCancel = () => {
    setNewTag('');
    setError('');
    setModalVisible(false);
  };

  const isDisabled = !newTag.trim() || !!error;
  const atTagLimit = countAtLimit(tags.length, MAX_TAGS);

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
        {!atTagLimit && (
          <TouchableOpacity
            style={[styles.tag, { backgroundColor: c.surface }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.tagText, { color: c.primary, fontSize: fs(13) }]}>
              + {labels.add_tag_new}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ModalShell
        visible={modalVisible}
        onClose={handleCancel}
        maxWidth={380}
        padding={16}
        overlayPadding={24}
        backgroundColor={c.background}
      >
        <ModalHeader title={labels.add_tag_modal_title} />
        <TextInput
          style={[styles.modalInput, { backgroundColor: c.surface, color: c.text, fontSize: fs(14), borderColor: error ? c.red : c.border }]}
          placeholder={labels.add_tag_name_placeholder}
          placeholderTextColor={c.textSecondary}
          value={newTag}
          onChangeText={handleNameChange}
          maxLength={MAX_TAG_NAME_LENGTH}
        />
        <Text style={[styles.modalCounter, { color: c.textSecondary, fontSize: fs(12) }]}>
          {newTag.length}/{MAX_TAG_NAME_LENGTH}
        </Text>
        {error ? (
          <Text style={[styles.modalError, { color: c.red, fontSize: fs(13) }]}>
            {error}
          </Text>
        ) : null}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: c.surface }]}
            onPress={handleCancel}
          >
            <Text style={[styles.modalButtonText, { color: c.textSecondary, fontSize: fs(14) }]}>
              {labels.cal_cancel}
            </Text>
          </TouchableOpacity>
          <PrimaryButton
            label={labels.add_submit}
            onPress={handleCreate}
            disabled={isDisabled}
            enabledTextColor={c.background}
            disabledBg={c.surface}
            disabledTextColor={c.textSecondary}
            style={styles.modalButton}
          />
        </View>
      </ModalShell>
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
  modalInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalCounter: {
    marginBottom: 4,
  },
  modalError: {
    marginBottom: 12,
    fontWeight: '500',
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
