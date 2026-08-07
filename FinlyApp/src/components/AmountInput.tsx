import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { TRANSPARENT } from '../constants/themes';
import { t } from '../i18n';
import { parseAmountInput, formatAmountDisplay, parseAmountValue } from '../utils/amountInput';

interface Props {
  raw: string;
  onChangeRaw: (raw: string) => void;
  onOpenCalculator?: () => void;
}

export default function AmountInput({ raw, onChangeRaw, onOpenCalculator }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const [focused, setFocused] = useState(false);

  const displayAmount = formatAmountDisplay(raw, config.decimalSeparator);
  const showError = raw.length > 0 && parseAmountValue(raw) === null;

  return (
    <>
      <View style={styles.amountRow}>
        <TextInput
          style={[
            styles.amountInput,
            {
              backgroundColor: c.surface,
              color: showError ? c.red : raw ? c.text : c.textSecondary,
              fontSize: fs(24),
              borderColor: focused ? c.primary : TRANSPARENT,
            },
          ]}
          placeholder="0"
          placeholderTextColor={c.textSecondary}
          value={displayAmount}
          onChangeText={(text) => {
            const clean = parseAmountInput(text);
            if (clean === null) return;
            onChangeRaw(clean);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          accessibilityLabel={labels.a11y_amount}
        />
        <Text style={[styles.currencySymbol, { color: c.textSecondary, fontSize: fs(18) }]}>
          {config.currency}
        </Text>
        {onOpenCalculator && (
          <TouchableOpacity
            style={styles.calculatorButton}
            onPress={onOpenCalculator}
            accessibilityLabel={labels.a11y_calculator}
          >
            <Ionicons name="calculator-outline" size={24} color={c.primary} />
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    gap: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontWeight: '700',
  },
  currencySymbol: {
    marginRight: 8,
    fontWeight: '600',
  },
  calculatorButton: {
    padding: 8,
  },
  errorText: {
    marginBottom: 8,
  },
});
