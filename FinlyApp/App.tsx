import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import Navigation from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { initWebStorage } from './src/database/webStorage';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        if (Platform.OS === 'web') {
          await initWebStorage();
        } else {
          await initDatabase();
        }
        setDbReady(true);
      } catch (error) {
        setDbError(String(error));
      }
    }
    setup();
  }, []);

  if (dbError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#22D3EE" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#22D3EE" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <Navigation />
        <StatusBar style="light" />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
