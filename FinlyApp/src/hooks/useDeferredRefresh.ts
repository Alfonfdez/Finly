import { useCallback, useRef } from 'react';

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
          console.error('useDeferredRefresh error:', err);
        }
        resolve();
      });
    });
  }, []) as unknown as T;
}
