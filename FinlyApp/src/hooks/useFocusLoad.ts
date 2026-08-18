import { useState, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useFocusLoad<T>(
  loader: () => Promise<T>,
  initial: T
): { data: T; setData: Dispatch<SetStateAction<T>>; loading: boolean } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (isInitialLoad.current) {
        setLoading(true);
      }
      loaderRef.current().then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
        isInitialLoad.current = false;
      }).catch((error) => {
        if (!active) return;
        console.error('useFocusLoad failed:', error);
        setLoading(false);
        isInitialLoad.current = false;
      });
      return () => { active = false; };
    }, [])
  );

  return { data, setData, loading };
}
