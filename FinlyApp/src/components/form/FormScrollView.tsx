import { ScrollView, Keyboard } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { formStyles } from './formStyles';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function FormScrollView({ children, style, contentContainerStyle }: Props) {
  return (
    <ScrollView
      style={[formStyles.scrollView, style]}
      contentContainerStyle={[formStyles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={() => Keyboard.dismiss()}
    >
      {children}
    </ScrollView>
  );
}
