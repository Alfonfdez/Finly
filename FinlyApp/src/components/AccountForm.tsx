import { Text, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { MAX_ACCOUNT_NAME_LENGTH, MAX_NOTE_LENGTH, type ConfigIconShape, type IconName } from '../constants/types';
import IconColorSection from './IconColorSection';
import LabeledTextField from './form/LabeledTextField';
import PrimaryButton from './form/PrimaryButton';
import FormError from './form/FormError';
import DeleteButton from './form/DeleteButton';
import FormScrollView from './form/FormScrollView';
import AmountInput from './AmountInput';
import { BUTTON_BORDER_RADIUS } from './componentStyles';

interface AccountFormProps {
  nameLabel: string;
  name: string;
  onNameChange: (value: string) => void;
  nameErrorDisplay: string | null;
  showNameField: boolean;
  nameDisabled?: boolean;
  icons: readonly IconName[];
  iconShape: ConfigIconShape;
  symbolTitle: string;
  colorTitle: string;
  selectedIcon: string | null;
  onSelectIcon: (icon: string) => void;
  selectedColor: string | null;
  customColor: string | null;
  onSelectColor: (color: string) => void;
  showInitialBalance?: boolean;
  initialBalanceLabel?: string;
  initialBalanceA11yLabel?: string;
  initialBalanceRaw?: string;
  onInitialBalanceChange?: (value: string) => void;
  noteLabel: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  hintText: string | null;
  submitLabel: string;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
  deleteLabel?: string;
  onDeletePress?: () => void;
  deleteDisabled?: boolean;
  deleteLastHint?: string | null;
}

export default function AccountForm({
  nameLabel,
  name,
  onNameChange,
  nameErrorDisplay,
  showNameField,
  nameDisabled = false,
  icons,
  iconShape,
  symbolTitle,
  colorTitle,
  selectedIcon,
  onSelectIcon,
  selectedColor,
  customColor,
  onSelectColor,
  showInitialBalance = false,
  initialBalanceLabel,
  initialBalanceA11yLabel,
  initialBalanceRaw = '',
  onInitialBalanceChange,
  noteLabel,
  description,
  onDescriptionChange,
  hintText,
  submitLabel,
  isSubmitDisabled,
  onSubmit,
  deleteLabel,
  onDeletePress,
  deleteDisabled,
  deleteLastHint,
}: AccountFormProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <FormScrollView>
      {showNameField && (
        <LabeledTextField
          label={nameLabel}
          placeholder={nameLabel}
          value={name}
          onChangeText={onNameChange}
          maxLength={MAX_ACCOUNT_NAME_LENGTH}
          autoCapitalize="words"
          autoCorrect={false}
          error={nameErrorDisplay}
          showCounter
          editable={!nameDisabled}
          inputStyle={nameDisabled ? { color: c.textSecondary } : undefined}
        />
      )}

      <IconColorSection
        icons={icons}
        shape={iconShape}
        symbolTitle={symbolTitle}
        colorTitle={colorTitle}
        selectedIcon={selectedIcon}
        onSelectIcon={onSelectIcon}
        selectedColor={selectedColor}
        customColor={customColor}
        onSelectColor={onSelectColor}
      />

      {showInitialBalance && (
        <AmountInput
          raw={initialBalanceRaw}
          onChangeRaw={onInitialBalanceChange ?? (() => {})}
          label={initialBalanceLabel}
          accessibilityLabel={initialBalanceA11yLabel}
        />
      )}

      <LabeledTextField
        label={noteLabel}
        value={description}
        onChangeText={onDescriptionChange}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        maxLength={MAX_NOTE_LENGTH}
        showCounter
      />

      <FormError message={hintText} fontSize={fs(12)} style={styles.hint} />

      {deleteLabel && onDeletePress && (
        <>
          <DeleteButton
            label={deleteLabel}
            onPress={onDeletePress}
            disabled={deleteDisabled}
            style={styles.deleteButton}
          />

          {deleteLastHint && (
            <Text style={[styles.hint, { color: c.textSecondary, fontSize: fs(12) }]}>
              {deleteLastHint}
            </Text>
          )}
        </>
      )}

      <PrimaryButton
        label={submitLabel}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
        style={styles.button}
      />
    </FormScrollView>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: 16,
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  button: {
    marginTop: 16,
  },
});
