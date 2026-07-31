import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';
import { tagRepository } from '../database';
import { RootStackParamList } from '../constants/types';

const USER_ID = 1;
const MAX_NAME_LENGTH = 20;

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
    const exists = await tagRepository.existsByName(USER_ID, value.trim());
    setNameError(exists ? labels.create_tag_error_duplicate : null);
    setCheckingName(false);
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
        <TextInput
          style={[styles.input, { backgroundColor: c.surface, borderColor: nameError ? c.red : c.border, color: c.text, fontSize: fs(15) }]}
          value={name}
          onChangeText={handleNameChange}
          placeholder={labels.create_tag_name_placeholder}
          placeholderTextColor={c.textSecondary}
          autoFocus
          maxLength={MAX_NAME_LENGTH}
          returnKeyType="done"
        />
        <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(12) }]}>
          {name.length}/{MAX_NAME_LENGTH}
        </Text>

        {nameError ? (
          <Text style={[styles.error, { color: c.red, fontSize: fs(13) }]}>{nameError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDisabled ? c.surface : c.primary }]}
          onPress={handleCreate}
          disabled={isDisabled}
        >
          <Text style={[styles.buttonText, { color: isDisabled ? c.textSecondary : c.background, fontSize: fs(15) }]}>
            {labels.create_tag_button}
          </Text>
        </TouchableOpacity>
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
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});
