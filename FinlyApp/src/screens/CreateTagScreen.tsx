import { useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useNameDuplicateCheck } from '../hooks/useNameDuplicateCheck';
import { useDeferredRefresh } from '../hooks/useDeferredRefresh';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { type NavigationProp, USER_ID, MAX_TAG_NAME_LENGTH, MAX_TAGS } from '../constants/types';
import { countAtLimit } from '../utils/limits';
import { getNameHintText, joinHints } from '../utils/formHints';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormActions from '../components/form/FormActions';
import { CARD_BORDER_RADIUS } from '../components/componentStyles';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';

export default function CreateTagScreen() {
  const { activeColors: c } = useConfig();
  const labels = t();
  const navigation = useNavigation<NavigationProp<'CreateTag'>>();
  const { refreshTags, tags } = useApp();

  const deferredRefreshTags = useDeferredRefresh(refreshTags);

  const [name, setName] = useState('');

  const { nameError, checkingName, handleNameChange } = useNameDuplicateCheck({
    existsByName: (value, excludeId) => tagRepository.existsByName(USER_ID, value, excludeId),
    resolveDefaultEnglishName: () => null,
    duplicateErrorKey: labels.create_tag_error_duplicate,
  });

  const handleCreate = async () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed || nameError || checkingName) return;
    await runWithErrorAlert(async () => {
      await tagRepository.create({ user_id: USER_ID, name: trimmed });
      navigation.goBack();
      deferredRefreshTags();
    }, ERROR_PREFIXES.tagCreate);
  };

  const isEmpty = !name.trim();
  const atTagLimit = countAtLimit(tags.length, MAX_TAGS);
  const isDisabled = isEmpty || !!nameError || checkingName || atTagLimit;

  // One red line above Save: every reason the tag cannot be created.
  const hintText = joinHints([
    getNameHintText(name, nameError, labels.create_tag_error_empty),
    atTagLimit ? labels.create_tag_error_limit(MAX_TAGS) : null,
  ]);

  return (
    <ScreenShell>
      <View style={styles.content}>
        <LabeledTextField
          placeholder={labels.create_tag_name_placeholder}
          value={name}
          onChangeText={(v) => handleNameChange(v, setName)}
          autoFocus
          maxLength={MAX_TAG_NAME_LENGTH}
          returnKeyType="done"
          error={isEmpty ? labels.create_tag_error_empty : nameError}
          showCounter
          counterStyle={styles.counter}
          inputStyle={styles.input}
        />

        <FormActions saveHint={hintText}>
          <PrimaryButton
            label={labels.create_tag_button}
            onPress={handleCreate}
            disabled={isDisabled}
            enabledTextColor={c.background}
            disabledBg={c.surface}
            disabledTextColor={c.textSecondary}
          />
        </FormActions>
      </View>
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
    borderRadius: CARD_BORDER_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontWeight: '500',
  },
  counter: {
    marginTop: 6,
    marginBottom: 12,
  },
});
