import { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { evaluate } from '../utils/calculator';
import { isWeb } from '../utils/platform';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import { CALC_KEYS } from '../constants/types';
import { WHITE } from '../constants/themes';
import ModalShell from './ModalShell';


interface Props {
  visible: boolean;
  onAccept: (result: string) => void;
  onCancel: () => void;
}

const BUTTONS = [
  ['7', '8', '9', CALC_KEYS.divide],
  ['4', '5', '6', CALC_KEYS.multiply],
  ['1', '2', '3', CALC_KEYS.subtract],
  [CALC_KEYS.clear, '0', CALC_KEYS.decimal, CALC_KEYS.add],
  [CALC_KEYS.backspace, '', '', CALC_KEYS.equals],
];

const OP_KEYS = new Set<string>([
  CALC_KEYS.add,
  CALC_KEYS.subtract,
  CALC_KEYS.multiply,
  CALC_KEYS.divide,
]);

export default function CalculatorModal({ visible, onAccept, onCancel }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const [expression, setExpression] = useState('');
  const [hasError, setHasError] = useState(false);

  const displayHeight = fs(16) * 1.4 * 2 + fs(28) * 1.4 + 32;

  const resultDisplay = useMemo(() => {
    if (!expression) return null;
    const { result, error } = evaluate(expression);
    if (error) return null;
    return result;
  }, [expression]);

  const handleButton = useCallback((btn: string) => {
    if (btn === CALC_KEYS.clear) {
      setExpression('');
      setHasError(false);
      return;
    }
    if (btn === CALC_KEYS.backspace) {
      setExpression(prev => prev.slice(0, -1));
      setHasError(false);
      return;
    }
    if (btn === CALC_KEYS.equals) {
      const { error } = evaluate(expression);
      setHasError(error);
      return;
    }

    setHasError(false);
    setExpression(prev => {
      const lastChar = prev.slice(-1);
      if (OP_KEYS.has(btn)) {
        if (!prev) return btn === CALC_KEYS.subtract ? prev + btn : prev;
        if (OP_KEYS.has(lastChar)) {
          return prev.slice(0, -1) + btn;
        }
      }
      if (btn === CALC_KEYS.decimal) {
        const lastNumber = prev.split(/[+\-*/]/).pop() || '';
        if (lastNumber.includes('.')) return prev;
      }
      return prev + btn;
    });
  }, [expression]);

  const handleAccept = useCallback(() => {
    if (resultDisplay !== null && !hasError) {
      onAccept(String(resultDisplay));
    }
  }, [resultDisplay, hasError, onAccept]);

  const labels = t();

  const getButtonBg = (btn: string) => {
    if (OP_KEYS.has(btn)) return c.primary;
    if (btn === CALC_KEYS.equals) return c.green;
    if (btn === CALC_KEYS.clear) return c.red;
    if (btn === CALC_KEYS.backspace) return c.border;
    return c.surface;
  };

  const getButtonFg = (btn: string) => {
    if (OP_KEYS.has(btn) || btn === CALC_KEYS.equals || btn === CALC_KEYS.clear) return WHITE;
    return c.text;
  };

  const renderButton = (btn: string, rowIdx: number, colIdx: number) => {
    if (btn === '') {
      return <View key={`${rowIdx}-${colIdx}`} style={isWeb ? webStyles.emptyCell : mobileStyles.emptyCell} />;
    }

    const disabled = btn === CALC_KEYS.equals && (!expression || hasError);
    const label = btn === CALC_KEYS.multiply ? '×' : btn === CALC_KEYS.divide ? '÷' : btn;
    const btnStyle = isWeb ? webStyles.button : mobileStyles.button;

    return (
      <TouchableOpacity
        key={`${rowIdx}-${colIdx}`}
        style={[
          btnStyle,
          { backgroundColor: getButtonBg(btn) },
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => handleButton(btn)}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={btn}
      >
        <Text style={[styles.buttonText, { color: getButtonFg(btn), fontSize: fs(20) }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const content = (
    <>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(18) }]}>
          {labels.calc_title}
        </Text>
      </View>

      <View style={[styles.displayArea, { height: displayHeight }]}>
        <Text
          style={[styles.expression, { color: c.textSecondary, fontSize: fs(16) }]}
          numberOfLines={2}
        >
          {expression || ' '}
        </Text>
        <Text
          style={[
            styles.result,
            {
              color: hasError ? c.red : c.text,
              fontSize: fs(28),
            },
          ]}
          numberOfLines={1}
        >
          {hasError
            ? labels.calc_error
            : resultDisplay !== null
              ? `= ${resultDisplay}`
              : ' '}
        </Text>
      </View>

      <View style={isWeb ? webStyles.keyboard : mobileStyles.keyboard}>
        {BUTTONS.map((row, rowIdx) => (
          <View key={rowIdx} style={isWeb ? webStyles.row : mobileStyles.row}>
            {row.map((btn, colIdx) => renderButton(btn, rowIdx, colIdx))}
          </View>
        ))}
      </View>

      <View style={[styles.actions, { borderTopColor: c.border }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: c.background, borderColor: c.border, borderWidth: 1 }]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={labels.calc_cancel}
        >
          <Text style={[styles.actionText, { color: c.text, fontSize: fs(16) }]}>
            {labels.calc_cancel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: resultDisplay !== null && !hasError ? c.primary : c.border,
            },
          ]}
          onPress={handleAccept}
          disabled={resultDisplay === null || hasError}
          accessibilityRole="button"
          accessibilityLabel={labels.calc_accept}
        >
          <Text
            style={[
              styles.actionText,
              {
                color: resultDisplay !== null && !hasError ? c.background : c.textSecondary,
                fontSize: fs(16),
              },
            ]}
          >
            {labels.calc_accept}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (isWeb) {
    return (
      <ModalShell visible={visible} onClose={onCancel} padding={0} overlayPadding={0} backgroundColor={c.background} maxHeight={undefined}>
        {content}
      </ModalShell>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[mobileStyles.container, { backgroundColor: c.background }]}>
        {content}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontWeight: '600' },
  displayArea: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  expression: {
    textAlign: 'right',
    marginBottom: 4,
  },
  result: {
    fontWeight: '700',
    textAlign: 'right',
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: {
    fontWeight: '600',
  },
});

const mobileStyles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    aspectRatio: 1.4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  emptyCell: {
    flex: 1,
    marginHorizontal: 4,
  },
});

const webStyles = StyleSheet.create({
  keyboard: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'center',
  },
  button: {
    width: 72,
    height: 52,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  emptyCell: {
    width: 72,
    height: 52,
    marginHorizontal: 4,
  },
});
