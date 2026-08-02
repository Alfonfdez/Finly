import { View } from 'react-native';
import { isAndroid } from '../../utils/platform';
import { formStyles } from './formStyles';

export default function KeyboardSpacer() {
  if (!isAndroid) return null;
  return <View style={formStyles.keyboardSpacer} />;
}
