import { useCallback, useEffect, useRef, useState } from 'react';

interface UseExternalRowRefreshOptions {
  /**
   * When the form has unsaved input and the row is rewritten underneath, show the
   * notice (true) or silently adopt the new values (false). Defaults to true.
   */
  warnWhenDirty?: boolean;
}

/**
 * Keeps an open form in sync with a row that may be rewritten externally (e.g. a
 * "Future + past" recurring-rule edit). `updatedAt` is the row's `updated_at`
 * (`undefined` while the row has not loaded yet, `null` when it has no timestamp).
 *
 * - Untouched form + changed row  -> `formKey` bumps (the form remounts and adopts).
 * - Dirty form + changed row      -> `updated` becomes true so the screen can warn.
 */
export function useExternalRowRefresh(
  updatedAt: string | null | undefined,
  { warnWhenDirty = true }: UseExternalRowRefreshOptions = {},
) {
  const [formKey, setFormKey] = useState(0);
  const [updated, setUpdated] = useState(false);
  const hasSynced = useRef(false);
  const syncedUpdatedAt = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const warnRef = useRef(warnWhenDirty);
  warnRef.current = warnWhenDirty;

  useEffect(() => {
    if (updatedAt === undefined) return;
    if (!hasSynced.current) {
      hasSynced.current = true;
      syncedUpdatedAt.current = updatedAt;
      return;
    }
    if (syncedUpdatedAt.current === updatedAt) return;
    syncedUpdatedAt.current = updatedAt;
    if (dirtyRef.current && warnRef.current) {
      setUpdated(true);
    } else {
      setFormKey(key => key + 1);
      setUpdated(false);
    }
  }, [updatedAt]);

  /** Adopt the row's values, discarding whatever the user typed in this form. */
  const adopt = useCallback(() => {
    setFormKey(key => key + 1);
    setUpdated(false);
  }, []);

  const onDirtyChange = useCallback((dirty: boolean) => { dirtyRef.current = dirty; }, []);

  return { formKey, updated, adopt, onDirtyChange };
}
