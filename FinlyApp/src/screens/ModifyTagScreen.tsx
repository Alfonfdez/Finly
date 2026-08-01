import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { RootStackParamList, USER_ID, MAX_TAG_NAME_LENGTH } from '../constants/types';
import ConfirmationModal from '../components/ConfirmationModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModifyTag'>;
type ModifyTagRouteProp = RouteProp<RootStackParamList, 'ModifyTag'>;

export default function ModifyTagScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ModifyTagRouteProp>();
  const { tags, refreshTags } = useApp();
  const { tagId } = route.params;

  const tag = useMemo(
    () => tags.find(t => t.id === tagId),
    [tags, tagId]
  );

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const userEditedRef = useRef(false);

  useEffect(() => {
    if (tag && !userEditedRef.current) {
      setName(tag.name);
      setNameError(null);
    }
  }, [tag]);

  const checkNameDuplicate = useCallback(async (value: string) => {
    if (!value.trim()) {
      setNameError(null);
      setCheckingName(false);
      return;
    }
    setCheckingName(true);
    try {
      const exists = await tagRepository.existsByName(USER_ID, value.trim(), tagId);
      setNameError(exists ? labels.create_tag_error_duplicate : null);
    } finally {
      setCheckingName(false);
    }
  }, [labels.create_tag_error_duplicate, tagId]);

  const debouncedCheck = useUniqueNameCheck(checkNameDuplicate);

  const handleNameChange = (text: string) => {
    userEditedRef.current = true;
    setName(text);
    setNameError(null);
    debouncedCheck(text);
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed || nameError || checkingName) return;

    await tagRepository.update(tagId, { name: trimmed });
    await refreshTags();
    navigation.goBack();
  };

  const handleDelete = async () => {
    await tagRepository.delete(tagId);
    await refreshTags();
    navigation.goBack();
  };

  const isEmpty = !name.trim();
  const isDisabled = isEmpty || !!nameError || checkingName;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <TextInput
          style={[styles.input, { backgroundColor: c.surface, borderColor: nameError ? c.red : c.border, color: c.text, fontSize: fs(15) }]}
          value={name}
          onChangeText={handleNameChange}
          placeholder={labels.create_tag_name_placeholder}
          placeholderTextColor={c.textSecondary}
          maxLength={MAX_TAG_NAME_LENGTH}
          returnKeyType="done"
        />
        <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(12) }]}>
          {name.length}/{MAX_TAG_NAME_LENGTH}
        </Text>

        {nameError ? (
          <Text style={[styles.error, { color: c.red, fontSize: fs(13) }]}>{nameError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: c.red }]}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Ionicons name="trash-outline" size={18} color={c.red} />
          <Text style={[styles.deleteButtonText, { color: c.red, fontSize: fs(15) }]}>
            {labels.modify_tag_delete}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDisabled ? c.surface : c.primary }]}
          onPress={handleSave}
          disabled={isDisabled}
        >
          <Text style={[styles.buttonText, { color: isDisabled ? c.textSecondary : c.background, fontSize: fs(15) }]}>
            {labels.modify_tag_save}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.modify_tag_delete_confirm_title(tag?.name ?? '')}
        message={labels.modify_tag_delete_confirm_message}
        confirmLabel={labels.modify_tag_delete_confirm_delete}
        cancelLabel={labels.modify_tag_delete_confirm_cancel}
        onConfirm={() => {
          setDeleteModalVisible(false);
          handleDelete();
        }}
        onCancel={() => setDeleteModalVisible(false)}
      />
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontWeight: '500',
  },
  counter: {
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 12,
  },
  error: {
    marginBottom: 12,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  deleteButtonText: {
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});
