import type { ReactNode } from 'react';
import { useRef, useLayoutEffect } from 'react';
import { View } from 'react-native';
import { HEADER_SPACER_STYLE } from '../constants/layout';
import { isAndroid } from '../utils/platform';

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
      headerRight: showHeader
        ? () => headerRightRef.current()
        : isAndroid
          ? () => <View pointerEvents="none" accessible={false} style={HEADER_SPACER_STYLE} />
          : null,
    });
  }, [navigation, showHeader, selectMode]);

  return undefined;
}
