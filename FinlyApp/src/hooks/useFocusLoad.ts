import { useState, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useFocusLoad<T>(
  loader: () => Promise<T>,
  initial: T,
  areEqual?: (prev: T, next: T) => boolean,
): { data: T; setData: Dispatch<SetStateAction<T>>; loading: boolean } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(loader);
  const hasLoaded = useRef(false);
  const dataRef = useRef(initial);
  const areEqualRef = useRef(areEqual);
  areEqualRef.current = areEqual;
  loaderRef.current = loader;

  useFocusEffect(
    useCallback(() => {
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
            setLoading(false);
          } else if (!hasLoaded.current) {
            setLoading(false);
          }
          hasLoaded.current = true;
        }).catch((error) => {
          if (!active) return;
          console.error('useFocusLoad failed:', error);
          hasLoaded.current = true;
          setLoading(false);
        });
      };

      runLoader();
      return () => { active = false; };
    }, [])
  );

  return { data, setData, loading };
}
