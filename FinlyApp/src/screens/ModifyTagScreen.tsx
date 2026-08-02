import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { type RootStackParamList, USER_ID, MAX_TAG_NAME_LENGTH } from '../constants/types';
import ConfirmationModal from '../components/ConfirmationModal';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormError from '../components/form/FormError';
import DeleteButton from '../components/form/DeleteButton';

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
        <LabeledTextField
          placeholder={labels.create_tag_name_placeholder}
          value={name}
          onChangeText={handleNameChange}
          maxLength={MAX_TAG_NAME_LENGTH}
          returnKeyType="done"
          error={nameError}
          showCounter
          counterFontSize={fs(12)}
          counterStyle={styles.counter}
          inputStyle={styles.input}
        />

        <FormError message={nameError} style={styles.error} />

        <DeleteButton
          label={labels.modify_tag_delete}
          onPress={() => setDeleteModalVisible(true)}
          style={styles.deleteButton}
        />

        <PrimaryButton
          label={labels.modify_tag_save}
          onPress={handleSave}
          disabled={isDisabled}
          enabledTextColor={c.background}
          disabledBg={c.surface}
          disabledTextColor={c.textSecondary}
          style={styles.button}
        />
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontWeight: '500',
  },
  counter: {
    marginTop: 6,
    marginBottom: 12,
  },
  error: {
    marginBottom: 12,
    fontWeight: '500',
  },
  deleteButton: {
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
  },
});
