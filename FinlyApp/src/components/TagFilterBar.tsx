import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { isWeb } from '../utils/platform';
import { t } from '../i18n';
import type { Tag } from '../database/types';
import { UNTAGGED_ID } from '../database/helpers';
import { withAlpha } from '../utils/color';
import { TRANSPARENT } from '../constants/themes';

interface Props {
  tags: Tag[];
  activeTagIds: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
  style?: object;
}

export default function TagFilterBar({ tags, activeTagIds, onToggle, onClear, style }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  if (tags.length === 0) return null;

  const renderChip = (label: string, id: number, isSelected: boolean, onPress?: () => void, isSpecial = false) => (
    <TouchableOpacity
      key={id}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected && isSpecial ? withAlpha(c.primary, 80) : isSelected ? c.primary : isSpecial ? TRANSPARENT : c.surface,
          borderWidth: !isSelected && isSpecial ? 1 : 0,
          borderColor: c.border,
        },
      ]}
      onPress={onPress ?? (() => onToggle(id))}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: isSelected && isSpecial ? withAlpha(c.background, 80) : isSelected ? c.background : isSpecial ? c.textSecondary : c.text,
            fontSize: fs(13),
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={isWeb}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.webScrollContent]}
      >
        {renderChip(labels.home_tag_all, -2, activeTagIds.length === 0, onClear, true)}
        {renderChip(labels.home_tag_untagged, UNTAGGED_ID, activeTagIds.includes(UNTAGGED_ID), undefined, true)}
        {tags.map(tag =>
          renderChip(tag.name, tag.id, activeTagIds.includes(tag.id))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  webScrollContent: {
    paddingBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontWeight: '500',
  },
});
