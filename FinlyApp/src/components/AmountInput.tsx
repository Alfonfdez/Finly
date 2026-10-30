import { useState, type ReactNode } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { TRANSPARENT } from '../constants/themes';
import { getCurrencySymbol } from '../constants/currencies';
import { t } from '../i18n';
import { parseAmountInput, formatAmountDisplay, parseAmountValue } from '../utils/amountInput';
import { CARD_BORDER_RADIUS } from './componentStyles';

interface Props {
  raw: string;
  onChangeRaw: (raw: string) => void;
  onOpenCalculator?: () => void;
  label?: string;
  accessibilityLabel?: string;
  /** The value is unacceptable for this form (e.g. an amount of 0): red border.
   *  The digits keep their normal color — only the text turns red when the input
   *  is not a number at all. Callers must not pass this for a field where 0 is
   *  valid (e.g. an account's initial balance). */
  error?: boolean;
  /** Account initial balances may be negative; transaction amounts may not. */
  allowNegative?: boolean;
  header?: ReactNode;
}

export default function AmountInput({ raw, onChangeRaw, onOpenCalculator, label, accessibilityLabel, error, allowNegative = false, header }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [focused, setFocused] = useState(false);

  const displayAmount = formatAmountDisplay(raw, config.decimalSeparator);
  const isNegative = raw.startsWith('-');
  const numericValue = parseAmountValue(raw);
  const canToggleSign = allowNegative && numericValue !== null && numericValue !== 0;
  const showError = raw.length > 0 && raw !== '-' && numericValue === null;
  const invalid = showError || !!error;
  const toggleSign = () => {
    if (!canToggleSign) return;
    onChangeRaw(isNegative ? raw.slice(1) : `-${raw}`);
  };

  return (
    <>
      {header}
      {label && (
        <Text style={[styles.label, { color: c.textSecondary, fontSize: fs(12) }]}>
          {label}
        </Text>
      )}
      <View style={[styles.amountRow, header ? styles.amountRowAfterHeader : null]}>
        <TextInput
          style={[
            styles.amountInput,
            {
              backgroundColor: c.surface,
              color: showError ? c.red : raw ? c.text : c.textSecondary,
              fontSize: fs(24),
              borderColor: invalid ? c.red : focused ? c.primary : TRANSPARENT,
            },
          ]}
          placeholder="0"
          placeholderTextColor={c.textSecondary}
          value={displayAmount}
          onChangeText={(text) => {
            const clean = parseAmountInput(text, allowNegative);
            if (clean === null) return;
            onChangeRaw(clean);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            // A zero balance has no meaningful negative representation.
            if (allowNegative && raw.startsWith('-') && parseAmountValue(raw) === 0) {
              onChangeRaw('0');
            }
          }}
          keyboardType="decimal-pad"
          accessibilityLabel={accessibilityLabel ?? labels.a11y_amount}
        />
        <Text accessible={false} style={[styles.currencySymbol, { color: c.textSecondary, fontSize: fs(18) }]}>
          {getCurrencySymbol(config.currency)}
        </Text>
        {allowNegative && (
          <TouchableOpacity
            style={[
              styles.signButton,
              { backgroundColor: c.surface, borderColor: c.border },
              !canToggleSign && styles.signButtonDisabled,
            ]}
            onPress={toggleSign}
            disabled={!canToggleSign}
            accessibilityRole="button"
            accessibilityLabel={labels.a11y_toggle_sign}
            accessibilityState={{ selected: isNegative, disabled: !canToggleSign }}
          >
            <Text style={[styles.signText, { color: c.primary, fontSize: fs(18) }]}>
              {isNegative ? '+' : '-'}
            </Text>
          </TouchableOpacity>
        )}
        {onOpenCalculator && (
          <TouchableOpacity
            style={styles.calculatorButton}
            onPress={onOpenCalculator}
            accessibilityRole="button"
            accessibilityLabel={labels.a11y_calculator}
          >
            <Ionicons name="calculator-outline" size={24} color={c.primary} accessible={false} />
          </TouchableOpacity>
        )}
      </View>
      {showError && (
        <Text style={[styles.errorText, { color: c.red, fontSize: fs(12) }]}>
          {labels.add_amount_error}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  amountRowAfterHeader: {
    marginTop: 0,
    marginBottom: 0,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    gap: 8,
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: 1,
    fontWeight: '700',
  },
  currencySymbol: {
    marginRight: 8,
    fontWeight: '600',
  },
  signButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signButtonDisabled: {
    opacity: 0.4,
  },
  signText: {
    fontWeight: '700',
  },
  calculatorButton: {
    padding: 8,
  },
  errorText: {
    marginBottom: 8,
  },
});
