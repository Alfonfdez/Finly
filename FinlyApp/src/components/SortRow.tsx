import type { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { isWeb } from '../utils/platform';

interface Props {
  children: ReactNode;
  /** Draws a bottom separator, grouping the controls away from the list. */
  bordered?: boolean;
}

/** Horizontally scrollable strip holding a `SortToggle` (and optional chips). */
export default function SortRow({ children, bordered = false }: Props) {
  const { activeColors: c } = useConfig();

  const strip = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={isWeb}
      style={styles.row}
      contentContainerStyle={[styles.content, isWeb && styles.webContent]}
    >
      {children}
    </ScrollView>
  );

  if (!bordered) return strip;

  return <View style={[styles.bordered, { borderBottomColor: c.border }]}>{strip}</View>;
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    flexGrow: 0,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  webContent: {
    paddingBottom: 8,
  },
  bordered: {
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
