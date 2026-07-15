import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

export default function ModifyTransactionScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: c.textSecondary, fontSize: fs(16) }}>
          TODO: {labels.details_edit}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
