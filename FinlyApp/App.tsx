import { useEffect, useState, useRef } from 'react';
import { Platform, Animated } from 'react-native';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, Image } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { ConfigProvider } from './src/context/ConfigContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { initWebStorage } from './src/database/webStorage';

const MIN_SPLASH_MS = 2000;
const EXIT_DURATION = 400;

function SplashScreen({ exiting }: { exiting: boolean }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
    ]).start();

    Animated.timing(lineWidth, { toValue: 1, duration: MIN_SPLASH_MS * 0.8, delay: 400, useNativeDriver: false }).start();

    return () => {
      logoOpacity.stopAnimation();
      logoScale.stopAnimation();
      lineWidth.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (!exiting) return;
    Animated.parallel([
      Animated.timing(exitOpacity, { toValue: 0, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(exitScale, { toValue: 1.1, duration: EXIT_DURATION, useNativeDriver: true }),
    ]).start();
  }, [exiting]);

  return (
    <Animated.View style={[styles.splash, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={require('./assets/icon.png')} style={styles.splashLogo} />
      </Animated.View>
      {!exiting && (
        <View style={styles.lineTrack}>
          <Animated.View style={[styles.lineFill, { width: lineWidth.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }) }]} />
        </View>
      )}
    </Animated.View>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSplashTimerDone(true), MIN_SPLASH_MS);

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

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (dbReady && splashTimerDone && !exiting && !showApp) {
      setExiting(true);
      setTimeout(() => setShowApp(true), EXIT_DURATION);
    }
  }, [dbReady, splashTimerDone]);

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
          <AppNavigator />
          <StatusBar style="light" />
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
    backgroundColor: '#0F172A',
    gap: 16,
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  lineTrack: {
    width: 120,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#1E293B',
    marginTop: 8,
    overflow: 'hidden',
  },
  lineFill: {
    height: '100%',
    backgroundColor: '#22D3EE',
    borderRadius: 1,
  },
  error: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
