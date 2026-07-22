import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useApp } from '../../context/AppContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { transactionRepository, accountRepository, categoryRepository, tagRepository } from '../../database';
import { initWebStorage } from '../../database/webStorage';
import { getDatabase } from '../../database/database';
import { seedData } from '../../database/migrations/002_seed';
import { seedConfig } from '../../database/migrations/003_config';
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
      if (Platform.OS === 'web') {
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
    setDeleteAllModal1(false);
    setDeleteAllModal2(false);
    setDeleteAllText('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
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

      <Modal visible={deleteTransactionsModal} transparent animationType="fade" onRequestClose={() => setDeleteTransactionsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>{labels.settings_delete_transactions_confirm_title}</Text>
            <Text style={[styles.modalMessage, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.settings_delete_transactions_confirm_message}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => setDeleteTransactionsModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>{labels.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.red }]}
                onPress={handleDeleteTransactions}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontSize: fs(14) }]}>{labels.delete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteAllModal1} transparent animationType="fade" onRequestClose={() => { setDeleteAllModal1(false); setDeleteAllModal2(false); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>{labels.settings_delete_data_confirm_title}</Text>
            <Text style={[styles.modalMessage, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.settings_delete_data_confirm_message}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => setDeleteAllModal1(false)}
              >
                <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>{labels.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.red }]}
                onPress={() => setDeleteAllModal2(true)}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontSize: fs(14) }]}>{labels.settings_delete_confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteAllModal2} transparent animationType="fade" onRequestClose={() => { setDeleteAllModal2(false); setDeleteAllText(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>{labels.settings_delete_data_confirm_title2}</Text>
            <Text style={[styles.modalMessage, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.settings_delete_data_confirm_message2}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border, fontSize: fs(14) }]}
              placeholder={labels.settings_delete_data_confirm_placeholder}
              placeholderTextColor={c.textSecondary}
              value={deleteAllText}
              onChangeText={setDeleteAllText}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => { setDeleteAllModal2(false); setDeleteAllText(''); }}
              >
                <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>{labels.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: deleteAllText.toUpperCase() === 'DELETE' ? c.red : c.surface }]}
                onPress={deleteAllText.toUpperCase() === 'DELETE' ? handleDeleteAll : undefined}
              >
                <Text style={[styles.modalButtonText, { color: deleteAllText.toUpperCase() === 'DELETE' ? '#FFFFFF' : c.textSecondary, fontSize: fs(14) }]}>{labels.settings_delete_confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
});
