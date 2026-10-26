import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DISABLED_OPACITY } from './calendarStyles';
import { t } from '../../i18n';

interface Props {
  title: string;
  titleSize: number;
  color: string;
  onPrev: () => void;
  onNext: () => void;
  onJumpToCurrent?: () => void;
  showJump?: boolean;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  jumpLabel?: string;
}

const ICON_SIZE = 22;
const JUMP_ICON_SIZE = 22;
const LEFT_SLOT = 66;
const RIGHT_SLOT = 66;

export default function CalendarNavRow({
  title,
  titleSize,
  color,
  onPrev,
  onNext,
  onJumpToCurrent,
  showJump = false,
  nextDisabled = false,
  prevDisabled = false,
  prevLabel,
  nextLabel,
  jumpLabel,
}: Props) {
  const labels = t();
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        <TouchableOpacity
          onPress={onPrev}
          style={[styles.button, { opacity: prevDisabled ? DISABLED_OPACITY : 1 }]}
          disabled={prevDisabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ disabled: prevDisabled }}
          accessibilityLabel={prevLabel ?? labels.a11y_previous_month}
        >
          <Ionicons name="chevron-back-outline" size={ICON_SIZE} color={color} />
        </TouchableOpacity>
      </View>

      <Text
        style={[styles.title, { color, fontSize: titleSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight]}>
        {showJump && onJumpToCurrent && (
          <TouchableOpacity
            onPress={onJumpToCurrent}
            style={[styles.button, styles.jumpButton]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={jumpLabel ?? labels.a11y_go_to_current_period}
          >
            <View style={styles.jumpIcons}>
              <Ionicons name="chevron-forward-outline" size={JUMP_ICON_SIZE} color={color} />
              <Ionicons
                name="chevron-forward-outline"
                size={JUMP_ICON_SIZE}
                color={color}
                style={styles.jumpOverlap}
              />
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onNext}
          style={[styles.button, { opacity: nextDisabled ? DISABLED_OPACITY : 1 }]}
          disabled={nextDisabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ disabled: nextDisabled }}
          accessibilityLabel={nextLabel ?? labels.a11y_next_month}
        >
          <Ionicons name="chevron-forward-outline" size={ICON_SIZE} color={color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 12,
  },
  side: {
    width: LEFT_SLOT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    width: RIGHT_SLOT,
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    width: 30,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpButton: {
    width: 28,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  jumpIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jumpOverlap: {
    marginLeft: -12,
  },
});
