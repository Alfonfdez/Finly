import { Component, Fragment, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import { t } from '../i18n';
import { ERROR_PREFIXES, logError } from '../utils/errors';

interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
}

interface BaseProps {
  children: ReactNode;
  onRetry?: () => void;
  colors: ThemeColors;
}

interface State {
  hasError: boolean;
  retryKey: number;
}

class ErrorBoundaryBase extends Component<BaseProps, State> {
  state: State = { hasError: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(ERROR_PREFIXES.errorBoundary, error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState(previous => ({ hasError: false, retryKey: previous.retryKey + 1 }));
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      const { background, text, textSecondary, primary } = this.props.colors;
      const labels = t();
      return (
        <View style={[styles.container, { backgroundColor: background }]}>
          <Text style={[styles.title, { color: text }]}>{labels.error_boundary_title}</Text>
          <Text style={[styles.message, { color: textSecondary }]}>{labels.error_boundary_message}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primary }]}
            onPress={this.handleRetry}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: background }]}>{labels.error_boundary_retry}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>;
  }
}

export default function ErrorBoundary({ children, onRetry }: Omit<BaseProps, 'colors'>) {
  const { activeColors: c } = useConfig();
  return (
    <ErrorBoundaryBase
      onRetry={onRetry}
      colors={{
        background: c.background,
        text: c.text,
        textSecondary: c.textSecondary,
        primary: c.primary,
      }}
    >
      {children}
    </ErrorBoundaryBase>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
