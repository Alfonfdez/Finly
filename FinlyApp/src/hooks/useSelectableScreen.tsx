import type { ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { useSelectAndSearch } from './useSelectAndSearch';

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: showHeader ? headerRight : null,
    });
  }, [navigation, select.selectMode, showHeader, headerRight]);

  return select;
}
