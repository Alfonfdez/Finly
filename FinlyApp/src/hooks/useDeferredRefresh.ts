import { useCallback, useRef } from 'react';
import { ERROR_PREFIXES, logError } from '../utils/errors';

type AnyAsyncFn = (...args: unknown[]) => unknown;

export function useDeferredRefresh<T extends AnyAsyncFn>(fn: T): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback((...args: Parameters<T>) => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(async () => {
        try {
          await fnRef.current(...args);
        } catch (err) {
          logError(ERROR_PREFIXES.deferredRefresh, err);
        }
        resolve();
      });
    });
  }, []) as unknown as T;
}
