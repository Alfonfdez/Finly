import { useState, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useFocusLoad<T>(
  loader: () => Promise<T>,
  initial: T
): { data: T; setData: Dispatch<SetStateAction<T>>; loading: boolean } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(loader);
  const hasLoaded = useRef(false);
  loaderRef.current = loader;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!hasLoaded.current) setLoading(true);
      loaderRef.current().then((result) => {
        if (!active) return;
        setData(result);
        hasLoaded.current = true;
        setLoading(false);
      }).catch((error) => {
        if (!active) return;
        console.error('useFocusLoad failed:', error);
        hasLoaded.current = true;
        setLoading(false);
      });
      return () => { active = false; };
    }, [])
  );

  return { data, setData, loading };
}
