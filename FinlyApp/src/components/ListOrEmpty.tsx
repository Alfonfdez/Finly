import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  /** When true the list is not rendered and `emptyState` fills the space instead. */
  empty: boolean;
  emptyState: ReactNode;
  children: ReactNode;
}

/**
 * Renders `children` (a list) unless `empty`, in which case it renders `emptyState`
 * centred instead. Unmounting the list avoids Android keeping the stale (tall) scroll
 * area after a list that overflowed the screen is emptied in a single update
 * (e.g. Select all -> Delete).
 */
export default function ListOrEmpty({ empty, emptyState, children }: Props) {
  if (!empty) return <>{children}</>;
  return <View style={styles.empty}>{emptyState}</View>;
}

const styles = StyleSheet.create({
  empty: { flex: 1 },
});
