import { View } from 'react-native';
import { HEADER_SPACER_STYLE } from '../constants/layout';

export default function HeaderSpacer() {
  return <View pointerEvents="none" accessible={false} style={HEADER_SPACER_STYLE} />;
}
