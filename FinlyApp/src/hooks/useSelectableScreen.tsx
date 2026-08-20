import type { ReactNode } from 'react';
import { useRef, useLayoutEffect } from 'react';
import { useSelectAndSearch } from './useSelectAndSearch';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- T is used for caller type inference
interface UseSelectableScreenOptions<T extends number | string> {
  navigation: { setOptions: (opts: Record<string, unknown>) => void };
  hasItems: boolean;
  showHeader: boolean;
  headerRight: () => ReactNode;
}

export function useSelectableScreen<T extends number | string = number>({
  navigation,
  hasItems,
  showHeader,
  headerRight,
}: UseSelectableScreenOptions<T>) {
  const select = useSelectAndSearch<T>({ hasItems });
  const headerRightRef = useRef(headerRight);
  headerRightRef.current = headerRight;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: showHeader ? () => headerRightRef.current() : null,
    });
  }, [navigation, select.selectMode, showHeader]);

  return select;
}
