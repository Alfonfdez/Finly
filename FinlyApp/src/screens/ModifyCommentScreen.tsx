import { useState, useEffect } from 'react';
import { Text, StyleSheet, Keyboard } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { useKeyboardReveal } from '../hooks/useKeyboardReveal';
import { t } from '../i18n';
import { transactionRepository } from '../database';
import { type RootStackParamList, type NavigationProp, MAX_COMMENT_LENGTH } from '../constants/types';
import ConfirmationModal from '../components/ConfirmationModal';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormActions from '../components/form/FormActions';
import FormScrollView from '../components/form/FormScrollView';
import { CARD_BORDER_RADIUS } from '../components/componentStyles';
import { ERROR_PREFIXES, runWithErrorAlert, showErrorAlert } from '../utils/errors';

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

  // The multiline field is at the top; the reveal keeps the Save button above the keyboard
  // on short screens without moving the field off-screen.
  const { scrollRef, onBottomFieldFocus, onBottomFieldBlur, onScrollLayout } = useKeyboardReveal();

  useEffect(() => {
    let active = true;
    transactionRepository.countByDescription(originalComment).then(n => {
      if (active) setCount(n);
    }).catch(() => showErrorAlert());
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
    await runWithErrorAlert(async () => {
      await transactionRepository.updateComment(originalComment, trimmed);
      navigation.goBack();
    }, ERROR_PREFIXES.commentUpdate);
  };

  const { visible: deleteModalVisible, open: openDeleteModal, close: closeDeleteModal, confirm: confirmDelete } = useDeleteConfirmation({
    deleteFn: () => transactionRepository.deleteComment(originalComment),
    onSuccess: () => navigation.goBack(),
    errorPrefix: ERROR_PREFIXES.commentDelete,
  });

  return (
    <ScreenShell>
      <FormScrollView scrollRef={scrollRef} onLayout={onScrollLayout}>
        <LabeledTextField
          label={labels.add_comment}
          placeholder={labels.add_comment}
          value={comment}
          onChangeText={setComment}
          multiline
          textAlignVertical="top"
          maxLength={MAX_COMMENT_LENGTH}
          autoFocus
          error={isEmpty}
          showCounter
          inlineCounter
          inputStyle={styles.input}
          onFocus={onBottomFieldFocus}
          onBlur={onBottomFieldBlur}
        />

        <FormActions
          deleteLabel={labels.delete}
          onDeletePress={openDeleteModal}
          saveHint={isEmpty ? labels.comments_error_empty : ''}
        >
          <PrimaryButton
            label={labels.comments_save}
            onPress={handleSave}
            disabled={isDisabled}
            enabledTextColor={c.background}
            disabledBg={c.surface}
            disabledTextColor={c.textSecondary}
          />
        </FormActions>

        <Text style={[styles.mergeHint, { color: c.textSecondary, fontSize: fs(12) }]}>
          {labels.comments_merge_hint}
        </Text>
      </FormScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.comments_delete_confirm_title}
        message={labels.comments_delete_confirm_message(count)}
        confirmLabel={labels.comments_delete_confirm_delete}
        cancelLabel={labels.comments_delete_confirm_cancel}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: CARD_BORDER_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontWeight: '500',
  },
  mergeHint: {
    marginTop: 12,
    textAlign: 'center',
  },
});
