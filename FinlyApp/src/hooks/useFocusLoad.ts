import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useFocusLoad<T>(
  loader: () => Promise<T>,
  initial: T
): { data: T; setData: Dispatch<SetStateAction<T>>; loading: boolean } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loader().then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      }).catch((error) => {
        if (!active) return;
        console.error('useFocusLoad failed:', error);
        setLoading(false);
      });
      return () => { active = false; };
    }, [loader])
  );

  return { data, setData, loading };
}
