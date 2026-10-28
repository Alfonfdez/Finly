import { useState, useCallback, useRef } from 'react';
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
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const confirm = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setVisible(false);
    try {
      const ok = await runWithErrorAlert(async () => {
        await deleteFn();
        return true;
      }, errorPrefix, labels);
      if (ok) await onSuccess?.();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [deleteFn, onSuccess, errorPrefix, labels]);

  return { visible, busy, open, close, confirm };
}
