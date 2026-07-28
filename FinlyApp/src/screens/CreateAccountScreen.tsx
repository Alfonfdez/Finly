import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Keyboard, LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDefaultAccountIdByName, getDefaultEnglishAccountName } from '../i18n';
import { isAndroid } from '../utils/platform';
import { accountRepository } from '../database';
import { RootStackParamList } from '../constants/types';
import { ACCOUNT_ICONS } from '../constants/accountIcons';
import ColorGrid, { QUICK_COLORS } from '../components/ColorGrid';
import ColorPickerModal from '../components/ColorPickerModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateAccount'>;

const MAX_NAME_LENGTH = 30;
const MAX_NOTE_LENGTH = 200;
const GRID_COLS = 4;
const GRID_GAP = 12;

export default function CreateAccountScreen() {
  const { activeColors: c, config } = useConfig();
  const { refreshAccounts } = useApp();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const round = config.accountIconShape === 'circle';

  const [cellSize, setCellSize] = useState(0);

  const onGridLayout = (e: LayoutChangeEvent) => {
    const gridWidth = e.nativeEvent.layout.width;
    setCellSize(Math.floor((gridWidth - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS));
  };

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [checkingName, setCheckingName] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkNameDuplicate(value), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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
    if (!canCreate) return;
    try {
      await accountRepository.create({
        user_id: 1,
        name: name.trim(),
        icon: selectedIcon!,
        color: selectedColor!,
        initial_balance: 0,
        description: description.trim(),
      });
      await refreshAccounts();
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create account:', err);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (!QUICK_COLORS.includes(color)) {
      setCustomColor(color);
    }
  };

  const hintText = getHintText();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_account_name}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: c.surface,
                color: c.text,
                borderColor: nameError ? c.red : c.border,
                fontSize: fs(14),
              },
            ]}
            placeholder={labels.create_account_name}
            placeholderTextColor={c.textSecondary}
            value={name}
            onChangeText={handleNameChange}
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
            {name.length}/{MAX_NAME_LENGTH}
          </Text>

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_account_symbols}
          </Text>
          <View style={styles.grid} onLayout={onGridLayout}>
            {cellSize > 0 && ACCOUNT_ICONS.map((icon) => {
              const isSelected = selectedIcon === icon;
              const iconColor = isSelected && selectedColor ? selectedColor : (isSelected ? c.primary : c.textSecondary);
              const bgColor = isSelected && selectedColor ? selectedColor + '33' : (isSelected ? c.primary + '33' : c.surface);
              const borderColor = isSelected ? (selectedColor || c.primary) : 'transparent';
              return (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.gridItem,
                    { width: cellSize, height: cellSize, borderRadius: round ? 999 : 12 },
                    { backgroundColor: bgColor },
                    isSelected && { borderWidth: 2, borderColor },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                  accessibilityLabel={icon}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Ionicons name={icon as any} size={24} color={iconColor} />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_account_color}
          </Text>
          <ColorGrid
            selectedColor={selectedColor}
            customColor={customColor}
            onSelect={handleColorSelect}
            onOpenPicker={() => setColorPickerVisible(true)}
          />

          <ColorPickerModal
            visible={colorPickerVisible}
            selectedColor={selectedColor}
            onSelect={(color) => {
              handleColorSelect(color);
            }}
            onClose={() => setColorPickerVisible(false)}
          />

          <Text style={[styles.sectionTitle, { color: c.text, fontSize: fs(14) }]}>
            {labels.create_account_note}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: c.surface,
                color: c.text,
                borderColor: c.border,
                fontSize: fs(14),
              },
            ]}
            value={description}
            onChangeText={(value) => {
              if (value.length <= MAX_NOTE_LENGTH) setDescription(value);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(11) }]}>
            {description.length}/{MAX_NOTE_LENGTH}
          </Text>

          {hintText && (
            <Text style={[styles.hint, { color: c.red, fontSize: fs(12) }]}>
              {hintText}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: canCreate ? c.primary : c.textSecondary },
            ]}
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: fs(15) }]}>
              {labels.create_account_button}
            </Text>
          </TouchableOpacity>

          {isAndroid && <View style={styles.keyboardSpacer} />}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  textArea: {
    minHeight: 80,
  },
  counter: {
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  keyboardSpacer: {
    height: 200,
  },
});
