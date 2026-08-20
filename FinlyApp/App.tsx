import { useEffect, useState, useRef } from 'react';
import { Platform, Animated, Appearance } from 'react-native';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, Image } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { ConfigProvider } from './src/context/ConfigContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initDatabase } from './src/database/database';
import { darkColors } from './src/constants/themes';

const EXIT_DURATION = 400;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function SplashScreen({ exiting }: { exiting: boolean }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();

    return () => {
      logoOpacity.stopAnimation();
      logoScale.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (!exiting) return;
    Animated.parallel([
      Animated.timing(exitOpacity, { toValue: 0, duration: EXIT_DURATION, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(exitScale, { toValue: 1.1, duration: EXIT_DURATION, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [exiting]);

  return (
    <Animated.View style={[styles.splash, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={require('./assets/icon.png')} style={styles.splashLogo} />
      </Animated.View>
    </Animated.View>
  );
}

import { useConfig } from './src/context/ConfigContext';
import { THEMES } from './src/constants/types';

function ThemeStatusBar() {
  const { config } = useConfig();
  const isDark = config.theme === THEMES.dark
    || (config.theme === THEMES.system && Appearance.getColorScheme() === THEMES.dark);
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (error) {
        setDbError(String(error));
      }
    }
    setup();
  }, []);

  useEffect(() => {
    if (dbReady && !exiting && !showApp) {
      setExiting(true);
      setTimeout(() => setShowApp(true), EXIT_DURATION);
    }
  }, [dbReady]);

  if (dbError) {
    return (
      <View style={styles.error}>
        <StatusBar style="light" />
        <Text style={{ color: 'white', padding: 20 }}>{dbError}</Text>
      </View>
    );
  }

  if (!showApp) {
    return <SplashScreen exiting={exiting} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ConfigProvider>
        <AppProvider>
          <ErrorBoundary>
            <AppNavigator />
          </ErrorBoundary>
          <ThemeStatusBar />
        </AppProvider>
      </ConfigProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkColors.background,
    gap: 16,
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  error: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
});
