import { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { Tag } from '../database/types';

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
  const scrollRef = useRef<ScrollView>(null);

  if (tags.length === 0) return null;

  const renderChip = (label: string, id: number, isSelected: boolean, onPress?: () => void, isSpecial = false) => (
    <TouchableOpacity
      key={id}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected && isSpecial ? c.primary + 'CC' : isSelected ? c.primary : isSpecial ? 'transparent' : c.surface,
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
            color: isSelected && isSpecial ? c.background + 'CC' : isSelected ? c.background : isSpecial ? c.textSecondary : c.text,
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
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderChip(labels.home_tag_all, -2, activeTagIds.length === 0, onClear, true)}
        {renderChip(labels.home_tag_untagged, -1, activeTagIds.includes(-1), undefined, true)}
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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontWeight: '500',
  },
});
