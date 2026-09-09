import ConfirmationModal from './ConfirmationModal';
import { t } from '../i18n';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function GuardModal({ visible, title, message, onClose }: Props) {
  const labels = t();

  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      message={message}
      confirmLabel={labels.common_close}
      destructive={false}
      onConfirm={onClose}
      onCancel={onClose}
    />
  );
}
