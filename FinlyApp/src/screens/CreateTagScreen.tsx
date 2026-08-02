import { useState, useCallback } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { type RootStackParamList, USER_ID, MAX_TAG_NAME_LENGTH } from '../constants/types';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormError from '../components/form/FormError';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTag'>;

export default function CreateTagScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const { refreshTags } = useApp();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  const checkNameDuplicate = useCallback(async (value: string) => {
    if (!value.trim()) {
      setNameError(null);
      setCheckingName(false);
      return;
    }
    setCheckingName(true);
    try {
      const exists = await tagRepository.existsByName(USER_ID, value.trim());
      setNameError(exists ? labels.create_tag_error_duplicate : null);
    } finally {
      setCheckingName(false);
    }
  }, [labels.create_tag_error_duplicate]);

  const debouncedCheck = useUniqueNameCheck(checkNameDuplicate);

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError(null);
    debouncedCheck(text);
  };

  const handleCreate = async () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed || nameError || checkingName) return;

    await tagRepository.create({ user_id: USER_ID, name: trimmed });
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
          autoFocus
          maxLength={MAX_TAG_NAME_LENGTH}
          returnKeyType="done"
          error={nameError}
          showCounter
          counterFontSize={fs(12)}
          counterStyle={styles.counter}
          inputStyle={styles.input}
        />

        <FormError message={nameError} style={styles.error} />

        <PrimaryButton
          label={labels.create_tag_button}
          onPress={handleCreate}
          disabled={isDisabled}
          enabledTextColor={c.background}
          disabledBg={c.surface}
          disabledTextColor={c.textSecondary}
          style={styles.button}
        />
      </View>
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
  button: {
    borderRadius: 12,
  },
});
