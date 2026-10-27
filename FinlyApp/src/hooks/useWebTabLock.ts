import { useCallback, useEffect, useRef, useState } from 'react';
import { isWeb } from '../utils/platform';

export const TAB_LOCK_STATUS = {
  checking: 'checking',
  acquired: 'acquired',
  blocked: 'blocked',
  failed: 'failed',
} as const;

export type TabLockStatus = keyof typeof TAB_LOCK_STATUS;

const LOCK_NAME = 'finly-db';

interface LockManagerLike {
  request(
    name: string,
    options: { ifAvailable: boolean },
    callback: (lock: unknown) => Promise<void>,
  ): Promise<void>;
}

/**
 * Web is a secondary platform and keeps the whole database in one IndexedDB
 * snapshot, so two tabs would otherwise overwrite each other. Hold an exclusive
 * browser lock for the app lifetime; a second tab is blocked until this one closes.
 */
export function useWebTabLock() {
  const [status, setStatus] = useState<TabLockStatus>(isWeb ? TAB_LOCK_STATUS.checking : TAB_LOCK_STATUS.acquired);
  const releaseRef = useRef<(() => void) | null>(null);
  const requestRef = useRef(0);
  const mountedRef = useRef(true);

  const acquire = useCallback(async () => {
    if (!isWeb) {
      setStatus(TAB_LOCK_STATUS.acquired);
      return;
    }
    const locks = (navigator as Navigator & { locks?: LockManagerLike }).locks;
    if (!locks) {
      // Older browsers without Web Locks keep the previous single-tab behaviour.
      setStatus(TAB_LOCK_STATUS.acquired);
      return;
    }

    const requestId = ++requestRef.current;
    setStatus(TAB_LOCK_STATUS.checking);
    void locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
      if (!mountedRef.current || requestId !== requestRef.current) return;
      if (!lock) {
        setStatus(TAB_LOCK_STATUS.blocked);
        return;
      }
      setStatus(TAB_LOCK_STATUS.acquired);
      await new Promise<void>((resolve) => {
        releaseRef.current = resolve;
      });
    }).catch(() => {
      // A rejected lock request (permissions/security context) must not leave the
      // app on the splash screen forever.
      if (mountedRef.current && requestId === requestRef.current) {
        setStatus(TAB_LOCK_STATUS.failed);
      }
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void acquire();
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      releaseRef.current?.();
      releaseRef.current = null;
    };
  }, [acquire]);

  return { status, retry: acquire };
}
