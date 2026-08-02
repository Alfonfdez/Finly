import { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useUniqueNameCheck } from '../hooks/useUniqueNameCheck';
import { useColorSelection } from '../hooks/useColorSelection';
import { t, getDefaultAccountIdByName, getDefaultEnglishAccountName } from '../i18n';
import { accountRepository } from '../database';
import { type RootStackParamList, USER_ID, MAX_ACCOUNT_NAME_LENGTH, MAX_NOTE_LENGTH } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import IconGrid from '../components/IconGrid';
import ColorGrid from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';
import SectionTitle from '../components/form/SectionTitle';
import LabeledTextField from '../components/form/LabeledTextField';
import PrimaryButton from '../components/form/PrimaryButton';
import FormError from '../components/form/FormError';
import KeyboardSpacer from '../components/form/KeyboardSpacer';
import FormScrollView from '../components/form/FormScrollView';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateAccount'>;

export default function CreateAccountScreen() {
  const { activeColors: c, config } = useConfig();
  const { refreshAccounts } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [checkingName, setCheckingName] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const { selectedColor, customColor, handleColorSelect } = useColorSelection();

  const checkNameDuplicate = useCallback(async (value: string) => {
    if (!value.trim()) {
      setNameError(null);
      setCheckingName(false);
      return;
    }
    setCheckingName(true);
    try {
      const defaultId = getDefaultAccountIdByName(value.trim());
      if (defaultId !== null) {
        const englishName = getDefaultEnglishAccountName(defaultId);
        if (englishName) {
          const defaultExists = await accountRepository.existsByName(englishName);
          if (defaultExists) {
            setNameError(labels.create_account_error_duplicate);
            return;
          }
        }
      }
      const exists = await accountRepository.existsByName(value.trim());
      setNameError(exists ? labels.create_account_error_duplicate : null);
    } catch {
      setNameError(null);
    } finally {
      setCheckingName(false);
    }
  }, [labels.create_account_error_duplicate]);

  const debouncedCheck = useUniqueNameCheck(checkNameDuplicate);

  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(null);
    debouncedCheck(value);
  };

  const canCreate = name.trim().length > 0 && !nameError && !checkingName && selectedIcon !== null && selectedColor !== null;

  const getHintText = (): string | null => {
    if (name.trim().length === 0) return labels.create_account_error_empty;
    if (nameError) return nameError;
    if (!selectedIcon && !selectedColor) return labels.create_account_error_icon_color;
    if (!selectedIcon) return labels.create_account_error_icon;
    if (!selectedColor) return labels.create_account_error_color;
    return null;
  };

  const handleCreate = async () => {
    if (!canCreate || selectedIcon === null || selectedColor === null) return;
    try {
      await accountRepository.create({
        user_id: USER_ID,
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        initial_balance: 0,
        description: description.trim(),
      });
      await refreshAccounts();
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create account:', err);
    }
  };

  const hintText = getHintText();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <FormScrollView>
          <LabeledTextField
            label={labels.create_account_name}
            placeholder={labels.create_account_name}
            value={name}
            onChangeText={handleNameChange}
            maxLength={MAX_ACCOUNT_NAME_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
            error={nameError}
            showCounter
          />

          <SectionTitle text={labels.create_account_symbols} />
          <IconGrid
            icons={ACCOUNT_ICONS}
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            shape={config.accountIconShape}
            onSelect={setSelectedIcon}
          />

          <SectionTitle text={labels.create_account_color} />
          <ColorGrid
            selectedColor={selectedColor}
            customColor={customColor}
            onSelect={handleColorSelect}
            onOpenPicker={() => setColorPickerVisible(true)}
          />

          <ColorPickerModal
            visible={colorPickerVisible}
            selectedColor={selectedColor}
            onSelect={handleColorSelect}
            onClose={() => setColorPickerVisible(false)}
          />

          <LabeledTextField
            label={labels.create_account_note}
            value={description}
            onChangeText={(value) => {
              if (value.length <= MAX_NOTE_LENGTH) setDescription(value);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={MAX_NOTE_LENGTH}
            showCounter
          />

          <FormError message={hintText} fontSize={fs(12)} style={styles.hint} />

          <PrimaryButton
            label={labels.create_account_button}
            onPress={handleCreate}
            disabled={!canCreate}
            style={styles.button}
          />

          <KeyboardSpacer />
        </FormScrollView>
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
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});
