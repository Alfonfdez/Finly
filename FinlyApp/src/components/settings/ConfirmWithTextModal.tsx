import { TextInput, StyleSheet, type TextStyle } from 'react-native';
import ConfirmationModal from '../ConfirmationModal';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { DELETE_ALL_CONFIRMATION, type IconName } from '../../constants/types';
import { isWeb } from '../../utils/platform';
import { BUTTON_BORDER_RADIUS } from '../componentStyles';

export interface ConfirmWithTextModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: IconName;
  confirmLabel: string;
  cancelLabel: string;
  text: string;
  onTextChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

export default function ConfirmWithTextModal({
  visible,
  title,
  message,
  icon = 'warning-outline',
  confirmLabel,
  cancelLabel,
  text,
  onTextChange,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmWithTextModalProps) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      icon={icon}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmDisabled={text.toUpperCase() !== DELETE_ALL_CONFIRMATION}
      busy={busy}
    >
      <TextInput
        style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border, fontSize: fs(14) }, webInputFocusReset]}
        placeholder={labels.settings_delete_data_confirm_placeholder}
        placeholderTextColor={c.textSecondary}
        value={text}
        onChangeText={onTextChange}
        editable={!busy}
        accessibilityLabel={labels.settings_delete_data_confirm_placeholder}
        autoCapitalize="characters"
        autoCorrect={false}
      />
    </ConfirmationModal>
  );
}

const webInputFocusReset = isWeb ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    padding: 12,
    marginBottom: 16,
  },
});
