import { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { useDeferredRefresh } from '../hooks/useDeferredRefresh';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { type RootStackParamList, type NavigationProp, USER_ID, MAX_TAG_NAME_LENGTH } from '../constants/types';
import ConfirmationModal from '../components/ConfirmationModal';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormError from '../components/form/FormError';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
import DeleteButton from '../components/form/DeleteButton';

type ModifyTagRouteProp = RouteProp<RootStackParamList, 'ModifyTag'>;

export default function ModifyTagScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'ModifyTag'>>();
  const route = useRoute<ModifyTagRouteProp>();
  const { tags, refreshTags } = useApp();
  const { tagId } = route.params;

  const deferredRefreshTags = useDeferredRefresh(refreshTags);

  const tag = useMemo(
    () => tags.find(t => t.id === tagId),
    [tags, tagId]
  );

  const [name, setName] = useState('');
  const userEditedRef = useRef(false);

  const { nameError, checkingName, clearNameError, handleNameChange } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => tagRepository.existsByName(USER_ID, value, excludeId),
    resolveDefaultEnglishName: () => null,
    duplicateErrorKey: labels.create_tag_error_duplicate,
    excludeId: tagId,
  });

  useEffect(() => {
    if (tag && !userEditedRef.current) {
      setName(tag.name);
      clearNameError();
    }
  }, [tag, clearNameError]);

  const handleNameChangeLocal = (text: string) => {
    userEditedRef.current = true;
    handleNameChange(text, setName);
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed || nameError || checkingName) return;

    await runWithErrorAlert(async () => {
      await tagRepository.update(tagId, { name: trimmed });
      navigation.goBack();
      deferredRefreshTags();
    }, ERROR_PREFIXES.tagUpdate);
  };

  const { visible: deleteModalVisible, open: openDeleteModal, close: closeDeleteModal, confirm: confirmDelete } = useDeleteConfirmation({
    deleteFn: () => tagRepository.delete(tagId),
    onSuccess: async () => {
      navigation.goBack();
      deferredRefreshTags();
    },
    errorPrefix: ERROR_PREFIXES.tagDelete,
  });

  const isEmpty = !name.trim();
  const isDisabled = isEmpty || !!nameError || checkingName;

  return (
    <ScreenShell>
      <View style={styles.content}>
        <LabeledTextField
          placeholder={labels.create_tag_name_placeholder}
          value={name}
          onChangeText={handleNameChangeLocal}
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
          onPress={openDeleteModal}
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
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
