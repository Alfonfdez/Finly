import ConfirmationModal, { type ConfirmationModalProps } from './ConfirmationModal';
import { t } from '../i18n';
import type { IconName } from '../constants/types';

export type DeleteConfirmationModalProps = Omit<
  ConfirmationModalProps,
  'icon' | 'confirmLabel' | 'cancelLabel'
> & {
  icon?: IconName;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function DeleteConfirmationModal({
  icon = 'trash-outline',
  confirmLabel,
  cancelLabel,
  ...props
}: DeleteConfirmationModalProps) {
  const labels = t();

  return (
    <ConfirmationModal
      {...props}
      icon={icon}
      confirmLabel={confirmLabel ?? labels.delete}
      cancelLabel={cancelLabel ?? labels.cancel}
    />
  );
}
