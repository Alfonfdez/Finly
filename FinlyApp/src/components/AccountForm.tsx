import { useConfig } from '../context/ConfigContext';
import { useKeyboardReveal } from '../hooks/useKeyboardReveal';
import { MAX_ACCOUNT_NAME_LENGTH, MAX_NOTE_LENGTH, type ConfigIconShape, type IconName } from '../constants/types';
import IconColorSection from './IconColorSection';
import FormSectionHeader from './form/FormSectionHeader';
import { formStyles } from './form/formStyles';
import LabeledTextField from './form/LabeledTextField';
import PrimaryButton from './form/PrimaryButton';
import FormActions from './form/FormActions';
import FormScrollView from './form/FormScrollView';
import AmountInput from './AmountInput';

interface AccountFormProps {
  nameLabel: string;
  namePlaceholder?: string;
  name: string;
  onNameChange: (value: string) => void;
  /** The duplicate-name message (or null) — the empty case comes from `nameEmptyError`. */
  nameError: string | null;
  /** Shown when the name is blank; the red border waits for the field to be touched. */
  nameEmptyError: string;
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
  namePlaceholder,
  name,
  onNameChange,
  nameError,
  nameEmptyError,
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
  // The Note is the bottom-most field, so focusing it scrolls the form to keep the
  // submit button (below it) above the keyboard.
  const { scrollRef, onBottomFieldFocus, onBottomFieldBlur, onScrollLayout } = useKeyboardReveal();

  const nameValidationError = nameDisabled ? null : name.trim() === '' ? nameEmptyError : nameError;

  return (
    <FormScrollView scrollRef={scrollRef} onLayout={onScrollLayout}>
      <LabeledTextField
        label={nameLabel}
        labelIcon="id-card-outline"
        labelStyle={formStyles.firstSection}
        placeholder={namePlaceholder ?? nameLabel}
        value={name}
        onChangeText={onNameChange}
        maxLength={MAX_ACCOUNT_NAME_LENGTH}
        autoCapitalize="words"
        autoCorrect={false}
        error={nameValidationError}
        showCounter
        counterInHeader
        editable={!nameDisabled}
        inputStyle={nameDisabled ? { color: c.textSecondary } : undefined}
      />

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
          header={initialBalanceLabel
            ? <FormSectionHeader title={initialBalanceLabel} icon="cash-outline" />
            : undefined}
          accessibilityLabel={initialBalanceA11yLabel}
          allowNegative
        />
      )}

      <LabeledTextField
        label={noteLabel}
        labelIcon="document-text-outline"
        value={description}
        onChangeText={onDescriptionChange}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        maxLength={MAX_NOTE_LENGTH}
        showCounter
        counterInHeader
        onFocus={onBottomFieldFocus}
        onBlur={onBottomFieldBlur}
      />

      <FormActions
        deleteHint={deleteLastHint}
        deleteLabel={deleteLabel}
        onDeletePress={onDeletePress}
        deleteDisabled={deleteDisabled}
        saveHint={hintText}
      >
        <PrimaryButton label={submitLabel} onPress={onSubmit} disabled={isSubmitDisabled} />
      </FormActions>
    </FormScrollView>
  );
}
