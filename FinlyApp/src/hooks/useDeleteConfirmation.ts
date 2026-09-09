import { useState, useCallback } from 'react';
import { runWithErrorAlert } from '../utils/errors';

interface UseDeleteConfirmationOptions {
  deleteFn: () => Promise<unknown>;
  onSuccess?: () => void | Promise<void>;
  errorPrefix: string;
  labels?: { error_title: string; error_generic: string };
}

export function useDeleteConfirmation({
  deleteFn,
  onSuccess,
  errorPrefix,
  labels,
}: UseDeleteConfirmationOptions) {
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const confirm = useCallback(async () => {
    setVisible(false);
    const ok = await runWithErrorAlert(async () => {
      await deleteFn();
      return true;
    }, errorPrefix, labels);
    if (ok) await onSuccess?.();
  }, [deleteFn, onSuccess, errorPrefix, labels]);

  return { visible, open, close, confirm };
}
