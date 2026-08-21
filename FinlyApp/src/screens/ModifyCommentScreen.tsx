import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { transactionRepository } from '../database';
import { type RootStackParamList, type NavigationProp, MAX_COMMENT_LENGTH } from '../constants/types';
import ConfirmationModal from '../components/ConfirmationModal';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormError from '../components/form/FormError';
import DeleteButton from '../components/form/DeleteButton';
import { showErrorAlert } from '../utils/errors';

type ModifyCommentRouteProp = RouteProp<RootStackParamList, 'ModifyComment'>;

export default function ModifyCommentScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'ModifyComment'>>();
  const route = useRoute<ModifyCommentRouteProp>();

  const originalComment = route.params.comment;
  const [comment, setComment] = useState(originalComment);
  const [count, setCount] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    let active = true;
    transactionRepository.countByDescription(originalComment).then(n => {
      if (active) setCount(n);
    }).catch(console.error);
    return () => {
      active = false;
    };
  }, [originalComment]);

  const trimmed = comment.trim();
  const isEmpty = !trimmed;
  const isUnchanged = trimmed === originalComment;
  const isDisabled = isEmpty || isUnchanged;

  const handleSave = async () => {
    Keyboard.dismiss();
    if (isDisabled) return;
    try {
      await transactionRepository.updateComment(originalComment, trimmed);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update comment:', err);
      showErrorAlert(labels);
    }
  };

  const handleDelete = async () => {
    setDeleteModalVisible(false);
    try {
      await transactionRepository.deleteComment(originalComment);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      showErrorAlert(labels);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.content}>
        <LabeledTextField
          label={labels.add_comment}
          placeholder={labels.add_comment}
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={MAX_COMMENT_LENGTH}
          autoFocus
          error={isEmpty}
          showCounter
          counterFontSize={fs(12)}
          counterStyle={styles.counter}
          inputStyle={styles.input}
        />

        <FormError message={isEmpty ? labels.comments_error_empty : null} style={styles.error} />

        <DeleteButton
          label={labels.comments_delete}
          onPress={() => setDeleteModalVisible(true)}
          style={styles.deleteButton}
        />

        <PrimaryButton
          label={labels.comments_save}
          onPress={handleSave}
          disabled={isDisabled}
          enabledTextColor={c.background}
          disabledBg={c.surface}
          disabledTextColor={c.textSecondary}
          style={styles.button}
        />

        <Text style={[styles.mergeHint, { color: c.textSecondary, fontSize: fs(12) }]}>
          {labels.comments_merge_hint}
        </Text>
      </View>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.comments_delete_confirm_title}
        message={labels.comments_delete_confirm_message(count)}
        confirmLabel={labels.comments_delete_confirm_delete}
        cancelLabel={labels.comments_delete_confirm_cancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
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
  mergeHint: {
    marginTop: 12,
    textAlign: 'center',
  },
});
