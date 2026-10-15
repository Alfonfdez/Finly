import { Text, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useKeyboardReveal } from '../hooks/useKeyboardReveal';
import { MAX_ACCOUNT_NAME_LENGTH, MAX_NOTE_LENGTH, type ConfigIconShape, type IconName } from '../constants/types';
import IconColorSection from './IconColorSection';
import LabeledTextField from './form/LabeledTextField';
import PrimaryButton from './form/PrimaryButton';
import FormHintSlot from './form/FormHintSlot';
import DeleteButton from './form/DeleteButton';
import FormScrollView from './form/FormScrollView';
import AmountInput from './AmountInput';

interface AccountFormProps {
  nameLabel: string;
  name: string;
  onNameChange: (value: string) => void;
  /** The duplicate-name message (or null) — the empty case comes from `nameEmptyError`. */
  nameError: string | null;
  /** Shown when the name is blank; the red border waits for the field to be touched. */
  nameEmptyError: string;
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
  /** Muted explanation for a disabled Delete; shown directly above the button. */
  deleteLastHint?: string | null;
}

export default function AccountForm({
  nameLabel,
  name,
  onNameChange,
  nameError,
  nameEmptyError,
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
  // The Note is the bottom-most field, so focusing it scrolls the form to keep the
  // submit button (below it) above the keyboard.
  const { scrollRef, onBottomFieldFocus, onBottomFieldBlur, onScrollLayout } = useKeyboardReveal();

  const hasDelete = !!(deleteLabel && onDeletePress);
  const nameValidationError = nameDisabled ? null : name.trim() === '' ? nameEmptyError : nameError;

  return (
    <FormScrollView scrollRef={scrollRef} onLayout={onScrollLayout}>
      {showNameField && (
        <LabeledTextField
          label={nameLabel}
          placeholder={nameLabel}
          value={name}
          onChangeText={onNameChange}
          maxLength={MAX_ACCOUNT_NAME_LENGTH}
          autoCapitalize="words"
          autoCorrect={false}
          error={nameValidationError}
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
        onFocus={onBottomFieldFocus}
        onBlur={onBottomFieldBlur}
      />

      {/* Disabled-Delete explanation (muted), then Delete, then the reserved
          "why you can't save" slot, then Save. */}
      {hasDelete && (
        <>
          {deleteLastHint != null && (
            <Text style={[styles.deleteLastHint, { color: c.textSecondary, fontSize: fs(12) }]}>
              {deleteLastHint}
            </Text>
          )}

          <DeleteButton
            label={deleteLabel as string}
            onPress={onDeletePress as () => void}
            disabled={deleteDisabled}
            style={[styles.deleteButton, deleteLastHint != null && styles.deleteButtonAfterHint]}
          />
        </>
      )}

      <FormHintSlot message={hintText} reserve={hasDelete} />

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
  deleteLastHint: {
    marginTop: 16,
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 24,
  },
  deleteButtonAfterHint: {
    marginTop: 8,
  },
  button: {
    marginTop: 0,
  },
});
