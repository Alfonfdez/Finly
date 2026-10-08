import { View, Text, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  /** Human-readable recurrence summary (frequency + end date). */
  summary: string;
  /** First (create) or next (edit) transaction line. */
  firstLine: string;
  /** Extra lines: how many transactions will be created / skipped / back-filled. */
  detailLines: string[];
}

/** Always-present "Summary" block inside the recurring card. */
export default function RecurrenceInfo({ summary, firstLine, detailLines }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  return (
    <View style={[styles.container, { borderTopColor: c.border }]}>
      <Text style={[styles.title, { color: c.textSecondary, fontSize: fs(12) }]}>
        {labels.recurring_info_title}
      </Text>
      <Text style={[styles.summary, { color: c.primary, fontSize: fs(13) }]}>{summary}</Text>
      <Text style={[styles.line, { color: c.text, fontSize: fs(12) }]}>{firstLine}</Text>
      {detailLines.map((line, index) => (
        <Text key={index} style={[styles.detail, { color: c.textSecondary, fontSize: fs(12) }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  title: { fontWeight: '500' },
  summary: { fontWeight: '600', marginTop: 4 },
  line: { marginTop: 4, fontWeight: '500' },
  detail: { marginTop: 2 },
});
