import type { ReactNode } from 'react';
import { useRef, useLayoutEffect } from 'react';

interface UseSelectableScreenOptions {
  navigation: { setOptions: (opts: Record<string, unknown>) => void };
  showHeader: boolean;
  selectMode: boolean;
  headerRight: () => ReactNode;
}

export function useSelectableScreen({
  navigation,
  showHeader,
  selectMode,
  headerRight,
}: UseSelectableScreenOptions) {
  const headerRightRef = useRef(headerRight);
  headerRightRef.current = headerRight;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: showHeader ? () => headerRightRef.current() : null,
    });
  }, [navigation, showHeader, selectMode]);

  return undefined;
}