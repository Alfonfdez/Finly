import { useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenShell from '../components/ScreenShell';
import Fab from '../components/Fab';
import RecurringRow from '../components/RecurringRow';
import { useConfig } from '../context/ConfigContext';
import { useApp } from '../context/AppContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { t } from '../i18n';
import { USER_ID, type RootStackParamList } from '../constants/types';
import { isRecurrenceEnded, todayDateOnly } from '../utils/recurrence';
import { recurringRepository } from '../database';
import { setRecurringRuleActive } from '../database/recurringService';
import type { RecurringRule } from '../database/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recurring'>;

export default function RecurringScreen() {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const navigation = useNavigation<NavigationProp>();
  const { categoriesById, refresh } = useApp();

  const loadRules = useCallback(async () => {
    const rules = await recurringRepository.list(USER_ID);
    const counts = await recurringRepository.countOccurrencesByRuleIds(rules.map(r => r.id));
    return { rules, counts };
  }, []);
  const { data, setData, loading } = useFocusLoad(
    loadRules,
    { rules: [] as RecurringRule[], counts: new Map<number, number>() },
  );
  const { rules, counts } = data;
  const today = todayDateOnly();

  const handleToggleActive = useCallback(async (rule: RecurringRule, value: boolean) => {
    // The switch is disabled for finished rules; guard here anyway (the service
    // also refuses to resume an ended rule). Pausing clears the flag; resuming
    // skips the paused window.
    if (isRecurrenceEnded(rule, rule.next_due, todayDateOnly())) return;
    await setRecurringRuleActive(rule.id, value);
    if (value) {
      setData(await loadRules());
      refresh();
    } else {
      setData(prev => ({ ...prev, rules: prev.rules.map(r => (r.id === rule.id ? { ...r, active: 0 } : r)) }));
    }
  }, [setData, refresh, loadRules]);

  if (loading && rules.length === 0) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <FlatList
        data={rules}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={rules.length === 0 ? styles.emptyContent : styles.listContent}
        renderItem={({ item }) => (
          <RecurringRow
            rule={item}
            category={categoriesById.get(item.category_id)}
            count={counts.get(item.id) ?? 0}
            today={today}
            onPress={() => navigation.navigate('ModifyRecurring', { ruleId: item.id })}
            onToggleActive={value => handleToggleActive(item, value)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="repeat-outline" size={64} color={c.textSecondary} />
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
              {labels.recurring_empty}
            </Text>
          </View>
        }
      />
      <Fab onPress={() => navigation.navigate('CreateRecurring')} accessibilityLabel={labels.recurring_add} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  listContent: {
    paddingBottom: 128,
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyText: {
    fontWeight: '500',
  },
});
