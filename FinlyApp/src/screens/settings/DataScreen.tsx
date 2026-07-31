import { useState } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { isWeb } from '../../utils/platform';
import { transactionRepository, accountRepository, categoryRepository, tagRepository } from '../../database';
import { initWebStorage } from '../../database/webStorage';
import { getDatabase } from '../../database/database';
import { seedData } from '../../database/migrations/002_seed';
import { seedConfig } from '../../database/migrations/003_config';
import ConfirmationModal from '../../components/ConfirmationModal';
import { settingsStyles } from './settingsStyles';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../constants/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SettingsData'>;
};

export default function DataScreen({ navigation }: Props) {
  const { activeColors: c } = useConfig();
  const { resetAll } = useApp();
  const fs = useFontSize();
  const labels = t();

  const [deleteTransactionsModal, setDeleteTransactionsModal] = useState(false);
  const [deleteAllModal1, setDeleteAllModal1] = useState(false);
  const [deleteAllModal2, setDeleteAllModal2] = useState(false);
  const [deleteAllText, setDeleteAllText] = useState('');

  const closeDeleteAll = () => {
    setDeleteAllModal1(false);
    setDeleteAllModal2(false);
  };

  const closeDeleteAllWithText = () => {
    setDeleteAllModal2(false);
    setDeleteAllText('');
  };

  const handleDeleteTransactions = async () => {
    try {
      await transactionRepository.deleteAllTransactions();
      await resetAll();
    } catch {}
    setDeleteTransactionsModal(false);
  };

  const handleDeleteAll = async () => {
    try {
      await transactionRepository.deleteAllTransactions();
      await accountRepository.deleteAll();
      await categoryRepository.deleteAll();
      await tagRepository.deleteAll();
      if (isWeb) {
        localStorage.clear();
        await initWebStorage();
      } else {
        const db = getDatabase();
        await db.runAsync('DELETE FROM config');
        await seedData(db);
        await seedConfig(db);
      }
      await resetAll();
    } catch {}
    closeDeleteAll();
    setDeleteAllText('');
  };

  const canDeleteAll = deleteAllText.toUpperCase() === 'DELETE';

  return (
    <ScrollView style={[settingsStyles.container, { backgroundColor: c.background }]} contentContainerStyle={settingsStyles.content}>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: c.surface }]}
        onPress={() => setDeleteTransactionsModal(true)}
      >
        <Ionicons name="trash-outline" size={22} color={c.red} />
        <Text style={[styles.rowLabel, { color: c.red, fontSize: fs(15) }]}>{labels.settings_delete_all_transactions}</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={c.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, { backgroundColor: c.surface }]}
        onPress={() => setDeleteAllModal1(true)}
      >
        <Ionicons name="warning-outline" size={22} color={c.red} />
        <Text style={[styles.rowLabel, { color: c.red, fontSize: fs(15) }]}>{labels.settings_delete_all_data}</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={c.textSecondary} />
      </TouchableOpacity>

      <ConfirmationModal
        visible={deleteTransactionsModal}
        title={labels.settings_delete_transactions_confirm_title}
        message={labels.settings_delete_transactions_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={handleDeleteTransactions}
        onCancel={() => setDeleteTransactionsModal(false)}
      />

      <ConfirmationModal
        visible={deleteAllModal1}
        title={labels.settings_delete_data_confirm_title}
        message={labels.settings_delete_data_confirm_message}
        confirmLabel={labels.settings_delete_confirm}
        cancelLabel={labels.cancel}
        onConfirm={() => setDeleteAllModal2(true)}
        onCancel={() => setDeleteAllModal1(false)}
      />

      <ConfirmationModal
        visible={deleteAllModal2}
        title={labels.settings_delete_data_confirm_title2}
        message={labels.settings_delete_data_confirm_message2}
        confirmLabel={labels.settings_delete_confirm}
        cancelLabel={labels.cancel}
        onConfirm={handleDeleteAll}
        onCancel={closeDeleteAllWithText}
        confirmDisabled={!canDeleteAll}
      >
        <TextInput
          style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border, fontSize: fs(14) }]}
          placeholder={labels.settings_delete_data_confirm_placeholder}
          placeholderTextColor={c.textSecondary}
          value={deleteAllText}
          onChangeText={setDeleteAllText}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </ConfirmationModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
});
