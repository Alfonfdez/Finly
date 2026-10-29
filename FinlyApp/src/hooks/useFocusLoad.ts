import { useState, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ERROR_PREFIXES, logError } from '../utils/errors';

export function useFocusLoad<T>(
  loader: () => Promise<T>,
  initial: T,
  areEqual?: (prev: T, next: T) => boolean,
): {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  loading: boolean;
  error: unknown | null;
  retry: () => void;
} {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const loaderRef = useRef(loader);
  const hasLoaded = useRef(false);
  const dataRef = useRef(initial);
  const areEqualRef = useRef(areEqual);
  areEqualRef.current = areEqual;
  loaderRef.current = loader;

  useFocusEffect(
    useCallback(() => {
      // Referencing reloadKey intentionally re-runs the focus loader on retry.
      void reloadKey;
      let active = true;
      if (!hasLoaded.current) setLoading(true);

      const runLoader = () => {
        loaderRef.current().then((result) => {
          if (!active) return;
          const same = areEqualRef.current
            ? areEqualRef.current(dataRef.current, result)
            : result === dataRef.current;
          if (!same) {
            dataRef.current = result;
            setData(result);
          }
          hasLoaded.current = true;
          setLoading(false);
          setError(null);
        }).catch((loadError) => {
          if (!active) return;
          logError(ERROR_PREFIXES.focusLoad, loadError);
          hasLoaded.current = true;
          setError(loadError);
          setLoading(false);
        });
      };

      runLoader();
      return () => { active = false; };
    }, [reloadKey]),
  );

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey(key => key + 1);
  }, []);

  // Keep the comparison baseline in sync when a caller updates the data
  // outside the loader (bulk delete reloads, external refreshes, ...).
  const updateData = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    setData((prev) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      dataRef.current = next;
      return next;
    });
  }, []);

  return { data, setData: updateData, loading, error, retry };
}
