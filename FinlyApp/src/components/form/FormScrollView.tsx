import { ScrollView, Keyboard, KeyboardAvoidingView, StyleSheet } from 'react-native';
import type { ReactNode, RefObject } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { formStyles } from './formStyles';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** The ScrollView ref to drive (e.g. from `useKeyboardReveal`). */
  scrollRef?: RefObject<ScrollView | null>;
  /** Forwarded to the ScrollView; pass `useKeyboardReveal().onScrollLayout`. */
  onLayout?: () => void;
}

export default function FormScrollView({ children, style, contentContainerStyle, scrollRef, onLayout }: Props) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        ref={scrollRef}
        onLayout={onLayout}
        style={[formStyles.scrollView, style]}
        contentContainerStyle={[formStyles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
