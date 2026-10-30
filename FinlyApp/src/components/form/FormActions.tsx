import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import FormHintSlot, { HINT_TONES } from './FormHintSlot';
import DeleteButton from './DeleteButton';

interface Props {
  /** The red band directly above Save: why the save is blocked. */
  saveHint?: string | null;
  /** The muted band directly above Delete: why it is disabled (e.g. last account). */
  deleteHint?: string | null;
  /** When both are given, the destructive button is rendered. Its label is always
   *  the generic "Delete" — only the confirmation spells out what is removed. */
  deleteLabel?: string;
  onDeletePress?: () => void;
  deleteDisabled?: boolean;
  /** The Save button. Every form keeps its own styling (PrimaryButton variants,
   *  the transaction form's custom button), so it is passed in as a child. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The standard bottom block of a form:
 *
 *   [muted band]   reserved — the disabled-Delete explanation, blank otherwise
 *   [Delete]       only in forms that can delete
 *   [red band]     reserved — why the save is blocked
 *   [Save]
 *
 * Both bands keep their room even when empty, so neither the Delete nor Save
 * moves when a message appears or disappears, and the separation from the field
 * area is identical in every screen.
 */
export default function FormActions({
  saveHint,
  deleteHint,
  deleteLabel,
  onDeletePress,
  deleteDisabled,
  children,
  style,
}: Props) {
  const hasDelete = !!(deleteLabel && onDeletePress);

  return (
    <View style={style}>
      {hasDelete && (
        <>
          <FormHintSlot tone={HINT_TONES.muted} message={deleteHint} />
          <DeleteButton
            label={deleteLabel as string}
            onPress={onDeletePress as () => void}
            disabled={deleteDisabled}
          />
        </>
      )}

      <FormHintSlot message={saveHint} />

      {children}
    </View>
  );
}
